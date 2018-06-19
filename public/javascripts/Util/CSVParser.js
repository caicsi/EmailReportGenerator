//var JSZip = require("jszip");

/*
    parseFiles: event listener function for input button onchange
 */
function parseFiles() {
    let fileList = this.files;
    console.log(fileList);

    for (let i = 0; i < fileList.length; i++) {
        let blob = fileList[i];
        //console.log(blob);

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
                return CSVToJSONConverter(blob);
                break;
            default:
                break;
        }
    }
}

//Takes a blob of a CSV file and returns a JSON
function CSVToJSONConverter(Blob) {

    let reader = new FileReader();
    reader.onload = function(e) {
        let text = reader.result;
        let headers = [];
        let json = [];
        let lines = text.split('\n');

        let i = findHeaders(lines);
        console.log(i);

        lines = removeBackslashes(lines, i);
        console.log(lines);
        headers = lines[0];

        //loop through entries (proceeding the headers)
        //help from http://techslides.com/convert-csv-to-json-in-javascript
        for (let i = 1; i < lines.length; i++) {
            let entry = {};
            let line = lines[i];

            //loop through columns
            for(let j = 0; j < headers.length; j++) {
                entry[headers[j]] = line[j];
            }

            json.push(entry);
        }

        console.log(json);
        return json;
    };

    //set the file reader to read the contents as text
    reader.readAsText(Blob);

}

//find headers in an array of lines of CSV. returns index of headers
function findHeaders(lines) {

    //find headers- usually the 5th element, but just in case.
    for (let i = 0; i < lines.length; i++) {

        if (lines[i].includes(",") && lines[i].split(",").length > 2) {
            return i;
        }
    }

    return -1;
}

//takes an array of lines (from CSV) and removes any /", as well as the lines before the headers.
//returns the new 2D array without those characters, and the first element is the headers.
function removeBackslashes(lines, index) {

    let newLines = [];

    //the text read in needs to be reformatted. Right now, if an entry is one word, it
    // has no \" surrounding it. But if it's multiple words, it does.
    //loop through all entries starting with the header and reformat them
    for (let k = index; k < lines.length; k++) {
        let row = lines[k];

        let entries = row.split(",");
        for (let l = 0; l < entries.length; l++) {
            while (entries[l][0] === "\"" && entries[l][entries[l].length - 1] !== "\"") {
                entries[l] = entries[l] + ',' + entries[l + 1];
                entries.splice(l + 1, 1);
            }

            entries[l] = entries[l].replace(/\"/g, "");
        }

        newLines[k - index] = entries;
    }

    return newLines;
}
