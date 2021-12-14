require("dotenv").config();
const express = require("express");
var mysql = require("mysql");
const { response } = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");
const app = express();
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const { registerUser, login, validateToken } = require("./security");
const { CognitoIdentity } = require("aws-sdk");
const {
  CognitoIdToken,
  CognitoUserSession,
} = require("amazon-cognito-identity-js");
var email;
var password;

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

const uploadG = multer({
  storage: multerS3({
    s3: s3,
    bucket: "gifs-777",

    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
    acl: "public-read",
  }),
});

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
    "CREATE TABLE IF NOT EXISTS Images(ID int NOT NULL AUTO_INCREMENT, email VARCHAR(50) ,Url VARCHAR(50), PRIMARY KEY(ID) )"
  );
  con.query(
    "CREATE TABLE IF NOT EXISTS Accounts ( ID int NOT NULL AUTO_INCREMENT , email varchar(100) NOT NULL,PRIMARY KEY(id)) ENGINE=InnoDB"
  );
  console.log("Connected!");
});

app.post("/reg", function (req, res, next) {
  email = req.body.email;
  password = req.body.password;

  var chk = con.query(
    "SELECT COUNT(email) FROM Accounts WHERE email = '" + email + "'",
    function (err, ress, fields) {
      if (err) throw err;
      chk = ress._eventsCount;
      console.log(chk);
    }
  );
  if (chk > 0) {
    //throw err;
  } else {
    registerUser(email, password);
    con.query("INSERT INTO Accounts(email) VALUES('" + email + "')");
    res.sendFile(__dirname + "/public/home.html");
  }
});

app.post("/auth", function (request, response) {
  email = request.body.email;
  password = request.body.password;
  console.log(email);
  login(email, password); /*.then(
    function (value) {
      console.log(value);
    },
    function (error) {
      console.log(error);
    }
  );*/

  //response.json(login(email, password));

  response.sendFile(__dirname + "/public/home.html");
});

app.get("/home", function (req, res) {
  res.sendFile(__dirname + "/public/home.html");
});

app.post("/save-image", upload.single("image"), (req, res) => {
  //email = req.body.email;
  res.sendFile(__dirname + "/public/home.html");
  //res.redirect(req.file.location);

  con.query(
    "INSERT INTO Images(email,Url) VALUES( '" +
      email +
      "','" +
      req.file.location +
      "')"
  );
});

app.get("/ali", function (req, res) {
  /*"SELECT Url FROM Images WHERE ID=2" */
  con.query(
    "SELECT Url FROM Images WHERE email = 'shanqamar48@gmail.com'",
    function (err, ress, fields) {
      if (err) throw err;
      image = ress[1];
      console.log(image);
      res.send("hello");
      //res.redirect(image);
    }
  );

  //res.sendFile(__dirname + "/public/link.html");
});

app.use(express.static(__dirname + "/public"));

app.listen(5678, () => console.log("server is running on port 5678"));
