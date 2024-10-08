import { getAvailabilityGoogle } from "./google";
import { getAvailabilityOutlook } from "./outlook";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'autofill') {
        const { calendarProvider, selectedTimezone, selectedModifier, startTime, endTime } = message;

        let times: string[] = [];
        let dates: string[] = [];

        const youGrid = document.getElementById('YouGrid');
        if (youGrid) {
            // Get the direct children of the YouGrid element
            const directChildren = youGrid.querySelectorAll(':scope > div');

            // Check if there are at least 3 direct child divs
            if (directChildren.length >= 3) {
                // Get the times
                const secondDiv = directChildren[1];
                const timeDivs = Array.from(secondDiv.querySelectorAll('div'));
                times = timeDivs.map(div => {
                    if (div.firstChild?.firstChild) {
                        return div.firstChild.firstChild.textContent;
                    }
                    return null;
                }).filter((time): time is string => time !== null);
                times = times.filter((_, index) => index % 2 === 0); // Filter out every other time

                // Get the dates
                const thirdDiv = directChildren[2];
                const divs = Array.from(thirdDiv.querySelectorAll('div'))
                    .filter(div => div.id !== 'YouGridSlots'); // Exclude the div with id 'YouGridSlots'
                // Extract the text from the direct children divs
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
            } else {
                console.error('There are not enough direct child divs inside YouGrid');
            }
        } else {
            console.error('Element with id YouGrid not found');
        }

        // Check the user's calendar choice and click the available slots
        switch (calendarProvider) {
            case 'Outlook':
                console.log('Outlook autofill');
                getAvailabilityOutlook(times, dates, selectedTimezone, startTime, endTime);
                break;
            case 'Google':
                console.log('Google autofill');
                getAvailabilityGoogle(times, dates, selectedModifier, startTime, endTime);
                break;
            default:
                console.error('Calendar provider not recognized');
                break
        }

        sendResponse({ status: 'Finished autofill' });
    }
});