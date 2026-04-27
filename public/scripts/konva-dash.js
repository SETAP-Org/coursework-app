const pathSegments = window.location.pathname.split('/');
const projectIndex = pathSegments.indexOf('projects');
const projectId = pathSegments[projectIndex + 1];
const username = pathSegments[1];

export async function saveNotesToDB(projectId, text, x, y, widgetId = null) {
    const response = await fetch(`/${username}/projects/${projectId}/save`, {
        method: "POST",
        headers: { 'content-type': "application/json" },
        body: JSON.stringify({ text, x, y, widgetId })
    });
    const data = await response.json();
    console.log("saveNotesToDB response:", data);
    return data.note;
}

export async function deleteNoteFromDB(projectId, text, x, y) {
    await fetch(`/${username}/projects/${projectId}/delete`, {
        method: "POST",
        headers: { 'content-type': "application/json" },
        body: JSON.stringify({ text, x, y })
    });
}

export async function getNotesFromDB(projectId) {
    const response = await fetch(`/${username}/projects/${projectId}/notes`);
    const data = await response.json();
    return data.notes;
}

const container = document.getElementById('Konva-container');
const addNoteBtn = document.getElementById('add-note-btn');

if (container && addNoteBtn) {
  const stage = new window.Konva.Stage({
    container: 'Konva-container',
    width: container.clientWidth,
    height: container.clientHeight,
  });

  const layer = new Konva.Layer();
  const transformer = new Konva.Transformer();
  stage.add(layer.add(transformer));

  const MAX_NOTES = 10;
  let noteCount = 0;

  async function init() {
    const savedNotes = await getNotesFromDB(projectId);
    if (savedNotes && Array.isArray(savedNotes)) {
        savedNotes.forEach(note => {
            createNote(
                note.widget_text, 
                parseFloat(note.widget_x), 
                parseFloat(note.widget_y), 
                note.widget_id
            );
        });
    }
  }
  init(); //create existing notes whent he page loads up 

  // Update parameters to accept optional initial data
  function createNote(initialText = 'Double-click to edit', x = 50 + noteCount * 10, y = 50 + noteCount * 10, widget_id = null) {
      if (noteCount >= MAX_NOTES) return alert('Maximum of 10 notes reached.');

      const group = new Konva.Group({
        x: x, 
        y: y, 
        draggable: true,
      });

      group.setAttrs({ dbX: x, dbY: y, widgetId: widget_id });

      const rect = new Konva.Rect({
        width: 180, height: 100, fill: '#ffffff',
        stroke: '#333333', cornerRadius: 20, shadowBlur: 4,
      });

      const text = new Konva.Text({
        x: 10, y: 10, width: 160, text: initialText, // Use the parameter
        fontSize: 18, fill: '#000000',
      });

      group.add(rect, text).on('click', () => transformer.nodes([group]));

      group.on('dragend', async () => {
          const { x: newX, y: newY } = group.position();

          if (newX > stage.width() - 200 && newY > stage.height() - 200) {
              await deleteNoteFromDB(projectId, text.text(), group.attrs.dbX, group.attrs.dbY);
              group.destroy();
              layer.draw();
              noteCount--;
          } else {
              console.log("Before save, widgetId:", group.attrs.widgetId);
              const savedNote = await saveNotesToDB(projectId, text.text(), newX, newY, group.attrs.widgetId);
              console.log("After save, returned:", savedNote);
              if (savedNote && savedNote.widget_id) {
                  group.setAttrs({ dbX: newX, dbY: newY, widgetId: savedNote.widget_id });
              }
              console.log("Stored widgetId:", group.attrs.widgetId);
          }
      });

      group.on('dblclick dbltap', () => editText(text, group));
      layer.add(group).draw();
      noteCount++;
  }

  function editText(textNode, group) {
    transformer.hide();
  
    const box = stage.container().getBoundingClientRect();
    const textarea = document.createElement('textarea');
   
    textarea.className = "note-editor";
    Object.assign(textarea.style, {
      left: `${box.left + group.x() + textNode.x()}px`,
      top: `${box.top + group.y() + textNode.y()}px`,
      width: `${textNode.width()}px`,
      height: `${textNode.height() + 20}px`,
      fontSize: `${textNode.fontSize()}px`
    });

    textarea.value = textNode.text();
    document.body.appendChild(textarea);
    textarea.focus();

    
    const finish = async (save) => {
        if (save) {
            textNode.text(textarea.value);
            await saveNotesToDB(projectId, textNode.text(), group.attrs.dbX, group.attrs.dbY, group.attrs.widgetId);
        }
        textarea.remove();
        transformer.show();
        layer.draw();
    };

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) finish(true);
      if (e.key === 'Escape') finish(false);
    });

    setTimeout(() => 
      window.addEventListener('click', () => finish(true), { once: true }));
    };

  addNoteBtn.addEventListener('click', () => createNote());
  
  window.addEventListener('resize', () => {
    stage.size({width: container.clientWidth, height: container.clientHeight});
    stage.draw();
  });
}