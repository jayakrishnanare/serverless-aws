const Responses = require('../common/API_Response') 
const fileType = require('file-type');
const { v4 , uuid } = require('uuid');
const S3 =  require('../common/s3')

const s3 = new AWS.S3();

const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

exports.handler = async event => {
    try {
        const body = JSON.parse(event.body);

        if (!body || !body.image || !body.mime) {
            return Responses._400({ message: 'incorrect body on request' });
        }

        if (!allowedMimes.includes(body.mime)) {
            return Responses._400({ message: 'mime is not allowed ' });
        }

        let imageData = body.image;
        if (body.image.substr(0, 7) === 'base64,') {
            imageData = body.image.substr(7, body.image.length);
        }

        const buffer = Buffer.from(imageData, 'base64');
        const fileInfo = await fileType.fromBuffer(buffer);
        const detectedExt = fileInfo.ext;
        const detectedMime = fileInfo.mime;

        if (detectedMime !== body.mime) {
            return Responses._400({ message: 'mime types dont match' });
        }

        const name = uuid();
        const key = `uploads/${name}.${detectedExt}`;

        console.log(`writing image to bucket called ${key}`);

        await S3.write(buffer, key, process.env.imageUploadBucket, null, body.mime)
        //this code is for uploading image in s3 
            // .putObject({
            //     Body: buffer,
            //     Key: key,
            //     ContentType: body.mime,
            //     Bucket: process.env.imageUploadBucket
            // })
            // .promise();
         const url = await S3.getSignedURL(process.env.imageUploadBucket, key , 60)
        return Responses._200({
            imageURL: url,
        });
    } catch (error) {
        console.log('error', error);

        return Responses._400({ message: error.message || 'failed to upload image' });
    }
};

