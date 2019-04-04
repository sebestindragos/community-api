import * as nodeMailer from 'nodemailer';

export class Mailer {
  private _transporter: nodeMailer.Transporter;

  /**
   * Class constructor.
   */
  constructor () {
    this._transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'contact.community.api@gmail.com',
        pass: '0pXyI8^6bW*2'
      }
    });
  }

  async send(to: string, subject: string, text: string) {
    await this._transporter.sendMail({
      to,
      subject,
      text
    });
  }
}
