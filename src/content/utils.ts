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

export { convertTo24Hour, generate15MinIntervals };