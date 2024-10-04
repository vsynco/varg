const db = require('../config/conexion.js');

const enlacesModel = {
    async crearEnlace(datosEnlace) {
        const { proyecto_id, nombre, url } = datosEnlace;
        const query = 'INSERT INTO enlaces (proyecto_id, nombre, url) VALUES (?, ?, ?)';
        const [result] = await db.query(query, [proyecto_id, nombre, url]);
        return { id: result.insertId, ...datosEnlace };
    },

    async actualizarEnlace(id, datosEnlace) {
        const { nombre, url } = datosEnlace;
        const query = 'UPDATE enlaces SET nombre = ?, url = ? WHERE id = ?';
        const [result] = await db.query(query, [nombre, url, id]);
        return result.affectedRows > 0;
    },

    async eliminarEnlace(id) {
        const query = 'DELETE FROM enlaces WHERE id = ?';
        const [result] = await db.query(query, [id]);
        return result.affectedRows > 0;
    },

    async obtenerEnlacesProyecto(proyectoId) {
        const query = 'SELECT * FROM enlaces WHERE proyecto_id = ?';
        const [rows] = await db.query(query, [proyectoId]);
        return rows;
    }
};

module.exports = enlacesModel;