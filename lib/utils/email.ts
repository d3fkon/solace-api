import nodemailer, { createTransport } from 'nodemailer';
import configuration from './configuration';

export async function sendEmail(emailMessageOptions: { email: string, subject: string, html: string }): Promise<void> {
  console.log(emailMessageOptions);
  const message = {
    from: `${configuration().smtp.fromMail} <${configuration().smtp.fromMail}>`,
    to: emailMessageOptions.email,
    subject: emailMessageOptions.subject,

    html: `<html> ${emailMessageOptions.html}</html>`,
    //   attachments: emailMessageOptions.attachments,
  };
  try {
    const transporter = createTransport({
      host: configuration().smtp.host,
      port: configuration().smtp.port as any,
      auth: {
        user: configuration().smtp.email,
        pass: configuration().smtp.password,
      },
    });
    const res = await transporter.sendMail(message);
    console.log(res);
  } catch (error) {
    console.log('SMTP ERROR: ', error);
  }
}
