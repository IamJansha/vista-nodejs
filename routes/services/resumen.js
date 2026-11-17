// routes/services/resumen.js
const express = require('express');
const router = express.Router();
const db = require('../../db');
const logs = require('../../structs/logs');

// --- Native SQL Queries para agregaciones y reportes pesados ---
const QUERIES = {
    kpis: `
        SELECT
            (SELECT COUNT(*) FROM animales) AS total_animales,
            (SELECT COUNT(*)
             FROM animales a
             INNER JOIN especies e ON a.id_especie = e.id_especie
             WHERE e.nombre = 'Perro') AS total_perros,
            (SELECT COUNT(*)
             FROM animales a
             INNER JOIN especies e ON a.id_especie = e.id_especie
             WHERE e.nombre = 'Gato') AS total_gatos,
            (SELECT COUNT(*)
             FROM animales a
             INNER JOIN estados_animal es ON a.id_estado = es.id_estado
             WHERE es.nombre = 'Disponible') AS disponibles_adopcion,
            (SELECT COUNT(*)
             FROM ficha_medica
             WHERE esterilizado = 'Sí') AS esterilizados_al_dia,
            (SELECT COUNT(*) FROM donaciones) AS donaciones_registradas
    `,

    porEspecieSexo: `
        SELECT
            e.id_especie,
            e.nombre AS especie,
            SUM(CASE WHEN a.sexo = 'Macho' THEN 1 ELSE 0 END) AS macho,
            SUM(CASE WHEN a.sexo = 'Hembra' THEN 1 ELSE 0 END) AS hembra,
            COUNT(a.id_animal) AS total_censado,
            e.poblacion_total_refugio,
            e.capacidad_maxima,
            ROUND(e.poblacion_total_refugio * 100.0 / e.capacidad_maxima, 1) AS porcentaje_ocupacion_refugio,
            e.consumo_semanal_kg,
            e.consumo_mensual_kg,
            e.promedio_diario_kg
        FROM especies e
        LEFT JOIN animales a ON e.id_especie = a.id_especie
        GROUP BY e.id_especie, e.nombre, e.poblacion_total_refugio, e.capacidad_maxima,
                 e.consumo_semanal_kg, e.consumo_mensual_kg, e.promedio_diario_kg
        ORDER BY e.id_especie ASC
    `,

    porEtapa: `
        SELECT
            et.id_etapa,
            et.nombre AS etapa,
            COUNT(a.id_animal) AS cantidad,
            ROUND(COUNT(a.id_animal) * 100.0 / NULLIF((SELECT COUNT(*) FROM animales), 0), 1) AS porcentaje_total
        FROM etapas_edad et
        LEFT JOIN animales a ON et.id_etapa = a.id_etapa
        GROUP BY et.id_etapa, et.nombre, et.orden
        ORDER BY et.orden ASC
    `,

    porEstado: `
        SELECT
            es.id_estado,
            es.nombre AS estado,
            COUNT(a.id_animal) AS cantidad,
            ROUND(COUNT(a.id_animal) * 100.0 / NULLIF((SELECT COUNT(*) FROM animales), 0), 1) AS porcentaje_total
        FROM estados_animal es
        LEFT JOIN animales a ON es.id_estado = a.id_estado
        GROUP BY es.id_estado, es.nombre
        ORDER BY es.id_estado ASC
    `,

    porSector: `
        SELECT
            s.id_sector,
            s.nombre AS sector,
            s.descripcion,
            COUNT(a.id_animal) AS cantidad,
            ROUND(COUNT(a.id_animal) * 100.0 / NULLIF((SELECT COUNT(*) FROM animales), 0), 1) AS porcentaje_total
        FROM sectores s
        LEFT JOIN animales a ON s.id_sector = a.id_sector
        GROUP BY s.id_sector, s.nombre, s.descripcion
        ORDER BY cantidad DESC, s.id_sector ASC
    `,

    controlVeterinario: `
        SELECT
            'Esterilizado' AS control_veterinario,
            SUM(CASE WHEN esterilizado = 'Sí' THEN 1 ELSE 0 END) AS al_dia_si,
            SUM(CASE WHEN esterilizado != 'Sí' OR esterilizado IS NULL THEN 1 ELSE 0 END) AS pendiente_parcial_no,
            ROUND(SUM(CASE WHEN esterilizado = 'Sí' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS porcentaje_al_dia
        FROM ficha_medica
        UNION ALL
        SELECT
            'Vacunación' AS control_veterinario,
            SUM(CASE WHEN vacunas_al_dia = 'Sí' THEN 1 ELSE 0 END) AS al_dia_si,
            SUM(CASE WHEN vacunas_al_dia != 'Sí' OR vacunas_al_dia IS NULL THEN 1 ELSE 0 END) AS pendiente_parcial_no,
            ROUND(SUM(CASE WHEN vacunas_al_dia = 'Sí' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS porcentaje_al_dia
        FROM ficha_medica
        UNION ALL
        SELECT
            'Desparasitación' AS control_veterinario,
            SUM(CASE WHEN desparasitado = 'Sí' THEN 1 ELSE 0 END) AS al_dia_si,
            SUM(CASE WHEN desparasitado != 'Sí' OR desparasitado IS NULL THEN 1 ELSE 0 END) AS pendiente_parcial_no,
            ROUND(SUM(CASE WHEN desparasitado = 'Sí' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS porcentaje_al_dia
        FROM ficha_medica
    `,

    insumosRecibidos: `
        SELECT
            ti.id_tipo_insumo,
            ti.nombre AS tipo_insumo,
            COUNT(d.id_donacion) AS registros,
            COALESCE(SUM(d.cantidad), 0) AS total_cantidad,
            ti.unidad_predeterminada AS unidad
        FROM tipos_insumo ti
        LEFT JOIN donaciones d ON ti.id_tipo_insumo = d.id_tipo_insumo
        GROUP BY ti.id_tipo_insumo, ti.nombre, ti.unidad_predeterminada
        ORDER BY ti.id_tipo_insumo ASC
    `
};

