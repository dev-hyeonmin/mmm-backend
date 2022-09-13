import { Inject, Injectable } from "@nestjs/common";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { MailModuleOptions } from "./mail.interface";

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
    ){}
    send(sendMail: string, code: string) {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(this.options.apiKey);            
        const msg = {
            to: sendMail, // Change to your recipient
            //to: this.options.fromMail,
            from: this.options.fromMail, // Change to your verified sender
            subject: '[mmm] Verfiy Email ;D',
            html: `<h3>mmm._.mmm</h3><br>
            <br>Thank you for using my app!<br>Please verify your email.<br><br><a href="${this.options.url}?code=${code}">verfiy email</a>`,
        };

        sgMail.send(msg).then(() => {
            console.log('Email sent.');
        }).catch((error) => {
            return error;
        })
    }
}