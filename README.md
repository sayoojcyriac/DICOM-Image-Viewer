# DICOM-Image-Viewer

A simple application to read and render DICOM image

# Dependencies

# npm install cornerstone-core cornerstone-tools cornerstone-wado-image-loader dicom-parser

# npm install cornerstone-math

# Building Docker Image

docker build -t dicom-image-viewer .

# Running the docker imahe

docker run -p 3000:3000 dicom-image-viewer