// --- RUTA GET /api/resumen ---
// Devuelve todas las métricas de Resumen_Consultas en un solo llamado usando Native Queries
router.get('/', async (req, res) => {
    /*
        #swagger.tags = ['Resumen y Estadísticas']
        #swagger.summary = 'Obtener el dashboard estadístico completo (Resumen_Consultas)'
        #swagger.description = 'Ejecuta todas las consultas de agregación en paralelo y retorna en un solo objeto los KPIs generales, desglose por especie/sexo, etapas de edad, estados de adopción, sectores, control veterinario e insumos recibidos.'
        #swagger.responses[200] = {
            description: 'Dashboard estadístico consolidado.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ResumenDashboard' }
                }
            }
        }
        #swagger.responses[500] = {
            description: 'Error interno del servidor al obtener el resumen.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorServidor' }
                }
            }
        }
    */
    try {
        const [
            kpis,
            porEspecieSexo,
            porEtapa,
            porEstado,
            porSector,
            controlVeterinario,
            insumosRecibidos
        ] = await Promise.all([
            db.queryOne(QUERIES.kpis),
            db.query(QUERIES.porEspecieSexo),
            db.query(QUERIES.porEtapa),
            db.query(QUERIES.porEstado),
            db.query(QUERIES.porSector),
            db.query(QUERIES.controlVeterinario),
            db.query(QUERIES.insumosRecibidos)
        ]);

        res.json({
            kpis,
            porEspecieSexo: porEspecieSexo.rows,
            porEtapa: porEtapa.rows,
            porEstado: porEstado.rows,
            porSector: porSector.rows,
            controlVeterinario: controlVeterinario.rows,
            insumosRecibidos: insumosRecibidos.rows
        });
    } catch (err) {
        logs.error(`Error al obtener el resumen general: ${err.stack}`);
        res.status(500).json({ error: 'Error interno del servidor al obtener el resumen.' });
    }
});

