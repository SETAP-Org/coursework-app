// function 
async function loadProfile() {
  try {
    const response = await fetch("/api/me");
    const data = await response.json();

    document.getElementById("profile-name").textContent = data.name || "Unknown User";
  } catch (error) {
    console.error("Error loading profile:", error);
    document.getElementById("profile-name").textContent = "Error in user";
  }
}

loadProfile();