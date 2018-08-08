function getURL(emailId) {

    const pardotAuth = {
        user_key : "c885ea7f299411ac8d667fecbecb54ae",
        api_key : getAPIkey()
    };

    if (pardotAuth.api_key === "error") return "Error retrieving API key";

    return 'https://pi.pardot.com/api/email/version/4/do/stats/id/' + 
    emailId + 
    "?user_key=" + pardotAuth.user_key + 
    "&api_key=" + pardotAuth.api_key + 
    "&list_email_id=" + emailId;
}

function getAPIkey() {

    const pardotAuth = {
        user_key : "c885ea7f299411ac8d667fecbecb54ae",
        password : "Bj1063kids!",
        email : "alice.easter@mymail.champlain.edu"
    };

    let request = new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.open('POST', "https://pi.pardot.com/api/login/version/3?user_key="
            + pardotAuth.user_key + "&email=" + pardotAuth.email + "&password=" + pardotAuth.password);
        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });

    request.then(function (values) {
        console.log(values);
        return values;
    }).catch(function (values) {
        console.log("Unable to retrieve Pardot API key");
        console.log(values);
        return "error";
    })
}