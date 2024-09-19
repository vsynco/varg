const mysql = require("mysql2/promise");
const db = require("../config/conexion.js");
const bcrypt = require("bcrypt");

// Función para verificar la conexión a la base de datos
async function verificarConexion() {
    try {
        await db.query('SELECT 1');
        console.log('Conexión a la base de datos establecida correctamente.');
        return true;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        return false;
    }
}

// Llamada a la función de verificación al iniciar el módulo
verificarConexion();

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

// PERSONA

async function obtenerPersonaPaginado(perPage, offset, orderBy = 'DESC') {
    const query = `
        SELECT * FROM usuarios
        ORDER BY creacion ${orderBy}
        LIMIT ? OFFSET ?
    `;
    return await safeQuery(query, [perPage, offset]);
}

async function obtenerPersonaId(id) {
    const query = "SELECT * FROM usuarios WHERE id = ?";
    const rows = await safeQuery(query, [id]);
    return rows.length > 0 ? rows[0] : null;
}

async function obtenerPersonaContactoId(id) {
    const query = "SELECT id, nombre, email, telefono, region, domicilio, comuna, registrado, rut FROM usuarios WHERE id = ?";
    const rows = await safeQuery(query, [id]);
    return rows.length > 0 ? rows[0] : null;
}

async function obtenerPersonaContactoEmail(id) {
    const query = "SELECT nombre, email, registrado FROM usuarios WHERE id = ?";
    const rows = await safeQuery(query, [id]);
    return rows.length > 0 ? rows[0] : null;
}

async function obtenerPersonaEmail(email) {
    const query = "SELECT * FROM usuarios WHERE email = ?";
    const rows = await safeQuery(query, [email]);
    return rows.length > 0 ? rows[0] : null;
}

// PERSONAS

async function obtenerTotalPersonas() {
    const query = "SELECT COUNT(*) as count FROM usuarios";
    const rows = await safeQuery(query);
    return rows.length > 0 ? parseInt(rows[0].count) : 0;
}

// EDITAR, ELIMINAR PERSONA

async function editarPersona(id, nombre, email, foto) {
    const query = "UPDATE usuarios SET nombre = ?, email = ?, foto_perfil = ? WHERE id = ?";
    const result = await safeQuery(query, [nombre, email, foto, id]);
    if (result.affectedRows > 0) {
        const updatedRows = await safeQuery("SELECT * FROM usuarios WHERE id = ?", [id]);
        return updatedRows.length > 0 ? updatedRows[0] : null;
    }
    return null;
}

async function eliminarPersona(id) {
    const query = "DELETE FROM usuarios WHERE id = ?";
    const result = await safeQuery(query, [id]);
    return result.affectedRows > 0;
}

async function ActualizarTokenGoogle(token, refresh_token, email) {
    const query = "UPDATE usuarios SET token = ?, token_refresh = ? WHERE email = ?";
    const result = await safeQuery(query, [token, refresh_token, email]);
    return result.affectedRows > 0;
}

async function obtenerPersonaGestor(id) {
    const query = "SELECT gestor FROM usuarios WHERE id = ?";
    const rows = await safeQuery(query, [id]);
    return rows.length > 0 ? rows[0] : null;
}

async function obtenerCorreo(id) {
    const query = "SELECT usuario FROM roles WHERE id = ? LIMIT 1";
    const rows = await safeQuery(query, [id]);
    return rows.length > 0 ? rows[0] : null;
}

// AGREGAR PERSONA CON GOOGLE (Con foto de perfil)
async function RegistrarUsuario(nombre, foto_perfil, email, token, refresh_token) {
    const query = "INSERT INTO usuarios (nombre, foto_perfil, email, token, token_refresh) VALUES (?, ?, ?, ?, ?)";
    const result = await safeQuery(query, [nombre, foto_perfil, email, token, refresh_token]);
    return result.insertId;
}

// Crea usuario registrado
async function insertarPersona({ nombre, email, contrasena, telefono, afiliado }) {
    const query = "INSERT INTO usuarios (nombre, email, contrasena, telefono, afiliado) VALUES (?, ?, ?, ?, ?)";
    const result = await safeQuery(query, [nombre, email, contrasena, telefono, afiliado]);
    return result.insertId;
}

// Crea usuario no registrado
async function insertarPersonaContacto(nombre, rut, domicilio, comuna, region, email, telefono) {
    const checkQuery = "SELECT id FROM usuarios WHERE email = ?";
    const checkRows = await safeQuery(checkQuery, [email]);
    
    if (checkRows.length > 0) {
        return checkRows[0].id;
    }
    
    const query = "INSERT INTO usuarios (nombre, rut, domicilio, comuna, region, email, telefono, registrado) VALUES (?, ?, ?, ?, ?, ?, ?, false)";
    const result = await safeQuery(query, [nombre, rut, domicilio, comuna, region, email, telefono]);
    return result.insertId;
}

async function buscarPersonas(buscar) {
    const query = "SELECT * FROM usuarios WHERE nombre LIKE ? OR email LIKE ?";
    const searchTerm = `%${buscar}%`;
    return await safeQuery(query, [searchTerm, searchTerm]);
}

// PERSONAS JURÍDICAS

async function obtenerPersonaNatural() { 
    const query = "SELECT id, rut, nombre, email, telefono, domicilio, comuna, region, registrado FROM usuarios";
    return await safeQuery(query);
}

async function obtenerPersonaNaturalConToken() {
    const query = `
        SELECT id, rut, nombre, email, telefono, domicilio, comuna, region, registrado 
        FROM usuarios 
        WHERE token IS NOT NULL
    `;
    return await safeQuery(query);
}

async function actualizarAccessToken(id, token) {
    const query = "UPDATE usuarios SET token = ? WHERE id = ?";
    const result = await safeQuery(query, [token, id]);
    return result.affectedRows > 0;
}

module.exports = {
    verificarConexion,
    obtenerPersonaId,
    obtenerPersonaEmail,
    obtenerPersonaPaginado,
    obtenerTotalPersonas,
    eliminarPersona,
    editarPersona,
    RegistrarUsuario,
    ActualizarTokenGoogle,
    obtenerPersonaGestor,
    obtenerCorreo,
    insertarPersona,
    buscarPersonas,
    insertarPersonaContacto,
    obtenerPersonaContactoId,
    obtenerPersonaContactoEmail,
    obtenerPersonaNatural,
    obtenerPersonaNaturalConToken,
    actualizarAccessToken
};
