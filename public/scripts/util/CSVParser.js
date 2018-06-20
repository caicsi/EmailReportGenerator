import * as JSZip from "jszip";

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

        //loop through entries (proceeding the headers)
        //help from http://techslides.com/convert-csv-to-json-in-javascript
        lines.filter(line => line.length > 1)
            .slice(1)
            .forEach(line => {
            let entry = {};


            //loop through columns
            for(let j = 0; j < headers.length; j++) {
                entry[headers[j]] = line[j];
            }

            json.push(entry);
        });

        json.shift();

        callback(json, lines.filter(line => line.length === 1 && line[0] !== ""));
    };

    //set the file reader to read the contents as text
    reader.readAsText(Blob);

}

function processData(data, metadata) {
    console.log(metadata);
    console.log(data)
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
