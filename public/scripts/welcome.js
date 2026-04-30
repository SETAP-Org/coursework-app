async function welcomeUser() {
    // add user to database
    const addUserResponse = await fetch("/api/users/addUser", { method: 'POST' });
    const addUserData = await addUserResponse.json();

    if (addUserData.success) {
        // if user successfully added to the database, send them to their homepage
        return window.location.replace(`/${addUserData.user.username}`);
    } else {
        // otherwise, remove them from the session and take them to the error page
        await fetch("/api/auth/signout");
    }
}

welcomeUser();