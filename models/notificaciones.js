const db = require("../config/conexion.js");


async function agregarNotificacionReglamento(comentario,condominio_id,reglamento_id) {
    const query = "INSERT INTO notificaciones (comentario,condominio_id,reglamento_id) VALUES ($1, $2, $3) RETURNING *;";
    const values = [comentario,condominio_id,reglamento_id];
    const result = await db.query(query, values);
    return result.rows[0];
    }

    async function obtenerNotificaciones(condominio_id, reglamento_id) {
        const query = "SELECT * FROM notificaciones WHERE condominio_id = $1 AND reglamento_id = $2 ORDER BY fecha DESC;";
        const values = [condominio_id, reglamento_id];
        const result = await db.query(query, values);
        return result.rows;
    }

    async function obtenerNotificacionesPorUsuario(user_id) {
        const query = `
            SELECT * FROM notificaciones
            WHERE condominio_id IN (
                SELECT id_condominio
                FROM condominios_usuarios
                WHERE id_usuario = $1
            )
            ORDER BY fecha DESC
            LIMIT 30;
        `;
        const values = [user_id];
        const result = await db.query(query, values);
        return result.rows;
    }

module.exports = {
    agregarNotificacionReglamento,
    obtenerNotificaciones,
    obtenerNotificacionesPorUsuario
  };
  