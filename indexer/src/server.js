const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const db = require('./db');

const app = express();
app.use(express.json());

const STATS_CACHE_TTL_MS = 60 * 1000;
let statsCache = null;
let statsCacheExpiresAt = 0;

/**
 * @openapi
 * /api/stats:
 *   get:
 *     summary: Get indexer statistics
 *     description: Returns aggregated indexer statistics. Responses are cached for 60 seconds.
 *     tags:
 *       - Stats
 *     responses:
 *       200:
 *         description: Indexer statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       500:
 *         description: Failed to load stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to load stats
 */
app.get('/api/stats', async (req, res) => {
  try {
    const now = Date.now();
    if (statsCache && now < statsCacheExpiresAt) {
      return res.json(statsCache);
    }

    const stats = await db.getStats();
    statsCache = stats;
    statsCacheExpiresAt = now + STATS_CACHE_TTL_MS;
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load stats' });
  }
});

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prediction Market Indexer API',
      version: '1.0.0',
      description: 'Machine-readable API documentation for the prediction market indexer.',
    },
    servers: [{ url: '/' }],
  },
  apis: [
    './src/**/*.js',
    './src/**/*.yaml',
    './src/**/*.yml',
  ],
});

const docsEnabled = ['development', 'staging'].includes(process.env.NODE_ENV);

if (docsEnabled) {
  app.get('/docs/openapi.json', (req, res) => {
    res.json(swaggerSpec);
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = app;