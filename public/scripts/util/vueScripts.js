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
        currentEmail: [],
        campaigns: ["Placeholder"],
        report: [{"Placeholder":"Choose an email to see more info"}]
    },
    methods: {
        viewReport: function(campaign) {
            this.currentEmail = this.report[0][campaign];
        }
    }
})

function generateReport(data) {

    emailReport.campaigns.push(data[0]["Campaign"]);
    console.log(data[0]);
    let content = {};
    data.forEach(line => {
        content[line[0]] = content[line[1]];
    });

    let file = {};
    file[data[0]["Campaign"]] = content;
    emailReport.report.push(file);
    //emailReport.report.push(data);
    //emailReport.campaigns.push

    console.log(emailReport.report);
}