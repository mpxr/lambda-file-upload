# Lambda file upload into an S3 bucket using Node.JS

In the `handler.js` you can find a compact Lambda function which parses a multipart/form-data request and uploads the parsed files into an S3 bucket.

You can clone this repo and deploy it with the Serverless Framework (`serverless deploy`). Just update some parameters in the `serverless.yml` file.
