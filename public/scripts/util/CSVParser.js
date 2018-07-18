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

        //check if the CSV is the overview; headers will be different.
        //detected by seeing if the very first line has more than one column
        if (headers === lines[0]) {
            json = OverviewCSVtoJSON(lines, json);
        }
        //if it's not the overview, parse normally
        else {
           json = CSVtoJSON(lines, json, headers);
        }

        //json.shift(); headers are already removed above

        callback(json, lines.filter(line => line.length === 1 && line[0] !== ""));
    };

    //set the file reader to read the contents as text
    reader.readAsText(Blob);
}

function CSVtoJSON(lines, json, headers) {
    //loop through entries (proceeding the headers)
    lines.filter(line => line.length > 1)
        .slice(1) //remove the headers
        .forEach(line => {
            let entry = {};

            //loop through columns
            for(let j = 0; j < headers.length; j++) {
                entry[headers[j]] = line[j];
            }

            json.push(entry);
        });
    return json;
}

function OverviewCSVtoJSON(lines, json) {

    //loop through entries
    for (let i = 0; i < lines.length; i++) {
        let entry = {};

        //remove colons that are at the end of the string
        for(let k = 0; k < lines[i].length; k++) {
            if (lines[i][k][lines[i][k].length - 1] === ":") {
                lines[i][k] = lines[i][k].substring(0, lines[i][k].length - 1);
            }
        }

        //check if line is just a header
        //determined by: either it only has one column, OR the second column is empty (and the first column is not empty)
        if ((lines[i].length === 1 && lines[i][0].length > 2) || (lines[i][0].length > 1 && lines[i][1] === "")) {
            let subJson = {};
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
            //console.log("" + lines[i][0] + " length is: " + lines[i].length);
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

    generateReport(data);
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