import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

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
    if (!socket) return;

    // Listen for new submissions
    socket.on('newSubmission', (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    // Cleanup
    return () => {
      socket.off('newSubmission');
    };
  }, [socket]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return { socket, notifications, clearNotifications };
};

export default useSocket;