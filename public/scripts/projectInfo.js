// show loading screen
const loading = document.querySelector(".loading");
loading.style.display = "flex";

// ejs variables
const { projectMembers, teamLeaderId } = window.scriptData;

// getting dom elements
const sectionList = document.querySelector(".section-list");
const template = document.querySelector(".section-li-template");

// assigning the group users to the list

for (const member of projectMembers) {
    const clone = template.content.cloneNode(true);

    clone.querySelector('.section-li-text').textContent = member.username;

    if (member.user_id === teamLeaderId) {
        clone.querySelector(".fa").classList.remove('fa-user');
        clone.querySelector(".fa").classList.add('fa-crown');

        clone.querySelector(".fa").classList.add('team-leader');
        clone.querySelector(".section-li-text").classList.add('team-leader');
    }
    
    sectionList.appendChild(clone);
}

// hide loading screen
loading.style.display = "none";