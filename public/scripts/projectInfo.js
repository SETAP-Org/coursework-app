// show loading screen
const loading = document.querySelector(".loading");
loading.style.display = "flex";

// ejs variables
const { projectMembers, teamLeaderId } = window.scriptData;

// getting dom elements
const sectionList = document.querySelector(".info-section-list");
const template = document.querySelector(".info-section-li-template");
const teamLeader = document.querySelector(".info-section-team-leader");

// team leader
const leaderUsername = projectMembers.find(u => u.user_id === teamLeaderId).username;
teamLeader.textContent = leaderUsername;

// members list
for (const member of projectMembers) {
    const clone = template.content.cloneNode(true);

    clone.querySelector('.info-section-li-text').textContent = member.username;

    if (member.user_id === teamLeaderId) {
        clone.querySelector(".fa").classList.remove('fa-user');
        clone.querySelector(".fa").classList.add('fa-crown');

        clone.querySelector(".fa").classList.add('team-leader');
        clone.querySelector(".info-section-li-text").classList.add('team-leader');
    }
    
    sectionList.appendChild(clone);
}

// hide loading screen
loading.style.display = "none";