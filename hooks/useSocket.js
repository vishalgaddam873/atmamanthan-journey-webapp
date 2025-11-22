import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSocket, setConnected, setSession } from '../store/slices/sessionSlice';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

export const useSocket = (room = 'LIVE') => {
  const dispatch = useAppDispatch();
  const socket = useAppSelector((state) => state.session.socket);
  const connected = useAppSelector((state) => state.session.connected);
  const session = useAppSelector((state) => state.session.session);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection if not already connected
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
      });

      const socketInstance = socketRef.current;
      dispatch(setSocket(socketInstance));

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        dispatch(setConnected(true));
        socketInstance.emit('get_session');
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        dispatch(setConnected(false));
      });

      socketInstance.on('session_state', (sessionData) => {
        dispatch(setSession(sessionData));
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
      // socketRef.current?.disconnect();
    };
  }, [dispatch]);

  return { socket, connected, session };
};

