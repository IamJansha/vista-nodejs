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
    try {
        const kpis = await db.queryOne(QUERIES.kpis);
        res.json(kpis);
    } catch (err) {
        logs.error(`Error en /api/resumen/kpis: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener KPIs.' });
    }
});

router.get('/especies', async (req, res) => {
    try {
        const result = await db.query(QUERIES.porEspecieSexo);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error en /api/resumen/especies: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener resumen por especie.' });
    }
});

router.get('/etapas', async (req, res) => {
    try {
        const result = await db.query(QUERIES.porEtapa);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error en /api/resumen/etapas: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener resumen por etapas.' });
    }
});

router.get('/estados', async (req, res) => {
    try {
        const result = await db.query(QUERIES.porEstado);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error en /api/resumen/estados: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener resumen por estados.' });
    }
});

router.get('/sectores', async (req, res) => {
    try {
        const result = await db.query(QUERIES.porSector);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error en /api/resumen/sectores: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener resumen por sectores.' });
    }
});

router.get('/veterinario', async (req, res) => {
    try {
        const result = await db.query(QUERIES.controlVeterinario);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error en /api/resumen/veterinario: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener resumen veterinario.' });
    }
});

router.get('/insumos', async (req, res) => {
    try {
        const result = await db.query(QUERIES.insumosRecibidos);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error en /api/resumen/insumos: ${err.stack}`);
        res.status(500).json({ error: 'Error interno al obtener resumen de insumos.' });
    }
});

module.exports = router;
