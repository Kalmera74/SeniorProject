//Email
import Email from '../util/email'

//Admin send mail

module.exports = (request, response) => {
    const {message, email} = request.body;

    const emailService = new Email({message, email}, 'Testing mail', 'https://www.google.com');
    emailService.send();
    response.status(200).send(`Email sent To: ${email} Successfully`);
};
