'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminHome() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
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
              {/* Welcome Section */}
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                  <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Welcome to GMS Admin
                </h1>
                <p className="text-xl text-gray-600 text-center max-w-2xl mb-8">
                  Event Management System Dashboard
                </p>
                
                {/* Quick Stats/Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-8">
                  {/* Events Card */}
                  <button
                    onClick={() => router.push('/admin/event')}
                    className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200 hover:shadow-lg hover:scale-[1.02] hover:border-indigo-400 transition-all duration-200 text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 group-hover:bg-indigo-700 rounded-lg flex items-center justify-center transition-colors">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">Event Management</h3>
                        <p className="text-sm text-gray-600">Create and manage events</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  {/* Configs Card */}
                  <button
                    onClick={() => router.push('/admin/configs')}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 hover:shadow-lg hover:scale-[1.02] hover:border-purple-400 transition-all duration-200 text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-600 group-hover:bg-purple-700 rounded-lg flex items-center justify-center transition-colors">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">Configuration</h3>
                        <p className="text-sm text-gray-600">Manage locations and floors</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
