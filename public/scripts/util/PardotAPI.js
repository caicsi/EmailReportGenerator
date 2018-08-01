

function getURL(emailId) {

    let pardotAuth = require('../.pardot_auth');
    return 'https://pi.pardot.com/api/email/version/4/do/stats/id/'
        + emailId
        + "?user_key=" + pardotAuth.user_key
        + "&api_key=" + pardotAuth.api_key
        + "&list_email_id=" + emailId;
}
