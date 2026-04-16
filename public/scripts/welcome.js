async function welcomeUser() {
    // get data needed for this function
    const authenticationFlagResponse = await fetch("/api/auth/justAuthenticated");
    const authenticationFlagData = await authenticationFlagResponse.json();

    let userData;

    try {
        const userResponse = await fetch("/api/me");
        userData = await userResponse.json();
    } catch(err) {
        console.log("User doesn't exist!")
        userData = null;
    }
    
    // if justAuthenticated flag is false, then user is trying to navigate via url, and should be redirected
    if (!authenticationFlagData.justAuthenticated) {
        if (!userData.sessionUser) return window.location.replace("/");
        else return window.location.replace(`/${userData.dbUser.username}`)
    }

    // otherwise, they have just logged in, therefore user should be signed in
    const addUserResponse = await fetch("/api/users/addUser", { method: 'POST' });
    const addUserData = await addUserResponse.json();
    if (addUserData.success) {
        return window.location.replace(`/${userData.dbUser.username}`)
    } else {
        console.log('there was an error...', addUserData.message);
    }
}

welcomeUser();