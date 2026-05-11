import { jest } from '@jest/globals';

// MOCK FIRST
jest.unstable_mockModule('../models/calendarModels.js', () => ({
  createCalendarEvent: jest.fn(),
  deleteCalendarEvent: jest.fn(),
  getCalendarEvents: jest.fn(),
}));

const { createCalendarEvent } = await import('../models/calendarModels.js');
const { addEvent } = await import('../controllers/calendarControllers.js');

test('addEvent returns 201 on success', async () => {
  createCalendarEvent.mockResolvedValue({ id: 1 });

  const req = {
    body: {
      subject: 'Test',
      start: '2026-01-01T10:00',
      end: '2026-01-01T11:00',
      project_id: '123',
    },
    user: { accessToken: 'fake-token' },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  await addEvent(req, res);

  expect(res.status).toHaveBeenCalledWith(201);
});