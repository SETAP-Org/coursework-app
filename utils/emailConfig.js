import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: '.env.mailconfig' });
dotenv.config();

// Initialize email transporter with Mailtrap configuration
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
    port: process.env.MAILTRAP_PORT || 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

// Verify transporter connection
// transporter.verify((error) => {
//     if (error) {
//         console.error('email transporter invalid credentials:', error);
//     } else {
//         console.log('email transporter ready');
//     }
// });

export default transporter;
