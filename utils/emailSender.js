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
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .logo {
                display: inline-block;
                margin-bottom: 10px;
            }
            .logo img {
                height: 40px;
                width: auto;
            }
            .header h1 {
                margin: 10px 0 0 0;
                font-size: 24px;
            }
            .content {
                padding: 30px;
            }
            .greeting {
                margin-bottom: 20px;
            }
            .notification-box {
                background-color: #f9f9f9;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .notification-type {
                display: inline-block;
                background-color: #667eea;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .project-name {
                color: #666;
                font-size: 14px;
                margin-top: 10px;
            }
            .footer {
                background-color: #f5f5f5;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #999;
                border-top: 1px solid #eee;
            }
            .footer a {
                color: #667eea;
                text-decoration: none;
            }
        </style>
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
