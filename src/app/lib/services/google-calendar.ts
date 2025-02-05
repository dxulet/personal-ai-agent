import { google } from 'googleapis';
import { Task } from '../../types';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function getCalendarEvents(accessToken: string, timeMin: string, timeMax: string) {
  try {
    console.log('Fetching calendar events from:', timeMin, 'to:', timeMax);
    console.log('Using access token:', accessToken.substring(0, 10) + '...');

    oauth2Client.setCredentials({ access_token: accessToken });
    console.log('OAuth2 client credentials set');
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    console.log('Calendar API response:', response.data);
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    if ('response' in (error as any)) {
      console.error('API Error response:', (error as any).response?.data);
    }
    throw error;
  }
}

export async function createCalendarEvent(task: Task, accessToken: string) {
  try {
    console.log('Creating calendar event for task:', task);
    console.log('Using access token:', accessToken.substring(0, 10) + '...');

    oauth2Client.setCredentials({ access_token: accessToken });
    console.log('OAuth2 client credentials set');
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Extract timezone from the startTime
    const timezone = task.startTime.match(/([+-]\d{2}:?\d{2}|Z)$/)?.[1] || 'Z';
    console.log('Detected timezone:', timezone);
    
    const event = {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: task.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Use local timezone
      },
      end: {
        dateTime: task.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Use local timezone
      },
      reminders: {
        useDefault: true
      }
    };
    console.log('Calendar event payload:', event);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    console.log('Calendar API response:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    if ('response' in (error as any)) {
      console.error('API Error response:', (error as any).response?.data);
    }
    throw error;
  }
}

export async function getAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly'
  ];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

export async function getTokens(code: string) {
  console.log('Getting tokens for code:', code.substring(0, 10) + '...');
  const { tokens } = await oauth2Client.getToken(code);
  console.log('Received tokens:', {
    access_token: tokens.access_token ? tokens.access_token.substring(0, 10) + '...' : null,
    refresh_token: tokens.refresh_token ? tokens.refresh_token.substring(0, 10) + '...' : null,
    expiry_date: tokens.expiry_date
  });
  return tokens;
} 