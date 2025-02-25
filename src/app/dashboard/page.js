'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';
import useSocket from '@/hooks/useSocket';
import TextSubmissionForm from '@/components/Dashboard/TextSubmissionForm';

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useContext(AuthContext);
  const { notifications, clearNotifications } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  const isDeveloper = user.role === 'developer' || isAdmin;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-indigo-600 shadow-md">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-white text-xl font-bold">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center">
              {/* Notification Bell */}
              <div className="relative mr-4">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-white p-1 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-indigo-600"></span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1 max-h-96 overflow-y-auto" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <div className="flex justify-between items-center px-4 py-2 border-b">
                        <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={clearNotifications}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((notification, index) => (
                          <div key={index} className="px-4 py-3 border-b hover:bg-gray-50">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-700">{notification.username}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(notification.submissionTime).toLocaleTimeString()}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {notification.submittedText}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="text-white mr-2">{user.email}</span>
                  <span className="bg-indigo-800 text-xs text-white px-2 py-1 rounded-full">
                    {user.role}
                  </span>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="ml-4 text-white hover:bg-indigo-500 px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen">
          <div className="pt-5 pb-4">
            <nav className="mt-5">
              <Link 
                href="/dashboard" 
                className={`group flex items-center px-4 py-2 text-sm font-medium ${
                  pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              
              {isDeveloper && (
                <Link 
                  href="/dashboard/text-submission" 
                  className={`group flex items-center px-4 py-2 text-sm font-medium ${
                    pathname === '/dashboard/text-submission' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Text Submission
                </Link>
              )}
              
              {isAdmin && (
                <Link 
                  href="/dashboard/admin" 
                  className={`group flex items-center px-4 py-2 text-sm font-medium ${
                    pathname === '/dashboard/admin' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-semibold mb-6">Welcome to your Dashboard</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Info Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Your Account</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role:</span>
                  <span className="font-medium capitalize">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="font-medium">{user._id}</span>
                </div>
              </div>
            </div>

            {/* Text Submission Form */}
            {isDeveloper && (
              <TextSubmissionForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
