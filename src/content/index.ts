import { PublicClientApplication } from "@azure/msal-browser";

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

// Helper function to generate 15-minute intervals
function generate15MinIntervals(start: Date, end: Date) {
    const intervals = [];
    let currentTime = new Date(start);
    while (currentTime < end) {
        const nextTime = new Date(currentTime.getTime() + 15 * 60 * 1000); // Add 15 minutes
        intervals.push({
            start: new Date(currentTime),
            end: new Date(nextTime),
        });
        currentTime = nextTime;
    }
    return intervals;
}

function formatDateToISO(dateString: string): string {
    const date = new Date(dateString);
    const year = String(new Date().getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function convertTo24Hour(time: string): string {
    const [timePart, modifier] = time.split(/\s+/);
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
        hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
        hours = 0;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

async function getAvailability(times: string[], dates: string[], timezone: string) {
    try {
        const accessToken = await getToken();
        const elements = document.querySelectorAll('[id^="YouTime"]');

        for (const [dateIndex, date] of dates.entries()) {
            const availability = await getAvailabilityIn15MinIntervals(
                accessToken,
                formatDateToISO(date),
                "00:00",
                "24:00",
                timezone
            );

            let timesIndex = 0;
            let startTime = false;
            const firstTime24Hour = convertTo24Hour(times[0]);
            const lastTime24Hour = convertTo24Hour(times[times.length - 1]);

            availability.forEach((slot) => {
                const start = slot.start.toLocaleTimeString();
                const start24Hour = convertTo24Hour(start);

                if (start24Hour === firstTime24Hour) {
                    startTime = true;
                } else if (start24Hour === lastTime24Hour) {
                    startTime = false;
                }

                if (startTime) {
                    if (!slot.busy) {
                        const elementIndex = dateIndex + dates.length * timesIndex;
                        const element = elements[elementIndex] as HTMLElement;

                        if (element) {
                            element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                            element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                        } else {
                            console.error(`Element at index ${elementIndex} is undefined`);
                        }
                    }
                    timesIndex++;
                }
            });
        }
    } catch (error) {
        console.error('Error getting calendar:', error);
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'autofill') {
        const { calendarProvider, timezone } = message;

        let times: string[] = [];
        let dates: string[] = [];

        const youGrid = document.getElementById('YouGrid');
        if (youGrid) {
            const directChildren = youGrid.querySelectorAll(':scope > div'); // Direct children only

            // Check if there are at least 3 direct child divs
            if (directChildren.length >= 3) {
                // Get the times.
                const secondDiv = directChildren[1];
                const timeDivs = Array.from(secondDiv.querySelectorAll('div'));
                times = timeDivs.map(div => {
                    if (div.firstChild?.firstChild) {
                        return div.firstChild.firstChild.textContent;
                    }
                    return null;
                }).filter((time): time is string => time !== null);
                times = times.filter((_, index) => index % 2 === 0); // Filter out every other time
                console.log("times: ", times);

                // Get the dates.
                const thirdDiv = directChildren[2];
                const divs = Array.from(thirdDiv.querySelectorAll('div'))
                    .filter(div => div.id !== 'YouGridSlots'); // Exclude the div with id 'YouGridSlots'

                dates = divs.map(div => {
                    if (!div.firstChild?.textContent) return null; // Skip if null
                    const cleanedText = div.firstChild && div.firstChild.nodeType === Node.TEXT_NODE
                        ? div.firstChild.textContent.trim() // Get only the direct text node (ignores nested divs)
                        : null;
                    if (cleanedText && cleanedText.length > 0) {
                        const match = cleanedText.match(/"([^"]+)"/); // Regex to capture text inside quotes
                        return match ? match[1] : cleanedText; // Return matched text or entire cleaned text
                    }
                    return null; // Skip if no direct text
                }).filter((date): date is string => date !== null); // Remove null values and ensure type is string
                dates = dates.filter((_, index) => index % 2 === 0); // Filter out every other date

                console.log(dates); // Outputs the array of texts inside quotes
            } else {
                console.error('There are not enough direct child divs inside YouGrid');
            }
        } else {
            console.error('Element with id YouGrid not found');
        }

        // Finding available times and inputting them into the YouTime elements
        getAvailability(times, dates, timezone);

        sendResponse({ status: 'Attempted to click all YouTime elements' });
    }
});