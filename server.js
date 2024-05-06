const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3030;
const defaultData = {};

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors());

let allTxtMsg = [];
let allFiles = [];
let allAudio = [];
let allVideo = [];
let allMsg = [];

app.get("/", (req, res) => {
  res.send("Serever working");
});

app.get("/available", (req, res) => {
  res.send({
    headers: { "Content-Type": "application/json" },
    succes: true,
    message: "Server connection success!",
  });
});

app.listen(port, () => {
  console.log(`Server start on port ${port}`);
});

const txtAndLinkFile = path.join(__dirname, "/storage/txt.json");
const filesData = path.join(__dirname, "/storage/files.json");
const audioData = path.join(__dirname, "/storage/audio.json");
const videoData = path.join(__dirname, "/storage/video.json");

// const dataFromClient = fs.existsSync(storageFile)
//   ? JSON.parse(fs.readFileSync(storageFile))
//   : defaultData;

app.get("/allMessages", (req, res) => {
  let body = JSON.stringify(allMsg);
  res.send({
    headers: { "Content-Type": "application/json" },
    succes: true,
    message: "All messages received",
    fullMessages: allMsg,
  });
});

app.post("/", (req, res) => {
  const msg = req.body;
  allMsg.push(msg);
  console.log(msg);

  if (msg.type == "txt" || msg.type == "link") {
    allTxtMsg.push(msg);

    // fs.writeFileSync(txtAndLinkFile, JSON.stringify(allTxtMsg)); // по заданию не требуется

    res.send({
      headers: { "Content-Type": "application/json" },
      succes: true,
      message: "Message added!",
      allTxtMessages: allTxtMsg,
    });
  }
  if (msg.type == "file") {
    allFiles.push(msg);

    // fs.writeFileSync(filesData, JSON.stringify(allFiles)); // по заданию не требуется

    res.send({
      headers: { "Content-Type": "application/json" },
      succes: true,
      message: "File added!",
      allFilesMsg: allFiles,
    });
  }
  if (msg.type == "audio") {
    allAudio.push(msg);

    // fs.writeFileSync(audioData, JSON.stringify(allAudio)); // по заданию не требуется

    res.send({
      headers: { "Content-Type": "application/json" },
      succes: true,
      message: "Audio added!",
      allAudioMsg: allAudio,
    });
  }
  if (msg.type == "video") {
    allVideo.push(msg);

    // fs.writeFileSync(videoData, JSON.stringify(allVideo)); // по заданию не требуется

    res.send({
      headers: { "Content-Type": "application/json" },
      succes: true,
      message: "Video added!",
      allVideoMsg: allVideo,
    });
  }
});

app.delete("/", (req, res) => {
  const msg = req.body;
  if (msg.id) {
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
    for (const item of allFiles) {
      if (item.id === msg.id) {
        let thisMsg = item;
        let index = allFiles.indexOf(thisMsg);

        allFiles.splice(index, 1);
        // fs.writeFileSync(filesData, JSON.stringify(allFiles)); // по заданию не требуется

        res.send({
          headers: { "Content-Type": "application/json" },
          succes: true,
          message: "This file deleted!",
          allFilesMsg: allFiles,
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
  }

  allTxtMsg = [];
  allFiles = [];
  allAudio = [];
  allVideo = [];
  allMsg = [];

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
