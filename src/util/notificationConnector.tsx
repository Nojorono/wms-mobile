import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import socket from './socket';
import NotificationToast from '../components/NotificationToast';

export default function NotificationConnector() {
  const user = useAuthStore((state) => state.user);
  const userRoles = user?.role.name || [];
  const [notification, setNotification] = useState<any | null>(null);
  const [visible, setVisible] = useState(false);

  // untuk mencegah efek double-mount di React 18 (development mode)
  // const mounted = useRef(false);

  useEffect(() => {
    console.log('user changed:', user);
    // if (mounted.current) return; // biar gak jalan 2x
    // mounted.current = true;

    if (!user) {
      console.log('⚠️ No user logged in — skipping socket setup');
      return;
    }

    console.log('🌐 Setting up WebSocket connection...');
    if (!socket.connected) socket.connect();

    const onConnect = () => {
      console.log('✅ Socket connected:', socket.id);
      if (user) {
        socket.emit('join_roles', { roles: userRoles });
        socket.emit('join_room', { room: `user_${user.id}` });
        socket.emit('subscribe', { types: ['INBOUND_INSPECTION_READY'] });
      }
    };

    const onNotification = (data: any) => {
      console.log('📩 Notification received:', data);
      setNotification(data);
      setVisible(true);
    };

    const onDisconnect = (reason: string) =>
      console.log('⚠️ Socket disconnected:', reason);

    const onError = (err: any) =>
      console.log('❌ Socket connect error:', err.message);

    socket.on('connect', onConnect);
    socket.on('notification', onNotification);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);

    console.log('🧩 Initial socket connected?', socket.connected);

    return () => {
      console.log('🧹 Cleaning up socket listeners...');
      socket.off('connect', onConnect);
      socket.off('notification', onNotification);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onError);
      socket.disconnect();
    };
  }, [user?.id]);

  return (
    <NotificationToast
      visible={visible}
      title={notification?.title || ''}
      message={notification?.message || ''}
      priority={notification?.priority}
      onHide={() => setVisible(false)}
    />
  );
}
