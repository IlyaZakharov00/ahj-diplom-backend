const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const fileUploader = require("express-fileupload");
const cors = require("cors");
const { http } = require("http");

const app = express();
const port = 3030;

app.use(bodyParser.json());
app.use(express.static("storage/uploads"));
app.use(express.static("storage/img"));
app.use(express.static("storage/mediaMessages"));
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
const allMessages = path.join(__dirname, "/storage/allMessages.json");

app.listen(port, () => {
  console.log(`Server start on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Serever working");
  // res.setHeader("Content-Type", "image/x-icon");
});

app.get("/serverAvailable", (req, res) => {
  res.send({
    headers: { "Content-Type": "application/json" },
    succes: true,
    message: "Server connection success!",
  });
});

app.get("/getAllMessages", (req, res) => {
  res.send({
    headers: { "Content-Type": "application/json" },
    succes: true,
    message: "All messages received",
    fullMessages: allMsg,
  });
});

app.post("/sendMessage", (req, res) => {
  const msg = req.body;

  try {
    allMsg.push(msg);
    fs.writeFileSync(allMessages, JSON.stringify(allMsg));

    if (msg.type == "txt" || msg.type == "link") {
      allTxtMsg.push(msg);
      fs.writeFileSync(txtAndLinkFile, JSON.stringify(allTxtMsg));

      console.log("Сообщение успешно отправлено!");
      res.send({
        headers: { "Content-Type": "application/json" },
        succes: true,
        message: "Message added!",
        allTxtMessages: allTxtMsg,
      });
    }
  } catch (error) {
    console.log("При отправке сообщения произошла ошибка!");
    res.send({
      headers: { "Content-Type": "application/json" },
      succes: false,
      message: "Failed to send message! " + error,
    });
  }
});

app.post("/sendMediaMessage", (req, res) => {
  try {
    let file_ = req.files.file;
    let data_ = req.body.data;
    let newFileName = file_.name;
    let format;
    const data = JSON.parse(data_);

    if (data.type == "audio") {
      format = ".mp3";
    } else if (data.type == "video") {
      format = ".mp4";
    }

    let file = {
      file: file_,
      data: data,
      format: format,
    };

    allMsg.push(file);
    fs.writeFileSync(allMessages, JSON.stringify(allMsg));

    file_.mv(
      `${__dirname}/storage/mediaMessages/${newFileName + format}`,
      (error, file) => {
        if (error) {
          console.log(
            "Произошла ошибка при попытке отправить медиа-сообщение :( " + error
          );
        } else if (file) {
          console.log("Успешно отправиили медиа-сообщение " + file);
        }
      }
    );
    let path = `/mediaMessages/${newFileName + format}`;

    if (data.type == "audio") {
      allAudio.push(file);
      fs.writeFileSync(audioData, JSON.stringify(file));

      console.log("Успешно отправиили аудио-сообщение!");
      res.send({
        headers: { "Content-Type": "application/json" },
        succes: true,
        message: "Audio added!",
        name: newFileName,
        path: path,
        allAudioMsg: "Аудио-сообщений сохранено " + allAudio.length,
      });
    }
    if (data.type == "video") {
      allVideo.push(file);
      fs.writeFileSync(videoData, JSON.stringify(file));

      console.log("Успешно отправиили видео-сообщение!");
      res.send({
        headers: { "Content-Type": "application/json" },
        succes: true,
        message: "Video added!",
        name: newFileName,
        path: path,
        allVideoMsg: "Видео-сообщений сохранено " + allVideo.length,
      });
    }
  } catch (error) {
    console.log("При отправке медиа-сообщения произошла ошибка!");
    res.send({
      headers: { "Content-Type": "application/json" },
      succes: false,
      message: "Failed to send media-message! " + error,
    });
  }
});

app.delete("/delete", (req, res) => {
  const msg = req.body;
  try {
    if (msg.id && !msg.nameFile) {
      for (const item of allMsg) {
        if (item.id === msg.id) {
          let thisMsg = item;
          let index = allMsg.indexOf(thisMsg);
          allMsg.splice(index, 1);
          fs.writeFileSync(allMessages, JSON.stringify(allMsg));
        }
      }
      for (const item of allTxtMsg) {
        if (item.id === msg.id) {
          let thisMsg = item;
          let index = allTxtMsg.indexOf(thisMsg);

          allTxtMsg.splice(index, 1);
          fs.writeFileSync(txtAndLinkFile, JSON.stringify(allTxtMsg));

          console.log("Успешно удалили сообщение!");
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
        if (item.data.id === msg.id) {
          let thisMsg = item;
          let format = msg.format;

          let index = allAudio.indexOf(thisMsg);
          let index_ = allMsg.indexOf(thisMsg);

          allAudio.splice(index, 1);
          allMsg.splice(index_, 1);
          fs.writeFileSync(audioData, JSON.stringify(allAudio));

          fs.readdir(`${__dirname}/storage/mediaMessages`, (error, files) => {
            if (error) {
              console.log(
                "Произошла ошибка при чтения удалить аудио-сообщений :( " +
                  error
              );
            } else if (files) {
              console.log("Чтение аудио-сообщений прошло успешно! " + files);
            }

            for (const item of files) {
              if (`${msg.id + format}` === item) {
                // for (let i = 0; i < files.length; i++) {
                fs.unlink(
                  `${__dirname}/storage/mediaMessages/${msg.id + format}`,
                  () => console.log("Удаление аудио-сообщения прошло успешно!")
                );
                // }
                res.send({
                  headers: {
                    "Content-Type": "application/json",
                  },
                  succes: true,
                  message: "This audio-message deleted!",
                  allAudio: "Осталось аудио сообщений " + allAudio.length,
                });
                return;
              }
            }
          });
        }
      }
      for (const item of allVideo) {
        if (item.data.id === msg.id) {
          let thisMsg = item;
          let format = msg.format;

          let index = allVideo.indexOf(thisMsg);
          let index_ = allMsg.indexOf(thisMsg);

          allVideo.splice(index, 1);
          allMsg.splice(index_, 1);
          fs.writeFileSync(videoData, JSON.stringify(allVideo));

          fs.readdir(`${__dirname}/storage/mediaMessages`, (error, files) => {
            if (error) {
              console.log(
                "Произошла ошибка при попытке прочитать видео-сообщения :( " +
                  error
              );
            } else if (files) {
              console.log("Чтение видео-сообщений прошло успешно!");
            }

            for (const item of files) {
              if (`${msg.id + format}` === item) {
                // for (let i = 0; i < files.length; i++) {
                fs.unlink(
                  `${__dirname}/storage/mediaMessages/${msg.id + format}`,
                  () => console.log("Удаление видео-сообщения прошло успешно!")
                );
                // }

                res.send({
                  headers: { "Content-Type": "application/json" },
                  succes: true,
                  message: "This audio-message deleted!",
                  allVideo: "Осталось видео сообщений " + allVideo.length,
                });
                return;
              }
            }
          });
        }
      }
    } else {
      fs.readdir(`${__dirname}/storage/uploads`, (error, files) => {
        if (error) {
          console.log(
            "Произошла ошибка при попытке прочитать файлы :( " + error
          );
        } else if (files) {
          console.log("Чтение файлов прошло успешно! " + files);
        }

        for (const item of files) {
          if (msg.nameFile === item) {
            // for (let i = 0; i < files.length; i++) {
            fs.unlink(`${__dirname}/storage/uploads/${msg.nameFile}`, () =>
              console.log("Удаление файла прошло успешно!")
            );
            // }

            let index = allFiles.indexOf(msg);
            let index_ = allMsg.indexOf(msg);

            allFiles.splice(index, 1);
            allMsg.splice(index_, 1);

            fs.writeFileSync(filesData, JSON.stringify(allFiles));
            fs.writeFileSync(allMessages, JSON.stringify(allMsg));

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
  } catch (error) {
    console.log("При удалении сообщения произошла ошибка!");
    res.send({
      headers: { "Content-Type": "application/json" },
      succes: false,
      message: "Failed to delete message! " + error,
    });
  }
});

app.delete("/clearAll", (req, res) => {
  allTxtMsg = [];
  allFiles = [];
  allAudio = [];
  allVideo = [];
  allMsg = [];

  try {
    fs.readdir(`${__dirname}/storage/uploads`, (error, files) => {
      if (error) {
        console.log("Произошла ошибка при попытке прочитать файлы :( " + error);
      } else if (files) {
        console.log("Чтение файлов прошло успешно!");
      }

      for (let i = 0; i < files.length; i++) {
        if (files[i] == "index.html") continue;
        fs.unlink(`${__dirname}/storage/uploads/${files[i]}`, (e) =>
          console.log("Удаление всех файлов прошло успешно! " + e)
        );
      }
    });

    fs.readdir(`${__dirname}/storage/mediaMessages`, (error, files) => {
      if (error) {
        console.log(
          "Произошла ошибка при попытке прочитать медиа-сообщения :( " + error
        );
      } else if (files) {
        console.log("Чтение медиа-сообщений прошло успешно! " + files);
      }
      for (let i = 0; i < files.length; i++) {
        if (files[i] == "index.html") continue;
        fs.unlink(`${__dirname}/storage/mediaMessages/${files[i]}`, (e) =>
          console.log("Удаление всех медиа-сообщений прошло успешно! " + e)
        );
      }
    });

    fs.writeFileSync(allMessages, JSON.stringify(allMsg));
    fs.writeFileSync(txtAndLinkFile, JSON.stringify(allTxtMsg));
    fs.writeFileSync(filesData, JSON.stringify(allFiles));
    fs.writeFileSync(audioData, JSON.stringify(allAudio));
    fs.writeFileSync(videoData, JSON.stringify(allVideo));

    console.log("Удаление всех сообщений прошло успешно!");
    res.send({
      headers: { "Content-Type": "application/json" },
      succes: true,
      message: "All messages deleted!",
      allMsgInServer: allMsg,
    });
  } catch (error) {
    console.log("При удалении всех сообщений произошла ошибка!");
    res.send({
      headers: { "Content-Type": "application/json" },
      succes: false,
      message: "Failed to delete all messages! " + error,
    });
  }
});

app.post("/sendFile", (req, res) => {
  const file_ = req.files.file_;
  const data_ = req.body.data;
  const data = JSON.parse(data_);

  let file = {
    file: file_,
    data: data,
  };

  let newFileName = file_.name;

  try {
    file_.mv(`${__dirname}/storage/uploads/${newFileName}`, (error, file) => {
      if (error) {
        console.log("Произошла ошибка при попытке отправить файл :( " + error);
      } else if (file) {
        console.log("Отправка файла прошла успешно! " + file);
      }
    });

    allMsg.push(file);
    allFiles.push(file);

    fs.writeFileSync(filesData, JSON.stringify(allFiles));
    fs.writeFileSync(allMessages, JSON.stringify(allMsg));

    let path = `/uploads/${newFileName}`;

    console.log("Успешно отправили файл!");
    res.send({
      headers: { "Content-Type": "application/json" },
      succes: true,
      message: "File added!",
      name: newFileName,
      path: path,
      allFilesMsg: `Файлов сохранено ${allFiles.length}`,
    });
  } catch (error) {
    console.log("При отправке файла произошла ошибка!");
    res.send({
      headers: { "Content-Type": "application/json" },
      succes: false,
      message: "Failed to send file! " + error,
    });
  }
});

app.get("/downloadFile", (req, res) => {
  let id = req.query.id;
  let thisFile;
  let thisFileName;
  let thisFormat;

  try {
    for (const item of allFiles) {
      if (!item.data) return;
      if (item.data.id === id) {
        thisFile = item.file;
        thisFileName = item.data.name;
        thisFormat = item.data.format;
      }
    }
    let path_ = `${__dirname}/storage/uploads/${thisFileName}`;

    console.log("Успешно загрузили файл!");
    res.sendFile(path_);
  } catch (error) {
    console.log("При загрузки файла произошла ошибка!");
    res.send({
      headers: { "Content-Type": "application/json" },
      succes: false,
      message: "Failed to download file! " + error,
    });
  }
});

app.get("/downloadMediaMessage", (req, res) => {
  let thisFile;
  let thisFileName;
  let thisFormat;

  try {
    for (const item of allMsg) {
      let id = req.query.id;
      if (!item.data) continue;
      if (item.data.id === id) {
        thisFile = item.file;
        thisFileName = item.data.id;
        thisFormat = item.data.format;
        let path_ = `${__dirname}/storage/mediaMessages/${
          thisFileName + thisFormat
        }`;
        console.log("Успешно загрузили медиа-сообщения!");
        res.sendFile(path_);
      }
    }
  } catch (error) {
    console.log("При загрузки медиа-сообщений произошла ошибка!");
    res.send({
      headers: { "Content-Type": "application/json" },
      succes: false,
      message: "Failed to download media-message! " + error,
    });
  }
});
