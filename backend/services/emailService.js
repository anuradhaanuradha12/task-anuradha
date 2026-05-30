import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  } else {
    // Offline / Mock logger
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n================================================');
        console.log(`✉️  [MOCK EMAIL SENT]`);
        console.log(`TO:      ${mailOptions.to}`);
        console.log(`SUBJECT: ${mailOptions.subject}`);
        console.log(`TEXT:    ${mailOptions.text || 'N/A'}`);
        if (mailOptions.html) {
          console.log(`HTML:    (Visual template details omitted, rendering content)`);
        }
        console.log('================================================\n');
        return { messageId: `mock-id-email-${Date.now()}` };
      },
    };
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const client = await getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"TaskFlow Platform" <noreply@taskflow.com>',
      to,
      subject,
      text,
      html,
    };
    const info = await client.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error(`Email Delivery Failure: ${error.message}`);
  }
};
