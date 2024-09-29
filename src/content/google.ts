import { convertTo24Hour, formatDateToISO } from "./utils";

// Function to fetch Google Calendar events using the token
async function fetchCalendarEvents(token: string, date: string, timeMin: string, timeMax: string, modifier: string) {
  const calendarAPI = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  
  const url = new URL(calendarAPI);
  url.searchParams.set('timeMin', date + "T" + timeMin + modifier); // Example: 2023-09-01T00:00:00Z
  url.searchParams.set('timeMax', date + "T" + timeMax + modifier); // Example: 2023-09-30T23:59:59Z
  url.searchParams.set('singleEvents', 'true'); // Ensures recurring events are expanded
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data.items;
}

// Function to generate 15-minute intervals for a given date and time range
function generateIntervals(date: string, timeMin: string, timeMax: string): string[] {
  const intervals = [];
  const start = new Date(`${date}T${timeMin}`);
  const end = new Date(`${date}T${timeMax}`);

  while (start < end) {
    intervals.push(start.toISOString());
    start.setMinutes(start.getMinutes() + 15);
  }

  return intervals;
}

// Function to determine availability in 15-minute intervals
function determineAvailability(events: any[], intervals: string[]): { start: string, end: string, busy: boolean }[] {
  const availability = intervals.map(interval => {
    const intervalStart = new Date(interval);
    const intervalEnd = new Date(intervalStart);
    intervalEnd.setMinutes(intervalEnd.getMinutes() + 15);

    const isBusy = events.some(event => {
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);
      return (intervalStart < eventEnd && intervalEnd > eventStart);
    });

    return {
      start: intervalStart.toISOString(),
      end: intervalEnd.toISOString(),
      busy: isBusy,
    };
  });

  return availability;
}

// Function to get availability from Google Calendar
async function getAvailabilityGoogle(times: string[], dates: string[], modifier: string, startTime: string, endTime: string) {
  try {
    const token = await new Promise<string>((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'signInGoogle' }, (response) => {
        if (response && response.token) {
          resolve(response.token);
        } else {
          reject(new Error('Failed to retrieve token'));
        }
      });
    });

    const elements = document.querySelectorAll('[id^="YouTime"]');

    const firstTime24Hour = convertTo24Hour(times[0]) + ":00";
    const lastTime24Hour = convertTo24Hour(times[times.length - 1]) + ":00";
    
    for (const [dateIndex, date] of dates.entries()) {
        const isoDate = formatDateToISO(date);
        const events = await fetchCalendarEvents(token, formatDateToISO(date), firstTime24Hour, lastTime24Hour, modifier);
        const intervals = generateIntervals(formatDateToISO(date), firstTime24Hour, lastTime24Hour);
        const availability = determineAvailability(events, intervals);

        availability.forEach((slot, index) => {
            if (!slot.busy && new Date(slot.start) >= new Date(`${isoDate}T${startTime}:00`) && new Date(slot.end) <= new Date(`${isoDate}T${endTime}:00`)) {
                const elementIndex = dateIndex + dates.length * index;
                const element = elements[elementIndex] as HTMLElement;

                if (element) {
                    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                } else {
                    console.error(`Element at index ${elementIndex} is undefined`);
                }
            }
        });
    }
  } catch (error) {
    console.error('Error fetching availability:', error);
  }
}

export { getAvailabilityGoogle };