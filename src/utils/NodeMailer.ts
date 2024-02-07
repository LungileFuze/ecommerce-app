import * as nodeMailer from "nodemailer"
import * as SendGrid from "nodemailer-sendgrid-transport"
import { getEnvironmentVariables } from "../environments/environment"
import PostMark from 'nodemailer-postmark-transport'


export class NodeMailer {

    private static initiateTransport() {
        return nodeMailer.createTransport(
        //     SendGrid({
        //     auth: {
        //         api_key: getEnvironmentVariables().sendgrid.api_key
        //     } 
        // })
        
        PostMark({
                auth: {
                    apiKey: getEnvironmentVariables().postmark.api_key
                } 
            })
         
        // {
        //     service: 'gmail',
        //     auth: {
        //         user: getEnvironmentVariables().gmail_auth.user,
        //         pass: getEnvironmentVariables().gmail_auth.pass
        //     }
        // }
        
        )
    }

    static sendMail(data: {to: [string], subject: string, html: string}): Promise<any> {
        return NodeMailer.initiateTransport().sendMail({
            // from: getEnvironmentVariables().sendgrid.email_from,
            // from: getEnvironmentVariables().gmail_auth.user,
            from: getEnvironmentVariables().postmark.email_from,
            to: data.to,
            subject: data.subject,
            html: data.html
        })
    }
}