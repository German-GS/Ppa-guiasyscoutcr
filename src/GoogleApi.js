import { google } from 'googleapis';

//Google calendar 
const CLIENT_ID = 'AIzaSyD01nY99B-wDhh-Mrw8_fJmJa8F52lqf_E';
const API_KEY = '868391699924-kagolnpqan4qt39qaatb90c1g4svuau7.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

//obtiene el cliente autenticado
const getAuthClient = async () => {
  const auth = new google.auth.GoogleAuth({
    clientId: CLIENT_ID,
    apiKey: API_KEY,
    scope: SCOPES,
  });

  const authClient = await auth.getClient();
  return authClient;
};

export const getCalendarClient = async () => {
  const authClient = await getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth: authClient });
  return calendar;
};