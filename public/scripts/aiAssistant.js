// public/scripts/aiAssistant.js

(function () {
  // ----------------------------------------------------------------------
  // Setup: find our root element and pull context off the page.
  // ----------------------------------------------------------------------

  // Bail out early if the partial wasn't included on this page. This keeps
  // the script safe to load globally even on pages that don't have the AI
  // widget mounted (defence-in-depth).
  const root = document.querySelector("#ai-assistant");
  if (!root) return;

  // Pull context from window.scriptData. We don't crash if a page forgets
  // to set one of these - just degrade gracefully.
  const data = window.scriptData;

  console.log(data);
  const projectId = data.projectId;
  const isTeamLeader = Boolean(data.isTeamLeader);

  if (!projectId) {
    console.warn("[aiAssistant] No projectId in scriptData; widget disabled.");
    return;
  }

  // Cache element handles up front. Doing this once is cheaper than
  // querying the DOM on every interaction.
  const launcher = document.querySelector("#ai-assistant-launcher");
  const panel = document.querySelector("#ai-assistant-panel");
  const closeBtn = document.querySelector("#ai-assistant-close");
  const clearBtn = document.querySelector("#ai-assistant-clear");
  const messagesEl = document.querySelector("#ai-assistant-messages");
  const form = document.querySelector("#ai-assistant-form");
  const input = document.querySelector("#ai-assistant-input");
  const sendBtn = document.querySelector("#ai-assistant-send");

  // Hide the clear button if the current user isn't the team leader.
  // The server still enforces this; this is just UI politeness.
  if (clearBtn && !isTeamLeader) {
    clearBtn.style.display = "none";
  }

  // Tracks whether we've fetched the initial history yet, so we don't
  // re-fetch every time the user opens and closes the panel.
  let historyLoaded = false;
  let isSending = false;

  // ----------------------------------------------------------------------
  // Open / close
  // ----------------------------------------------------------------------

  function openPanel() {
    root.classList.remove("ai-assistant--collapsed");
    panel.hidden = false;
    // Defer focus until the panel is actually visible.
    requestAnimationFrame(() => input.focus());

    if (!historyLoaded) {
      loadHistory();
    }
  }

  function closePanel() {
    root.classList.add("ai-assistant--collapsed");
    panel.hidden = true;
  }

  launcher.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);

  // Allow ESC to close when the panel is open.
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      !root.classList.contains("ai-assistant--collapsed")
    ) {
      closePanel();
    }
  });

  // ----------------------------------------------------------------------
  // Rendering helpers
  // ----------------------------------------------------------------------

  function renderEmptyState() {
    messagesEl.innerHTML = `
            <div class="ai-assistant__empty">
                Hi! Ask me anything about your project's spec, files, or tasks.
                I can summarise PDFs you've uploaded to the shared folder.
            </div>
        `;
  }

  function renderMessage(role, content, authorLabel) {
    const wrapper = document.createElement("div");
    wrapper.className =
      role === "user"
        ? "ai-assistant__msg ai-assistant__msg--user"
        : "ai-assistant__msg ai-assistant__msg--assistant";

    if (authorLabel) {
      const author = document.createElement("span");
      author.className = "ai-assistant__msg-author";
      author.textContent = authorLabel;
      wrapper.appendChild(author);
    }

    // Use textContent (not innerHTML) so the message body stays
    // plain-text safe - the user's input is rendered as text, not HTML.
    const body = document.createElement("div");
    body.textContent = content;
    wrapper.appendChild(body);

    messagesEl.appendChild(wrapper);
    scrollToBottom();
  }

  function renderTypingIndicator() {
    const el = document.createElement("div");
    el.className = "ai-assistant__typing";
    el.id = "ai-assistant-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function clearTypingIndicator() {
    const el = document.querySelector("#ai-assistant-typing");
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ----------------------------------------------------------------------
  // Network calls
  // ----------------------------------------------------------------------

  async function loadHistory() {
    try {
      const res = await fetch(`/api/projects/${projectId}/ai-chat`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`status ${res.status}`);

      const payload = await res.json();
      messagesEl.innerHTML = "";

      if (!payload.messages || payload.messages.length === 0) {
        renderEmptyState();
      } else {
        for (const m of payload.messages) {
          const isOwn = m.role === "user" && m.user_id === data.userId;
          const label =
            m.role === "assistant"
              ? "GCMS Assistant"
              : isOwn
                ? null
                : "Team mate";
          renderMessage(m.role, m.content, label);
        }
      }

      historyLoaded = true;
    } catch (err) {
      console.error("[aiAssistant] Failed to load history:", err);
      messagesEl.innerHTML = `
                <div class="ai-assistant__empty">
                    Couldn't load chat history. Try reopening the panel.
                </div>
            `;
    }
  }

  async function sendMessage(text) {
    if (isSending) return;
    isSending = true;

    // Optimistically render the user's message immediately so the UI
    // feels responsive. Remove empty-state if it's still there.
    const emptyState = messagesEl.querySelector(".ai-assistant__empty");
    if (emptyState) emptyState.remove();
    renderMessage("user", text, null);
    renderTypingIndicator();

    sendBtn.disabled = true;
    input.disabled = true;

    try {
      const res = await fetch(`/api/projects/${projectId}/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ messageContent: text }),
      });

      clearTypingIndicator();

      if (!res.ok) {
        const errMsg =
          res.status === 403
            ? "You don't have permission to do that."
            : `Server error (${res.status}).`;
        renderMessage("assistant", errMsg, "GCMS Assistant");
        return;
      }

      const payload = await res.json();
      if (payload.assistantMessage?.content) {
        renderMessage(
          "assistant",
          payload.assistantMessage.content,
          "GCMS Assistant",
        );
      } else {
        renderMessage(
          "assistant",
          "Sorry, I couldn't get a response from the AI just now.",
          "GCMS Assistant",
        );
      }
    } catch (err) {
      clearTypingIndicator();
      console.error("[aiAssistant] Send failed:", err);
      renderMessage(
        "assistant",
        "Network error. Check your connection and try again.",
        "GCMS Assistant",
      );
    } finally {
      isSending = false;
      input.disabled = false;
      input.value = "";
      input.style.height = "";
      sendBtn.disabled = true;
      input.focus();
    }
  }

  async function clearHistory() {
    if (
      !confirm("Clear the AI chat for the whole team? This can't be undone.")
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}/ai-chat`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        alert("Couldn't clear the chat. Are you the team leader?");
        return;
      }
      messagesEl.innerHTML = "";
      renderEmptyState();
    } catch (err) {
      console.error("[aiAssistant] Clear failed:", err);
      alert("Network error while clearing chat.");
    }
  }

  if (clearBtn) clearBtn.addEventListener("click", clearHistory);

  // ----------------------------------------------------------------------
  // Form / input behaviour
  // ----------------------------------------------------------------------

  // Auto-grow the textarea up to its max-height.
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
    sendBtn.disabled = input.value.trim().length === 0 || isSending;
  });

  // Submit on Enter, newline on Shift+Enter (standard chat behaviour).
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) form.requestSubmit();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    sendMessage(text);
  });
})();
