export default function configuration() {
  return {
    smtp: {
      email: process.env.SMTP_EMAIL,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      password: process.env.SMTP_PASSWORD,
      fromMail: process.env.SMTP_FROM_EMAIL,
      fromName: process.env.SMTP_FROM_NAME,
    }
  }
}
