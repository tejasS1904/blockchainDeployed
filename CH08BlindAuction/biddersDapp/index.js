const express = require("express");
const path = require("path");

const app = express();
const PORT = 3001;

// Serve static files from "src" folder
app.use(express.static(path.join(__dirname, "src")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
