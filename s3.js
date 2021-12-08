require("dotenv").config();
const express = require("express");
const app = express();
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");

const s3 = new aws.S3({});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "images-777",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
    acl: "public-read",
  }),
});

var mysql = require("mysql");

var con = mysql.createConnection({
  host: "database-1.conue5zevsxg.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "Ali.2580",
});

con.connect(function (err) {
  if (err) throw err;
  con.query("CREATE DATABASE IF NOT EXISTS Gif ");
  con.query("USE Gif");
  con.query(
    "CREATE TABLE IF NOT EXISTS Uid(ID int NOT NULL AUTO_INCREMENT, Url VARCHAR(50), PRIMARY KEY(ID) )"
  );
  //con.query("INSERT IGNORE INTO Uid(ID) VALUES('004654613346')");
  console.log("Connected!");
});

/*app.get("/public/home", function (req, res) {
  res.render(__dirname + "/public/home.html"); //if html file is within public directory
});*/
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/home.html");
});

/*app.get("/public/home.html", function (req, res) {
  res.sendFile("/public/home.html");
});*/

app.post("/save-image", upload.single("image"), (req, res) => {
  res.redirect(req.file.location);
  var f = req.file.location;
  con.query("INSERT INTO Uid(Url) VALUES('" + req.file.location + "')");
});
app.get("/ali", function (req, res) {
  var foto = con.query("SELECT Url FROM Uid WHERE ID=(5)");
  console.log(foto);
  //res.redirect(foto);
});

app.use(express.static(__dirname + "/public"));

app.listen(5678, () => console.log("server is running on port 5678"));
