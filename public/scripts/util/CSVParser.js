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
        let json = [];
        let lines = text.split('\n');

        lines = CSVtoArr(lines);

        let headers = lines.filter(line => line.length > 1)[0];

        //check if the CSV has all headers on top, or each line has a header.
        //Pardot will have all headers on top.
        if (headers[0] === "Email Id") {
            json = CSVtoJSON(lines, json, headers);
        }
        //if it's not the overview, parse normally
        else {
            json = OverviewCSVtoJSON(lines, json);
        }

        callback(json, lines.filter(line => line.length === 1 && line[0] !== ""));
    };

    //set the file reader to read the contents as text
    reader.readAsText(Blob);
}

function CSVtoJSON(lines, json, headers) {
    //loop through entries (proceeding the headers)
    let entry = {};
    lines.filter(line => line.length > 1)
        .slice(1) //remove the headers
        .forEach(line => {
            entry = {};

            //loop through columns
            for(let j = 0; j < headers.length; j++) {
                entry[headers[j]] = line[j];
            }

            json.push(entry);
        });
    return json;
}

function OverviewCSVtoJSON(lines, json) {

    let entry = {};
    let subJson = {};


    //loop through entries
    for (let i = 0; i < lines.length; i++) {
        entry = {};

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
            entry[lines[i]] = subJson;
            i = j - 1;
            //json.push(entry); //move to below if/else if we want to see the gaps in the CSV file
        }
        //otherwise, proceed to make json entry as normal
        else if (lines[i].length > 1) {
            entry[lines[i][0]] = lines[i][1];

            //json.push(entry); //move to below if/else if we want to see the gaps in the CSV file
        }

        json.push(entry);
    }

    return json;
}

function processData(data, metadata) {
    console.log(metadata);
    console.log(data);

    //determine if myEmma or Pardot
    //Pardot can have multiple emails in one sheet

    if (data[0]["Email Id"]) {
        //pardot
        getPardotEmails(data);
    }

    generateReport(data);
}

function getPardotEmails(data) {
    console.log("pardot");

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
    }).catch(function(values) {
        console.log("error");
        console.log(values);
    });
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