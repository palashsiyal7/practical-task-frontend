'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import UserManagement from '@/components/Dashboard/UserManagement';
import { getStatistics } from '@/lib/api';

export default function AdminPage() {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: '--',
    textSubmissions: '--',
    activeSessions: '--'
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!loading && isAuthenticated && user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [loading, isAuthenticated, user, router]);

  // Fetch statistics when the admin page loads
  useEffect(() => {
    const fetchStatistics = async () => {
      if (!isAuthenticated || user?.role !== 'admin') return;
      
      try {
        setStatsLoading(true);
        const data = await getStatistics();
        setStats(data);
        setStatsError(null);
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
        setStatsError('Failed to load statistics');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStatistics();
  }, [isAuthenticated, user]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* System Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">System Statistics</h2>
          
          {statsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{statsError}</span>
            </div>
          )}
          
          {statsLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-indigo-600 font-medium">Total Users</h3>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-green-600 font-medium">Text Submissions</h3>
                <p className="text-2xl font-bold">{stats.textSubmissions}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-purple-600 font-medium">Active Sessions</h3>
                <p className="text-2xl font-bold">{stats.activeSessions}</p>
              </div>
            </div>
          )}
        </div>

        <UserManagement />
      </div>
    </div>
  );
}