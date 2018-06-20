document.addEventListener("DOMContentLoaded", () => {
    let inputElement = document.getElementById('file-input');
    inputElement.addEventListener("change", parseFiles, false);
    inputElement.innerHTML = "";

    let dropbox = document.getElementById('drop-box');
    dropbox.addEventListener("dragenter", dragenter, false);
    dropbox.addEventListener("dragover", dragover, false);
    dropbox.addEventListener("drop", drop, false);
});