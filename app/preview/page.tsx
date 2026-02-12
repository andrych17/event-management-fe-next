'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import apiService, { Event } from '@/lib/api';
import EventDisplay from '@/components/EventDisplay';
import PromoSlideshow from '@/components/PromoSlideshow';

const RETRY_INTERVAL = 15000;

function PreviewContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const retryTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getTodayEvents(dateParam || undefined);
      setEvents(data.events);
      setCurrentDate(formatDate(data.date));
      setHasError(false);
      if (retryTimer.current) {
        clearInterval(retryTimer.current);
        retryTimer.current = null;
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setHasError(true);
      if (!retryTimer.current) {
        retryTimer.current = setInterval(fetchEvents, RETRY_INTERVAL);
      }
    } finally {
      setLoading(false);
    }
  }, [dateParam]);

  useEffect(() => {
    fetchEvents();
    return () => {
      if (retryTimer.current) clearInterval(retryTimer.current);
    };
  }, [fetchEvents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('id-ID', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month.toUpperCase()} ${year}`;
  };

  return (
    <div className="min-h-screen bg-black overflow-y-auto md:h-screen md:overflow-hidden">
      <main className="md:h-full">
        <div className="flex flex-col md:grid md:grid-cols-2 md:h-full">

          {/* Top / Left: Events */}
          <div className="flex flex-col">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-6 md:px-12 py-6 md:py-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white uppercase tracking-tight">
                JADWAL HARI INI
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-green-400 mt-1 md:mt-2">
                {currentDate}
              </p>
            </div>

            {/* Events Content */}
            <div className="bg-neutral-900 px-6 md:px-12 py-8 md:py-10 flex-1 flex flex-col min-h-[40vh] md:min-h-0">
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
                <EventDisplay events={events} />
              )}
            </div>
          </div>

          {/* Bottom / Right: Promo Slideshow */}
          <div className="h-[60vw] md:h-full">
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
