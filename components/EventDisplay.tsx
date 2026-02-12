'use client';

import { useState, useRef, useCallback } from 'react';
import { Event } from '@/lib/api';
import PaginationBullets from './PaginationBullets';

const SWIPE_THRESHOLD = 50;

interface EventDisplayProps {
  events: Event[];
}

export default function EventDisplay({ events }: EventDisplayProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const displayedEvents = events.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Drag/swipe state
  const dragStartX = useRef(0);
  const dragEndX = useRef(0);
  const isDragging = useRef(false);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const diff = dragStartX.current - dragEndX.current;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;

    if (diff > 0) {
      nextPage();
    } else {
      prevPage();
    }
  }, [nextPage, prevPage]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragEndX.current = e.touches[0].clientX;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    dragEndX.current = e.touches[0].clientX;
  }, []);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    dragEndX.current = e.clientX;
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    dragEndX.current = e.clientX;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isDragging.current) handleDragEnd();
  }, [handleDragEnd]);

  const formatTime = (time: string) => {
    // time is in format "HH:MM:SS" or "HH:MM"
    return time.substring(0, 5); // Returns "HH:MM"
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatFullDateTime = (datetime: string) => {
    const date = new Date(datetime);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
  };

  const isSameDay = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getTimeDisplay = (event: Event) => {
    // If new datetime fields exist, use them
    if (event.event_start_datetime) {
      const startTime = formatDateTime(event.event_start_datetime);
      if (event.event_end_datetime) {
        // Check if start and end are on the same day
        if (isSameDay(event.event_start_datetime, event.event_end_datetime)) {
          // Same day: show only times
          const endTime = formatDateTime(event.event_end_datetime);
          return { type: 'same-day', start: startTime, end: endTime };
        } else {
          // Different days: show full datetime for end
          const endDateTime = formatFullDateTime(event.event_end_datetime);
          return { type: 'multi-day', start: startTime, end: endDateTime };
        }
      }
      return { type: 'single', time: startTime };
    }
    // Fallback to old fields
    return { type: 'single', time: formatTime(event.event_time) };
  };

  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  // Shared drag handlers props
  const dragProps = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleDragEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleDragEnd,
    onMouseLeave: handleMouseLeave,
  };

  if (events.length === 0) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center text-gray-400 select-none cursor-grab active:cursor-grabbing"
        {...dragProps}
      >
        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="font-medium">No events scheduled for today</p>
      </div>
    );
  }

  return (
    // h-full makes the swipeable area fill the entire parent container,
    // including empty space below events.
    <div
      className="h-full flex flex-col justify-center select-none cursor-grab active:cursor-grabbing"
      {...dragProps}
    >
      <div className="space-y-6">
      {displayedEvents.map((event, index) => (
        <div
          key={event.id}
          className="group"
        >
          {/* Event Title */}
          <h3 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-4 uppercase tracking-tight">
            {event.title}
          </h3>

          {/* Event Details - Horizontal Layout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8 pb-6">
            {/* Left: Location & Floor */}
            <div className="flex items-center gap-6 text-white">
              <div className="flex items-center gap-3">
                <span className="text-lg sm:text-xl font-bold uppercase tracking-wide">
                  {event.location?.value || '-'}
                </span>
              </div>
              {event.floor && (
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-medium">
                    {event.floor?.value || '-'}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Time */}
            <div className="flex items-center gap-2">
              {(() => {
                const timeDisplay = getTimeDisplay(event);

                if (timeDisplay.type === 'single') {
                  return (
                    <span className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                      {timeDisplay.time} <span className="text-base text-gray-400">WIB</span>
                    </span>
                  );
                } else if (timeDisplay.type === 'same-day') {
                  return (
                    <span className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                      {timeDisplay.start} - {timeDisplay.end} <span className="text-base text-gray-400">WIB</span>
                    </span>
                  );
                } else {
                  // multi-day
                  return (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="text-lg sm:text-xl font-bold text-white">
                        {timeDisplay.start} <span className="text-sm text-gray-400">WIB</span>
                      </span>
                      <span className="text-green-400 font-bold hidden sm:inline">→</span>
                      <span className="text-lg sm:text-xl font-bold text-green-400">
                        {timeDisplay.end} <span className="text-sm text-gray-400">WIB</span>
                      </span>
                    </div>
                  );
                }
              })()}
            </div>
          </div>

          {/* Separator Line (except for last item) */}
          {index < displayedEvents.length - 1 && (
            <div className="border-t border-gray-700 my-6"></div>
          )}
        </div>
      ))}

        {/* Show pagination bullets if events > 2 */}
        {events.length > 2 && (
          <div className="pt-4">
            <PaginationBullets
              total={totalPages}
              current={currentPage}
              onChange={changePage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
