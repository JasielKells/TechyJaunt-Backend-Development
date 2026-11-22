const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./config/logger');
const requestId = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
app.use(helmet());
app.use(cors());
app.use(requestId);
app.use(pinoHttp({ logger, genReqId: (req) => req.id }));

// WEBHOOK FIRST — raw body for HMAC verification
app.use('/api/v1/webhooks/paystack',
  express.raw({ type: 'application/json' }),
  require('./routes/webhook.routes'));

// All other routes use JSON
app.use(express.json({ limit: '1mb' }));
app.use('/api/v1', routes);

const spec = YAML.load(path.join(__dirname, 'docs/openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

app.use(errorHandler);
module.exports = app;