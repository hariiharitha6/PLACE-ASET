import { expect } from 'chai';
import {
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  generateAISchedule
} from './calendar.controller';
import { CalendarService } from '../services/calendar.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Calendar Controller Unit Tests', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let resStatus: number;
  let resJson: any;

  beforeEach(() => {
    resStatus = 200;
    resJson = null;
    mockRes = {
      status: (code: number) => { resStatus = code; return mockRes as Response; },
      json: (data: any) => { resJson = data; return mockRes as Response; },
    };
  });

  it('listCalendarEvents should return 200 on success', async () => {
    const original = CalendarService.getEvents;
    CalendarService.getEvents = async () => [];
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      query: {}
    };
    await listCalendarEvents(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CalendarService.getEvents = original;
  });

  it('createCalendarEvent should return 201 on success', async () => {
    const original = CalendarService.createEvent;
    CalendarService.createEvent = async () => ({ id: 'e1', title: 'Event' } as any);
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      body: { title: 'Event', start_time: '2026-08-12T10:00:00Z' }
    };
    await createCalendarEvent(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    CalendarService.createEvent = original;
  });

  it('deleteCalendarEvent should return 200 on success', async () => {
    const original = CalendarService.deleteEvent;
    CalendarService.deleteEvent = async () => ({ success: true });
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      params: { id: 'e1' }
    };
    await deleteCalendarEvent(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CalendarService.deleteEvent = original;
  });

  it('generateAISchedule should return 200 on success', async () => {
    const original = CalendarService.generateAISchedule;
    CalendarService.generateAISchedule = async () => ({ scheduleType: 'daily', plan: 'Plan', provider: 'gemini' });
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      body: { scheduleType: 'daily' }
    };
    await generateAISchedule(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CalendarService.generateAISchedule = original;
  });
});
