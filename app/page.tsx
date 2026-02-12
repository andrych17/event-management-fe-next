'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import apiService, { Event } from '@/lib/api';
import EventDisplay from '@/components/EventDisplay';
import PromoSlideshow from '@/components/PromoSlideshow';

const RETRY_INTERVAL = 15000; // Retry every 15 seconds on error

export default function Home() {
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const retryTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchTodayEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getTodayEvents();
      setTodayEvents(data.events);
      setCurrentDate(formatDate(data.date));
      setHasError(false);
      // Clear retry timer on success
      if (retryTimer.current) {
        clearInterval(retryTimer.current);
        retryTimer.current = null;
      }
    } catch (error) {
      console.error('Failed to fetch today events:', error);
      setHasError(true);
      // Start auto-retry if not already running
      if (!retryTimer.current) {
        retryTimer.current = setInterval(fetchTodayEvents, RETRY_INTERVAL);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayEvents();

    // Refresh every 5 minutes
    const interval = setInterval(fetchTodayEvents, 300000);
    return () => {
      clearInterval(interval);
      if (retryTimer.current) clearInterval(retryTimer.current);
    };
  }, [fetchTodayEvents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('id-ID', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month.toUpperCase()} ${year}`;
  };

  return (
    <div className="min-h-screen lg:h-screen bg-black overflow-y-auto lg:overflow-hidden">
      {/* Main Content */}
      <main className="h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen lg:h-full">
          {/* Left: Today's Events */}
          <div className="min-h-screen lg:h-full flex flex-col">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-12 py-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight">
                JADWAL HARI INI
              </h1>
              <p className="text-xl md:text-2xl font-bold text-green-400 mt-2">
                {currentDate}
              </p>
            </div>

            {/* Events Content */}
            <div className="bg-neutral-900 px-12 py-10 flex-1 flex flex-col">
              {loading || hasError ? (
                <div className="text-center text-gray-400 py-12 flex flex-col items-center gap-4">
                  <svg className="animate-spin h-10 w-10 text-cyan-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="font-medium">
                    {hasError ? 'Menghubungkan ke server...' : 'Loading events...'}
                  </span>
                </div>
              ) : (
                <EventDisplay events={todayEvents} />
              )}
            </div>
          </div>

          {/* Right: Promo Slideshow */}
          <div className="min-h-screen lg:h-full">
            <PromoSlideshow />
          </div>
        </div>
      </main>
    </div>
  );
}
