function displayMetadata(dataSet) {
  // Implement metadata display logic
  // Iterate over dataSet elements and create .info-card divs for each
  var rows = dataSet.uint16("x00280010"); // Rows
  var columns = dataSet.uint16("x00280011"); // Columns
  var numberOfFrames = dataSet.intString("x00280008"); // Number of Frames
  var bitsAllocated = dataSet.uint16("x00280100"); // Bits Allocated
  var samplesPerPixel = dataSet.uint16("x00280002"); // Samples per Pixel
  var transferSyntax = dataSet.string("x00020010"); // Transfer Syntax
  var compressed = transferSyntax !== "1.2.840.10008.1.2.1"; // Check for compression
  var photometricInterpretation = dataSet.string("x00280004"); // Color Space

  var infoDiv = document.getElementById("dicomInfo");
  infoDiv.innerHTML =
    "Rows: " +
    rows +
    "<br>" +
    "Columns: " +
    columns +
    "<br>" +
    "Number of Frames: " +
    numberOfFrames +
    "<br>" +
    "Bits Allocated: " +
    bitsAllocated +
    "<br>" +
    "Samples Per Pixel: " +
    samplesPerPixel +
    "<br>" +
    "Transfer Syntax: " +
    transferSyntax +
    "<br>" +
    "Is Pixel Data Compressed: " +
    (compressed ? "Yes" : "No") +
    "<br>" +
    "Color Space: " +
    photometricInterpretation;
}

function readDICOMFile() {
  var fileInput = document.getElementById("dicomFile");
  var file = fileInput.files[0];

  const reader = new FileReader();

  reader.onload = function (event) {
    const arrayBuffer = event.target.result;
    const byteArray = new Uint8Array(arrayBuffer);
    const dataSet = dicomParser.parseDicom(byteArray);

    displayMetadata(dataSet);

    renderDICOMImage(file);
  };

  reader.readAsArrayBuffer(file);
}

document
  .getElementById("dicomFile")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      readDICOMFile(file);
    }
  });
