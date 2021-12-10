require("dotenv").config();
const express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");
const app = express();
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const { registerUser, login, validateToken } = require("./security");
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

var mysql = require("mysql");
const { response } = require("express");

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
  con.query(
    "CREATE TABLE IF NOT EXISTS accounts ( id int(11) NOT NULL, password varchar(255) NOT NULL, email varchar(100) NOT NULL) ENGINE=InnoDB"
  );
  console.log("Connected!");
});

app.post("/reg", function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  registerUser(email, password);
  res.sendFile(__dirname + "/public/home.html");
});
/*checkIfUserDoesntExist(email) {
  return new Promise(async (resolve, reject) => {
      const payload = {
          ClientId: configCognito.APP_CLIENT_ID,
          AuthFlow: "ADMIN_NO_SRP_AUTH",
          UserPoolId: configCognito.USER_POOL_ID,
          AuthParameters: {
              USERNAME: email,
              PASSWORD: "123",
          }
      }
      try {
          await (new AWS.CognitoIdentityServiceProvider()).adminInitiateAuth(payload).promise();
          reject(); // very unlikely 
      } catch (e) {
          console.log("checkIfUserDoesntExist error", e);
          switch (e.code) {
              case 'UserNotFoundException':
                  resolve();
              case 'NotAuthorizedException':
              case 'PasswordResetRequiredException':
              case 'UserNotConfirmedException':
              default:
                  reject();
          }
      }
    });
  }*/
app.post("/auth", function (request, response) {
  var email = request.body.email;
  var password = request.body.password;
  login(email, password);
  response.sendFile(__dirname + "/public/home.html");
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/link.html"));
});

app.get("/home", function (req, res) {
  res.sendFile(__dirname + "/public/home.html");
});

app.post("/save-image", upload.single("image"), (req, res) => {
  res.redirect(req.file.location);
  //var f = req.file.location;
  con.query("INSERT INTO Uid(Url) VALUES('" + req.file.location + "')");
});
app.get("/ali", function (req, res) {
  con.query("SELECT Url FROM Uid WHERE ID=11", function (err, ress, fields) {
    if (err) throw err;
    image = ress[0].Url;

    res.redirect(image);
  });

  //res.sendFile(__dirname + "/public/link.html");
});

app.use(express.static(__dirname + "/public"));

app.listen(5678, () => console.log("server is running on port 5678"));
