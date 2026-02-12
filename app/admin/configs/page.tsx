'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api, { Config } from '@/lib/api';
import Sidebar from '@/components/admin/Sidebar';
import NotificationDialog from '@/components/admin/NotificationDialog';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

export default function ConfigsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupCode, setGroupCode] = useState<'All' | 'Location' | 'Floor'>('All');
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [formData, setFormData] = useState({ value: '', descr: '', is_active: true, group_code: 'Location' as 'Location' | 'Floor', parent_id: undefined as number | undefined });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error', title: string, message: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean, config: Config | null }>({ show: false, config: null });
  const [showFilters, setShowFilters] = useState(false);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [locations, setLocations] = useState<Config[]>([]);
  const [sortBy, setSortBy] = useState('group_code');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConfigs();
    }
  }, [groupCode, search, perPage, currentPage, sortBy, sortDir, isActive, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadLocations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showForm) {
        setShowForm(false);
      }
    };

    if (showForm) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [showForm]);

  const loadLocations = async () => {
    try {
      const response = await api.getActiveConfigs('Location');
      setLocations(response || []);
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const group = groupCode === 'All' ? undefined : groupCode;
      const response = await api.getConfigs(currentPage, perPage, search, group, isActive, sortBy, sortDir);
      setConfigs(response.data || []);
      setTotalPages(response.last_page || 1);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to load configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setEditingConfig(null);
    const defaultGroup = groupCode === 'All' ? 'Location' : groupCode;
    setFormData({ value: '', descr: '', is_active: true, group_code: defaultGroup, parent_id: undefined });
    setErrors({});
    setShowForm(true);
  };

  const handleEdit = (config: Config) => {
    setEditingConfig(config);
    setFormData({
      value: config.value,
      descr: config.descr || '',
      is_active: config.is_active,
      group_code: (config.group_code || 'Location') as 'Location' | 'Floor',
      parent_id: config.parent_id,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    try {
      const data = { ...formData, group_code: formData.group_code };
      if (editingConfig) {
        await api.updateConfig(editingConfig.id, data);
        setNotification({
          type: 'success',
          title: 'Success',
          message: 'Configuration updated successfully'
        });
      } else {
        await api.createConfig(data);
        setNotification({
          type: 'success',
          title: 'Success',
          message: 'Configuration created successfully'
        });
      }
      setShowForm(false);
      loadConfigs();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to save configuration'
        });
      }
    }
  };

  const handleDelete = (config: Config) => {
    setConfirmDialog({ show: true, config });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.config) return;

    try {
      await api.deleteConfig(confirmDialog.config.id);
      setNotification({
        type: 'success',
        title: 'Success',
        message: 'Configuration deleted successfully'
      });
      loadConfigs();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setNotification({
          type: 'error',
          title: 'Error',
          message: error.response.data.errors.config?.[0] || 'Cannot delete configuration'
        });
      } else {
        setNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete configuration'
        });
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <th
      className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors select-none"
      onClick={() => handleSort(column)}
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

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} userName={user?.name} />

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Configuration Management
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Manage locations and floors</p>
                </div>
              </div>

              {/* Filters & Actions */}
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
                    {(groupCode !== 'All' || isActive !== undefined) && (
                      <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </button>

                  {/* Search */}
                  <input
                    type="text"
                    placeholder={`Search ${groupCode === 'All' ? 'configurations' : groupCode.toLowerCase() + 's'}...`}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-medium"
                  />
                </div>

                {/* Collapsible Filter Panel */}
                {showFilters && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 p-6 space-y-4 animate-fadeIn mb-4">
                    {/* Group Code Tabs */}
                    <div>
                      <label className="block text-xs font-bold text-gray-900 uppercase mb-2">Type</label>
                      <div className="flex gap-2 flex-wrap">
                        {(['All', 'Location', 'Floor'] as const).map((code) => (
                          <button
                            key={code}
                            onClick={() => { setGroupCode(code); setCurrentPage(1); }}
                            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                              groupCode === code
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {code === 'All' ? 'All' : code === 'Location' ? 'Locations' : 'Floors'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-xs font-bold text-gray-900 uppercase mb-2">Status</label>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => { setIsActive(undefined); setCurrentPage(1); }}
                          className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                            isActive === undefined
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => { setIsActive(true); setCurrentPage(1); }}
                          className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                            isActive === true
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Active
                        </button>
                        <button
                          onClick={() => { setIsActive(false); setCurrentPage(1); }}
                          className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                            isActive === false
                              ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Inactive
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Per Page & Create Button */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  {/* Per Page */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-900">Show:</label>
                    <select
                      value={perPage}
                      onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 font-semibold"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={handleCreate}
                    className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Config
                  </button>
                </div>
              </div>

              {/* Loading indicator */}
              {loading && (
                <div className="flex items-center gap-2 mb-3 text-sm text-indigo-600 font-medium">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading configurations...
                </div>
              )}

              {/* Empty State */}
              {!loading && configs.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No {groupCode.toLowerCase()}s found</p>
                </div>
              )}

              {/* Desktop Table View */}
              <div className="hidden lg:block rounded-xl border border-gray-200 overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <SortableHeader column="group_code">Type</SortableHeader>
                      <SortableHeader column="value">Name</SortableHeader>
                      <SortableHeader column="parent_id">Parent Location</SortableHeader>
                      <SortableHeader column="descr">Description</SortableHeader>
                      <SortableHeader column="is_active">Status</SortableHeader>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loading ? (
                      Array.from({ length: perPage > 5 ? 5 : perPage }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4"><div className="skeleton h-6 w-20" /></td>
                          <td className="px-6 py-4"><div className="skeleton h-5 w-32" /></td>
                          <td className="px-6 py-4"><div className="skeleton h-5 w-28" /></td>
                          <td className="px-6 py-4"><div className="skeleton h-5 w-40" /></td>
                          <td className="px-6 py-4"><div className="skeleton h-6 w-16" /></td>
                          <td className="px-6 py-4 text-right"><div className="skeleton h-5 w-24 ml-auto" /></td>
                        </tr>
                      ))
                    ) : (
                      configs.map((config) => (
                        <tr key={config.id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200">
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              config.group_code === 'Location' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {config.group_code}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">{config.value}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            {config.parent ? (
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {config.parent.value}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{config.descr || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              config.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {config.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(config)}
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold mr-4 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(config)}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile & Tablet Skeleton */}
              {loading && (
                <div className="lg:hidden space-y-4">
                  {Array.from({ length: perPage > 3 ? 3 : perPage }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="skeleton h-6 w-20" />
                        <div className="skeleton h-6 w-16" />
                      </div>
                      <div className="skeleton h-5 w-32" />
                      <div className="grid grid-cols-2 gap-3">
                        <div><div className="skeleton h-3 w-24 mb-1" /><div className="skeleton h-4 w-28" /></div>
                        <div><div className="skeleton h-3 w-20 mb-1" /><div className="skeleton h-4 w-24" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mobile & Tablet Card View */}
              {!loading && configs.length > 0 && (
                <div className="lg:hidden space-y-4">
                  {configs.map((config) => (
                    <div
                      key={config.id}
                      className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          config.group_code === 'Location' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {config.group_code}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          config.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {config.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900">{config.value}</h3>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase block">Parent Location</span>
                          <span className="text-gray-900 font-medium">
                            {config.parent ? (
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {config.parent.value}
                              </span>
                            ) : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase block">Description</span>
                          <span className="text-gray-900">{config.descr || '-'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleEdit(config)}
                          className="flex-1 inline-flex items-center justify-center gap-2 text-indigo-600 hover:bg-indigo-50 font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(config)}
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
                </div>
              )}

              {/* Pagination */}
              {!loading && configs.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 rounded-xl border border-gray-200 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-900 font-semibold">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} results
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
          </div>
        </main>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingConfig ? 'Edit Configuration' : 'Create New Configuration'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Type *</label>
                <select
                  value={formData.group_code}
                  onChange={(e) => setFormData({ ...formData, group_code: e.target.value as 'Location' | 'Floor', parent_id: undefined })}
                  required
                  disabled={!!editingConfig}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 font-semibold"
                >
                  <option value="Location">Location</option>
                  <option value="Floor">Floor</option>
                </select>
                {editingConfig && <p className="text-xs text-gray-500 mt-1">Type cannot be changed after creation</p>}
              </div>
              {formData.group_code === 'Floor' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Parent Location *</label>
                  <select
                    value={formData.parent_id || ''}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : undefined })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 font-semibold"
                  >
                    <option value="">Select Location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.value}
                      </option>
                    ))}
                  </select>
                  {errors.parent_id && <p className="text-red-600 text-sm mt-1">{errors.parent_id[0]}</p>}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                  placeholder="e.g., Main Hall, 1st Floor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
                {errors.value && <p className="text-red-600 text-sm mt-1">{errors.value[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea
                  value={formData.descr}
                  onChange={(e) => setFormData({ ...formData, descr: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label className="ml-2 text-sm font-semibold text-gray-900">Active</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Dialog */}
      {notification && (
        <NotificationDialog
          isOpen={true}
          onClose={() => setNotification(null)}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        onClose={() => setConfirmDialog({ show: false, config: null })}
        onConfirm={confirmDelete}
        title="Delete Configuration"
        message={`Are you sure you want to delete "${confirmDialog.config?.value}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
