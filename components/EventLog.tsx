
import React, { useEffect, useRef } from 'react';

interface EventLogProps {
  events: string[];
}

const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm p-4 rounded-lg shadow-lg h-64 border border-gray-700">
      <h2 className="text-xl font-bold mb-2 text-center border-b pb-2">Nhật Ký</h2>
      <div ref={logContainerRef} className="h-full overflow-y-auto pr-2">
        <ul>
          {events.map((event, index) => (
            <li key={index} className="text-sm mb-1 text-gray-300">{event}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EventLog;