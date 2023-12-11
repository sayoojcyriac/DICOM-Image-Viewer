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

    // Display pixel data insights
    displayPixelDataInsights(dataSet);
  };

  reader.readAsArrayBuffer(file);
}

function displayPixelDataInsights(dataSet) {
  const insightsDiv = document.getElementById("pixelDataInsights");
  insightsDiv.innerHTML = ""; // Clear previous insights

  const transferSyntaxUID = dataSet.string("x00020010");
  let isCompressed = isDataCompressed(transferSyntaxUID);
  // Display isCompressed insight
  const compressionStatus = document.createElement("div");
  compressionStatus.className = "insight";
  compressionStatus.textContent = `Pixel Data is ${
    isCompressed ? "Compressed" : "Uncompressed"
  } - But, double-check the TransferSyntax`;
  insightsDiv.appendChild(compressionStatus);

  // Get relevant attributes to compute expected pixel data length
  const rows = dataSet.uint16("x00280010");
  const columns = dataSet.uint16("x00280011");
  const samplesPerPixel = dataSet.uint16("x00280002");
  const bitsAllocated = dataSet.uint16("x00280100");
  const numberOfFrames = dataSet.intString("x00280008") || 1;
  const photometricInterpretation = dataSet.string("x00280004");

  let bytesPerPixel = bitsAllocated / 8;
  let exptectedPixelDataLength =
    rows * columns * bytesPerPixel * samplesPerPixel * numberOfFrames;

  if (photometricInterpretation === "YBR_FULL_422") {
    // Adjust for YBR_FULL_422 chroma subsampling
    exptectedPixelDataLength = rows * columns * bytesPerPixel * numberOfFrames;
    exptectedPixelDataLength +=
      rows * Math.ceil(columns / 2) * bytesPerPixel * numberOfFrames;
  }

  // Expected Pixel Data Length
  const expectedLengthDiv = document.createElement("div");
  expectedLengthDiv.className = "insight";
  expectedLengthDiv.textContent = `Expected Pixel Data Length: ${exptectedPixelDataLength} bytes`;
  insightsDiv.appendChild(expectedLengthDiv);

  // Raw Pixel Data Length
  const rawPixelDataLength = dataSet.elements.x7fe00010.length; // Raw data length
  const actualLengthDiv = document.createElement("div");
  actualLengthDiv.className = "insight";
  actualLengthDiv.textContent = `Raw Pixel Data Length in DICOM: ${rawPixelDataLength} bytes`;
  insightsDiv.appendChild(actualLengthDiv);
}

function isDataCompressed(transferSyntaxUID) {
  // Common uncompressed Transfer Syntax UIDs
  const uncompressedSyntaxUIDs = [
    "1.2.840.10008.1.2", // Implicit VR Little Endian
    "1.2.840.10008.1.2.1", // Explicit VR Little Endian
    "1.2.840.10008.1.2.2", // Explicit VR Big Endian
  ];

  return !uncompressedSyntaxUIDs.includes(transferSyntaxUID);
}

document
  .getElementById("dicomFile")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      readDICOMFile(file);
    }
  });
