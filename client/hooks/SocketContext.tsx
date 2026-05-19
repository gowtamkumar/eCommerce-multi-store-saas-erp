'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Only connect if the user is authenticated and has an accessToken
    const accessToken = (session as any)?.user?.accessToken;
    if (!accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3900';

    // Connect to WebSocket notification namespace
    const socketInstance = io(`${wsUrl}/notifications`, {
      auth: {
        token: `Bearer ${accessToken}`,
      },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    socketInstance.on('connect', () => {
      console.log('Real-time WebSockets connected successfully');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

// Hook to access the raw socket instance
export function useSocket() {
  return useContext(SocketContext);
}

// Hook to register and cleanup listeners on socket events
export function useSocketEvent<T = any>(event: string, callback: (data: T) => void) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, callback]);
}
