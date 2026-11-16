const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const logs = require('../structs/logs');
require('dotenv').config();

const dbRelativePath = process.env.DB_PATH || '../generar-db/refugio_pikilines.db';
const dbPath = path.resolve(__dirname, '..', dbRelativePath);

let db;
try {
    db = new DatabaseSync(dbPath, { readOnly: true });
    const check = db.prepare("SELECT datetime('now') AS now").get();
    logs.info(`Conexión a SQLite establecida con éxito (${dbPath}) [${check.now}]`);
} catch (err) {
    logs.error(`No se pudo conectar a la BD SQLite en ${dbPath}: ${err.message}`);
    process.exit(1);
}

/**
 * Ejecuta una consulta SQL nativa (SELECT) y devuelve un objeto { rows, rowCount }
 * manteniendo la misma firma limpia que pg en example_front:
 *   const result = await db.query(queryText, queryParams);
 *   res.json(result.rows);
 */
async function query(text, params = []) {
    const stmt = db.prepare(text);
    const rows = stmt.all(...params);
    return {
        rows,
        rowCount: rows.length
    };
}

/**
 * Ejecuta una consulta SQL nativa y devuelve la primera fila o null.
 */
async function queryOne(text, params = []) {
    const stmt = db.prepare(text);
    const row = stmt.get(...params);
    return row || null;
}

module.exports = {
    query,
    queryOne,
    db
};
