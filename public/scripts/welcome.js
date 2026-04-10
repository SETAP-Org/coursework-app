// first, check if you have just authenticated
    // if yes, then add the user and renavigate to the user dashboard
    // if no, then check if there is already a user in the session
        // if yes, then user dashboard
        // if no, then landing so they can sign in

// async so make it a function call

async function welcomeUser() {
    // get data needed for this function
    const authenticationFlagResponse = await fetch("/api/auth/justAuthenticated");
    const authenticationFlagData = await authenticationFlagResponse.json();
    const userResponse = await fetch("/api/me");
    const userData = await userResponse.json();
    console.log(userData, 'this is the user data...')
    
    // if justAuthenticated flag is false, then user is trying to navigate via url, and should be redirected
    if (!authenticationFlagData) {
        if (userData.sessionUser) return window.location.replace(`/${userData.dbUser.username}`)
        else return window.location.replace("/");
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