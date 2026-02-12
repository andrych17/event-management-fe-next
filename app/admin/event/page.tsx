'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/lib/api';
import { useEventManagement } from '@/hooks/useEventManagement';
import { useNotifications } from '@/hooks/useNotifications';
import EventList from '@/components/admin/EventList';
import EventForm from '@/components/admin/EventForm';
import Sidebar from '@/components/admin/Sidebar';
import PreviewModal from '@/components/admin/PreviewModal';
import NotificationDialog from '@/components/admin/NotificationDialog';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import FloorMapModal from '@/components/FloorMapModal';

export default function EventsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  // Custom Hooks
  const {
    events,
    locations,
    floors,
    loading,
    currentPage,
    perPage,
    totalPages,
    total,
    filters,
    sort,
    updatePage,
    updatePerPage,
    updateFilters,
    updateSort,
    fetchConfigs,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEventManagement({ initialPage: 1, initialPerPage: 10 });

  const { notification, showSuccess, showError, clearNotification } = useNotifications();

  // UI State
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showFloorMap, setShowFloorMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; event: Event | null }>({
    show: false,
    event: null,
  });

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch configs on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConfigs();
    }
  }, [isAuthenticated, fetchConfigs]);

  // Handlers
  const handleCreate = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = (event: Event) => {
    setConfirmDialog({ show: true, event });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.event) return;

    try {
      await deleteEvent(confirmDialog.event.id);
      showSuccess('Success', 'Event deleted successfully');
      setConfirmDialog({ show: false, event: null });
    } catch (error) {
      console.error('Failed to delete event:', error);
      showError('Error', 'Failed to delete event');
    }
  };

  const handleSave = async (eventData: Partial<Event>) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        showSuccess('Success', 'Event updated successfully');
      } else {
        await createEvent(eventData);
        showSuccess('Success', 'Event created successfully');
      }
      setShowForm(false);
      setEditingEvent(null);
    } catch (error: any) {
      console.error('Failed to save event:', error);
      showError('Error', error.response?.data?.message || 'Failed to save event');
      throw error;
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleClearFilters = () => {
    updateFilters({
      locationId: undefined,
      floorId: undefined,
      dateFrom: '',
      dateTo: '',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const hasActiveFilters = filters.locationId || filters.floorId || filters.dateFrom || filters.dateTo;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} userName={user?.name} onPreview={() => setShowPreview(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl lg:ml-0">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-end gap-3 ml-16 lg:ml-0">
              {/* User Info & Logout */}
              <div className="text-right hidden sm:block">
                <p className="text-xs text-white/70 font-medium uppercase tracking-wide">Admin</p>
                <p className="text-sm font-semibold">{user?.name || 'Administrator'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 border border-white/30 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 lg:p-8 border border-gray-100">
              {/* Title */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  All Events
                </h2>
              </div>

              {/* Filters */}
              <div className="mb-6">
                {/* Filter Toggle & Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 rounded-lg font-semibold text-sm transition-all shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                    {hasActiveFilters && (
                      <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </button>

                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-medium"
                  />
                </div>

                {/* Collapsible Filter Panel */}
                {showFilters && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 p-6 space-y-4 animate-fadeIn mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Location Filter */}
                      <div>
                        <label className="block text-xs font-bold text-gray-900 uppercase mb-2">Location</label>
                        <select
                          value={filters.locationId || ''}
                          onChange={(e) =>
                            updateFilters({ locationId: e.target.value ? Number(e.target.value) : undefined })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-semibold shadow-sm"
                        >
                          <option value="">All Locations</option>
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.value}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Floor Filter */}
                      <div>
                        <label className="block text-xs font-bold text-gray-900 uppercase mb-2">Floor</label>
                        <select
                          value={filters.floorId || ''}
                          onChange={(e) =>
                            updateFilters({ floorId: e.target.value ? Number(e.target.value) : undefined })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-semibold shadow-sm"
                        >
                          <option value="">All Floors</option>
                          {floors.map((floor) => (
                            <option key={floor.id} value={floor.id}>
                              {floor.value}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* DateTime From Filter */}
                      <div>
                        <label className="block text-xs font-bold text-gray-900 uppercase mb-2">Date & Time From</label>
                        <input
                          type="datetime-local"
                          value={filters.dateFrom}
                          onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-semibold shadow-sm"
                        />
                      </div>

                      {/* DateTime To Filter */}
                      <div>
                        <label className="block text-xs font-bold text-gray-900 uppercase mb-2">Date & Time To</label>
                        <input
                          type="datetime-local"
                          value={filters.dateTo}
                          onChange={(e) => updateFilters({ dateTo: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-semibold shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleClearFilters}
                          className="px-4 py-2 border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all font-semibold text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Per Page & Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  {/* Per Page */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-900">Show:</label>
                    <select
                      value={perPage}
                      onChange={(e) => updatePerPage(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 font-semibold"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setShowFloorMap(true)}
                      className="w-full sm:w-auto bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Ketersediaan Lokasi
                    </button>
                    <button
                      onClick={() => setShowPreview(true)}
                      className="w-full sm:w-auto bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview Event
                    </button>
                    <button
                      onClick={handleCreate}
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Event
                    </button>
                  </div>
                </div>
              </div>

              {/* Event List or Welcome Message */}
              {!loading && events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    {hasActiveFilters
                      ? 'No events found matching your filters. Try adjusting your search criteria.'
                      : 'Get started by creating your first event.'}
                  </p>
                  {!hasActiveFilters && (
                    <button
                      onClick={handleCreate}
                      className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Your First Event
                    </button>
                  )}
                </div>
              ) : (
                <EventList
                  events={events}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={loading}
                  currentPage={currentPage}
                  perPage={perPage}
                  totalPages={totalPages}
                  total={total}
                  onPageChange={updatePage}
                  onPerPageChange={updatePerPage}
                  sortBy={sort.sortBy}
                  sortDir={sort.sortDir}
                  onSort={updateSort}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Event Form Modal */}
      {showForm && <EventForm event={editingEvent} onSave={handleSave} onCancel={handleCancel} locations={locations} allFloors={floors} />}

      {/* Preview Modal */}
      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} />

      {/* Notification Dialog */}
      {notification && (
        <NotificationDialog
          isOpen={true}
          onClose={clearNotification}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        onClose={() => setConfirmDialog({ show: false, event: null })}
        onConfirm={confirmDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${confirmDialog.event?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Floor Map Modal */}
      {showFloorMap && <FloorMapModal isOpen={showFloorMap} onClose={() => setShowFloorMap(false)} />}
    </div>
  );
}
