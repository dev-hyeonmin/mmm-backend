import * as AWS from 'aws-sdk';
import { Injectable } from '@nestjs/common';

const BUCKET_NAME = "hyeonminmmmmapp";

@Injectable()
export class UploadsService {
    constructor() {
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
    }

    async upload(file) {
        try {
            //const upload = await new AWS.S3().createBucket({ Bucket: BUCKET_NAME }).promise();
            const objectName = `${Date.now() + file.originalname}`;

            await new AWS.S3().putObject({
                Body: file.buffer,
                Bucket: BUCKET_NAME,
                Key: objectName,
                ACL: "public-read"
            }).promise();

            const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
            return { url };
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async delete(fileName: string) {
        const key = fileName.replace(`https://${BUCKET_NAME}.s3.amazonaws.com/`, '');
        const params = {
            Bucket: BUCKET_NAME,
            Key: key
        };
        await new AWS.S3().deleteObject(params, (err) => {
            if (err) return err;
            return true;
        }).promise();
    }
}