// --- Endpoints individuales por cada bloque de resumen ---
router.get('/kpis', async (req, res) => {
    /*
        #swagger.tags = ['Resumen y Estadísticas']
        #swagger.summary = 'Obtener indicadores clave (KPIs) generales'
        #swagger.description = 'Devuelve los totales principales del refugio: total de animales censados, perros, gatos, disponibles para adopción, esterilizados al día y donaciones registradas.'
        #swagger.responses[200] = {
            description: 'KPIs generales del refugio.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ResumenKPIs' }
                }
            }
        }
        #swagger.responses[500] = {
            description: 'Error interno al obtener KPIs.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorServidor' }
                }
            }
        }
    */
    try {
        const kpis = await db.queryOne(QUERIES.kpis);
        res.json(kpis);
    } catch (err) {
        logs.error(`Error en /api/resumen/kpis: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener KPIs.' });
    }
});

router.get('/especies', async (req, res) => {
    /*
        #swagger.tags = ['Resumen y Estadísticas']
        #swagger.summary = 'Obtener resumen poblacional y de consumo por especie y sexo'
        #swagger.description = 'Devuelve la distribución de machos y hembras censados, población total real en el refugio, capacidad máxima, porcentaje de ocupación y consumo de alimento en kg por especie.'
        #swagger.responses[200] = {
            description: 'Resumen por especie y sexo.',
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ResumenEspecieSexo' }
                    }
                }
            }
        }
        #swagger.responses[500] = {
            description: 'Error interno al obtener resumen por especie.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorServidor' }
                }
            }
        }
    */
    try {
        const result = await db.query(QUERIES.porEspecieSexo);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error en /api/resumen/especies: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener resumen por especie.' });
    }
});

router.get('/etapas', async (req, res) => {
    /*
        #swagger.tags = ['Resumen y Estadísticas']
        #swagger.summary = 'Obtener distribución de animales por etapa de edad'
        #swagger.description = 'Agrupa la población censada según su etapa de vida (Cachorro, Joven, Adulto, Senior) incluyendo el porcentaje sobre el total.'
        #swagger.responses[200] = {
            description: 'Resumen por etapas de edad.',
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ResumenEtapa' }
                    }
                }
            }
        }
        #swagger.responses[500] = {
            description: 'Error interno al obtener resumen por etapas.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorServidor' }
                }
            }
        }
    */
    try {
        const result = await db.query(QUERIES.porEtapa);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error en /api/resumen/etapas: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener resumen por etapas.' });
    }
});

router.get('/estados', async (req, res) => {
    /*
        #swagger.tags = ['Resumen y Estadísticas']
        #swagger.summary = 'Obtener distribución de animales por estado actual'
        #swagger.description = 'Agrupa los animales según su estado de adopción o situación clínica (Disponible, En tratamiento, Hogar temporal, Adoptado).'
        #swagger.responses[200] = {
            description: 'Resumen por estados de adopción/internación.',
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ResumenEstado' }
                    }
                }
            }
        }
        #swagger.responses[500] = {
            description: 'Error interno al obtener resumen por estados.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorServidor' }
                }
            }
        }
    */
    try {
        const result = await db.query(QUERIES.porEstado);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error en /api/resumen/estados: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener resumen por estados.' });
    }
});

router.get('/sectores', async (req, res) => {
    /*
        #swagger.tags = ['Resumen y Estadísticas']
        #swagger.summary = 'Obtener distribución de animales por sector del refugio'
        #swagger.description = 'Agrupa los animales según el sector físico en el que habitan (Patio Principal, Sala Max, Jaula de cachorros, Catio).'
        #swagger.responses[200] = {
            description: 'Resumen por sectores físicos.',
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ResumenSector' }
                    }
                }
            }
        }
        #swagger.responses[500] = {
            description: 'Error interno al obtener resumen por sectores.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorServidor' }
                }
            }
        }
    */
    try {
        const result = await db.query(QUERIES.porSector);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error en /api/resumen/sectores: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener resumen por sectores.' });
    }
});

router.get('/veterinario', async (req, res) => {
    /*
        #swagger.tags = ['Resumen y Estadísticas']
        #swagger.summary = 'Obtener resumen de cobertura de control veterinario'
        #swagger.description = 'Compara la cantidad y porcentaje de animales al día ("Sí") frente a pendientes/parciales/no en Esterilizado, Vacunación y Desparasitación.'
        #swagger.responses[200] = {
            description: 'Resumen de control veterinario.',
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ResumenControlVeterinario' }
                    }
                }
            }
        }
        #swagger.responses[500] = {
            description: 'Error interno al obtener resumen veterinario.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorServidor' }
                }
            }
        }
    */
    try {
        const result = await db.query(QUERIES.controlVeterinario);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error en /api/resumen/veterinario: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener resumen veterinario.' });
    }
});

router.get('/insumos', async (req, res) => {
    /*
        #swagger.tags = ['Resumen y Estadísticas']
        #swagger.summary = 'Obtener totalizador de donaciones por tipo de insumo'
        #swagger.description = 'Suma la cantidad de registros y el total recibido por cada categoría del catálogo tipos_insumo.'
        #swagger.responses[200] = {
            description: 'Resumen acumulado de insumos recibidos.',
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ResumenInsumo' }
                    }
                }
            }
        }
        #swagger.responses[500] = {
            description: 'Error interno al obtener resumen de insumos.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorServidor' }
                }
            }
        }
    */
    try {
        const result = await db.query(QUERIES.insumosRecibidos);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error en /api/resumen/insumos: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener resumen de insumos.' });
    }
});

module.exports = router;
