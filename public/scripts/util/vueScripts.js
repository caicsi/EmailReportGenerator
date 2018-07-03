
let emailReport = new Vue({
    el: '#emails',
    data: {
        campaigns: ["Placeholder"],
        currentCampaign: "",
        report: {"Placeholder": { "" : "Upload a spreadsheet to view the email report" } }
    },
    methods: {
        isString: function (value) {
            if (!value) return true;
            return (Object.getOwnPropertyNames(value)[Object.getOwnPropertyNames(value).length - 1] === "length")
        },
        needsUpdating: function () {
            if (this.currentCampaign === "") return false;
            let date = new Date(this.report[this.currentCampaign]["Sent"]);
            return (date.toDateString() !== new Date().toDateString());
        }
    },
    filters: {
        formatItem: function (item) {
            return item.replace(/"/g, "");
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

    //console.log(content);
    emailReport.report[data[0]["Campaign"]] = content;
    emailReport.campaigns.push(data[0]["Campaign"]);

    console.log(emailReport.report);
}