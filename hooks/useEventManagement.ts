import { useState, useEffect, useCallback } from 'react';
import apiService, { Event, Config } from '@/lib/api';

interface EventFilters {
  search: string;
  locationId?: number;
  floorId?: number;
  dateFrom: string;
  dateTo: string;
}

interface EventSort {
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

interface UseEventManagementProps {
  initialPage?: number;
  initialPerPage?: number;
}

export const useEventManagement = ({
  initialPage = 1,
  initialPerPage = 10,
}: UseEventManagementProps = {}) => {
  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    locationId: undefined,
    floorId: undefined,
    dateFrom: '',
    dateTo: '',
  });

  // Sorting
  const [sort, setSort] = useState<EventSort>({
    sortBy: 'event_start_datetime',
    sortDir: 'asc',
  });

  // Configs
  const [locations, setLocations] = useState<Config[]>([]);
  const [floors, setFloors] = useState<Config[]>([]);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getEvents(
        currentPage,
        perPage,
        filters.search,
        filters.locationId,
        filters.floorId,
        filters.dateFrom,
        filters.dateTo,
        sort.sortBy,
        sort.sortDir
      );
      setEvents(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, filters, sort]);

  // Fetch locations and floors
  const fetchConfigs = useCallback(async () => {
    try {
      const [locationsData, floorsData] = await Promise.all([
        apiService.getActiveConfigs('Location'),
        apiService.getActiveConfigs('Floor'),
      ]);
      setLocations(locationsData || []);
      setFloors(floorsData || []);
    } catch (error) {
      console.error('Failed to fetch configs:', error);
    }
  }, []);

  // Auto-fetch events when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Create event
  const createEvent = useCallback(
    async (eventData: Partial<Event>) => {
      const event = await apiService.createEvent(eventData);
      await fetchEvents();
      return event;
    },
    [fetchEvents]
  );

  // Update event
  const updateEvent = useCallback(
    async (id: number, eventData: Partial<Event>) => {
      const event = await apiService.updateEvent(id, eventData);
      await fetchEvents();
      return event;
    },
    [fetchEvents]
  );

  // Delete event
  const deleteEvent = useCallback(
    async (id: number) => {
      await apiService.deleteEvent(id);
      await fetchEvents();
    },
    [fetchEvents]
  );

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  // Update pagination
  const updatePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const updatePerPage = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page on per page change
  }, []);

  // Update sorting
  const updateSort = useCallback((column: string) => {
    setSort((prev) => ({
      sortBy: column,
      sortDir: prev.sortBy === column && prev.sortDir === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1); // Reset to first page on sort change
  }, []);

  return {
    // Data
    events,
    locations,
    floors,

    // Loading state
    loading,

    // Pagination
    currentPage,
    perPage,
    totalPages,
    total,
    updatePage,
    updatePerPage,

    // Filters
    filters,
    updateFilters,

    // Sorting
    sort,
    updateSort,

    // CRUD operations
    fetchEvents,
    fetchConfigs,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
