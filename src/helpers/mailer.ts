import nodemailer from 'nodemailer';
import User from '@/model/userModel';
import bcryptjs from 'bcryptjs';

export const sendEmail = async ({ email, emailType, userId }: any) => {
    try {
        const hashedToken = await bcryptjs.hash(userId.toString(), 10);

        if (emailType === "Verify") {
            await User.findByIdAndUpdate(userId, {
                verifyToken: hashedToken,
                verifyTokenExpiry: Date.now() + 3600000
            })
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId, { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000 })
        }

        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "01c68b55964287",
                pass: "b94608b4ef70cf"
            }
        });

        const mailOptions = {
            from: 'sujalagarwalwk@gmail.com',
            to: email,
            subject: emailType === "Verify" ? "Verify Email" : "Reset Password",
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}'>here<a/> to ${emailType === "Verify" ? "Verify Email" : "Reset Password"} or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}/verifyemail? token=${hashedToken}</p>`
        }
        const mailresponse = await transport.sendMail(mailOptions);
        return mailresponse;
    } catch (error: any) {
        throw new Error(error.message);
    }
}