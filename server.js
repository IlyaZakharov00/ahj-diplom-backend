const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const fileUploader = require("express-fileupload");
const cors = require("cors");
const { http } = require("http");

const app = express();
const port = 3030;
const defaultData = {};

app.use(bodyParser.json());
app.use(express.static("storage/uploads"));
app.use(cors());
app.use(fileUploader());

let allTxtMsg = [];
let allFiles = [];
let allAudio = [];
let allVideo = [];
let allMsg = [];

const txtAndLinkFile = path.join(__dirname, "/storage/txt.json");
const filesData = path.join(__dirname, "/storage/files.json");
const audioData = path.join(__dirname, "/storage/audio.json");
const videoData = path.join(__dirname, "/storage/video.json");

app.listen(port, () => {
  console.log(`Server start on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Serever working");
});

app.get("/serverAvailable", (req, res) => {
  res.send({
    headers: { "Content-Type": "application/json" },
    succes: true,
    message: "Server connection success!",
  });
});

app.get("/getAllMessages", (req, res) => {
  let body = JSON.stringify(allMsg);
  res.send({
    headers: { "Content-Type": "application/json" },
    succes: true,
    message: "All messages received",
    fullMessages: allMsg,
  });
});

app.post("/sendMessage", (req, res) => {
  const msg = req.body;
  allMsg.push(msg);

  if (msg.type == "txt" || msg.type == "link") {
    allTxtMsg.push(msg);

    res.send({
      headers: { "Content-Type": "application/json" },
      succes: true,
      message: "Message added!",
      allTxtMessages: allTxtMsg,
    });
  }
  if (msg.type == "audio") {
    allAudio.push(msg);

    res.send({
      headers: { "Content-Type": "application/json" },
      succes: true,
      message: "Audio added!",
      allAudioMsg: allAudio,
    });
  }
  if (msg.type == "video") {
    allVideo.push(msg);

    res.send({
      headers: { "Content-Type": "application/json" },
      succes: true,
      message: "Video added!",
      allVideoMsg: allVideo,
    });
  }
});

app.delete("/delete", (req, res) => {
  const msg = req.body;
  if (msg.id & !msg.nameFile) {
    for (const item of allMsg) {
      if (item.id === msg.id) {
        let thisMsg = item;
        let index = allMsg.indexOf(thisMsg);
        allMsg.splice(index, 1);
      }
    }
    for (const item of allTxtMsg) {
      if (item.id === msg.id) {
        let thisMsg = item;
        let index = allTxtMsg.indexOf(thisMsg);

        allTxtMsg.splice(index, 1);
        // fs.writeFileSync(storageFile, JSON.stringify(allTxtMsg)); // по заданию не требуется

        res.send({
          headers: { "Content-Type": "application/json" },
          succes: true,
          message: "This message deleted!",
          allTxtMessages: allTxtMsg,
        });
        return;
      }
    }
    for (const item of allAudio) {
      if (item.id === msg.id) {
        let thisMsg = item;
        let index = allAudio.indexOf(thisMsg);

        allAudio.splice(index, 1);
        // fs.writeFileSync(audioData, JSON.stringify(allAudio));  // по заданию не требуется

        res.send({
          headers: { "Content-Type": "application/json" },
          succes: true,
          message: "This audio deleted!",
          allAudioMsg: allAudio,
        });
        return;
      }
    }
    for (const item of allVideo) {
      if (item.id === msg.id) {
        let thisMsg = item;
        let index = allVideo.indexOf(thisMsg);

        allVideo.splice(index, 1);
        // fs.writeFileSync(videoData, JSON.stringify(allVideo)); // по заданию не требуется

        res.send({
          headers: { "Content-Type": "application/json" },
          succes: true,
          message: "This video deleted!",
          allVideoMsg: allVideo,
        });
        return;
      }
    }
  } else {
    fs.readdir(`${__dirname}/storage/uploads`, (error, files) => {
      if (error) console.log(error + "3");

      for (const item of files) {
        if (msg.nameFile === item) {
          for (let i = 0; i < files.length; i++) {
            fs.unlink(`${__dirname}/storage/uploads/${msg.nameFile}`, (e) =>
              console.log(e, "4")
            );
          }

          let index = allFiles.indexOf(msg);
          let index_ = allMsg.indexOf(msg);

          allFiles.splice(index, 1);
          allMsg.splice(index_, 1);

          res.send({
            headers: { "Content-Type": "application/json" },
            succes: true,
            message: "This file deleted!",
            allFilesMsg: allFiles,
          });
          return;
        }
      }
    });
  }

  // fs.writeFileSync(txtAndLinkFile, JSON.stringify(allTxtMsg)); // по заданию не требуется
  // fs.writeFileSync(filesData, JSON.stringify(allFiles)); // по заданию не требуется
  // fs.writeFileSync(audioData, JSON.stringify(allAudio)); // по заданию не требуется
  // fs.writeFileSync(videoData, JSON.stringify(allVideo)); // по заданию не требуется
});

app.delete("/clearAll", (req, res) => {
  allTxtMsg = [];
  allFiles = [];
  allAudio = [];
  allVideo = [];
  allMsg = [];

  fs.readdir(`${__dirname}/storage/uploads`, (error, files) => {
    if (error) console.log(error + "5");

    for (let i = 0; i < files.length; i++) {
      if (files[i] == "index.html") return;
      fs.unlink(`${__dirname}/storage/uploads/${files[i]}`, (error) =>
        console.log(error + "6")
      );
    }
  });

  // fs.writeFileSync(txtAndLinkFile, JSON.stringify(allTxtMsg)); // по заданию не требуется
  // fs.writeFileSync(filesData, JSON.stringify(allFiles)); // по заданию не требуется
  // fs.writeFileSync(audioData, JSON.stringify(allAudio)); // по заданию не требуется
  // fs.writeFileSync(videoData, JSON.stringify(allVideo)); // по заданию не требуется

  res.send({
    headers: { "Content-Type": "application/json" },
    succes: true,
    message: "All messages deleted!",
    allMsgInServer: allMsg,
  });
});

app.post("/sendFile", (req, res) => {
  console.log(typeof req.files);
  const file_ = req.files.file_;
  const data_ = req.body.data;
  const data = JSON.parse(data_);

  let file = {
    file: file_,
    data: data,
  };

  let newFileName = file_.name;

  file_.mv(`${__dirname}/storage/uploads/${newFileName}`, (error, file) => {
    if (error) console.log(error + "2");
  });

  allMsg.push(file);
  allFiles.push(file);

  let path = `/uploads/${newFileName}`;

  res.send({
    headers: { "Content-Type": "application/json" },
    succes: true,
    message: "File added!",
    name: newFileName,
    path: path,
    allFilesMsg: `Файлов сохранено ${allFiles.length}`,
  });
});

app.get("/downloadFile", (req, res) => {
  let id = req.query.id;
  let thisFile;
  let thisFileName;
  let thisFormat;

  for (const item of allFiles) {
    if (!item.data) return;
    if (item.data.id === id) {
      thisFile = item.file;
      thisFileName = item.data.name;
      thisFormat = item.data.format;
    }
  }
  let path_ = `${__dirname}/storage/uploads/${thisFileName}`;

  res.sendFile(path_);

  return;
});
