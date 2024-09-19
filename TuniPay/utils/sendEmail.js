const nodeMailer = require("nodemailer");
const fs = require('fs');
const path = require('path');

const sendEmail = async (options, contentType = 'html') => {
    try {

    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: "hdammbrjnalvzwtg"
        },
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,
        subject: options.subject,
    };

    if (contentType === 'text') {
        mailOptions.text = options.message;
    } else if (contentType === 'html') {
        // Load the HTML template and replace placeholders
        const templatePath = path.join(__dirname, 'templates', 'userCreated.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
        const replacedHtml = htmlTemplate
            .replace('{{username}}', options.username)
            .replace('{{email}}', options.email)
            .replace('{{role}}', options.role)
            .replace('{{password}}', options.password)

        mailOptions.html = replacedHtml;
    }
   

    await transporter.sendMail(mailOptions);
} catch (error) {
    console.error('Error sending email:', error);

    throw error;
}
};

module.exports = sendEmail;