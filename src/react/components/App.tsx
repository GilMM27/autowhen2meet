import React, { useState } from 'react';

const App = () => {
    const [calendarProvider, setCalendarProvider] = useState<string>('Outlook');
    const calendars = ['Outlook', 'Google'];

    const [timezone, setTimezone] = useState<string>('America/Mexico_City');
    const timezones = [
        'Etc/GMT+12', 'Etc/GMT+11', 'Pacific/Honolulu', 'America/Anchorage', 'America/Santa_Isabel',
        'America/Los_Angeles', 'America/Phoenix', 'America/Chihuahua', 'America/Denver', 'America/Guatemala',
        'America/Chicago', 'America/Mexico_City', 'America/Regina', 'America/Bogota', 'America/New_York',
        'America/Indiana/Indianapolis', 'America/Caracas', 'America/Asuncion', 'America/Halifax', 'America/Cuiaba',
        'America/La_Paz', 'America/Santiago', 'America/St_Johns', 'America/Sao_Paulo', 'America/Argentina/Buenos_Aires',
        'America/Cayenne', 'America/Godthab', 'America/Montevideo', 'America/Bahia', 'Etc/GMT+2', 'Atlantic/Azores',
        'Atlantic/Cape_Verde', 'Africa/Casablanca', 'Etc/GMT', 'Europe/London', 'Atlantic/Reykjavik', 'Europe/Berlin',
        'Europe/Budapest', 'Europe/Paris', 'Europe/Warsaw', 'Africa/Lagos', 'Africa/Windhoek', 'Europe/Bucharest',
        'Asia/Beirut', 'Africa/Cairo', 'Asia/Damascus', 'Africa/Johannesburg', 'Europe/Kyiv (Kiev)', 'Europe/Istanbul',
        'Asia/Jerusalem', 'Asia/Amman', 'Asia/Baghdad', 'Europe/Kaliningrad', 'Asia/Riyadh', 'Africa/Nairobi',
        'Asia/Tehran', 'Asia/Dubai', 'Asia/Baku', 'Europe/Moscow', 'Indian/Mauritius', 'Asia/Tbilisi', 'Asia/Yerevan',
        'Asia/Kabul', 'Asia/Karachi', 'Asia/Toshkent (Tashkent)', 'Asia/Kolkata', 'Asia/Colombo', 'Asia/Kathmandu',
        'Asia/Astana (Almaty)', 'Asia/Dhaka', 'Asia/Yekaterinburg', 'Asia/Yangon (Rangoon)', 'Asia/Bangkok',
        'Asia/Novosibirsk', 'Asia/Shanghai', 'Asia/Krasnoyarsk', 'Asia/Singapore', 'Australia/Perth', 'Asia/Taipei',
        'Asia/Ulaanbaatar', 'Asia/Irkutsk', 'Asia/Tokyo', 'Asia/Seoul', 'Australia/Adelaide', 'Australia/Darwin',
        'Australia/Brisbane', 'Australia/Sydney', 'Pacific/Port_Moresby', 'Australia/Hobart', 'Asia/Yakutsk',
        'Pacific/Guadalcanal', 'Asia/Vladivostok', 'Pacific/Auckland', 'Etc/GMT-12', 'Pacific/Fiji', 'Asia/Magadan',
        'Pacific/Tongatapu', 'Pacific/Apia', 'Pacific/Kiritimati'
    ];

    const changeCalendar = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCalendarProvider(event.target.value);
    };

    const changeTimezone = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimezone(event.target.value);
    };

    function autofill() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'autofill', calendarProvider, timezone });
            }
        });

        // 56216641853-1emfcl2dl1cuspkpfv6mq07i686trf5a.apps.googleusercontent.com
        // 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
    }

    return (
        <main className="w-80 h-fit relative bg-gradient-to-r from-black to-green-950 text-white flex flex-col items-center font-code">
            <h1 className="text-3xl text-center w-full py-3 font-bold text-green-600">AutoWhen2Meet</h1>
            <p className="m-3 text-center text-lg">Fill in a when2meet with the free spaces on your calendar!</p>

            <p className="text-center">Select your calendar provider:</p>
            <select value={calendarProvider} onChange={changeCalendar} className="text-black m-3 p-1 box-border w-60 mx-auto block">
                {calendars.map((calendar, index) => (
                    <option key={index} value={calendar}>{calendar}</option>
                ))}
            </select>

            <p className="text-center">Select your timezone:</p>
            <select value={timezone} onChange={changeTimezone} className="text-black m-3 p-1 box-border w-60 mx-auto block">
                {timezones.map((timezone, index) => (
                    <option key={index} value={timezone}>{timezone}</option>
                ))}
            </select>

            <button onClick={autofill} className="text-xl text-center w-40 m-3 bg-blue-800 hover:bg-blue-700 transition duration-300 ease-in-out rounded-xl">Autofill!</button>
            <p className="m-3 text-center text-sm w-full text-green-600">Developed by: <a href='https://github.com/GilMM27' target='_blank' rel='noopener noreferrer' className='font-bold'>GilMM27</a></p>
        </main>
    );
};

export default App;