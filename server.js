const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3030;

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.listen(port, () => {
  console.log(`Server start on port ${port}`);
});

app.use(bodyParser.json());
app.use(express.static("public"));

const storageFile = path.join(__dirname, "/storage/data.json");

const dataFromClient = fs.existsSync(storageFile)
  ? JSON.parse(fs.readFileSync(storageFile))
  : console.log("error parse");

app.get("/messages", (req, res) => {
  res.send(dataFromClient);
});

app.post("/users/add", (req, res) => {
  const msg = req.body;
  // users.push({
  //   id,
  //   ...user,
  // });

  fs.writeFileSync(storageFile, JSON.stringify(msg));

  res.send({
    succes: true,
    message: "Message added!",
  });
});
