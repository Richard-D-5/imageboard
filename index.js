const express = require("express");
const app = express();
const db = require("./db");
const s3 = require("./s3");
const { s3Url } = require("./config.json");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

app.use(express.json());

app.use(express.static("public"));

app.get("/images", (req, res) => {
    db.getImages()
        .then((val) => {
            res.json(val.rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/getMoreImages/:id", (req, res) => {
    db.getMoreImages(req.params.id)
        .then((results) => {
            console.log("res: ", results);
            res.json(results);
        })
        .catch((err) => {
            console.log("err in getMoreImages: ", err);
        });
});

app.get("/getImageInfo/:id", (req, res) => {
    console.log("req.params: ", req.params.id);
    const getImage = db.getImageInfo(req.params.id);
    const getComments = db.getComments(req.params.id);
    Promise.all([getImage, getComments])
        .then((data) => {
            // console.log("getImage: ", getImage);
            // console.log("getComments: ", getComments);
            console.log("data[0] ind getImageInfo: ", data[0]);
            console.log("data[1]: ", data[1]);
            res.json({ imageData: data[0].rows, commentsData: data[1].rows });
        })
        .catch((err) => {
            console.log("err in GET getImageInfo: ", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    if (req.file) {
        db.addImage(
            req.body.title,
            req.body.description,
            req.body.username,
            `${s3Url}${req.file.filename}`
        )
            .then((data) => {
                res.json(data.rows);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.json({ success: false });
    }
});

app.post("/upload-comments", (req, res) => {
    console.log("req.body comment post: ", req.body);
    db.addComments(req.body.comment, req.body.images_id, req.body.username)
        .then((data) => {
            console.log("data.rows: ", data.rows);
            res.json(data.rows);
        })
        .catch((err) => {
            console.log("err in comments post: ", err);
        });
});

app.listen(8080, () => {
    console.log("The image board server is listing.");
});
