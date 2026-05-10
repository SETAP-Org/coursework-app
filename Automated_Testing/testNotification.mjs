import dotenv from 'dotenv';
import { postNotificationModel } from '../models/notificationModels.js';

// Load environment variables
dotenv.config({ path: '.env.mailconfig' });
dotenv.config({ path: '.env.auth' });
dotenv.config({ path: '.env.development' }); // For database connection
dotenv.config();

const testUserId = process.argv[2] || 'your-test-user-id'; // Pass user ID as argument
const testProjectId = process.argv[3] || null;
const testProjectName = process.argv[4] || 'Test Project';

async function testNotificationEmail() {
    try {
        console.log('🧪 Testing notification email sending...');
        console.log(`User ID: ${testUserId}`);
        console.log(`Project: ${testProjectName}`);

        const result = await postNotificationModel(
            testUserId,
            testProjectId,
            'Test Notification',
            'This is a test notification to verify email sending works.',
            'TestUser',
            testProjectName
        );

        console.log('✅ Notification created successfully');
        console.log('Notification ID:', result.rows[0].notification_id);

        // Wait a bit for async email sending
        setTimeout(() => {
            console.log('🎯 Test complete - check your Mailtrap inbox and server logs');
            process.exit(0);
        }, 2000);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testNotificationEmail();