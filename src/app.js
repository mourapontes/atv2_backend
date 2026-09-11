require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const openapiSpec = require('./config/swagger');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    // Permite que o formulário estático em /public use fetch() contra a própria API.
    contentSecurityPolicy: false,
  })
);
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve os arquivos estáticos de public/ (ex.: formulário de cadastro em /cadastro.html).
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

app.use(errorHandler);

module.exports = app;
