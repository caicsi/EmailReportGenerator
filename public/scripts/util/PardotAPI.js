function getURL(emailId) {

    const pardotAuth = {
        user_key : "c885ea7f299411ac8d667fecbecb54ae",
        api_key : "d925155ecd258eb7dc131728fe4848dc"
    };

    return 'https://pi.pardot.com/api/email/version/4/do/stats/id/' + 
    emailId + 
    "?user_key=" + pardotAuth.user_key + 
    "&api_key=" + pardotAuth.api_key + 
    "&list_email_id=" + emailId;
}
