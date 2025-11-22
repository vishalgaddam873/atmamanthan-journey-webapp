import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

let socket = null;

export const connectSocket = (screenType) => {
  if (socket && socket.connected) {
    return socket;
  }
  
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
  });
  
  socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('join', { screenType });
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

