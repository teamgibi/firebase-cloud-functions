const functions = require("firebase-functions");
const admin = require("firebase-admin");
const appOptions = JSON.parse(process.env.FIREBASE_CONFIG);
const app = admin.initializeApp(appOptions, "app");
const database = app.database();

const successHtml = "Success! You can now return back to the app.";
const errorHtml = "Something went wrong!";

exports.saveAuthToken = functions.https.onRequest((request, response) => {
  const guid = request.query["state"];
  const code = request.query["code"];

  if (guid.length == 0 || code.length == 0 || !validateGUID(guid)) {
    response.send(errorHtml);
    return;
  }

  database.ref("authTokens/" + guid).set(code).then((res) => {
    response.send(successHtml);
  }).catch((e) => {
    response.send(errorHtml);
  });
});

exports.getAuthToken = functions.https.onRequest((request, response) => {
  const guid = request.query["state"];

  if (guid.length == 0 || !validateGUID(guid)) {
    response.send("");
    return;
  }

  database.ref("authTokens/" + guid).get().then((res) => {
    response.send(res.val());
    database.ref("authTokens/" + guid).set(null);
  }).catch((e) => {
    response.send("");
  });
});

function validateGUID(guid) {
  const rgx = "[0-9A-Fa-f]{8}-?([0-9A-Fa-f]{4}-?){3}[0-9A-Fa-f]{12}";
  return guid.match(rgx).length > 0;
}
