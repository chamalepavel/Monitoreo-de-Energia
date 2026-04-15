require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const rutasNodos = require('./routes/nodos');
const rutasMetricas = require('./routes/metricas');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/nodos',    rutasNodos);
app.use('/api/metricas', rutasMetricas);

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  if (err.status === 401 || err.name === 'UnauthorizedError') {
    return res.status(401).json({ ok: false, mensaje: 'No autorizado: token invalido o ausente' });
  }
  console.error('Error no manejado:', err.message);
  res.status(err.status || 500).json({ ok: false, mensaje: err.message || 'Error interno del servidor' });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('No autorizado: falta el token'));
    }

    const { createRemoteJWKSet, jwtVerify } = require('jose');

    const JWKS = createRemoteJWKSet(
      new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
    );

    const tokenLimpio = token.replace('Bearer ', '');

    await jwtVerify(tokenLimpio, JWKS, {
      audience: process.env.AUTH0_AUDIENCE,
      issuer:   `https://${process.env.AUTH0_DOMAIN}/`,
    });

    next();
  } catch (error) {
    console.warn('Conexion socket rechazada:', error.message);
    next(new Error('No autorizado: token invalido'));
  }
});

io.on('connection', (socket) => {
  console.log(`Cliente conectado al socket: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`Cliente desconectado: ${socket.id} — ${reason}`);
  });
});

app.set('socketio', io);

const PUERTO = process.env.PORT || 4000;

httpServer.listen(PUERTO, () => {
  console.log('');
  console.log('Sistema de Monitoreo Solar IoT');
  console.log(`Servidor en http://localhost:${PUERTO}`);
  console.log(`API en http://localhost:${PUERTO}/api`);
  console.log('');
});
