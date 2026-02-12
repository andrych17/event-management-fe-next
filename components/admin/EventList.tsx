'use client';

import { Event } from '@/lib/api';
import { formatFullDateTime } from '@/lib/dateFormat';

interface EventListProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  loading: boolean;
  currentPage: number;
  perPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

export default function EventList({
  events,
  onEdit,
  onDelete,
  loading,
  currentPage,
  perPage,
  totalPages,
  total,
  onPageChange,
  onPerPageChange,
  sortBy,
  sortDir,
  onSort
}: EventListProps) {
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, total);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Returns "HH:MM"
  };

  const getStartDateTime = (event: Event) => {
    if (event.event_start_datetime) {
      return formatFullDateTime(event.event_start_datetime);
    }
    // Fallback to old format
    return `${formatDate(event.event_date)} ${formatTime(event.event_time)}`;
  };

  const getEndDateTime = (event: Event) => {
    if (event.event_end_datetime) {
      return formatFullDateTime(event.event_end_datetime);
    }
    return '-';
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <th
      className={`px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider ${
        onSort ? 'cursor-pointer hover:bg-gray-200 transition-colors select-none' : ''
      }`}
      onClick={() => onSort?.(column)}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        {sortBy === column && (
          <span className="text-indigo-600 font-bold">
            {sortDir === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  if (!loading && events.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium">No events found. Create your first event!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading events...
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <SortableHeader column="title">Title</SortableHeader>
              <SortableHeader column="location_id">Location</SortableHeader>
              <SortableHeader column="floor_id">Floor</SortableHeader>
              <SortableHeader column="event_start_datetime">Start Date & Time</SortableHeader>
              <SortableHeader column="event_end_datetime">End Date & Time</SortableHeader>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              Array.from({ length: perPage > 5 ? 5 : perPage }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="skeleton h-5 w-36" /><div className="skeleton h-3 w-48 mt-2" /></td>
                  <td className="px-6 py-4"><div className="skeleton h-5 w-24" /></td>
                  <td className="px-6 py-4"><div className="skeleton h-5 w-20" /></td>
                  <td className="px-6 py-4"><div className="skeleton h-5 w-36" /></td>
                  <td className="px-6 py-4"><div className="skeleton h-5 w-36" /></td>
                  <td className="px-6 py-4 text-right"><div className="skeleton h-5 w-24 ml-auto" /></td>
                </tr>
              ))
            ) : events.map((event) => (
              <tr key={event.id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">{event.title}</div>
                  {event.description && (
                    <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                      {event.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {event.location?.value || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {event.floor?.value || <span className="text-gray-400">-</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {getStartDateTime(event)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {getEndDateTime(event)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(event)}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold mr-4 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(event)}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Skeleton */}
      {loading && (
        <div className="lg:hidden space-y-4">
          {Array.from({ length: perPage > 3 ? 3 : perPage }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="skeleton h-5 w-48" />
              <div className="skeleton h-3 w-64" />
              <div className="grid grid-cols-2 gap-3">
                <div><div className="skeleton h-3 w-16 mb-1" /><div className="skeleton h-4 w-24" /></div>
                <div><div className="skeleton h-3 w-12 mb-1" /><div className="skeleton h-4 w-20" /></div>
                <div><div className="skeleton h-3 w-24 mb-1" /><div className="skeleton h-4 w-32" /></div>
                <div><div className="skeleton h-3 w-24 mb-1" /><div className="skeleton h-4 w-32" /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile & Tablet Card View */}
      {!loading && <div className="lg:hidden space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">{event.title}</h3>
                {event.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{event.description}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase block">Location</span>
                <span className="text-gray-900 font-medium">{event.location?.value || '-'}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase block">Floor</span>
                <span className="text-gray-900">{event.floor?.value || '-'}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase block">Start Date & Time</span>
                <span className="text-gray-900 font-semibold">{getStartDateTime(event)}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase block">End Date & Time</span>
                <span className="text-gray-900 font-semibold">{getEndDateTime(event)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => onEdit(event)}
                className="flex-1 inline-flex items-center justify-center gap-2 text-indigo-600 hover:bg-indigo-50 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => onDelete(event)}
                className="flex-1 inline-flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>}

      {/* Pagination */}
      {!loading && (
        <div className="px-6 py-4 bg-gray-50 rounded-xl border border-gray-200 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-900 font-semibold">
            Showing {startIndex + 1} to {endIndex} of {total} events
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Previous</span>
              </button>
              <span className="px-4 py-2 text-sm text-gray-700 font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
