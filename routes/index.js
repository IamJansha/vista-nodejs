// routes/index.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

const router = express.Router();
const animalesRoutes = require('./services/animales');
const donacionesRoutes = require('./services/donaciones');
const resumenRoutes = require('./services/resumen');
const refugioRoutes = require('./services/refugio');

const swaggerOutputPath = path.resolve(__dirname, '..', 'config', 'swagger-output.json');

// --- Swagger UI Documentation ---
router.use('/api-docs', swaggerUi.serve, (req, res, next) => {
    // #swagger.ignore = true
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerOutputPath, 'utf-8'));
    return swaggerUi.setup(swaggerDocument, {
        customSiteTitle: 'API Refugio Los Pikilines - Swagger UI',
        swaggerOptions: {
            docExpansion: 'list',
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1
        }
    })(req, res, next);
});

router.get('/api-docs.json', (req, res) => {
    // #swagger.ignore = true
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerOutputPath, 'utf-8'));
    res.json(swaggerDocument);
});

// --- API Routes ---
router.use('/api/animales', animalesRoutes);
router.use('/api/donaciones', donacionesRoutes);
router.use('/api/resumen', resumenRoutes);
router.use('/api/refugio', refugioRoutes);

// --- Índice de documentación rápida de la API ---
router.get('/api', (req, res) => {
    // #swagger.ignore = true
    res.json({
        name: 'API Refugio Los Pikilines (3FN + Native SQL)',
        version: '1.0.0',
        swagger: 'http://localhost:3000/api-docs',
        endpoints: {
            animales: {
                list: 'GET /api/animales?especie=&sexo=&etapa=&tamano=&sector=&estado=&esterilizado=&search=',
                details: 'GET /api/animales/:id'
            },
            donaciones: {
                list: 'GET /api/donaciones?tipo=&donante=&desde=&hasta=&search=',
                details: 'GET /api/donaciones/:id'
            },
            resumen: {
                dashboardCompleto: 'GET /api/resumen',
                kpis: 'GET /api/resumen/kpis',
                especies: 'GET /api/resumen/especies',
                etapas: 'GET /api/resumen/etapas',
                estados: 'GET /api/resumen/estados',
                sectores: 'GET /api/resumen/sectores',
                veterinario: 'GET /api/resumen/veterinario',
                insumos: 'GET /api/resumen/insumos'
            },
            refugio: {
                infoCompleta: 'GET /api/refugio',
                catalogos: 'GET /api/refugio/catalogos'
            }
        }
    });
});

// --- Static Files (listo para cuando tu compañera agregue public/static) ---
const staticDir = path.resolve(__dirname, '..', 'public', 'static');
if (fs.existsSync(staticDir)) {
    router.use('/static', express.static(staticDir));
}

router.get('*', (req, res) => {
    // #swagger.ignore = true
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint de API no encontrado' });
    }
    const indexHtml = path.resolve(__dirname, '..', 'public', 'static', 'homepage', 'html', 'index.html');
    if (fs.existsSync(indexHtml)) {
        return res.sendFile(indexHtml);
    }
    res.redirect('/api-docs');
});

module.exports = router;
