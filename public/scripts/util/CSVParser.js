//var JSZip = require("jszip");

/*
    parseFiles: event listener function for input button onchange
 */
function parseFiles() {
    let fileList = this.files;

    for (let i = 0; i < fileList.length; i++) {
        let blob = fileList[i];

        switch(blob.type) {
            case "application/zip":
                new JSZip.external.Promise(function (resolve, reject) {
                   JSZipUtils.getBinaryContent(blob, (err, data) => {
                       if (err) {
                           console.log(data);
                           reject(err);
                       } else {
                           resolve(data);
                       }
                   });
                }).then(data => {
                    console.log("here");
                    return JSZip.loadAsync(data)
                }).then(function success(zip) {
                    console.log("success", zip.files)
                }, function failure(e) {
                    console.error("failure\n", e)
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

        //loop through entries (proceeding the headers)
        //help from http://techslides.com/convert-csv-to-json-in-javascript
        lines.filter(line => line.length > 1).slice(1).forEach(line => {
            let entry = {};


            //loop through columns
            for(let j = 0; j < headers.length; j++) {
                entry[headers[j]] = line[j];
            }

            json.push(entry);
        });

        json.shift();

        callback(json, lines.filter(line => line.length === 1).filter(line => line[0] !== ""));
    };

    //set the file reader to read the contents as text
    reader.readAsText(Blob);

}

function processData(data, metadata) {
    console.log(metadata);
    console.log(data)
}

//takes an array of lines (from CSV) and removes any \", as well as the lines before the headers.
//returns the new 2D array without those characters, and the first element is the headers.
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
