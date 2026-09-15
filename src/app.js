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
const seedRoutes = require('./routes/seed.routes');
const adminAuditRoutes = require('./routes/adminAudit.routes');

const {
  securityHeaders,
  rateLimit,
} = require('./middleware/security');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

/*
 * Render est placé derrière un proxy HTTPS.
 * Cela permet notamment à req.ip et req.secure de fonctionner correctement.
 */
app.set('trust proxy', 1);

// ===== Middlewares globaux =====

app.disable('x-powered-by');

app.use(securityHeaders);

/*
 * CORS :
 * - en production, CORS_ORIGIN doit être configuré ;
 * - en développement, une absence de CORS_ORIGIN reste tolérée.
 */
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const isProduction = process.env.NODE_ENV === 'production';

app.use(
  cors({
    origin: (origin, callback) => {
      // Les requêtes sans Origin (curl, serveur à serveur, healthcheck...)
      // restent autorisées.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      /*
       * En développement uniquement, on autorise les origines si
       * CORS_ORIGIN n'est pas configuré.
       */
      if (!isProduction && allowedOrigins.length === 0) {
        return callback(null, true);
      }

      return callback(new Error('Non autorisé par la politique CORS.'));
    },
    credentials: true,
  })
);

/*
 * Limite JSON conservée à 2 Mo afin de ne pas casser les payloads
 * existants du frontend.
 */
app.use(express.json({ limit: '2mb' }));

/*
 * Limite explicite pour les formulaires URL-encoded.
 */
app.use(
  express.urlencoded({
    extended: true,
    limit: '100kb',
  })
);

// ===== Rate limiting global léger =====

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.',
  })
);

// ===== Healthcheck =====

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API BF IMMO SARL — opérationnelle.',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
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
app.use('/api/seed-init', seedRoutes);
app.use('/api/admin-audit', adminAuditRoutes);

// ===== Gestion des erreurs =====

app.use(notFound);
app.use(errorHandler);

module.exports = app;
