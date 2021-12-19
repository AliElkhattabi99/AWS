const AWS = require("aws-sdk");
const fs = require("fs");
const execPromise = require("./execPromise");

const s3 = new AWS.S3();
const BUCKET_NAME = "gifs-777";

const formatProps = { minimumIntegerDigits: 3, useGrouping: false };

exports.handler = async (event) => {
  const uuid = event.detail.uuid;

  try {
    const files = await s3
      .listObjectsV2({ Bucket: BUCKET_NAME, Prefix: uuid })
      .promise();
    await Promise.all(
      files.Contents.map(({ Key: key }, i) => {
        return s3
          .getObject({
            Bucket: BUCKET_NAME,
            Key: key,
          })
          .promise()
          .then((data) => {
            fs.writeFileSync(
              `/tmp/img${i.toLocaleString("en-US", formatProps)}.jpg`,
              data.Body
            );
          });
      })
    );

    const gifResult = await execPromise(
      `ffmpeg -f image2 -framerate 5 -i /tmp/img%03d.jpg -loop -1 /tmp/result.gif`
    );
    const gif = fs.readFileSync("/tmp/result.gif");
    const res = await s3
      .upload({
        Bucket: BUCKET_NAME,
        Key: uuid + "/result.gif",
        Body: gif,
      })
      .promise();
  } catch (e) {
    console.log(e);
  }

  const response = {
    statusCode: 200,
    body: "Done",
  };
  return response;
};

/*const EventBridge = new AWS.EventBridge({ region: "us-east-1" });

// When successfully inserting image
const params = {
  Entries: [
    {
      Detail: JSON.stringify({ uuid: uuid }),
      DetailType: "new_file",
      EventBusName: "gif-events",
      Source: "web-server",
      Time: new Date(),
    },
  ],
};
EventBridge.putEvents(params, (err, data) => {
  console.log(err);
});*/
