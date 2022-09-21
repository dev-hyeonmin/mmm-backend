import { Bind, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as AWS from 'aws-sdk';

//AKIA5PNE3LOT26PKLFX6
//MPey41nr0Yv1vnafgRqrTNoJ2LSA21RUTbnZUNic

const BUCKET_NAME = "hyeonminmmmmapp";

@Controller('uploads')
export class UploadsController {
    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file) {
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });

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
}