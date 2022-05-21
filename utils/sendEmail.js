const nodemailer = require('nodemailer');
const sendEmail = async function (coustomer, token) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'thh33ybkuki3gavf@ethereal.email', // generated ethereal user
            pass: 'EJD7jCKBSRFGgBpzXE', // generated ethereal password
        },
    });

    let info = await transporter.sendMail({
        from: '<thh33ybkuki3gavf@ethereal.email>', // sender address
        to: `${coustomer.email}`, // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'This is a system generated email',
        html: `<h1>This is a system generated Email 😸 <br> Please do not reply to this</h1> reset token is ${token} `, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return await nodemailer.getTestMessageUrl(info);
};

module.exports = sendEmail;
