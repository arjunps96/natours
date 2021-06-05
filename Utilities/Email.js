const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = 'Arjun PS <admin@natours.io>';
  }
  newTransport() {
    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '017c847e5cc056',
        pass: 'c43e3015fb50a2',
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    const mailOptions = {
      from: 'ArjunPS<arjunps@test.com>',
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours Family');
  }

  async passwordReset() {
    await this.send(
      'passwordReset',
      'Link to reset the password..valid for only 10 minutes'
    );
  }
};

// const sendMail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.mailtrap.io',
//     port: 2525,
//     auth: {
//       user: '017c847e5cc056',
//       pass: 'c43e3015fb50a2',
//     },
//   });

//   const token = transporter.sendMail(mailOptions);
//   return token;
// };
// module.exports = sendMail;
