'use client';

import { useState, useEffect } from 'react';
import api, { Config } from '@/lib/api';

interface LocationAvailability {
  location_id: number;
  location_name: string;
  is_available: boolean;
  events: Array<{
    id: number;
    title: string;
    start_time: string;
    end_time: string | null;
  }>;
}

interface FloorMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialFloorId?: number;
}

export default function FloorMapModal({ isOpen, onClose, initialDate, initialFloorId }: FloorMapModalProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate || getTodayDate());
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(initialFloorId || null);
  const [locations, setLocations] = useState<Config[]>([]);
  const [allFloors, setAllFloors] = useState<Config[]>([]);
  const [filteredFloors, setFilteredFloors] = useState<Config[]>([]);
  const [availability, setAvailability] = useState<LocationAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  useEffect(() => {
    if (isOpen) {
      loadConfigs();
      setSelectedDate(initialDate || getTodayDate());
      if (initialFloorId) {
        setSelectedFloorId(initialFloorId);
        // Find the parent location of the initial floor
        const floor = allFloors.find((f) => f.id === initialFloorId);
        if (floor?.parent_id) {
          setSelectedLocationId(floor.parent_id);
        }
      }
    }
  }, [isOpen, initialDate, initialFloorId]);

  useEffect(() => {
    if (selectedFloorId && selectedDate) {
      loadAvailability();
    }
  }, [selectedFloorId, selectedDate]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  const loadConfigs = async () => {
    try {
      const [locsRes, floorsRes] = await Promise.all([
        api.getActiveConfigs('Location'),
        api.getActiveConfigs('Floor')
      ]);
      setLocations(locsRes || []);
      setAllFloors(floorsRes || []);

      // Auto-select first location if none selected
      if (locsRes && locsRes.length > 0 && !selectedLocationId) {
        const firstLocation = locsRes[0];
        setSelectedLocationId(firstLocation.id);

        // Filter floors for first location
        const filtered = (floorsRes || []).filter(
          (floor) => floor.parent_id === firstLocation.id
        );
        setFilteredFloors(filtered);

        // Auto-select first floor
        if (filtered.length > 0 && !selectedFloorId) {
          setSelectedFloorId(filtered[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load configs:', error);
    }
  };

  const handleLocationChange = (locationId: number) => {
    setSelectedLocationId(locationId);
    const filtered = allFloors.filter((floor) => floor.parent_id === locationId);
    setFilteredFloors(filtered);

    // Auto-select first floor or reset
    if (filtered.length > 0) {
      setSelectedFloorId(filtered[0].id);
    } else {
      setSelectedFloorId(null);
    }

    // Clear availability when location changes
    setAvailability([]);
  };

  const loadAvailability = async () => {
    if (!selectedFloorId || !selectedDate) return;

    setLoading(true);
    try {
      const response = await api.getFloorAvailability(selectedFloorId, selectedDate);
      setAvailability(response.availability || []);
    } catch (error) {
      console.error('Failed to load availability:', error);
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Floor Availability Map
            </h2>
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <p className="text-sm font-semibold text-black mb-4">Pilih Lokasi, Lantai dan Tanggal untuk Melihat Ketersediaan:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Location *</label>
              <select
                value={selectedLocationId || ''}
                onChange={(e) => handleLocationChange(Number(e.target.value))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              >
                {locations.length === 0 && <option value="">No locations available</option>}
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Floor *</label>
              <select
                value={selectedFloorId || ''}
                onChange={(e) => setSelectedFloorId(Number(e.target.value))}
                required
                disabled={!selectedLocationId}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                  !selectedLocationId ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {!selectedLocationId && <option value="">Select Location First</option>}
                {selectedLocationId && filteredFloors.length === 0 && <option value="">No floors available</option>}
                {filteredFloors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-green-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="text-black font-medium">Loading availability...</div>
              </div>
            </div>
          ) : availability.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-black">
                <p className="text-lg font-semibold mb-2">No locations found</p>
                <p className="text-sm">Please select a floor and date to view availability</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availability.map((loc) => (
                <div
                  key={loc.location_id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    loc.is_available
                      ? 'bg-green-50 border-green-300 hover:shadow-lg'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{loc.location_name}</h3>
                    <div
                      className={`w-4 h-4 rounded-full ${
                        loc.is_available ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                  </div>

                  {loc.is_available ? (
                    <p className="text-sm text-green-700 font-medium">Available</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-red-700 font-semibold">Occupied</p>
                      {loc.events.map((event) => (
                        <div key={event.id} className="text-xs bg-white/50 p-2 rounded">
                          <p className="font-semibold text-black">{event.title}</p>
                          <p className="text-black">
                            {formatTime(event.start_time)}
                            {event.end_time && ` - ${formatTime(event.end_time)}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-black font-medium text-center">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Available
            </span>
            <span className="mx-2">•</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Occupied
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
