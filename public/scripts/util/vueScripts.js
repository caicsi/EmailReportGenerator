

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
        showReports: "none",
        reports: [],
        currentCampaign: null,
        currentDate: null
    },
    computed: {
        //variable called that will determine if the email is old data and needs to be updated
        needsUpdating: function () {
            if (this.currentCampaign === null || this.currentDate === null) return false;
            let date = new Date(this.reports[this.currentDate].emails[this.currentCampaign].report["Sent"]);
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
        reports: function (newCampaignArray, oldCampaignArray) {

            localStorage.setItem('emailGeneratorReports', JSON.stringify(this.reports));

            this.showReports = "block";
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


function generateReport(data) {

    console.log("data: ");
    console.log(data);


    let content = {};
    data.forEach(line => {
        for (let key in line) {
            content[key] = line[key];
        }
    });


    console.log("content: ");
    console.log(content);

    //new data structure

    let report = {};
    let found = false;
    report["name"] = content["Campaign"];
    report["service"] = "myEmma";
    report["report"] = content;

    //check if there are other emails from this date
    let reportDate = new Date(content["Sent"]).toDateString();
    emailReport.reports.forEach(dateGroup => {
        if (new Date(dateGroup["date"]).toDateString() === reportDate) {
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

    console.log("reports (new data structure): ");
    console.log(emailReport.reports);
}

//check local storage for previous data
function checkForReport() {

    if (typeof(Storage) !== "undefined") {

        //check if past emails have been stored
        if(localStorage.getItem("emailGeneratorReports")) {
            //if so, load them into Vue vars
            localStorage.removeItem('emailGeneratorReports');

            //emailReport.reports = JSON.parse(localStorage.getItem("emailGeneratorReports"));
        }

    } else {
        //local storage not supported
    }
}

//run this function upon initialization to fetch data from local storage
checkForReport();