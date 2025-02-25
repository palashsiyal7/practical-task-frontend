import { io } from 'socket.io-client';

let socket;

const initSocket = () => {
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
};

const getSocket = () => {
  if (!socket) {
    initSocket();
  }
  return socket;
};

export { initSocket, getSocket };
