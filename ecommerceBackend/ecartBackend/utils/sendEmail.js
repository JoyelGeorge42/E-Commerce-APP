const nodeMailer = require('nodemailer');

//function for send email 

const sendEmail = async (options)=>{
const transporter = nodeMailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    service:process.env.SMPT_SERVICE,
    auth:{
        user:process.env.SMPT_MAIL,
        pass:process.env.SMPT_PASSWORD,
    }
})

const mailerOption = {
    from:process.env.SMPT_MAIL,   // from whome we got the mail
    to:options.email,              // whome to send mail
    subject:options.subject,        // subject of the mail
    text:options.message            // message for the mail
}
await transporter.sendMail(mailerOption)
}
module.exports = sendEmail