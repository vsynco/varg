const db = require('../config/conexion.js'); // Asegúrate de que tu conexión esté configurada para usar mysql2/promise

async function safeQuery(query, params = []) {
    try {
        const [rows] = await db.query(query, params);
        return rows;
    } catch (error) {
        console.error('Error en la consulta:', query, error);
        throw error;
    }
}

const proyectosModel = {
    async obtenerProyecto(id) {
        const query = `
            SELECT p.*, 
                   b.nombre AS banco_nombre, 
                   b.tipo_cuenta AS banco_tipo_cuenta, 
                   b.numero_cuenta AS banco_numero_cuenta
            FROM proyectos p
            LEFT JOIN cuentas_bancarias b ON p.id = b.proyecto_id
            WHERE p.id = ?`;
        const rows = await safeQuery(query, [id]);
        if (rows.length > 0) {
            const proyecto = rows[0];
            proyecto.socios = await this.obtenerSociosProyecto(id);
            return proyecto;
        }
        return null;
    },

    async obtenerSociosProyecto(proyectoId) {
        const query = "SELECT * FROM socios WHERE proyecto_id = ? ORDER BY porcentaje DESC";
        return await safeQuery(query, [proyectoId]);
    },

    async crearProyecto(datos) {
        const { nombre, descripcion, sitioWeb, grupoWhatsapp, sociedad, nombreFantasia, rut, domicilio, ceo,
                bancoNombre, bancoTipoCuenta, bancoNumeroCuenta } = datos;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const queryProyecto = `INSERT INTO proyectos 
                (nombre, descripcion, sitio_web, grupo_whatsapp, sociedad, nombre_fantasia, rut, domicilio, ceo) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            const [resultProyecto] = await connection.query(queryProyecto, 
                [nombre, descripcion, sitioWeb, grupoWhatsapp, sociedad, nombreFantasia, rut, domicilio, ceo]);
            
            const proyectoId = resultProyecto.insertId;
            console.log("Proyecto creado con ID:", proyectoId);

            if (bancoNombre && bancoTipoCuenta && bancoNumeroCuenta) {
                const queryBanco = `INSERT INTO cuentas_bancarias 
                    (proyecto_id, nombre, tipo_cuenta, numero_cuenta) 
                    VALUES (?, ?, ?, ?)`;
                await connection.query(queryBanco, [proyectoId, bancoNombre, bancoTipoCuenta, bancoNumeroCuenta]);
                console.log("Cuenta bancaria añadida para el proyecto ID:", proyectoId);
            }

            await connection.commit();
            return proyectoId;
        } catch (err) {
            await connection.rollback();
            console.error('Error en la creación del proyecto:', err);
            throw err;
        } finally {
            connection.release();
        }
    },

    async obtenerTodosProyectos() {
        const query = "SELECT * FROM proyectos ORDER BY nombre";
        return await safeQuery(query);
    },

    async actualizarProyecto(id, datos) {
        const { nombre, descripcion, sitioWeb, grupoWhatsapp, sociedad, nombreFantasia, rut, domicilio, ceo } = datos;
        const query = `UPDATE proyectos SET 
            nombre = ?, descripcion = ?, sitio_web = ?, grupo_whatsapp = ?, 
            sociedad = ?, nombre_fantasia = ?, rut = ?, domicilio = ?, ceo = ? 
            WHERE id = ?`;
        const result = await safeQuery(query, [nombre, descripcion, sitioWeb, grupoWhatsapp, sociedad, nombreFantasia, rut, domicilio, ceo, id]);
        return result.affectedRows > 0;
    },

    async eliminarProyecto(id) {
        const query = "DELETE FROM proyectos WHERE id = ?";
        const result = await safeQuery(query, [id]);
        return result.affectedRows > 0;
    }
};

module.exports = proyectosModel;
