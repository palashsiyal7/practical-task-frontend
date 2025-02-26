'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';
import useSocket from '@/hooks/useSocket';
import useWindowSession from '@/hooks/useWindowSession';
import TextSubmissionForm from '@/components/Dashboard/TextSubmissionForm';
import { getAllSubmissions } from '@/lib/api';

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout, windowSessionId } = useContext(AuthContext);
  const { notifications, clearNotifications, socket } = useSocket();
  const { sessionId, isNewWindow } = useWindowSession();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [submissionError, setSubmissionError] = useState(null);

  // Get or initialize session data
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionId) {
      try {
        // Try to get any existing data for this session
        const sessionDataKey = `session_data_${sessionId}`;
        const savedData = localStorage.getItem(sessionDataKey);
        
        if (savedData) {
          setSessionData(JSON.parse(savedData));
        } else {
          // Initialize new session data
          const newSessionData = {
            createdAt: new Date().toISOString(),
            visitCount: 1,
            sessionId
          };
          
          localStorage.setItem(sessionDataKey, JSON.stringify(newSessionData));
          setSessionData(newSessionData);
        }
      } catch (error) {
        console.error('Error managing session data:', error);
      }
    }
  }, [sessionId]);

  // Load submissions data
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchSubmissions = async () => {
      try {
        setIsLoadingSubmissions(true);
        const data = await getAllSubmissions();
        setSubmissions(data);
        setSubmissionError(null);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setSubmissionError('Failed to load submissions');
      } finally {
        setIsLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [isAuthenticated, user]);

  // Listen for real-time submission updates
  useEffect(() => {
    if (!user || !socket) return;

    const handleNewSubmission = (data) => {
      // Create a temporary submission object
      const newSubmission = {
        _id: Date.now().toString(), // Temporary ID
        text: data.submittedText,
        createdAt: data.submissionTime || new Date().toISOString(),
        userId: { email: data.username }
      };
      
      setSubmissions(prev => [newSubmission, ...prev]);
    };

    socket.on('newSubmission', handleNewSubmission);

    return () => {
      socket.off('newSubmission', handleNewSubmission);
    };
  }, [socket, user]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  // Display a welcome message for new windows
  useEffect(() => {
    if (isNewWindow && isAuthenticated) {
      alert('Welcome to a new session! This window has its own separate session.');
    }
  }, [isNewWindow, isAuthenticated]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Session info banner */}
      <div className="bg-indigo-600 text-white px-4 py-2 text-sm text-center">
        <p>
          Window Session ID: <span className="font-mono">{sessionId || windowSessionId || 'Not available'}</span>
          {isNewWindow && ' (New Window Session)'}
        </p>
        <p className="text-xs mt-1">
          Open a new window (Cmd+N) to create a separate session. Each window maintains its own session.
        </p>
      </div>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Clear all
                      </button>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <p className="px-4 py-2 text-sm text-gray-500">No new notifications</p>
                    ) : (
                      notifications.map((notification, index) => (
                        <div key={index} className="px-4 py-2 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-force-dark">{notification.username}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <p className="text-sm text-force-dark">{notification.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="ml-4 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Session information section */}
      {sessionData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Window Session Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded p-4">
                <p className="text-gray-500">Session ID</p>
                <p className="font-mono mt-1">{sessionData.sessionId}</p>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-gray-500">Created</p>
                <p className="mt-1">{new Date(sessionData.createdAt).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-gray-500">Visit Count</p>
                <p className="mt-1">{sessionData.visitCount}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Each browser window has its own isolated session. Try opening a new window with Cmd+N to see a new session created.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Submit Text Form */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Text</h2>
            <TextSubmissionForm />
          </div>

          {/* Recent Submissions */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h2>
            
            {submissionError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{submissionError}</span>
              </div>
            )}
            
            {isLoadingSubmissions ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : submissions.length === 0 ? (
              <p className="text-center py-4 text-force-dark">No submissions yet</p>
            ) : (
              <div className="overflow-y-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-force-dark uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-force-dark uppercase tracking-wider">
                        Text
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-force-dark uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-force-dark">
                            {submission.userId && typeof submission.userId === 'object' 
                              ? submission.userId.email 
                              : 'Unknown User'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-force-dark max-w-xs truncate">{submission.text}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs text-force-dark">
                            {new Date(submission.createdAt).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 text-right">
              <Link 
                href="/dashboard/text-submission" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View All Submissions
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
