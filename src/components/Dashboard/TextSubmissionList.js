import React from 'react';

const TextSubmissionList = ({ submissions, loading, error }) => {
  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center p-4 text-force-dark">
        No submissions found
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4 text-force-dark">Recent Submissions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-force-dark uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-force-dark uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-force-dark uppercase tracking-wider">Text</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-data">
                    {new Date(submission.createdAt).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-data">
                    {submission.userId && typeof submission.userId === 'object' 
                      ? submission.userId.email 
                      : 'Unknown User'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-data">{submission.text}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TextSubmissionList;
