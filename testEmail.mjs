import dotenv from 'dotenv';
import sendNotificationEmail from './utils/emailSender.js';

// Load Mailtrap configuration from .env.mailconfig or fallback to .env
dotenv.config({ path: '.env.mailconfig' });
dotenv.config();

const recipientEmail = process.env.TEST_EMAIL_TO || process.env.MAILTRAP_USER + '@example.com';
const recipientName = process.env.TEST_EMAIL_NAME || 'GCMS User';
const notificationMessage = process.env.TEST_EMAIL_MESSAGE || 'This is a test notification from GCMS.';
const notificationType = process.env.TEST_EMAIL_TYPE || 'Test Notification';
const projectName = process.env.TEST_EMAIL_PROJECT || 'Test Project';

if (!recipientEmail) {
  console.error('Recipient email is not defined. Set TEST_EMAIL_TO in .env.mailconfig or .env.');
  process.exit(1);
}

async function runTest() {
  try {
    const info = await sendNotificationEmail(
      recipientEmail,
      recipientName,
      notificationMessage,
      notificationType,
      projectName,
    );
    console.log('Test email sent successfully.');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', info.previewURL || 'N/A');
  } catch (error) {
    console.error('Failed to send test email:', error);
    process.exit(1);
  }
}

runTest();
