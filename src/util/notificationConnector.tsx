import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import socket from './socket';
import NotificationToast from '../components/NotificationToast';
import { NotificationTypes, subscribeToNotifications } from '../constants/SubsribeType';
import { ROLES } from '../constants/Roles';

export default function NotificationConnector() {
  const user = useAuthStore((state) => state.user);
  const userRoles = user?.role.name || [];
  const [notification, setNotification] = useState<any | null>(null);
  const [visible, setVisible] = useState(false);

  // untuk mencegah efek double-mount di React 18 (development mode)
  const mounted = useRef(false);

  useEffect(() => {
    if (!user) {
      socket.disconnect();
      return;
    }

    console.log('🌐 Setting up WebSocket connection...');
    socket.connect();

    const onConnect = () => {
      console.log('✅ Socket connected:', socket.id);
      socket.emit('join_roles', { roles: user.role || [] });
      socket.emit('join_room', { room: `user_${user.id}` });
      // Subscribe berdasarkan role
      if (user.role.name === ROLES.HELPER) {
        subscribeToNotifications(socket, [NotificationTypes.PUT_AWAY_ASSIGNED]);
      } else if (user.role.name === ROLES.WH_STAFF) {
        subscribeToNotifications(socket, [NotificationTypes.INBOUND_INSPECTION_READY]);
      }

    };

    const onNotification = (data: any) => {
      console.log('📩 Notification received:', data);
      setNotification(data);
      setVisible(true);
    };

    socket.on('connect', onConnect);
    socket.on('notification', onNotification);

    return () => {
      console.log('🧹 Cleaning up socket listeners...');
      socket.off('connect', onConnect);
      socket.off('notification', onNotification);
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
