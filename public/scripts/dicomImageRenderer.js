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

  cornerstone.loadImage(imageId).then(function (image) {
    cornerstone.displayImage(element, image);

    if (image.data.string("x00280008")) {
      cornerstoneTools.addStackStateManager(element, ["stack"]);
      cornerstoneTools.addToolState(element, "stack", {
        currentImageIdIndex: 0,
        imageIds: [imageId],
      });

      const stackScroll = cornerstoneTools.StackScrollTool;
      cornerstoneTools.addTool(stackScroll);
      cornerstoneTools.setToolActive("StackScroll", { mouseButtonMask: 1 });
    }
  });
}
