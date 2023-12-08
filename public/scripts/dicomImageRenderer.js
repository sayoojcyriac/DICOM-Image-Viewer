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

function setupStackScroll(element, imageIds) {
  // Initialize stack state
  const stack = {
    currentImageIdIndex: 0,
    imageIds: imageIds,
  };

  cornerstoneTools.addStackStateManager(element, ["stack"]);
  cornerstoneTools.addToolState(element, "stack", stack);

  // Activate the stack scroll tool
  cornerstoneTools.stackScroll.activate(element, 1); // 1 is the left mouse button
  cornerstoneTools.stackScrollWheel.activate(element);
}

function renderDICOMImage(file) {
  const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
  const element = document.getElementById("dicomImage");

  cornerstone.enable(element);

  cornerstone
    .loadImage(imageId)
    .then(function (image) {
      cornerstone.displayImage(element, image);

      // Check if it's a multi-frame image
      if (image.data.intString("x00280008")) {
        const numFrames = image.data.intString("x00280008");
        let imageIds = Array.from({ length: numFrames }, (_, i) =>
          cornerstoneWADOImageLoader.wadouri.fileManager.add(file, i)
        );

        setupStackScroll(element, imageIds);

        initializeScrollOnMouseMove(element);
      }
    })
    .catch(function (error) {
      console.error("Error loading the image:", error);
    });
}

function initializeScrollOnMouseMove(element) {
  let lastY = 0;

  element.addEventListener("mousemove", function (event) {
    if (!event.buttons) {
      return; // Only proceed if the mouse button is pressed
    }

    const deltaY = event.clientY - lastY;
    lastY = event.clientY;

    const stackState = cornerstoneTools.getToolState(element, "stack");
    if (stackState) {
      const stackData = stackState.data[0];
      const newImageIdIndex =
        stackData.currentImageIdIndex + (deltaY > 0 ? 1 : -1);

      if (newImageIdIndex >= 0 && newImageIdIndex < stackData.imageIds.length) {
        cornerstoneTools.scrollToIndex(element, newImageIdIndex);
      }
    }
  });

  element.addEventListener("mousedown", function (event) {
    lastY = event.clientY;
  });
}
