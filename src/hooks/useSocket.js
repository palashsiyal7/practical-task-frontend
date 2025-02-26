import { useEffect, useState, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '@/context/AuthContext';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Initialize socket connection
    const socketInit = io(process.env.NEXT_PUBLIC_API_URL);
    setSocket(socketInit);

    // Cleanup on component unmount
    return () => {
      if (socketInit) socketInit.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for new submissions
    socket.on('newSubmission', (data) => {
      // Format notification properly with user info and message
      const notification = {
        message: data.submittedText,
        timestamp: data.submissionTime || new Date().toISOString(),
        username: data.username || 'Unknown User',
        userId: data.userId,
        // Add additional fields for admins
        type: 'submission',
        email: data.email || 'No email provided',
        role: data.role || 'user'
      };

      setNotifications((prev) => [notification, ...prev]);
    });

    // Cleanup
    return () => {
      socket.off('newSubmission');
    };
  }, [socket, user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return { socket, notifications, clearNotifications };
};

export default useSocket;