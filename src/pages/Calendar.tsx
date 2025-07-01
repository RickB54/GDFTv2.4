
import React, { useState, useEffect } from "react";
import { format, addDays, subDays, isSameDay, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { getSavedWorkoutTemplates } from "@/lib/data";
import { Workout } from "@/lib/data";
import { EventType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import CalendarHelpPopup from "@/components/ui/CalendarHelpPopup";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<EventType[]>([]);
  const { workouts } = useWorkout();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Get days for current week
  const getWeekDays = () => {
    const days = [];
    // Start with 3 days before current date
    let startDay = subDays(currentDate, 3);

    // Create array of 7 days (current day in the middle)
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDay, i);
      days.push({
        date: day,
        dayOfMonth: format(day, "d"),
        dayOfWeek: format(day, "E"),
        isToday: isSameDay(day, new Date()),
        isSelected: isSameDay(day, selectedDate),
      });
    }
    return days;
  };

  useEffect(() => {
    // Transform workouts into calendar events
    const workoutEvents = workouts.map((workout: Workout) => ({
      id: workout.id,
      title: workout.name || "Workout",
      date: new Date(workout.startTime),
      type: "workout",
      completed: !!workout.endTime,
    }));

    // Get saved templates
    const templates = getSavedWorkoutTemplates();
    const templateEvents = templates.map((template) => ({
      id: template.id,
      title: template.name,
      date: new Date(template.createdAt),
      type: "template",
    }));

    setEvents([...workoutEvents, ...templateEvents]);
  }, [workouts]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handlePrevWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };

  // Filter events for selected date
  const selectedDateEvents = events.filter((event) =>
    isSameDay(event.date, selectedDate)
  );

  const weekDays = getWeekDays();

  return (
    <div className="page-container page-transition">
      <CalendarHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Calendar</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 items-center">
            <button
              onClick={handlePrevWeek}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft />
            </button>
            <span className="font-medium">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <button
              onClick={handleNextWeek}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight />
            </button>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Week view */}
      <div className="flex justify-between my-4 overflow-x-auto">
        {weekDays.map((day) => (
          <div
            key={day.date.toString()}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full cursor-pointer 
              ${day.isSelected ? "bg-primary text-white" : ""}
              ${
                day.isToday && !day.isSelected
                  ? "bg-gray-700 text-white"
                  : ""
              }
              ${
                !day.isToday && !day.isSelected
                  ? "hover:bg-gray-800 text-gray-300"
                  : ""
              }
            `}
            onClick={() => handleDateClick(day.date)}
          >
            <span className="text-xs">{day.dayOfWeek}</span>
            <span className="font-medium">{day.dayOfMonth}</span>
            {events.some(event => isSameDay(event.date, day.date)) && (
              <div className="w-1 h-1 bg-blue-400 rounded-full mt-1"></div>
            )}
          </div>
        ))}
      </div>

      {/* Selected date */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">
          {format(selectedDate, "EEEE, MMMM d")}
        </h2>

        {selectedDateEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedDateEvents.map((event) => (
              <div
                key={event.id}
                className={`card-glass p-4 rounded-md flex items-center justify-between
                  ${event.type === "workout" ? "border-l-4 border-primary" : "border-l-4 border-secondary"}
                  ${event.completed ? "opacity-70" : ""}
                `}
              >
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-400">
                    {event.type === "workout" ? "Workout" : "Workout Plan"}
                  </p>
                </div>
                <div className="text-sm">
                  {event.completed && (
                    <span className="text-green-400">Completed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No workouts scheduled for this day
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
