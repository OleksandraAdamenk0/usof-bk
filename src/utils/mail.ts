import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendConfirmationEmail(email: string, url: string) {
  await transporter.sendMail({
    from: `"USOF" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Confirm your email",
    html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
  });
}