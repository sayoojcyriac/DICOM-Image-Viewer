function initializeCornerstone() {
  // Configure cornerstoneWADOImageLoader
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.webWorkerManager.initialize({
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    webWorkerTaskPaths: [],
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: true,
        usePDFJS: false,
      },
    },
  });

  // Optional: Set up a function to handle any errors during image loading
  cornerstone.events.addEventListener(
    "cornerstoneimageloadfailed",
    function (event) {
      console.error(event.detail.error);
    }
  );
}

// Call this function when your application initializes
initializeCornerstone();

function renderDICOMImage(file) {
  const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
  const element = document.getElementById("dicomImage");

  cornerstone.enable(element);
  // Initialize Cornerstone Tools
  cornerstoneTools.init({
    showSVGCursors: true,
  });

  cornerstone
    .loadImage(imageId)
    .then(function (image) {
      console.log(image);
      cornerstone.displayImage(element, image);

      const numFrames = image.data.intString("x00280008");
      if (numFrames > 1) {
        setupMultiFrame(element, imageId, numFrames);
      }
    })
    .catch(function (error) {
      console.error("Error loading the image:", error);
    });
}

function setupMultiFrame(element, imageId, numFrames) {
  // Create an array of imageIds for each frame
  let imageIds = Array.from({ length: numFrames }, (_, index) => {
    return imageId + "?frame=" + index;
  });

  // Setup the stack
  const stack = {
    currentImageIdIndex: 0,
    imageIds: imageIds,
  };
  cornerstoneTools.addStackStateManager(element, ["stack"]);
  cornerstoneTools.addToolState(element, "stack", stack);

  // Activate scroll tool
  const toolName = "StackScrollMouseWheel";
  const apiTool = cornerstoneTools[`${toolName}Tool`];
  cornerstoneTools.addTool(apiTool);
  cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
}
