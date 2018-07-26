

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

                this.showReports = "block";
            },
            deep: true
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

    //make array of objects into one object
    let content = {};
    data.forEach(line => {
        for (let key in line) {
            content[key] = line[key];
        }
    });

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

    //console.log("reports (new data structure): ");
    //console.log(emailReport.reports);
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


//maybe have json be a parameter
function XMLtoJSON(data) {

    let json = {};
    let subJson = {};
    let i = 0;
    data = '<rsp stat="ok" version="1.0"> <stats> <sent>1003</sent> <delivered>543</delivered> <total_clicks>54</total_clicks> <unique_clicks>5</unique_clicks> <soft_bounced>3</soft_bounced> <hard_bounced>2</hard_bounced> <opt_outs>454</opt_outs> <spam_complaints>123</spam_complaints> <opens>34</opens> <unique_opens>...</unique_opens> <delivery_rate>...</delivery_rate> <opens_rate>100%</opens_rate> <click_through_rate>20%</click_through_rate> <unique_click_through_rate>...</unique_click_through_rate> <click_open_ratio>...</click_open_ratio> <opt_out_rate>34%</opt_out_rate> <spam_complaint_rate>0.0</spam_complaint_rate> </stats> </rsp>';

    // let parser = new DOMParser();
    // let xmlDoc = parser.parseFromString(data, "text/xml");
    // xmlDoc.documentElement.childNodes.forEach(node => {
    //     if (node.childNodes.length > 0) {
    //         subJson = {};
    //         for (i = 0; i < node.childNodes.length; i++) {
    //             subJson[node.childNodes[i].nodeName] = node.childNodes.nodeValue;
    //         }
    //         // node.childNodes.forEach(childNode => {
    //         //     subJson[childNode.nodeName] = childNode.nodeValue;
    //         // });
    //         json[node.nodeName] = subJson;
    //     }
    //     else {
    //         json[node.nodeName] = node.nodeValue;
    //     }
    // });
    //
    // console.log(xmlDoc);
    // console.log("xml parsed:");
    // console.log(json);

    let json2 = {};

    let stats = xmlDoc.getElementsByTagName("stats");
    console.log(stats);
    console.log(stats[0]);
    console.log(stats[0].childElementCount);
    stats[0].childNodes.forEach(node => {
        json2[node.nodeName] = node.textContent;
    });

    console.log("xml take two:");
    console.log(json2);

    //return json;
}

XMLtoJSON("hello");