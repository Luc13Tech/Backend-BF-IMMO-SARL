const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const servicesRoutes = require('./routes/services.routes');
const propertiesRoutes = require('./routes/properties.routes');
const leadsRoutes = require('./routes/leads.routes');
const contentRoutes = require('./routes/content.routes');
const uploadRoutes = require('./routes/upload.routes');
const aiFaqRoutes = require('./routes/aiFaq.routes');
const seedRoutes = require('./routes/seed.routes');
const adminAuditRoutes = require('./routes/adminAudit.routes');
const sitemapRoutes = require('./routes/sitemap.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
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

// sitemap.xml et robots.txt vivent à la racine du domaine (convention SEO
// standard attendue par Google), pas sous /api
app.use('/', sitemapRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API BF IMMO SARL — opérationnelle.' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai-assistant', aiFaqRoutes);
app.use('/api/seed-init', seedRoutes);
app.use('/api/admin-audit', adminAuditRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
