const db = require("../config/conexion.js");

// Función helper para manejar consultas de manera segura
async function safeQuery(query, params = []) {
    try {
        const [rows] = await db.query(query, params);
        return rows;
    } catch (error) {
        console.error('Error en la consulta:', query, error);
        throw error;
    }
}

// Función para añadir un socio
async function anadirSocio(nombre, rut, porcentaje, proyectoId) {
    if (porcentaje < 1 || porcentaje > 100) {
        throw new Error("El porcentaje debe estar entre 1 y 100");
    }

    const query = "INSERT INTO socios (nombre, rut, porcentaje, proyecto_id) VALUES (?, ?, ?, ?)";
    const result = await safeQuery(query, [nombre, rut, porcentaje, proyectoId]);
    return result.insertId;
}

async function obtenerProyectoIDSocio(id) {
    const query = "SELECT proyecto_id FROM socios WHERE id = ?";
    const [socio] = await safeQuery(query, [id]);
    return socio ? socio.proyecto_id : null;
}


async function eliminarSocio(id) {
    // Eliminar el socio
    const queryEliminar = "DELETE FROM socios WHERE id = ?";
    const result = await safeQuery(queryEliminar, [id]);
    return {
        eliminado: result.affectedRows > 0
    };
}


// Función para editar un socio
async function editarSocio(id, nombre, rut, porcentaje) {
    if (porcentaje < 1 || porcentaje > 100) {
        throw new Error("El porcentaje debe estar entre 1 y 100");
    }

    const query = "UPDATE socios SET nombre = ?, rut = ?, porcentaje = ? WHERE id = ?";
    const result = await safeQuery(query, [nombre, rut, porcentaje, id]);
    if (result.affectedRows > 0) {
        const updatedRows = await safeQuery("SELECT * FROM socios WHERE id = ?", [id]);
        return updatedRows.length > 0 ? updatedRows[0] : null;
    }
    return null;
}

// Función para obtener el porcentaje total
async function obtenerPorcentajeTotal(proyectoId) {
    const query = "SELECT SUM(porcentaje) AS porcentajeTotal FROM socios WHERE proyecto_id = ?";
    const result = await safeQuery(query, [proyectoId]);
    return result.length > 0 ? result[0].porcentajeTotal : 0;
}

// Función para obtener socio por ID
async function obtenerSocioPorId(id) {
    const query = "SELECT * FROM socios WHERE id = ?";
    const result = await safeQuery(query, [id]);
    return result.length > 0 ? result[0] : null;
}

// Función para obtener todos los socios
async function obtenerTodosSocios() {
    const query = "SELECT * FROM socios ORDER BY nombre";
    return await safeQuery(query);
}

// Función para obtener socios por proyecto
async function obtenerSociosPorProyecto(proyectoId) {
    const query = "SELECT * FROM socios WHERE proyecto_id = ? ORDER BY nombre";
    return await safeQuery(query, [proyectoId]);
}

// Función para obtener el total de socios
async function obtenerTotalSocios() {
    const query = "SELECT COUNT(*) as count FROM socios";
    const rows = await safeQuery(query);
    return rows.length > 0 ? parseInt(rows[0].count) : 0;
}

// Función para obtener el total de socios por proyecto
async function obtenerTotalSociosPorProyecto(proyectoId) {
    const query = "SELECT COUNT(*) as count FROM socios WHERE proyecto_id = ?";
    const rows = await safeQuery(query, [proyectoId]);
    return rows.length > 0 ? parseInt(rows[0].count) : 0;
}

// Función para buscar socios
async function buscarSocios(buscar, proyectoId = null) {
    let query = "SELECT * FROM socios WHERE (nombre LIKE ? OR rut LIKE ?)";
    let params = [`%${buscar}%`, `%${buscar}%`];

    if (proyectoId !== null) {
        query += " AND proyecto_id = ?";
        params.push(proyectoId);
    }

    return await safeQuery(query, params);
}

// Función para verificar si el total de porcentajes de socios en un proyecto es válido
async function verificarPorcentajeTotal(proyectoId) {
    const query = "SELECT SUM(porcentaje) as total FROM socios WHERE proyecto_id = ?";
    const rows = await safeQuery(query, [proyectoId]);
    const total = rows.length > 0 ? rows[0].total : 0;
    return total <= 100;
}

module.exports = {
    anadirSocio,
    eliminarSocio,
    editarSocio,
    obtenerSocioPorId,
    obtenerTodosSocios,
    obtenerSociosPorProyecto,
    obtenerTotalSocios,
    obtenerTotalSociosPorProyecto,
    buscarSocios,
    verificarPorcentajeTotal,
    obtenerPorcentajeTotal,
    obtenerProyectoIDSocio
};
