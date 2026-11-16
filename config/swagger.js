// config/swagger.js
const path = require('path');
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0', language: 'es' });

const doc = {
    info: {
        title: 'API Refugio Los Pikilines',
        version: '1.0.0',
        description:
            'API REST de consulta (solo lectura) autogenerada con **swagger-autogen** a partir de las rutas de Express (`routes/`).\n\n' +
            'Construida con **Node.js + Express + SQLite Nativo (`node:sqlite`)** sobre el esquema relacional en **3FN**.'
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 3000}`,
            description: 'Servidor Local'
        }
    ]
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
