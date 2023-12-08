function displayMetadata(dataSet) {
  const table = document.getElementById("dicomTable");

  // Remove existing rows except the header
  while (table.children.length > 1) {
    table.removeChild(table.lastChild);
  }

  // Define the metadata fields to display
  const metadataFields = [
    { tag: "x00280010", name: "Rows" },
    { tag: "x00280011", name: "Columns" },
    { tag: "x00280008", name: "Number of Frames", defaultValue: "1" },
    { tag: "x00280100", name: "Bits Allocated" },
    { tag: "x00280002", name: "Samples Per Pixel" },
    { tag: "x00020010", name: "Transfer Syntax" },
    { tag: "x00280004", name: "Photometric Interpretation" },
  ];

  // Iterate over the metadata fields and create HTML content
  metadataFields.forEach((field) => {
    const value = dataSet.string(field.tag) || field.defaultValue || "N/A";

    const row = document.createElement("div");
    row.className = "dicom-table-row";

    const cellTag = document.createElement("span");
    cellTag.className = "dicom-table-cell";
    cellTag.textContent = field.name;

    const cellValue = document.createElement("span");
    cellValue.className = "dicom-table-cell";
    cellValue.textContent = value;

    row.appendChild(cellTag);
    row.appendChild(cellValue);

    table.appendChild(row);
  });
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
