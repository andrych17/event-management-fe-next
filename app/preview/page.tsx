'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import apiService, { Event } from '@/lib/api';
import EventDisplay from '@/components/EventDisplay';
import PromoSlideshow from '@/components/PromoSlideshow';

function PreviewContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [dateParam]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // If date param is provided, fetch events for that date
      // Otherwise, fetch today's events
      const data = await apiService.getTodayEvents(dateParam || undefined);
      setEvents(data.events);
      setCurrentDate(formatDate(data.date));
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
      setCurrentDate('');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('id-ID', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month.toUpperCase()} ${year}`;
  };

  return (
    <div className="h-screen bg-black overflow-hidden">
      {/* Main Content */}
      <main className="h-full">
        <div className="grid grid-cols-2 h-full">
          {/* Left: Events */}
          <div className="h-full min-h-screen flex flex-col overflow-y-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-4 md:px-12 py-8">
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white uppercase tracking-tight">
                JADWAL HARI INI
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-green-400 mt-2">
                {currentDate}
              </p>
            </div>

            {/* Events Content */}
            <div className="bg-neutral-900 px-4 md:px-12 py-10 flex-1 flex flex-col justify-center overflow-y-auto">
              {loading ? (
                <div className="text-center text-gray-400 py-12 flex flex-col items-center gap-4">
                  <svg className="animate-spin h-10 w-10 text-cyan-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="font-medium">Loading events...</span>
                </div>
              ) : (
                <EventDisplay events={events} />
              )}
            </div>
          </div>

          {/* Right: Promo Slideshow */}
          <div className="h-full min-h-screen overflow-y-auto">
            <PromoSlideshow />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-gray-400 flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-cyan-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-medium">Loading...</span>
        </div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
