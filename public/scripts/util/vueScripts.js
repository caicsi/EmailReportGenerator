Vue.component('tab-home', {
    template: '<div>Home component</div>'
})
Vue.component('tab-posts', {
    template: '<div>Posts component</div>'
})
Vue.component('tab-archive', {
    template: '<div>Archive component</div>'
})

// Vue.component('report', {
//
// })

//var emails = { }

let emailReport = new Vue({
    el: '#emails',
    data: {
        campaigns: ["Placeholder"],
        currentCampaign: "",
        report: {"Placeholder": { "Choose an email to see more info" : "Example data" } }
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