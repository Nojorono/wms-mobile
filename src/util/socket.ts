import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://10.0.63.198:3000/notifications'; 
// or wss://your-domain.com/notifications in production

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  withCredentials: true,
  autoConnect: true,           // penting
  reconnection: true,          // aktifkan reconnect
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 5000,
});

export default socket;