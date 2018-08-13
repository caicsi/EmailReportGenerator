

Vue.component('initial-drop-box', {
    data: function () {
        return {
            header: "Welcome to the Email Report Generator",
            text: "Upload a csv file of an email to get started."
        }
    },
    template: '<div class="drop-box-text"><h1>{{ header }}</h1><p>{{ text }}</p></div>'
});

Vue.component('standard-drop-box', {
    data: function () {
        return {
            text: "Drag and drop to upload an additional email"
        }
    },
    template: '<p>{{ text }}</p>'
});

let dropBox = new Vue({
    el: '#drop-box',
    data: {
        currentBox: 'initial-drop-box',
        styling: {
            "padding": '30%',
            "vertical-align": "middle",
            "background": 'radial-gradient(#0e76a3, #0d56a2, #0d2b56)'
        }
    }
});

let headerDiv = new Vue({
    el: '#header',
    computed: {
        showHeader: function () {
            if (dropBox.currentBox === 'standard-drop-box') return "flex";
            return "none";
        }
    }
});

let emailReport = new Vue({
    el: '#emails',
    data: {
        showEmails: "none",
        showReports: "none",
        reports: [],
        currentCampaign: null,
        currentDate: null
    },
    computed: {
        //variable called that will determine if the email is old data and needs to be updated
        needsUpdating: function () {
            if (this.currentDate === null) return false;
            let date = new Date(this.reports[this.currentDate].date);
            return (date.toDateString() !== new Date().toDateString());
        },
        emailsPerDate: function() {
            if (this.currentDate !== null){
                return this.reports[this.currentDate].emails;
            }
            return [];
        },
        currentReport: function() {
            if (this.currentDate !== null && this.currentCampaign !== null) {
                return this.reports[this.currentDate].emails[this.currentCampaign].report;
            }
            return [];
        },
        currentFormat: function() {
            if (this.currentDate !== null && this.currentCampaign !== null) {
                return this.reports[this.currentDate].emails[this.currentCampaign].service;
            }
            return "Unknown";
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
        reports: {
            handler: function (newCampaignArray, oldCampaignArray) {

                console.log("updating data...");

                localStorage.setItem('emailGeneratorReports', JSON.stringify(this.reports));

                this.showEmails = "flex";
            },
            deep: true
        },
        currentCampaign: function (newValue, oldValue) {
            if (newValue != null) this.showReports = "block";
            else this.showReports = "none";
        }
    }
});


//change the dropbox depending on if any emails have been uploaded
emailReport.$watch('reports', function () {
    dropBox.currentBox = 'standard-drop-box';
    dropBox.styling = {
        "padding": "1%",
        "background": 'linear-gradient(-90deg, #0d2b56, #0d56a2, #0e76a3)',
        "margin": "1rem"
    };
});

/*
Pre: Takes in an Object of an email report and a string determining if the format is myEmma or Pardot
Post: Adds email to Vue array of reports
Purpose: To add the given email report to the list of reports in its proper date group format
 */
function generateReport(data, format) {

    let report = {};
    //set reportDate to the current date. will be changed if myEmma
    let reportDate = new Date().toDateString();
    let found = false;

    //if myemma
    if (format === "MyEmma") {
        report["name"] = data["Campaign"];
        report["service"] = "myEmma";
        report["report"] = data;

        //set reportDate to the date in the report, instead of the current date
        reportDate = new Date(data["Sent"]).toDateString();

    //if pardot
    } else if (format === "Pardot") {
        console.log(data);
        report["name"] = data["Email List Info"]["Name"];
        report["service"] = "Pardot";
        report["report"] = data;

    } else {
        console.log("Email report format not recognised. Cannot be added to stored list of reports.");
        return;
    }

    //check if there are other emails from this date

    emailReport.reports.forEach(dateGroup => {
        if (new Date(dateGroup["date"]).toDateString() === reportDate) {
            dateGroup["emails"].push(report);
            found = true;
        }
    });

    //if this is the first email for this date, create new entry
    if (!found) {
        let dateGroup = {};
        dateGroup["date"] = reportDate;
        dateGroup["emails"] = [report];
        emailReport.reports.push(dateGroup);
    }

}

//check local storage for previous data
function checkForReport() {

    if (typeof(Storage) !== "undefined") {

        //check if past emails have been stored
        if(localStorage.getItem("emailGeneratorReports")) {
            //if so, load them into Vue vars
            //localStorage.removeItem('emailGeneratorReports');

            emailReport.reports = JSON.parse(localStorage.getItem("emailGeneratorReports"));
        }

    } else {
        //local storage not supported
    }
}

//run this function upon initialization to fetch data from local storage
checkForReport();