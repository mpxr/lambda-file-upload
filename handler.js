const Multipart = require("lambda-multipart");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const uuidv4 = require("uuid/v4");

module.exports.upload = async (event, context) => {
  const { fields, files } = await parseMultipartFormData(event);

  if (files == null || files.length == 0) {
    // no file found in http request
    return {
      statusCode: 200
    };
  }

  await Promise.all(
    files.map(async file => {
      await uploadFileIntoS3(file);
    })
  );

  return {
    statusCode: 201
  };
};

const parseMultipartFormData = async event => {
  return new Promise((resolve, reject) => {
    const parser = new Multipart(event);

    parser.on("finish", result => {
      resolve({ fields: result.fields, files: result.files });
    });

    parser.on("error", error => {
      return reject(error);
    });
  });
};

const uploadFileIntoS3 = async file => {
  const ext = getFileExtension(file);
  const options = {
    Bucket: process.env.file_s3_bucket_name,
    Key: `${uuidv4()}.${ext}`,
    Body: file
  };

  try {
    await s3.upload(options).promise();
    console.log(
      `File uploaded into S3 bucket: "${
        process.env.file_s3_bucket_name
      }", with key: "${fileName}"`
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getFileExtension = file => {
  const headers = file["headers"];
  if (headers == null) {
    throw new Error(`Missing "headers" from request`);
  }

  const contentType = headers["content-type"];
  if (contentType == "image/jpeg") {
    return "jpg";
  }

  throw new Error(`Unsupported content type "${contentType}".`);
};
