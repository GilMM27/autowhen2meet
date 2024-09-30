import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRightIcon } from 'lucide-react';

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
  'Pacific/Guadalcanal', 'Asia/Vladivostok', 'Pacific/Auckland', 'Etc/GMT-12', 'Pacific/Fiji'
];

const timezonesModifier = [
  '+12:00', '+11:00', '-10:00', '-09:00', '-08:00',
  '-07:00', '-07:00', '-07:00', '-06:00', '-06:00',
  '-05:00', '-06:00', '-06:00', '-05:00', '-05:00',
  '-05:00', '-04:30', '-04:00', '-04:00', '-04:00',
  '-04:00', '-03:00', '-03:00', '-03:00', '-03:00',
  '-03:00', '-03:00', '-02:00', '-01:00', '-01:00',
  '+00:00', '+00:00', '+00:00', '+00:00', '+01:00',
  '+01:00', '+01:00', '+01:00', '+01:00', '+01:00',
  '+01:00', '+02:00', '+02:00', '+02:00', '+02:00',
  '+02:00', '+02:00', '+02:00', '+03:00', '+03:00',
  '+03:30', '+04:00', '+04:00', '+04:00', '+04:00',
  '+04:00', '+04:00', '+04:00', '+04:30', '+05:00',
  '+05:00', '+05:00', '+05:30', '+05:30', '+05:45',
  '+06:00', '+06:00', '+05:00', '+06:30', '+07:00',
  '+07:00', '+08:00', '+07:00', '+08:00', '+08:00',
  '+08:00', '+08:00', '+08:00', '+09:00', '+09:00',
  '+09:30', '+09:30', '+10:00', '+10:00', '+10:00',
  '+10:00', '+09:00', '+11:00', '+10:00', '+12:00',
  '+12:00', '+13:00', '+12:00', '+13:00', '+14:00'
];

export default function Component() {
  const [calendarProvider, setCalendarProvider] = useState<string>('Outlook');
  const calendars = ['Outlook', 'Google'];

  const [selectedTimezone, setSelectedTimezone] = useState<string>('America/Mexico_City');
  const [selectedModifier, setSelectedModifier] = useState<string>('-06:00');

  const [showAdditionalSelects, setShowAdditionalSelects] = useState(false);
  const [startTime, setStartTime] = useState<string>('00:00');
  const [endTime, setEndTime] = useState<string>('24:00');
  const [endTimeSlots, setEndTimeSlots] = useState<string[]>([]);

  const timezonesWithModifiers: [string, string][] = timezones.map((timezone, index) => [timezone, timezonesModifier[index]]);

  const timeSlots = useMemo(() => {
    // Generate time slots in 15-minute intervals
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    slots.push('24:00');
    return slots;
  }, []);

  const generateEndTimeSlots = (start: string) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const slots = [];
    let hour = startHour;
    let minute = startMinute + 15;

    if (minute >= 60) {
      hour += 1;
      minute -= 60;
    }

    for (; hour < 24; hour++) {
      for (; minute < 60; minute += 15) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
      minute = 0; // Reset minute to 0 after the first hour
    }
    slots.push('24:00');
    return slots;
  };

  useEffect(() => {
    setEndTimeSlots(generateEndTimeSlots(startTime));
  }, [startTime]);

  const changeCalendar = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCalendarProvider(event.target.value);
  };

  const handleTimezoneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = event.target.selectedIndex;
    const selectedTimezone = timezonesWithModifiers[selectedIndex][0];
    const selectedModifier = timezonesWithModifiers[selectedIndex][1];
    setSelectedTimezone(selectedTimezone);
    setSelectedModifier(selectedModifier);
  };

  const toggleAdditionalSelects = () => {
    setShowAdditionalSelects(!showAdditionalSelects);
  };

  function autofill() {
    // Send message to content script to autofill the when2meet
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'autofill', 
            calendarProvider, 
            selectedTimezone, 
            selectedModifier,
            startTime,
            endTime
          });
        }
      });
    } else {
      console.log('Chrome API not available');
    }
  }

  return (
    <main className="w-80 h-fit relative bg-gradient-to-t from-black to-green-950 text-white flex flex-col items-center font-code overflow-hidden">
      <h1 className="text-3xl text-center w-full py-3 font-bold text-green-600">AutoWhen2Meet</h1>
      <p className="mb-3 text-center text-lg">Fill in a when2meet with the free spaces on your calendar!</p>

      <div className="relative w-full">
        <div className={`transition-transform duration-300 ease-in-out ${showAdditionalSelects ? '-translate-x-full' : 'translate-x-0'}`}>
          <p className="text-center">Select your calendar provider:</p>
          <select value={calendarProvider} onChange={changeCalendar} className="text-black m-3 p-1 box-border w-60 mx-auto block focus:outline-none">
            {calendars.map((calendar, index) => (
              <option key={index} value={calendar}>{calendar}</option>
            ))}
          </select>

          <p className="text-center">Select your timezone:</p>
          <select value={selectedTimezone} onChange={handleTimezoneChange} className="text-black m-3 p-1 box-border w-60 mx-auto block focus:outline-none">
            {timezonesWithModifiers.map(([timezone, modifier], index) => (
              <option key={index} value={timezone}>
                {timezone} ({modifier})
              </option>
            ))}
          </select>
        </div>

        <div className={`absolute top-0 left-full w-full transition-transform duration-300 ease-in-out ${showAdditionalSelects ? '-translate-x-full' : 'translate-x-0'}`}>
          <p className="text-center">Start Time:</p>
          <select 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)} 
            className="text-black m-3 p-1 box-border w-60 mx-auto block focus:outline-none"
          >
            {timeSlots.map((slot, index) => (
              <option key={index} value={slot}>{slot}</option>
            ))}
          </select>

          <p className="text-center">End Time:</p>
          <select 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)} 
            className="text-black m-3 p-1 box-border w-60 mx-auto block focus:outline-none"
          >
            {endTimeSlots.map((slot, index) => (
              <option key={index} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={toggleAdditionalSelects}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-400 focus:outline-none"
        aria-label={showAdditionalSelects ? "Show original selects" : "Show additional selects"}
      >
        <ChevronRightIcon className={`w-6 h-6 transition-transform duration-300 ${showAdditionalSelects ? 'rotate-180' : ''}`} />
      </button>

      <button onClick={autofill} className="text-xl text-center w-40 m-3 bg-blue-800 hover:bg-blue-700 transition duration-300 ease-in-out rounded-xl focus:outline-none">Autofill!</button>
      <p className="m-3 text-center text-sm w-full text-green-600">Developed by: <a href='https://github.com/GilMM27' target='_blank' rel='noopener noreferrer' className='font-bold focus:outline-none'>GilMM27</a></p>
    </main>
  );
}