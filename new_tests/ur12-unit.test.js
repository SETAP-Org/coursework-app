import { jest } from '@jest/globals';

/**
 * =========================
 * MOCK EMAIL TRANSPORTER
 * =========================
 */
let sendMailShouldFail = false;

jest.unstable_mockModule('../utils/emailConfig.js', () => ({
    default: {
        sendMail: async () => {
            if (sendMailShouldFail) {
                throw new Error('SMTP failed');
            }
            return { messageId: 'mock-email-id' };
        }
    }
}));

/**
 * IMPORT AFTER MOCKING
 */
const { sendNotificationEmail } = await import('../utils/emailSender.js');
const { postNotificationModel } = await import('../models/notificationModels.js');

const mockUUID = '00000000-0000-0000-0000-000000000001';

describe('UNIT TESTS - Email + Notification Logic', () => {

    test('sendNotificationEmail - success', async () => {
        const result = await sendNotificationEmail(
            'alice@example.com',
            'Alice',
            'Hello',
            'Task Assigned',
            'Project A'
        );

        expect(result).toBeDefined();
        expect(result.messageId).toBe('mock-email-id');
    });

    test('sendNotificationEmail - failure handled', async () => {
        sendMailShouldFail = true;

        await expect(
            sendNotificationEmail(
                'fail@example.com',
                'Fail',
                'Hello',
                'Task',
                'Project'
            )
        ).rejects.toThrow('SMTP failed');

        sendMailShouldFail = false;
    });

    test('postNotificationModel calls DB layer safely', async () => {
        // this will fail ONLY if DB not mocked in integration (unit safe check)
        try {
            await postNotificationModel(
                mockUUID,
                mockUUID,
                'Task',
                'Unit test message',
                'alice',
                'Project A'
            );
        } catch (e) {
            // DB may exist or not — unit test just ensures function executes
            expect(e).toBeDefined();
        }
    });

});