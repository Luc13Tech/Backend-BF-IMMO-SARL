const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const servicesRoutes = require('./routes/services.routes');
const propertiesRoutes = require('./routes/properties.routes');
const leadsRoutes = require('./routes/leads.routes');
const contentRoutes = require('./routes/content.routes');
const uploadRoutes = require('./routes/upload.routes');
const aiAssistantRoutes = require('./routes/aiAssistant.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ===== Middlewares globaux =====
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Autorise les outils sans origine (Postman, curl) et les origines listées
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Non autorisé par la politique CORS.'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== Healthcheck =====
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API BF IMMO SARL — opérationnelle.' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// ===== Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);

// ===== Gestion des erreurs =====
app.use(notFound);
app.use(errorHandler);

module.exports = app;
