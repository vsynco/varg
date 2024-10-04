const db = require('../config/conexion.js');

async function safeQuery(query, params = []) {
    try {
        const [rows] = await db.query(query, params);
        return rows;
    } catch (error) {
        console.error('Error en la consulta:', query, error);
        throw error;
    }
}

async function obtenerProyecto(id) {
    const query = `
        SELECT 
            p.*,
            b.id AS cuenta_id,
            b.nombre AS banco_nombre, 
            b.tipo_cuenta AS banco_tipo_cuenta, 
            b.numero_cuenta AS banco_numero_cuenta
        FROM proyectos p
        LEFT JOIN cuentas_bancarias b ON p.id = b.proyecto_id
        WHERE p.id = ?`;
    
    const rows = await safeQuery(query, [id]);
    
    if (rows.length > 0) {
        const proyecto = {
            ...rows[0],
            cuentas_bancarias: []
        };
        
        // Eliminar propiedades de cuentas bancarias del objeto principal
        delete proyecto.cuenta_id;
        delete proyecto.banco_nombre;
        delete proyecto.banco_tipo_cuenta;
        delete proyecto.banco_numero_cuenta;

        // Agregar todas las cuentas bancarias
        rows.forEach(row => {
            if (row.cuenta_id) {
                proyecto.cuentas_bancarias.push({
                    id: row.cuenta_id,
                    nombre: row.banco_nombre,
                    tipo_cuenta: row.banco_tipo_cuenta,
                    numero_cuenta: row.banco_numero_cuenta
                });
            }
        });

        proyecto.socios = await obtenerSociosProyecto(id);
        return proyecto;
    }
    return null;
}


async function obtenerSociosProyecto(proyectoId) {
    const query = "SELECT * FROM socios WHERE proyecto_id = ? ORDER BY porcentaje DESC";
    return await safeQuery(query, [proyectoId]);
}

async function crearProyecto(datos) {
    console.log("Creando proyecto con datos:", datos);
    const { nombre, subtitulo, descripcion, estado, porcentaje_legal, porcentaje_diseno, porcentaje_codigo, sociedad, nombreFantasia, rut, domicilio, ceo,
            bancoNombre, bancoTipoCuenta, bancoNumeroCuenta } = datos;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const queryProyecto = `INSERT INTO proyectos 
            (nombre, subtitulo, descripcion, estado, porcentaje_legal, porcentaje_diseno, porcentaje_codigo, sociedad, nombre_fantasia, rut, domicilio, ceo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [resultProyecto] = await connection.query(queryProyecto, 
            [nombre, subtitulo, descripcion, estado, porcentaje_legal, porcentaje_diseno, porcentaje_codigo, sociedad, nombreFantasia, rut, domicilio, ceo]);
        
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
}

async function obtenerTodosProyectos() {
    const query = "SELECT * FROM proyectos ORDER BY nombre";
    return await safeQuery(query);
}

async function obtenerTodosProyectosNombreId() {
    const query = "SELECT id,nombre FROM proyectos ORDER BY nombre";
    return await safeQuery(query);
}


async function actualizarProyecto(id, datos) {
    const { nombre, subtitulo, descripcion, estado, porcentaje_legal, porcentaje_diseno, porcentaje_codigo, sociedad, nombre_fantasia, rut, domicilio, ceo } = datos;
    const query = `UPDATE proyectos SET 
        nombre = ?, subtitulo = ?, descripcion = ?, estado = ?, porcentaje_legal = ?, porcentaje_diseno = ?, porcentaje_codigo = ?,  sociedad = ?, nombre_fantasia = ?, rut = ?, domicilio = ?, ceo = ? 
        WHERE id = ?`;
    const result = await safeQuery(query, [nombre, subtitulo, descripcion, estado, porcentaje_legal, porcentaje_diseno, porcentaje_codigo, sociedad, nombre_fantasia, rut, domicilio, ceo, id]);
    
    return result.affectedRows > 0 ? id : null;
}

async function actualizarCuentaBancaria(Id, datos) {
    const { nombre, tipo_cuenta, numero_cuenta } = datos;
    const query = `UPDATE cuentas_bancarias SET 
        nombre = ?, tipo_cuenta = ?, numero_cuenta = ? 
        WHERE proyecto_id = ?`;
    const result = await safeQuery(query, [nombre, tipo_cuenta, numero_cuenta, proyectoId]);
    
    return result.affectedRows > 0;
}

async function actualizarProyectoFoto(id, fotoUrl) {
    const query = `UPDATE proyectos SET 
        foto_perfil_url = ? 
        WHERE id = ?`;
    const result = await safeQuery(query, [fotoUrl, id]);
    
    return result.affectedRows > 0 ? id : null;
}

async function eliminarProyecto(id) {
    const query = "DELETE FROM proyectos WHERE id = ?";
    const result = await safeQuery(query, [id]);
    return result.affectedRows > 0;
}

module.exports = {
    obtenerProyecto,
    obtenerSociosProyecto,
    crearProyecto,
    obtenerTodosProyectos,
    actualizarProyecto,
    actualizarProyectoFoto,
    eliminarProyecto,
    actualizarCuentaBancaria,
    obtenerTodosProyectosNombreId
};