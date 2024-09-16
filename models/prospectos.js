const db = require("../config/conexion.js");

async function mostrarProspectos() {
    const query = `SELECT p.*, u.nombre, u.email, u.telefono 
FROM prospectos p 
JOIN usuarios u ON p.user_id = u.id
ORDER BY p.id DESC;`;
    const result = await db.query(query);
    return result.rows;
}

async function mostrarProspecto(prospecto_id) {
    const query = `SELECT p.*, u.nombre, u.email, u.creacion, u.telefono, u.region, u.domicilio, u.comuna FROM prospectos p JOIN usuarios u ON p.user_id = u.id WHERE p.id = $1;`;
    const values = [prospecto_id];
    const result = await db.query(query, values);
    return result.rows[0];
}

async function ProspectoVisto(prospecto_id) {
    const query = `UPDATE prospectos SET visto = true WHERE id = $1 AND visto = false;`;
    const values = [prospecto_id];
    const result = await db.query(query, values);
    return result.rows[0];
}

async function crearProspecto(user_id, mensaje) {
    const query = `INSERT INTO prospectos (user_id, mensaje) VALUES ($1, $2);`;
    const values = [user_id, mensaje];
    await db.query(query, values);
}

module.exports = {
    mostrarProspectos,
    mostrarProspecto,
    crearProspecto,
    ProspectoVisto
};