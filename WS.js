require("dotenv").config();
const express = require("express");
var mysql = require("mysql");
const { response } = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
const app = express();
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const { registerUser, login, validateToken } = require("./security");
const s3 = new AWS.S3({});
const axios = require("axios");
const { v4 } = require("uuid");
const res = require("express/lib/response");

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

// After imports

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

  con.query(
    "SELECT COUNT(email) FROM Accounts WHERE email = '" + email + "'",
    function (err, ress, fields) {
      if (err) throw err;
      let chk = JSON.stringify(ress[0]);
      let rest = chk.slice(16, 17);
      console.log(rest);
      if (rest > 0) {
        //throw err;

        console.log("bestaat al");
      } else {
        registerUser(email, password);
        con.query("INSERT INTO Accounts(email) VALUES('" + email + "')");
        res.sendFile(__dirname + "/public/home.html");
      }
    }
  );
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

  con.query(
    "SELECT COUNT(Url) FROM Images WHERE email = '" + email + "'",
    function (err, ress, fields) {
      if (err) throw err;
      let count = JSON.stringify(ress[0]);
      let rest = count.slice(14, 15);
      if (rest == 3) {
        console.log("3 piccas");
      } else if (rest < 3) {
        res.sendFile(__dirname + "/public/home.html");
      } else {
        console.log("stop");
      }
    }
  );
});

app.get("/ali", function (req, res) {
  /*"SELECT Url FROM Images WHERE ID=2" */
  con.query(
    "SELECT Url FROM Images WHERE email = '" + email + "'",
    function (err, ress, fields) {
      if (err) throw err;
      let count = ress[2].Url;
      /*count[0] = ress[0].Url;
      count[1] = ress[1].Url;
      count[2] = ress[2].Url;*/

      console.log(count);
      res.send("hello");
      /*for(let i=0;i<2;i++){
        console.log(ress[i].Url)
      }*/

      //res.redirect(image);
    }
  );

  //res.sendFile(__dirname + "/public/link.html");
});

app.get("/getuploadurl", function (req, res) {
  const objectId = v4();
  console.log(objectId);
  const generateUrl = generatePutUrl(objectId);
  res.json(generateUrl);
});
app.post("/signalupload", function (req, res) {
  const { uploadUrls } = req.body;
  const objectIds = uploadUrls.map((uploadUrl) => extractObjId(uploadUrl));
  const inputImageUrls = objectIds.map((objectId) => generateGetUrl(objectId));
  const getUrl = objectIds.map((objectId) => generateGetUrl(objectId));
  const outputObjId = v4();
  console.log(outputObjId);
  const putUrl = generatePutUrl(outputObjId);
  const outputImageUrl = generatePutUrl(outputObjId, "image/gif");

  axios
    .post(
      "https://msw31oj97f.execute-api.eu-west-1.amazonaws.com/Prod/generate/gif",
      { inputImageUrls, outputImageUrl },
      {
        headers: {
          "x-api-key": "SIdHi3lzwma61h4GeBGR96ZD4rpsa3mb6iKVlMG7",
        },
      }
    )
    .then(function (response) {
      res.json(outputObjId);
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).json(error);
    });
});

function extractObjId(url) {
  const urlWprms = url.split("?")[0];
  const splitUrl = urlWprms.split("/");
  return splitUrl[splitUrl.length - 1];
}

function generateGetUrl(objectId) {
  return s3.getSignedUrl("getObject", {
    Key: objectId,
    Bucket: "gifs-777",
    Expires: 9000,
  });
}
function generatePutUrl(objectId, contentType) {
  return s3.getSignedUrl("putObject", {
    Key: objectId,
    Bucket: "gifs-777",
    Expires: 9000,
    ContentType: contentType,
  });
}

app.use(express.static(__dirname + "/public"));

app.listen(5678, () => console.log("server is running on port 5678"));
