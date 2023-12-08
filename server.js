const express = require("express");
const app = express();
const path = require("path");
const port = 3000;

app.use(express.static("public"));
app.use(
  "/scripts",
  express.static(path.join(__dirname, "node_modules/cornerstone-core/dist"))
);
app.use(
  "/scripts",
  express.static(path.join(__dirname, "node_modules/cornerstone-math/dist"))
);
app.use(
  "/scripts",
  express.static(path.join(__dirname, "node_modules/cornerstone-tools/dist"))
);
app.use(
  "/scripts",
  express.static(
    path.join(
      __dirname,
      "node_modules/cornerstone-wado-image-loader/dist/dynamic-import"
    )
  )
);
app.use(
  "/scripts",
  express.static(path.join(__dirname, "node_modules/dicom-parser/dist"))
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
