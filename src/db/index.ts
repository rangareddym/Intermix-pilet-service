import { Pilet } from '../types';
import * as Config from '../helpers/config';
import * as Fs from 'fs';
import * as AWS from 'aws-sdk';

var piletData: Record<string, Record<string, Pilet>> = {};

// Create unique bucket name
var bucketName = Config.BUCKET_NAME;
// Create name for uploaded object key
var keyName = Config.FILE_NAME; 

// Create a promise on S3 service object
AWS.config.update({ region: Config.AWS_REGION });

// Create S3 Service object
let s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  accessKeyId: Config.aws_access_key_id,
  secretAccessKey: Config.aws_secret_access_key
});


var getParams = {
  Bucket: bucketName,
  Key: keyName
}

// call S3 to retrieve upload file to specified bucket
var uploadParams = { Bucket: bucketName, Key: keyName, Body: 'empty' };
  
class DataFactory {
  public constructor() {
  }
 public read(type: String) {
      switch(type) {
         case "aws":
           return awsGetFile();
         case "file":
           return readFile();
         default :
          {
            console.info(' No TYPE specified in .env - Default to file');
            return readFile();;
          }

      }
  }
}
const PiletDataFactory = new DataFactory();


export async function getPilets(): Promise<Array<Pilet>> {
  return PiletDataFactory.read(Config.TYPE).then(() => {
    const pilets: Array<Pilet> = [];
    Object.keys(piletData).forEach(name => {
      //console.info(' GetPilates- pilte name=',piletData[name] );
      Object.keys(piletData[name]).forEach(version => {
        const pilet = piletData[name][version];
        pilets.push(pilet);
      });
    });
    return pilets;
  }).catch((err) => {
    console.info('getPilets- AWS get file Error');
    const pilets: Array<Pilet> = [];
    return pilets;
  });
}


export async function getPilet(name: string, version: string): Promise<Pilet | undefined> {
  return PiletDataFactory.read(Config.TYPE).then(() => {
    const versions = piletData[name] || {};
    //console.info('versions=', versions);
    return versions[version];
  }).catch((err) => {
    console.info('getPilet- AWS get file Error');
    const versions = piletData[name] || {};
    return versions[version];
  });
}

function awsGetFile() {
  return new Promise(function (resolve, reject) {
    s3.getObject(getParams, function (err, data) {
      if (err) {
        //console.error(err);
        piletData = {};
        // Return resolve as we expect no file first time. Other type of errors TODO
        return resolve(err);
      } else {
        //console.info("GetFile - Success", data);
        piletData = JSON.parse(data.Body.toString());
        return resolve(piletData);
      }
    });

  });
}

function awsUploadFile() {
  return new Promise(function (resolve, reject) {
    s3.upload(uploadParams, function (err: any, data: any) {
      if (err) {
        //console.error(err);
        //piletData = {};
        return reject(err);
      } else {
        //console.info("Upload Success", data);
        //awsGetFile();
        return resolve(data);
      }
    });

  });
}


function readFile() {
  return new Promise(function (resolve, reject) {
    Fs.exists('PiletDatafile.txt', function (exists) {
      if (exists) {
        Fs.readFile('PiletDatafile.txt', function (err, data) {
          if (err) {
            console.error(err);
            return reject(err);
          } else {

            //piletData = JSON.parse(data.toString().replace(/ 0+(?![\. }])/g, ' '));
            piletData = JSON.parse(data.toString());
            //console.info("Asynchronous read: " + piletData);
            resolve(piletData);
          }
        });
      } else {
        piletData = {};
        resolve(piletData);
      }
    });
  });
}


export async function setPilet(pilet: Pilet) {
  PiletDataFactory.read(Config.TYPE).then(() => {
    //console.info('Pile=', pilet);
    const meta = pilet.meta;
    //console.info('Pile meta info=', meta);
    const current = piletData[meta.name] || {};
    //console.info('Pile current info=', current);
    //console.info('pileData Before =', piletData);
    piletData[meta.name] = {
      ...current,
      [meta.version]: pilet,
    };

    //console.info('pileData after=', piletData);
    uploadParams.Body = JSON.stringify(piletData); //fileStream;
    if ( Config.TYPE == 'aws') {
        // call S3 to retrieve upload file to specified bucket
        awsUploadFile().then(() => {
          awsGetFile();
        }).catch(() => {
          console.error('Upload - Failed');
        })
      } else{
        Fs.writeFile('PiletDatafile.txt', JSON.stringify(piletData), function (err) {
          if (err) {
            console.error(err);
          } else {
          //console.log("File created!");
          readFile();
        }
        });
      }
    //console.info('JSON string=',JSON.stringify(piletData));
  }).catch((err) => {
    console.info('setPilet- AWS get file Error');
  });

  

}
