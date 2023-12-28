const nodemailer = require('nodemailer')




const contactMail = async (req, res) => {

    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: "Please fill in all required fields." })
        }
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        })
        const mailMessage = `
        <p>From: ${email}</p>
        <p>Name: ${name}</p>
        <p>Message: ${message}</p>
        `
        let mailOptions = {
            from: email,
            to: "shahdab888@gmail.com",
            subject: "Message From Wemotions Form",
            html: mailMessage
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
            return res.status(200).json({ message: "Mail Sent" })
            // Send a response back to the front end
        });

    } catch (error) {
        console.log("catchError " + error);
        return res.status(500).json({ message: "Error Sending Mail." })
    }

}

module.exports = {
    contactMail
}

