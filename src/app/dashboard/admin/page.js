'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import UserManagement from '@/components/Dashboard/UserManagement';

export default function AdminPage() {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const router = useRouter();

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
        <UserManagement />
        
        {/* Additional admin components can be added here */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">System Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-indigo-600 font-medium">Total Users</h3>
              <p className="text-2xl font-bold">--</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-green-600 font-medium">Text Submissions</h3>
              <p className="text-2xl font-bold">--</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-purple-600 font-medium">Active Sessions</h3>
              <p className="text-2xl font-bold">--</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}