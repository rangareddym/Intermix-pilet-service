//import * as Dotenv from 'dotenv';
const Dotenv = require('dotenv');

Dotenv.config();
let path;
/*switch (process.env.NODE_ENV) {
  case "test":
    path = `${__dirname}/../../.env.test`;
    break;
  case "production":
    path = `${__dirname}/../../.env.production`;
    break;
  default:
    path = `${__dirname}/../../.env.development`;
}*/
// For now we support .env only.
path = `${__dirname}/../../.env`;
Dotenv.config({ path: path });

export const aws_access_key_id = process.env.aws_access_key_id;
export const aws_secret_access_key = process.env.aws_secret_access_key;

export const TYPE = process.env.TYPE;
export const FILE_NAME = process.env.FILE_NAME;
export const AWS_REGION = process.env.AWS_REGION;
export const BUCKET_NAME = process.env.BUCKET_NAME;