import { PublicClientApplication } from "@azure/msal-browser";
import { generate15MinIntervals, convertTo24Hour, formatDateToISO } from "./utils";

const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID as string,
        authority: process.env.AZURE_AUTHORITY as string,
        redirectUri: 'https://www.when2meet.com/',
    }
};

const msalInstance = new PublicClientApplication(msalConfig);

async function getToken() {
    try {
        await msalInstance.initialize();

        const loginResponse = await msalInstance.loginPopup({
            scopes: ["User.Read", "Calendars.Read"],
            prompt: "select_account"
        });

        return loginResponse.accessToken;
    } catch (error) {
        console.error('Error getting token:', error);
        throw error; // Handle token acquisition errors
    }
}

async function getAvailabilityIn15MinIntervals(
    accessToken: string,
    date: string, // Format: YYYY-MM-DD
    startTime: string, // Format: HH:mm
    endTime: string, // Format: HH:mm
    timezone: string
) {
    // Combine date with time to create start and end DateTime objects
    const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
    const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();
    // Get all events in the specified time range in one API call
    const events = await getCalendarEventsForWindow(accessToken, startDateTime, endDateTime, timezone);

    // Process events and check availability for each 15-minute interval
    const intervals = generate15MinIntervals(new Date(startDateTime), new Date(endDateTime));

    const availability = intervals.map((interval) => {
        const isBusy = events.value.some((event: any) => {
            const eventStart = new Date(event.start.dateTime);
            const eventEnd = new Date(event.end.dateTime);
            // Check if the event overlaps with the current interval
            return eventStart < interval.end && eventEnd > interval.start;
        });
        return {
            start: interval.start,
            end: interval.end,
            busy: isBusy,
        };
    });

    return availability;
}

// Fetch all events for the specified window
async function getCalendarEventsForWindow(accessToken: string, startDateTime: string, endDateTime: string, timezone: string) {
    const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                Prefer: `outlook.timezone="${timezone}"`,
            },
        }
    );
    const events = await response.json();
    return events;
}

async function getAvailabilityOutlook(times: string[], dates: string[], timezone: string, startTime: string, endTime: string) {
    try {
        const accessToken = await getToken();
        const elements = document.querySelectorAll('[id^="YouTime"]');
        const firstTime24Hour = convertTo24Hour(times[0], true);
        const lastTime24Hour = convertTo24Hour(times[times.length - 1], false);

        for (const [dateIndex, date] of dates.entries()) {
            const isoDate = formatDateToISO(date);
            const availability = await getAvailabilityIn15MinIntervals(
                accessToken,
                isoDate,
                firstTime24Hour,
                lastTime24Hour,
                timezone
            );

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
        console.error('Error getting availability:', error);
    }
}

export { getAvailabilityOutlook };