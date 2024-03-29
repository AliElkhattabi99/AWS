const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const request = require("request");
const jwkToPem = require("jwk-to-pem");
const jwt = require("jsonwebtoken");
const res = require("express/lib/response");
global.fetch = require("node-fetch");

const poolData = {
  UserPoolId: "us-east-1_HmLquD1qk",
  ClientId: "tsnff6p9ohrgqetvvj48rhgr8",
};
const pool_region = "us-east-1";

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
function registerUser(email, password) {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: "email",
        Value: email,
      }),
    ];
    userPool.signUp(
      email,
      password,
      attributeList,
      null,
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result.user);
        }
      }
    );
  });
}
function login(email, password) {
  return new Promise((resolve, reject) => {
    const authenticationDetails =
      new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password,
      });
    const userData = {
      Username: email,
      Pool: userPool,
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        resolve(result);
      },
      onFailure: function (err) {
        reject(err);
      },
    });
  });
}
function validateToken(token) {
  return new Promise((resolve, reject) => {
    request(
      {
        url: "https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json",
        json: true,
      },
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          pems = {};
          var keys = body["keys"];
          for (var i = 0; i < keys.length; i++) {
            //Convert each key to PEM
            var key_id = keys[i].kid;
            var modulus = keys[i].n;
            var exponent = keys[i].e;
            var key_type = keys[i].kty;
            var jwk = { kty: key_type, n: modulus, e: exponent };
            var pem = jwkToPem(jwk);
            pems[key_id] = pem;
          }
          //validate the token
          var decodedJwt = jwt.decode(token, { complete: true });
          if (!decodedJwt) {
            reject("Not a valid JWT token");
            return;
          }
          var kid = decodedJwt.header.kid;
          var pem = pems[kid];
          if (!pem) {
            reject("Invalid token");
            return;
          }
          jwt.verify(token, pem, function (err, payload) {
            if (err) {
              reject("Invalid Token.");
            } else {
              resolve("Valid Token.");
            }
          });
        } else {
          reject("Error! Unable to download JWKs");
        }
      }
    );
  });
}

module.exports = {
  registerUser,
  login,
  validateToken,
};
