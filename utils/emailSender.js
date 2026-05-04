import transporter from './emailConfig.js';

/**
 * Send notification email to user
 * @param {string} recipientEmail - User's email address
 * @param {string} recipientName - User's name
 * @param {string} notificationMessage - The notification message
 * @param {string} notificationType - Type of notification (e.g., 'Message', 'Task', 'Member Join')
 * @param {string} projectName - Name of the project (if applicable)
 * @returns {Promise<object>} - Nodemailer response
 */
export async function sendNotificationEmail(
    recipientEmail,
    recipientName,
    notificationMessage,
    notificationType,
    projectName
) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@gcms.app',
            to: recipientEmail,
            subject: `GCMS Notification: ${notificationType}${projectName ? ` - ${projectName}` : ''}`,
            html: generateEmailHTML(recipientName, notificationMessage, notificationType, projectName),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email notification sent to ${recipientEmail} (${notificationType})`);
        return info;
    } catch (error) {
        console.error('Error sending notification email:', error);
        throw error;
    }
}

/**
 * Generate HTML email template with GCMS branding
 * @param {string} recipientName - User's name
 * @param {string} notificationMessage - The notification message
 * @param {string} notificationType - Type of notification
 * @param {string} projectName - Project name
 * @returns {string} - HTML email content
 */
function generateEmailHTML(recipientName, notificationMessage, notificationType, projectName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/css/defaultemail.css">
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    <img src="cid:logo" alt="GCMS Logo">
                </div>
                <h1>GCMS</h1>
                <p>Group Coursework Management System</p>
            </div>
            <div class="content">
                <div class="greeting">
                    <p>Hi ${recipientName},</p>
                </div>
                <p>You have received a new notification:</p>
                <div class="notification-box">
                    <span class="notification-type">${notificationType}</span>
                    <p>${notificationMessage}</p>
                    ${projectName ? `<p class="project-name"><strong>Project:</strong> ${projectName}</p>` : ''}
                </div>
                <p>Log in to GCMS to view more details and take action.</p>
            </div>
            <div class="footer">
                <p>This is an automated notification from GCMS.</p>
                <p>You can manage your notification preferences in your profile settings.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export default sendNotificationEmail;
