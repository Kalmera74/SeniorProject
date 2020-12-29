//Email
import Email from '../util/email'

//For Admin user to send mail

module.exports = (request, response) => {
    const {message, email} = request.body;

    // Change the address of "https://www.google.com" this to the Web portal url
    const emailService = new Email({message, email}, 'Testing mail', 'https://www.google.com');
    emailService.send();
    response.status(200).send(`Email sent To: ${email} Successfully`);
};
