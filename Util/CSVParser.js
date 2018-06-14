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
                new JSZip.external.Promise((resolve, reject) => {
                   JSZipUtils.getBinaryContent(blob, (err, data) => {
                       if (err) {
                           reject(err)
                       } else {
                           resolve(data);
                       }
                   })
                }).then(data => {
                    return JSZip.loadAsync(data)
                }).then(function success(zip) {
                    console.log("success", zip.files)
                }, function failure(e) {
                    console.error("failure", e)
                });
                // JSZipUtils.getBinaryContent(blob, (err, data) => {
                //    if (err) {
                //        throw err;
                //    }
                //
                //    console.log(data);
                //
                //    JSZip.loadAsync(data).then(zip => {
                //        console.log('in loadAsync');
                //
                //        zip.forEach((relativePath, zipEntry) => {
                //            console.log(relativePath);
                //            console.log(zipEntry);
                //        })
                //    })
                // });
                break;
            case "text/csv":
                break;
            default:
                break;
        }
    }
}