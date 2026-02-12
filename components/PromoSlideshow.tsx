'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import apiService, { Promo } from '@/lib/api';
import Image from 'next/image';

const RETRY_INTERVAL = 15000; // Retry every 15 seconds on error

export default function PromoSlideshow() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);

  // Drag/swipe state (shared for touch & mouse)
  const dragStartX = useRef(0);
  const dragEndX = useRef(0);
  const isDragging = useRef(false);
  const retryTimer = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_DURATION = 5000; // 5 seconds
  const PROGRESS_INTERVAL = 50; // Update progress every 50ms
  const SWIPE_THRESHOLD = 50; // Minimum swipe distance in pixels

  const fetchPromos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getPromos();
      setPromos(data.promos || []);
      setHasError(false);
      if (retryTimer.current) {
        clearInterval(retryTimer.current);
        retryTimer.current = null;
      }
    } catch (error) {
      console.error('Failed to fetch promos:', error);
      setHasError(true);
      if (!retryTimer.current) {
        retryTimer.current = setInterval(fetchPromos, RETRY_INTERVAL);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % promos.length);
    setProgress(0);
  }, [promos.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length);
    setProgress(0);
  }, [promos.length]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const diff = dragStartX.current - dragEndX.current;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;

    if (diff > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }, [nextSlide, prevSlide]);

  // Touch handlers (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragEndX.current = e.touches[0].clientX;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    dragEndX.current = e.touches[0].clientX;
  }, []);

  // Mouse handlers (desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    dragEndX.current = e.clientX;
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    dragEndX.current = e.clientX;
  }, []);

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging.current) handleDragEnd();
  }, [handleDragEnd]);

  // Fetch promos on mount
  useEffect(() => {
    fetchPromos();
    return () => {
      if (retryTimer.current) clearInterval(retryTimer.current);
    };
  }, [fetchPromos]);

  // Auto-advance slides
  useEffect(() => {
    if (promos.length <= 1) return;

    const slideInterval = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(slideInterval);
  }, [promos.length, nextSlide]);

  // Update progress bar
  useEffect(() => {
    if (promos.length <= 1) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (PROGRESS_INTERVAL / SLIDE_DURATION) * 100;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, PROGRESS_INTERVAL);

    return () => clearInterval(progressInterval);
  }, [promos.length, currentIndex]);

  if (loading || hasError || promos.length === 0) {
    return (
      <div className="relative w-full h-full bg-neutral-900 overflow-hidden flex items-center justify-center">
        <div className="text-gray-500 flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-cyan-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>
            {hasError ? 'Menghubungkan ke server...' : 'Loading promos...'}
          </span>
        </div>
      </div>
    );
  }

  const currentPromo = promos[currentIndex];

  return (
    <div
      className="relative w-full h-full bg-neutral-900 overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slideshow Image */}
      <div className="absolute inset-0 p-2 lg:p-0">
        <div className="relative w-full h-full">
          <Image
            src={currentPromo.image_url}
            alt={`Promo ${currentIndex + 1}`}
            fill
            draggable={false}
            className="object-contain transition-opacity duration-500 pointer-events-none"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/800x1000?text=Promo+Image';
            }}
            unoptimized
          />
        </div>
      </div>

      {/* Progress Bar */}
      {promos.length > 1 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800/50">
          <div
            className="h-full bg-cyan-400 transition-all duration-100 linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Navigation Dots */}
      {promos.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3">
          {promos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-cyan-400 w-8 h-3'
                  : 'bg-gray-500 hover:bg-gray-400 w-3 h-3'
              }`}
              aria-label={`Go to promo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
