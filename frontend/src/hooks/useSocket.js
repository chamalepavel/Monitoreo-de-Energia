import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

const useSocket = (token) => {
  const [conectado, setConectado]       = useState(false);
  const [nuevaMetrica, setNuevaMetrica] = useState(null);
  const [alertaCritica, setAlertaCritica] = useState(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setConectado(true);
    });

    socket.on('disconnect', () => {
      setConectado(false);
    });

    socket.on('connect_error', () => {
      setConectado(false);
    });

    socket.on('nueva-metrica', (metrica) => {
      setNuevaMetrica(metrica);
    });

    socket.on('alerta-critica', (alerta) => {
      setAlertaCritica(alerta);
      setTimeout(() => setAlertaCritica(null), 8000);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return { conectado, nuevaMetrica, alertaCritica };
};

export default useSocket;
