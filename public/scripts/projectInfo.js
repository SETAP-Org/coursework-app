const socket = io();

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
    projectMembers,
} = window.scriptData;

// getting dom elements
const sectionList = document.querySelector(".info-section-list");
const liTemplate = document.querySelector(".info-section-li-template");
const teamLeader = document.querySelector(".info-section-team-leader");

const teamLeaderSelect = document.querySelector("#team-leader-select");
const teamLeaderTemplate = document.querySelector(".team-leader-option-template");
const teamLeaderOption = document.querySelector(".team-leder-option");

const leaveButton = document.querySelector("#leave-button");
const newMemberButton = document.querySelector("#new-member-button");
const changeLeaderButton = document.querySelector("#change-leader-button");
const deleteButton = document.querySelector("#delete-button");

const leaveDialog = document.querySelector("#leave-dialog");
const addDialog = document.querySelector("#add-dialog");
const teamLeaderDialog = document.querySelector("#team-leader-dialog");
const deleteDialog = document.querySelector("#delete-dialog");
const secondaryDialog = document.querySelector("#secondary-dialog");

const addMemberInput = document.querySelector("#add-member-input");

const leaveDialogNoBtn = document.querySelector("#leave-dialog-no");
const leaveDialogYesBtn = document.querySelector("#leave-dialog-yes");
const addDialogNoBtn = document.querySelector("#add-dialog-no");
const addDialogYesBtn = document.querySelector("#add-dialog-yes");
const teamLeaderDialogNoBtn = document.querySelector("#team-leader-dialog-no");
const teamLeaderDialogYesBtn = document.querySelector("#team-leader-dialog-yes");
const deleteDialogNoBtn = document.querySelector("#delete-dialog-no");
const deleteDialogYesBtn = document.querySelector("#delete-dialog-yes");
const secondaryDialogHeading = document.querySelector("#secondary-dialog-heading");
const secondaryDialogMsg = document.querySelector("#secondary-dialog-message");
const secondaryDialogBtn = document.querySelector("#secondary-dialog-button");

// team leader
const leaderUsername = projectMembers.find(u => u.user_id === teamLeaderId).username;
teamLeader.textContent = leaderUsername;

// populate the members list
for (const member of projectMembers) {
    // clone the template
    const clone = liTemplate.content.cloneNode(true);

    // change the values in the clone
    clone.querySelector('.info-section-li-text').textContent = member.username;

    // if user is team leader, give them a crown and update colours to gold
    if (member.user_id === teamLeaderId) {
        clone.querySelector(".fa").classList.remove('fa-user');
        clone.querySelector(".fa").classList.add('fa-crown', 'team-leader');
        clone.querySelector(".info-section-li-text").classList.add('team-leader');
    }
    
    // add the clone to the list
    sectionList.appendChild(clone);
};

// event listener for secondary dialog (redirect to home)
secondaryDialogBtn.addEventListener("click", () => {
    window.location.replace("/");
});

// event listener to open leave dialog
leaveButton.addEventListener("click", () => {
    leaveDialog.showModal();
});

// event listener to close leave dialog (click outside)
leaveDialog.addEventListener("click", (e) => {
    if (e.target === leaveDialog) leaveDialog.close();
});

// event listener to close leave dialog (cancel button)
leaveDialogNoBtn.addEventListener("click", () => {
    leaveDialog.close();
});

// event listener if user chooses to leave the project
leaveDialogYesBtn.addEventListener("click", async () => {
    leaveDialog.close();

    if (teamLeaderId === userId) {
        alert("You cannot be removed from the group as you are the team leader. Change the team leader and try again.");
    } else {
        // show loading
        loading.style.display = "flex";
    
        // remove the user
        const response = await fetch("/api/projects/user", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                projectId: projectId
            })
        });

        const data = await response.json();

        // change the message of the secondary dialog
        if (data.success) {
            socket.emit('notification', {
                targetUsers: projectMembers
                    .filter(u => u.user_id !== userId)
                    .map(u => u.user_id),
                projectId: projectId,
                notificationType: "Member Leave",
                notificationMessage: `${username} has left ${projectName}`,
            });

            // update and show secondary dialog
            secondaryDialogHeading.textContent = "Success!";
            secondaryDialogMsg.textContent = data.message;
        } else {
            secondaryDialogHeading.textContent = "Error :(";
            secondaryDialogMsg.textContent = data.message;
        }
    
        // close loading
        loading.style.display = "none";
    
        // show redirect dialog
        secondaryDialog.showModal();
    }
});

