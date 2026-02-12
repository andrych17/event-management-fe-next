'use client';

import { useState, useEffect } from 'react';
import { Event, Config } from '@/lib/api';

interface EventFormProps {
  event?: Event | null;
  onSave: (eventData: Partial<Event>) => Promise<void>;
  onCancel: () => void;
  locations: Config[];
  allFloors: Config[];
}

const initialFormData = {
  title: '',
  location_id: '',
  floor_id: '',
  event_start_date: '',
  event_start_time: '',
  event_end_date: '',
  event_end_time: '',
  description: '',
};

export default function EventForm({ event, onSave, onCancel, locations, allFloors }: EventFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [filteredFloors, setFilteredFloors] = useState<Config[]>([]);

  // Get today's date in YYYY-MM-DD format for min date validation
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper functions to split datetime into date and time
  const splitDateTime = (datetime: string | undefined): { date: string; time: string } => {
    if (!datetime) return { date: '', time: '' };

    // Parse the datetime string WITHOUT timezone conversion
    const cleanDatetime = datetime.replace(/\.\d{6}Z?$/, '').replace(' ', 'T').split('+')[0].split('Z')[0];

    // Split into date and time parts
    const [date, time] = cleanDatetime.split('T');
    return {
      date: date || '',
      time: time ? time.substring(0, 5) : '' // HH:MM format
    };
  };

  useEffect(() => {
    // Reset form when opening dialog
    if (event) {
      // Editing mode - populate with event data
      const startDT = splitDateTime(event.event_start_datetime);
      const endDT = splitDateTime(event.event_end_datetime);

      setFormData({
        title: event.title,
        location_id: String(event.location_id),
        floor_id: event.floor_id ? String(event.floor_id) : '',
        event_start_date: startDT.date,
        event_start_time: startDT.time,
        event_end_date: endDT.date,
        event_end_time: endDT.time,
        description: event.description || '',
      });

      // Filter floors for the existing location
      if (event.location_id) {
        const filtered = allFloors.filter((floor) => floor.parent_id === event.location_id);
        setFilteredFloors(filtered);
      }
    } else {
      // Create mode - reset to initial values
      setFormData(initialFormData);
      setFilteredFloors([]);
    }
    // Clear errors when dialog opens
    setErrors({});
  }, [event, allFloors]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Combine date and time into datetime format
    const event_start_datetime = formData.event_start_date && formData.event_start_time
      ? `${formData.event_start_date}T${formData.event_start_time}`
      : '';
    const event_end_datetime = formData.event_end_date && formData.event_end_time
      ? `${formData.event_end_date}T${formData.event_end_time}`
      : '';

    // Client-side validation for datetime
    const now = new Date();
    if (event_start_datetime) {
      const startDate = new Date(event_start_datetime);
      if (startDate < now) {
        setErrors({ event_start_datetime: ['Event start datetime cannot be in the past.'] });
        return;
      }
    }

    setLoading(true);

    try {
      // Convert string IDs to numbers for API
      const eventData: Partial<Event> = {
        title: formData.title,
        location_id: Number(formData.location_id),
        floor_id: formData.floor_id ? Number(formData.floor_id) : undefined,
        event_start_datetime: event_start_datetime,
        event_end_datetime: event_end_datetime || undefined,
        description: formData.description || undefined,
      };

      await onSave(eventData);
    } catch (error: any) {
      console.error('Failed to save event:', error);
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // If location changes, filter floors and reset floor selection
    if (name === 'location_id') {
      const locationId = value ? Number(value) : null;
      const filtered = locationId
        ? allFloors.filter((floor) => floor.parent_id === locationId)
        : [];
      setFilteredFloors(filtered);
      setFormData((prev) => ({ ...prev, location_id: value, floor_id: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {event ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                )}
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Global Error Messages */}
          {(errors.duplicate || errors.general || errors.location_id) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Validation Error</h3>
                  {errors.duplicate && <p className="text-sm text-red-700">{errors.duplicate[0]}</p>}
                  {errors.general && <p className="text-sm text-red-700">{errors.general[0]}</p>}
                  {errors.location_id && <p className="text-sm text-red-700">{errors.location_id[0]}</p>}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="e.g., Sunday Service"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Location *
            </label>
            <select
              name="location_id"
              value={formData.location_id}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                errors.location_id ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.value}
                </option>
              ))}
            </select>
            {errors.location_id && <p className="mt-1 text-sm text-red-600">{errors.location_id[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Floor *
            </label>
            <select
              name="floor_id"
              value={formData.floor_id}
              onChange={handleChange}
              required
              disabled={!formData.location_id}
              className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                errors.floor_id ? 'border-red-300 bg-red-50' : 'border-gray-200'
              } ${!formData.location_id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {!formData.location_id ? 'Select Location First' : 'Select Floor'}
              </option>
              {filteredFloors.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.value}
                </option>
              ))}
            </select>
            {errors.floor_id && <p className="mt-1 text-sm text-red-600">{errors.floor_id[0]}</p>}
          </div>

          <div className="space-y-4">
            {/* Start Date & Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Start Date & Time * <span className="text-gray-400 font-normal">(WIB - 24 Hour Format)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="event_start_date"
                  value={formData.event_start_date}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.event_start_datetime ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <input
                  type="time"
                  name="event_start_time"
                  value={formData.event_start_time}
                  onChange={handleChange}
                  required
                  step="300"
                  placeholder="HH:MM"
                  className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.event_start_datetime ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.event_start_datetime && <p className="mt-1 text-sm text-red-600">{errors.event_start_datetime[0]}</p>}
            </div>

            {/* End Date & Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                End Date & Time <span className="text-gray-400 font-normal">(Optional - 24 Hour Format)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="event_end_date"
                  value={formData.event_end_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.event_end_datetime ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <input
                  type="time"
                  name="event_end_time"
                  value={formData.event_end_time}
                  onChange={handleChange}
                  step="300"
                  placeholder="HH:MM"
                  className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.event_end_datetime ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.event_end_datetime && <p className="mt-1 text-sm text-red-600">{errors.event_end_datetime[0]}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none placeholder-gray-400 ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Add event description..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
