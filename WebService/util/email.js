const nodemailer = require('nodemailer');

const Email = function({ email, message }, subject, url) {
    this.to = email;
    this.message = message;
    this.url = url;
    this.subject = subject;
    this.from = `Admin`;
  }

  Email.prototype.newTransport = () => {
        return nodemailer.createTransport({
            service: 'Gmail',
            secure: true,
            auth: {
                user: 'denemekistiyorum589@gmail.com', //Gmail account info
                pass: 'thisisistemporarypassword'
            }
        })
    }

    Email.prototype.send = async function() {
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: this.subject,
            text: `${this.message} ${this.url}`
            // message: write this "click here to gain readonly priviledges"
        };

        await this.newTransport().sendMail(mailOptions);
    }
    export default Email;
