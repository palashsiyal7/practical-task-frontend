import React from 'react';
import useAuth from '../../hooks/useAuth';
import TextSubmissionForm from './TextSubmissionForm';
import TextSubmissionList from './TextSubmissionList';
import UserManagement from './UserManagement';

const Dashboard = () => {
  const { userRole } = useAuth();

  return (
    <div>
      <h2>Dashboard</h2>
      {userRole === 'developer' && (
        <>
          <TextSubmissionForm />
          <TextSubmissionList />
        </>
      )}
      {userRole === 'admin' && <UserManagement />}
    </div>
  );
};

export default Dashboard;
