import client from 'prom-client';

const register = new client.Registry();

// Enable collection of default process metrics (CPU, Memory, GC)
client.collectDefaultMetrics({ register });

export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2.5, 5, 10], // Standard latency buckets
  registers: [register],
});

export const activeSocketConnections = new client.Gauge({
  name: 'active_socket_connections',
  help: 'Number of active Socket.io connections',
  registers: [register],
});

export const activeOnlineUsers = new client.Gauge({
  name: 'active_online_users',
  help: 'Number of unique users currently online',
  registers: [register],
});

export const databaseConnectionState = new client.Gauge({
  name: 'mongodb_connection_state',
  help: 'MongoDB state: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting',
  registers: [register],
});

export const authAttempts = new client.Counter({
  name: 'auth_attempts_total',
  help: 'Authentication and registration attempts',
  labelNames: ['action', 'outcome'],
  registers: [register],
});

export const messagesProcessed = new client.Counter({
  name: 'messages_processed_total',
  help: 'Chat messages processed',
  labelNames: ['content_type', 'outcome'],
  registers: [register],
});

export const imageUploads = new client.Counter({
  name: 'image_uploads_total',
  help: 'Cloudinary image uploads',
  labelNames: ['context', 'outcome'],
  registers: [register],
});

export const imageUploadDuration = new client.Histogram({
  name: 'image_upload_duration_seconds',
  help: 'Time spent uploading images to Cloudinary',
  labelNames: ['context', 'outcome'],
  buckets: [0.1, 0.3, 0.5, 1, 2.5, 5, 10, 30],
  registers: [register],
});

export { register };