// event listeners if the user is team leader
if (teamLeaderId === userId) {
    // add memeber username input
    let addUserInputValue = "";

    // event listener to update addUserInputValue
    addMemberInput.addEventListener("input", (e) => {
        addUserInputValue = e.target.value;
        e.target.value === "" ? addDialogYesBtn.disabled = true : addDialogYesBtn.disabled = false;
    });

    // populating new team leader dropdown
    for (const member of projectMembers) {
        if (member.user_id !== userId) {
            // clone the template
            const clone = teamLeaderTemplate.content.cloneNode(true);

            // change the values in the clone
            clone.querySelector(".team-leader-option").textContent = member.username;
            clone.querySelector(".team-leader-option").value = member.user_id;

            // add the clone to the select
            teamLeaderSelect.appendChild(clone);
        }
    };

    // event listener to open new member dialog
    newMemberButton.addEventListener("click", () => {
        addDialog.showModal();
    });

    // event listener to close new member dialog (click outside)
    addDialog.addEventListener("click", (e) => {
        if (e.target === addDialog) addDialog.close();
        addMemberInput.value = "";
    });

    // event listener to close new member dialog (cancel button)
    addDialogNoBtn.addEventListener("click", () => {
        addDialog.close();
        addMemberInput.value = "";
    });

    // event listener to add new member to project
    addDialogYesBtn.addEventListener("click", async () => {
        addDialog.close();

        const userAlreadyInProject = projectMembers.some(member => member.username === addUserInputValue);

        if (addUserInputValue === username) {
            alert("You cannot add yourself to the project!");
            addMemberInput.value = "";
        } else if (userAlreadyInProject) {
            alert(`${addUserInputValue} is already a part of the project!`);
            addMemberInput.value = "";
        } else {
            // show loading
            loading.style.display = "flex";

            // attempt to add the user to the group
            const response = await fetch("/api/projects/user", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: addUserInputValue,
                    projectId: projectId
                })
            });

            const data = await response.json();

            if (data.success) {
                // send notification to other group members
                socket.emit('notification', {
                    targetUsers: [...projectMembers
                        .filter(u => u.user_id !== userId)
                        .map(u => u.user_id),
                        data.userId,
                    ],
                    projectId: projectId,
                    notificationType: "Member Join",
                    notificationMessage: `${addUserInputValue} has been added added to ${projectName}`,
                    targetUsername: addUserInputValue,
                    projectName: projectName
                });

                // load the secondary dialog
                secondaryDialogHeading.textContent = "Success!";
                secondaryDialogMsg.textContent = `${addUserInputValue} has been added to the group!`;
            } else {
                secondaryDialogHeading.textContent = "Error :(";
                secondaryDialogMsg.textContent = data.message;
            }

            addMemberInput.value = "";

            // close loading
            loading.style.display = "none";
        
            // show redirect dialog
            secondaryDialog.showModal();
        }
    });

    // event listener to open new team leader dialog
    changeLeaderButton.addEventListener("click", () => {
        teamLeaderDialog.showModal();
    });

    // event listner to close new team leader dialog (click outside)
    teamLeaderDialog.addEventListener("click", (e) => {
        if (e.target === teamLeaderDialog) teamLeaderDialog.close();
    });

    // event listener to close new team leader dialog (cancel button)
    teamLeaderDialogNoBtn.addEventListener("click", () => {
        teamLeaderDialog.close();
    });

    // event listener to change the team leader
    teamLeaderDialogYesBtn.addEventListener("click", async () => {
        teamLeaderDialog.close();

        // show loading
        loading.style.display = "flex";

        // change the leader
        const response = await fetch("/api/projects/leader", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                newLeaderId: teamLeaderSelect.value,
                projectId: projectId
            })
        });
        const data = await response.json();

        if (data.success) {
            // send notifications to group members
            socket.emit('notification', {
                targetUsers: projectMembers
                    .filter(u => u.user_id !== userId)
                    .map(u => u.user_id),
                projectId: projectId,
                notificationType: "Leader",
                notificationMessage: `${teamLeaderSelect.options[teamLeaderSelect.selectedIndex].text} has been made the team leader of ${projectName}`,
                targetUsername: teamLeaderSelect.options[teamLeaderSelect.selectedIndex].text,
                projectName: projectName,
            });

            // update and show the secondary dialog
            secondaryDialogHeading.textContent = "Success!";
            secondaryDialogMsg.textContent = data.message;
        } else {
            secondaryDialogHeading.textContent = "Error :(";
            secondaryDialogMsg.textContent = data.message;
        }

        // hide loading
        loading.style.display = "none";

        // show redirect dialog
        secondaryDialog.showModal();
    });

    // event listener to open delete project dialog
    deleteButton.addEventListener("click", () => {
        deleteDialog.showModal();
    });

    // event listener to close delete project dialog (click outside)
    deleteDialog.addEventListener("click", (e) => {
        if (e.target === deleteDialog) deleteDialog.close();
    });

    // event listener to close delete project dialog (cancel button)
    deleteDialogNoBtn.addEventListener("click", () => {
        deleteDialog.close();
    });

    // event listener to delete the project
    deleteDialogYesBtn.addEventListener("click", async () => {
        deleteDialog.close();

        // show loading
        loading.style.display = "flex";

        // delete the project
        const response = await fetch(`/api/projects/${projectId}`, {
            method: "DELETE",
        });
        const data = await response.json();

        if (data.success) {
            socket.emit('notification', {
                targetUsers: projectMembers
                    .filter(u => u.user_id !== userId)
                    .map(u => u.user_id),
                notificationType: "Project",
                notificationMessage: `${projectName} has been deleted`,
            });

            // update and show the secondary dialog
            secondaryDialogHeading.textContent = "Success!";
            secondaryDialogMsg.textContent = data.message;
        } else {
            secondaryDialogHeading.textContent = "Error :(";
            secondaryDialogMsg.textContent = data.message;
        }

        // hide loading
        loading.style.display = "none";

        // show redirect dialog
        secondaryDialog.showModal();
    });
};

// hide loading screen
loading.style.display = "none";