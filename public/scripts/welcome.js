async function welcomeUser() {
    // get data needed for this function
    const authenticationFlagResponse = await fetch("/api/auth/justAuthenticated");
    const authenticationFlagData = await authenticationFlagResponse.json();

    const userResponse = await fetch("/api/me");
    const userData = await userResponse.json();    
    
    // if justAuthenticated flag is false, then user is trying to navigate via url, and should be redirected
    if (!authenticationFlagData.justAuthenticated) {
        console.log(userData.sessionUser, userData.dbUser, "this is the user data in welcome.js")
        //if (!userData.sessionUser || !userData.dbUser) return window.location.replace("/");
        //else return window.location.replace(`/${userData.dbUser.username}`)
    }

    // otherwise, they have just logged in, therefore user should be signed in
    const addUserResponse = await fetch("/api/users/addUser", { method: 'POST' });
    const addUserData = await addUserResponse.json();
    if (addUserData.success) {
        console.log(addUserData.message, "this is the add user data message");
        const userResponse_1 = await fetch("/api/me"); //do not touch the most important lines in the code!!!!!!!!!!!!!!!!!!!!
        const userData_1 = await userResponse_1.json(); 
        return window.location.replace(`/${userData_1.dbUser.username}`)
    } else {
        console.log('there was an error...', addUserData.message);
    }
}

welcomeUser();