// config/swagger.js
const path = require('path');
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0', language: 'es' });
const { schemas } = require('../models');

const doc = {
    info: {
        title: 'API Refugio Los Pikilines',
        version: '1.0.0',
        description:
            'API REST de consulta (solo lectura) autogenerada con **swagger-autogen** a partir de las rutas de Express (`routes/`) y los modelos de datos (`models/`).\n\n' +
            'Construida con **Node.js + Express + SQLite Nativo (`node:sqlite`)** sobre el esquema relacional en **3FN**.'
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 3000}`,
            description: 'Servidor Local'
        }
    ],
    tags: [
        {
            name: 'Animales',
            description: 'Consulta del padrón de animales rescatados, filtros multicriterio y ficha médica individual (3FN).'
        },
        {
            name: 'Donaciones',
            description: 'Registro histórico de insumos recibidos, tipos de insumo y grupos donantes.'
        },
        {
            name: 'Resumen y Estadísticas',
            description: 'Agregaciones SQL nativas, KPIs poblacionales, ocupación por sector/especie, control veterinario e insumos.'
        },
        {
            name: 'Refugio y Catálogos',
            description: 'Información institucional del Refugio Los Pikilines, capacidad/consumo y catálogos normalizados (3FN).'
        }
    ],
    components: {
        '@schemas': schemas
    }
};

const outputFile = path.resolve(__dirname, 'swagger-output.json');
const endpointsFiles = [path.resolve(__dirname, '..', 'routes', 'index.js')];

async function generateSwagger() {
    await swaggerAutogen(outputFile, endpointsFiles, doc);
    return require(outputFile);
}

if (require.main === module) {
    generateSwagger();
}

module.exports = {
    generateSwagger,
    outputFile
};
