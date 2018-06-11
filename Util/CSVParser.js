/*
    parseFiles: event listener function for input button onchange
 */
function parseFiles() {
    let fileList = this.files;
    console.log(fileList);

    for (let i = 0; i < fileList.length; i++) {
        let blob = fileList[i];

        switch(blob.type) {
            case "application/zip":
                JSZipUtils.getBinaryContent(blob, (err, data) => {
                   if (err) {
                       throw err;
                   }

                   JSZip.loadAsync(data).then(zip => {
                       console.log('in loadAsync');

                       zip.forEach((relativePath, zipEntry) => {
                           console.log(relativePath);
                           console.log(zipEntry);
                       })
                   })
                });
                break;
            case "text/csv":
                break;
            default:
                break;
        }
    }
}