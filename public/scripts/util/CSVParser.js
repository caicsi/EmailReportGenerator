function parseFiles() {
    let fileList = this.files;

    for (let i = 0; i < fileList.length; i++) {
        let blob = fileList[i];

        switch(blob.type) {
            case "application/zip":
                let new_zip = new JSZip();
                // more files !
                new_zip.loadAsync(content)
                    .then(function(zip) {
                        // you now have every files contained in the loaded zip
                        new_zip.file("clicks.csv").async("string").then(text => console.log(text)); // a promise of "Hello World\n"
                    });

                break;
            case "text/csv":
                CSVToJSONConverter(blob, processData);
                break;
            default:
                console.log(blob.type);
                break;
        }
    }
}

//Takes a blob of a CSV file and returns a JSON
function CSVToJSONConverter(Blob, callback) {

    let reader = new FileReader();

    reader.onload = () => {
        let text = reader.result;
        let json = {};
        let lines = text.split('\n');

        lines = CSVtoArr(lines);

        let headers = lines.filter(line => line.length > 1)[0];

        //check if the CSV has all headers on top, or each line has a header.
        //Pardot will have all headers on top.
        if (headers[0] === "Email Id") {
            json = CSVtoJSON(lines, headers);
        }
        else {
            json = OverviewCSVtoJSON(lines);
        }

        callback(json, lines.filter(line => line.length === 1 && line[0] !== ""));
    };

    //set the file reader to read the contents as text
    reader.readAsText(Blob);
}

//take a CSV file in which the headers are the top line and
// multiple entries are under these headers,
//and returns an array of Objects. Each obj has header-value pairs.
function CSVtoJSON(lines, headers) {
    //loop through entries (proceeding the headers)
    let emails = [];
    let json = {};
    let j = 0;
    lines.filter(line => line.length > 1)
        .slice(1) //remove the headers
        .forEach(line => {
            //console.log("line" + line);
            //line = line.split(',');
            //console.log(line);
            if (line[0] !== "") {
                //loop through columns
                //console.log(line);
                //having a weird bug where the first obj values are "getter and setter" ???
                json = {};
                for (j = 0; j < headers.length; j++) {
                    json[headers[j]] = line[j];
                }

                //add to array
                emails.push(json);
            }

        });

    return emails;
}

//takes a CSV file in which the headers and respective values are
// grouped together per line
//returns an Object with header-value pairs.
function OverviewCSVtoJSON(lines) {

    let json = {};
    let subJson = {};

    //loop through entries
    for (let i = 0; i < lines.length; i++) {
        //entry = {};

        //remove colons that are at the end of the string
        for(let k = 0; k < lines[i].length; k++) {
            if (lines[i][k][lines[i][k].length - 1] === ":") {
                lines[i][k] = lines[i][k].substring(0, lines[i][k].length - 1);
            }
        }

        //check if line is just a header
        //determined by: either it only has one column, OR the second column is empty (and the first column is not empty)
        if ((lines[i].length === 1 && lines[i][0].length > 2) || (lines[i][0].length > 1 && lines[i][1] === "")) {

            subJson = {};
            let j = i + 1;

            for (; j < lines.length; j++) {
                if (lines[j][0].length < 3){
                    break;
                }
                subJson[j - (i + 1)] = lines[j];
                lines[j] = "";
            }

            json[lines[i]] = subJson;
            i = j - 1;
        }

        //otherwise, proceed to make json entry as normal
        else if (lines[i].length > 1) {

            json[lines[i][0]] = lines[i][1];

        }
    }

    return json;
}


/*
Pre: Takes in an array of lines from a CSV file
Post: Returns a 2D array where the second dimension is the rows of the csv split into individual values
Purpose: To convert CSV rows into an array while maintaining non-delimiter comma values and removing excess quotes
 */
function CSVtoArr(lines) {

    let inQuote = false;

    return lines.map(row => {
        return row.split('')
            .map(char => {
                if (char === '"') {
                    inQuote = !inQuote;
                }
                else if (char === ',' && !inQuote) {
                    return '|';
                }

                return char;
            })
            .join('')
            .replace(/\"/g, "")
            .split('|');
    })
}

function XMLtoJSON(data) {

    //until API works, manually defining test data.
    data = '<rsp stat="ok" version="1.0"> <stats> <sent>1003</sent> <delivered>543</delivered> <total_clicks>54</total_clicks> <unique_clicks>5</unique_clicks> <soft_bounced>3</soft_bounced> <hard_bounced>2</hard_bounced> <opt_outs>454</opt_outs> <spam_complaints>123</spam_complaints> <opens>34</opens> <unique_opens>...</unique_opens> <delivery_rate>...</delivery_rate> <opens_rate>100%</opens_rate> <click_through_rate>20%</click_through_rate> <unique_click_through_rate>...</unique_click_through_rate> <click_open_ratio>...</click_open_ratio> <opt_out_rate>34%</opt_out_rate> <spam_complaint_rate>0.0</spam_complaint_rate> </stats> </rsp>';

    let json = {};
    let parser = new DOMParser();
    let stats = parser.parseFromString(data, "text/xml").getElementsByTagName("stats");

    stats[0].childNodes.forEach(node => {
        json[node.nodeName] = node.textContent;
    });

    if (json["#text"]) {
        delete json["#text"];
    }

    console.log("xml test:");
    console.log(json);

    return json;
}

//Takes an array of Objects
//returns an array of XML if successful, error message or undefined if not.
function getPardotEmails(data) {

    Promise.all(
        data.filter(line => line["Email Id"] !== undefined && line["Email Id"] !== "")
            .map(line => {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    //needs user_key and api_key still, to be sent
                    xhr.open('POST', 'https://pi.pardot.com/api/email/version/4/do/stats/id/' + line["Email Id"] + "?");
                    xhr.onload = () => resolve(xhr.responseText);
                    xhr.onerror = () => reject(xhr.statusText);
                    xhr.send();
                });
        })
    ).then(function(values) {
        console.log(values);
        if (Array.isArray(values)){
            return values;
        }
        return [values];
    }).catch(function(values) {
        console.log("error");
        return "error";
    });

}


//receives data and metadata after CSV file was parsed.
function processData(data, metadata) {
    //console.log(metadata);
    console.log(data);

    //determine if myEmma or Pardot
    //Pardot can have multiple emails in one sheet

    //pardot- can handle multiple emails
    if ((Array.isArray(data) && data[0]["Email Id"]) || data["Email Id"]) {

        let xmlResponse = getPardotEmails(data);

        //check if error or check if it's not an array ?
        if (xmlResponse === "error" || xmlResponse === undefined) {
            console.log("The Pardot API had an error trying to receive data.");

            //just for testing, because the API will not work no matter what rn
            let jsonReport = XMLtoJSON("hi");
            jsonReport["Email List Info"] = data[0];
            generateReport(jsonReport, "Pardot");

        //API was successful, loop through responses
        } else {
            //loop through xml responses for each one,
            // convert to JSON, add on attributes from CSV file, and then generate its report.
            let jsonReport = {};
            for (let i = 0; i < xmlResponse.length; i++) {
                jsonReport = XMLtoJSON(xmlResponse[i]);
                jsonReport["Email List Info"] = data[i];
                generateReport(jsonReport, "Pardot")
            }
        }

    //myEmma
    } else {
        generateReport(data, "MyEmma");
    }

}


