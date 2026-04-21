// show loading screen
const loading = document.querySelector(".loading");
loading.style.display = "flex";

// ejs variables
const {
    userId,
    username,
    projectId,
    projectName,
    creatorId,
    teamLeaderId,
    projectDeadline,
    projectMembers
} = window.scriptData;

// getting dom elements
const sectionList = document.querySelector(".info-section-list");
const template = document.querySelector(".info-section-li-template");
const teamLeader = document.querySelector(".info-section-team-leader");

const leaveButton = document.querySelector("#leave-button");
const newMemberButton = document.querySelector("#new-member-button");
const changeLeaderButton = document.querySelector("#change-leader-button");
const deleteButton = document.querySelector("#delete-button");

const leaveDialog = document.querySelector("#leave-dialog");
const addDialog = document.querySelector("#add-dialog");
const teamLeaderDialog = document.querySelector("#team-leader-dialog");
const deleteDialog = document.querySelector("#delete-dialog");

const leaveDialogNoBtn = document.querySelector("#leave-dialog-no");
const leaveDialogYesBtn = document.querySelector("#leave-dialog-yes");
const addDialogNoBtn = document.querySelector("#add-dialog-no");
const addDialogYesBtn = document.querySelector("#add-dialog-yes");
const teamLeaderDialogNoBtn = document.querySelector("#team-leader-dialog-no");
const teamLeaderDialogYesBtn = document.querySelector("#team-leader-dialog-yes");
const deleteDialogNoBtn = document.querySelector("#delete-dialog-no");
const deleteDialogYesBtn = document.querySelector("#delete-dialog-yes");

// team leader
const leaderUsername = projectMembers.find(u => u.user_id === teamLeaderId).username;
teamLeader.textContent = leaderUsername;

// populate the members list
for (const member of projectMembers) {
    // clone the template
    const clone = template.content.cloneNode(true);

    // change the values in the clone
    clone.querySelector('.info-section-li-text').textContent = member.username;

    if (member.user_id === teamLeaderId) {
        clone.querySelector(".fa").classList.remove('fa-user');
        clone.querySelector(".fa").classList.add('fa-crown', 'team-leader');
        clone.querySelector(".info-section-li-text").classList.add('team-leader');
    }
    
    // add the clone to the list
    sectionList.appendChild(clone);
}

// event listeners to open dialogs
leaveButton.addEventListener("click", () => {
    leaveDialog.showModal();
})

newMemberButton.addEventListener("click", () => {
    addDialog.showModal();
})

changeLeaderButton.addEventListener("click", () => {
    teamLeaderDialog.showModal();
})

deleteButton.addEventListener("click", () => {
    deleteDialog.showModal();
})

// event listeners to close dialogs
leaveDialog.addEventListener("click", (e) => {
    if (e.target === leaveDialog) leaveDialog.close();
});

leaveDialogNoBtn.addEventListener("click", () => {
    leaveDialog.close();
});

addDialog.addEventListener("click", (e) => {
    if (e.target === addDialog) addDialog.close();
});

addDialogNoBtn.addEventListener("click", () => {
    addDialog.close();
});

teamLeaderDialog.addEventListener("click", (e) => {
    if (e.target === teamLeaderDialog) teamLeaderDialog.close();
});

teamLeaderDialogNoBtn.addEventListener("click", () => {
    teamLeaderDialog.close();
});

deleteDialog.addEventListener("click", (e) => {
    if (e.target === deleteDialog) deleteDialog.close();
});

deleteDialogNoBtn.addEventListener("click", () => {
    deleteDialog.close();
});

// event listener to leave the project
leaveDialogYesBtn.addEventListener("click", async () => {
    leaveDialog.close();

    if (teamLeaderId === userId) {
        alert("You cannot be removed from the group as you are the team leader. Change the team leader and try again.");
    } else {
        // show loading
        loading.style.display = "flex";
    
        // remove the user
        const response = await fetch("/api/projects/remove_user", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: 123,
                project_id: 456
            })
        });
    
        // close loading
        loading.style.display = "none";
    
        // show redirect dialog
    }

})

// hide loading screen
loading.style.display = "none";