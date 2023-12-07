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
