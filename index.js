require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const logs = require('./structs/logs');
const { generateSwagger } = require('./config/swagger');

const app = express();
const port = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rutas Principales ---
app.use(require(path.join(__dirname, 'routes')));

// --- Manejo Centralizado de Errores ---
app.use((err, req, res, next) => {
    logs.error(`Error no manejado detectado: ${err.stack}`);
    res.status(500).json({ error: 'Algo salió mal en el servidor!' });
});

if (require.main === module) {
    generateSwagger()
        .then(() => {
            app.listen(port, () => {
                logs.info(`Servidor API Refugio Los Pikilines corriendo en http://localhost:${port}`);
                logs.info(`Documentación autogenerada Swagger UI: http://localhost:${port}/api-docs`);
            });
        })
        .catch(err => {
            logs.error(`Error autogenerando Swagger: ${err.message}`);
            process.exit(1);
        });
}

module.exports = app;
