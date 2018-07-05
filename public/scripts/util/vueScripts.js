
let emailReport = new Vue({
    el: '#emails',
    data: {
        emailReport: "none",
        campaigns: [],
        currentCampaign: "",
        report: {},
        reports: []
    },
    computed: {
        //variable called that will determine if the email is old data and needs to be updated
        needsUpdating: function () {
            if (this.currentCampaign === "") return false;
            let date = new Date(this.report[this.currentCampaign]["Sent"]);
            return (date.toDateString() !== new Date().toDateString());
        },
        //var called that will determine if there are any emails yet
        noReports: function () {
            if (this.emailReport === "none") {
                return "flex";
            } else {
                return "none";
            }
        }
    },
    methods: {
        //function to determine if the second element of a key-value pair is an array or just a string value
        isString: function (value) {
            if (!value) return true;
            return (Object.getOwnPropertyNames(value)[Object.getOwnPropertyNames(value).length - 1] === "length")
        }
    },
    filters: {
        //remove the quotations from a value (in an array)
        formatItem: function (item) {
            return item.replace(/"/g, "");
        }
    },
    watch: {
        //watch campaigns and whenever it changes (a new report is uploaded and parsed), store to local storage
        campaigns: function (newCampaignArray, oldCampaignArray) {
            //let newEmail = newCampaignArray[newCampaignArray.length - 1];
            //let newReport
            //localStorage.removeItem('campaigns');
            localStorage.setItem('campaigns', JSON.stringify(this.campaigns));

            //localStorage.removeItem('report');
            localStorage.setItem('report', JSON.stringify(this.report));

            this.emailReport = "flex";
        }
    }
});

function generateReport(data) {

    let content = {};
    data.forEach(line => {
        for (let key in line) {
            content[key] = line[key];
        }
    });

    let report = {};
    let found = false;
    report["name"] = content["Campaign"];
    report["report"] = content;

    //check if there are other emails from this date
    emailReport.reports.forEach(dateGroup => {
        if (dateGroup["date"] === content["Sent"]) {
            dateGroup["emails"].push(report);
            found = true;
        }
    });

    //if this is the first email for this date, create new entry
    if (!found) {
        let dateGroup = {};
        dateGroup["date"] = content["Sent"];
        dateGroup["emails"] = [report];
        emailReport.reports.push(dateGroup);
    }

    //console.log(content);
    emailReport.report[data[0]["Campaign"]] = content;
    emailReport.campaigns.push(data[0]["Campaign"]);

    console.log(emailReport.report);
}

function checkForReport() {

    if (typeof(Storage) !== "undefined") {

        //check if past emails have been stored
        if(localStorage.getItem("campaigns")) {
            //if so, load them into Vue vars
            // localStorage.removeItem('report');
            // localStorage.removeItem('campaigns');

            emailReport.campaigns = JSON.parse(localStorage.getItem("campaigns"));
            emailReport.report = JSON.parse(localStorage.getItem("report"));
        }

    } else {
        //local storage not supported
    }
}

checkForReport();