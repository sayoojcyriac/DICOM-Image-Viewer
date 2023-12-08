function displayMetadata(dataSet) {
  const instanceBasicInfoFields = [
    { tag: "x0020000d", name: "StudyInstanceUID", type: "String" },
    { tag: "x00080018", name: "SopInstanceUID", type: "String" },
    { tag: "x00080016", name: "SopClassUID", type: "String" },
    { tag: "x00080060", name: "Modality", type: "String" },
  ];

  // Display Instance Basic Info
  populateTableSection("instanceBasicInfo", dataSet, instanceBasicInfoFields);

  const imageInfoFields = [
    { tag: "x00280010", name: "Rows", type: "Uint" },
    { tag: "x00280011", name: "Columns", type: "Uint" },
    { tag: "x00280008", name: "Number of Frames", type: "Uint", default: 1 },
    { tag: "x00280100", name: "Bits Allocated", type: "Uint" },
    { tag: "x00280002", name: "Samples Per Pixel", type: "Uint" },
    { tag: "x00020010", name: "Transfer Syntax UID", type: "String" },
    { tag: "x00280004", name: "Photometric Interpretation", type: "String" },
  ];

  // Display Image Info
  populateTableSection("imageInfo", dataSet, imageInfoFields);
}

function getValue(dataSet, field) {
  const element = dataSet.elements[field.tag];
  if (!element) {
    return field.default ? field.default : "N/A";
  }

  switch (field.type) {
    case "String":
      return dataSet.string(field.tag) || "N/A";
    case "Uint":
      return element.length === 2
        ? dataSet.uint16(field.tag)
        : dataSet.uint32(field.tag);
    default:
      return "N/A";
  }
}

function populateTableSection(sectionId, dataSet, fields) {
  const sectionDiv = document.getElementById(sectionId);
  sectionDiv.innerHTML = "";

  fields.forEach((field) => {
    let value = "N/A";

    const row = document.createElement("div");
    row.className = "dicom-table-row";

    const cellTag = document.createElement("div");
    cellTag.className = "dicom-table-cell";
    cellTag.textContent = field.name;

    const cellValue = document.createElement("div");
    cellValue.className = "dicom-table-cell";
    cellValue.textContent = getValue(dataSet, field);

    row.appendChild(cellTag);
    row.appendChild(cellValue);

    sectionDiv.appendChild(row);
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
