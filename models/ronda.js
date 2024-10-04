const db = require('../config/conexion.js');
async function crear({ proyecto_id, nombre, porcentajeTotal, fechaInicio, fechaFin, tramos }) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO rondas_inversion (proyecto_id, nombre, porcentaje_total, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?)',
            [proyecto_id, nombre, porcentajeTotal, fechaInicio, fechaFin]
        );

        const rondaId = result.insertId;

        for (let i = 0; i < tramos.length; i++) {
            const tramo = tramos[i];
            await connection.query(
                'INSERT INTO tramos_inversion (ronda_id, proyecto_id, porcentaje, cupon, valor, orden) VALUES (?, ?, ?, ?, ?, ?)',
                [rondaId, proyecto_id, tramo.porcentaje, tramo.cupon, tramo.valor, i + 1]
            );
        }

        await connection.commit();

        return rondaId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function obtenerPorId(id) {
    const [rondas] = await db.query(
        `SELECT r.*, 
         JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'porcentaje', t.porcentaje, 'valor', t.valor, 'estado', t.estado, 'cupon', t.cupon, 'orden', t.orden)) AS tramos
         FROM rondas_inversion r
         LEFT JOIN tramos_inversion t ON r.id = t.ronda_id
         WHERE r.id = ?
         GROUP BY r.id`,
        [id]
    );

    if (rondas.length === 0) {
        return null;
    }

    const ronda = rondas[0];
    ronda.tramos = JSON.parse(ronda.tramos);
    return ronda;
}


async function obtenerPorProyecto(proyectoId) {
    const [rondas] = await db.query(
        'SELECT * FROM rondas_inversion WHERE proyecto_id = ? ORDER BY fecha_inicio DESC',
        [proyectoId]
    );

    return rondas;
}

async function obtenerRondas() {
    const [rondas] = await db.query(
        'SELECT * FROM rondas_inversion'
    );

    return rondas;
}


async function actualizarEstado(id, estado) {
    const [result] = await db.query(
        'UPDATE rondas_inversion SET estado = ? WHERE id = ?',
        [estado, id]
    );

    return result.affectedRows > 0;
}

async function eliminar(id) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query('DELETE FROM tramos_inversion WHERE ronda_id = ?', [id]);
        await connection.query('DELETE FROM inversiones WHERE ronda_id = ?', [id]);
        const [result] = await connection.query('DELETE FROM rondas_inversion WHERE id = ?', [id]);

        await connection.commit();

        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function obtenerTramoPorId(id) {
    const [tramos] = await db.query('SELECT * FROM tramos_inversion WHERE id = ?', [id]);
    return tramos[0];
}


async function comprar(tramoId, usuarioId, cupon = null) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Verificar si el tramo está disponible
        const [tramo] = await connection.query('SELECT * FROM tramos_inversion WHERE id = ? AND estado = "disponible" FOR UPDATE', [tramoId]);
        if (tramo.length === 0) {
            throw new Error('El tramo no está disponible');
        }

        // Aplicar cupón si es válido (implementar lógica de cupones aquí)

        // Actualizar el estado del tramo
        await connection.query('UPDATE tramos_inversion SET estado = "vendido", usuario_id = ? WHERE id = ?', [usuarioId, tramoId]);

        // Registrar la compra (puedes crear una tabla separada para esto si lo deseas)
        await connection.query('INSERT INTO compras_tramos (tramo_id, usuario_id, fecha_compra) VALUES (?, ?, NOW())', [tramoId, usuarioId]);

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        console.error('Error en la compra del tramo:', error);
        return false;
    } finally {
        connection.release();
    }
}



module.exports = {
    crear,
    obtenerPorId,
    obtenerPorProyecto,
    actualizarEstado,
    eliminar,
    obtenerRondas,
    comprar,
    obtenerTramoPorId
};