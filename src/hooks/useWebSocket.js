import { useEffect, useState, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../services/socketService';

export const useWebSocket = (screenType) => {
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = connectSocket(screenType);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('session:started', (data) => {
      setSession(data);
    });

    socket.on('session:stopped', () => {
      setSession(null);
    });

    socket.on('session:status', (data) => {
      setSession(data);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Request current session status
    socket.emit('session:status');

    return () => {
      disconnectSocket();
    };
  }, [screenType]);

  return {
    socket: socketRef.current,
    isConnected,
    session,
    setSession,
  };
};

