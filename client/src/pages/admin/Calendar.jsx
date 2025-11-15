// Calendar.jsx
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

export default function CalendarPage() {
  const [events, setEvents] = useState([
    { id: "1", title: "Event Conf.", start: new Date().toISOString().slice(0,10) },
    // thêm sample
  ]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Calendar</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-indigo-600 text-white rounded">Add Event +</button>
        </div>
      </div>

      <div className="prose">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          height="auto"
        />
      </div>
    </div>
  );
}
