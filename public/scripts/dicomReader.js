function displayMetadata(dataSet) {
  const instanceBasicInfoFields = [
    { tag: "x0020000d", name: "StudyInstanceUID", type: "String" },
    { tag: "x00080018", name: "SopInstanceUID", type: "String" },
    { tag: "x00080016", name: "SopClassUID", type: "String" },
    { tag: "x00080060", name: "Modality", type: "String" },
  ];

  // Display Instance Basic Info
  populateTableSection("instanceBasicInfo", dataSet, instanceBasicInfoFields);
}

function populateTableSection(sectionId, dataSet, fields) {
  const sectionDiv = document.getElementById(sectionId);
  sectionDiv.innerHTML = "";

  fields.forEach((field) => {
    let value = "N/A";

    if (field.type === "String") {
      let element = dataSet.elements[field.tag];
      if (element !== undefined) {
        let strValue = dataSet.string(field.tag);
        if (strValue !== undefined) {
          value = strValue;
        }
      }
    } else if (field.type === "Uint") {
      let element = dataSet.elements[field.tag];
      if (element !== undefined) {
        if (element.length === 2) {
          value += dataSet.uint16(field.tag);
        } else if (element.length === 4) {
          value += dataSet.uint32(field.tag);
        }
      }
    }

    const row = document.createElement("div");
    row.className = "dicom-table-row";

    const cellTag = document.createElement("div");
    cellTag.className = "dicom-table-cell";
    cellTag.textContent = field.name;

    const cellValue = document.createElement("div");
    cellValue.className = "dicom-table-cell";
    cellValue.textContent = value;

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
