'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import TextSubmissionForm from '@/components/Dashboard/TextSubmissionForm';
import { getAllSubmissions } from '@/lib/api';
import useSocket from '@/hooks/useSocket';

export default function TextSubmissionPage() {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { socket } = useSocket();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Redirect non-admin/developer users to dashboard
    if (!loading && isAuthenticated && user && 
        user.role !== 'admin' && user.role !== 'developer') {
      router.push('/dashboard');
      return;
    }

    const fetchSubmissions = async () => {
      try {
        const data = await getAllSubmissions();
        setSubmissions(data);
      } catch (err) {
        setError('Failed to load submissions');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user && (user.role === 'admin' || user.role === 'developer')) {
      fetchSubmissions();
    }
  }, [loading, isAuthenticated, user, router]);

  // Listen for real-time submission updates
  useEffect(() => {
    if (!socket) return;

    const handleNewSubmission = (data) => {
      // Create a temporary submission object until page refresh
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
  }, [socket]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Additional check to ensure only admins or developers can access this page
  if (user.role !== 'admin' && user.role !== 'developer') {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">You don't have permission to access this page.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6 text-force-dark">Text Submissions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <TextSubmissionForm />
        </div>
        
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-force-dark">All Submissions</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-center py-4 text-force-dark">No submissions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-force-dark uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-force-dark uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-force-dark uppercase tracking-wider">
                      Text
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-force-dark">
                          {new Date(submission.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-force-dark">
                          {submission.userId && typeof submission.userId === 'object' 
                            ? submission.userId.email 
                            : (submission.userId || 'Unknown User')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-force-dark">
                          {submission.text}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 