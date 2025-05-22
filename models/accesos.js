const db = require('../config/turso');

// 1. mostrarContactoNatural(id)
async function mostrarContactoNatural(id) {
  try {
    const result = await db.execute(
      `SELECT * FROM usuarios WHERE id = ?`,
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error en mostrarContactoNatural:', error);
    throw error;
  }
}

// 2. obtenerPersonaId(id)
async function obtenerPersonaId(id) {
  try {
    const result = await db.execute(`SELECT * FROM usuarios WHERE id = ?`, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error en obtenerPersonaId:', error);
    throw error;
  }
}

// 3. obtenerPersonaNaturalConToken()
async function obtenerPersonaNaturalConToken() {
  try {
    const result = await db.execute(`
      SELECT id, rut, nombre, email, telefono, domicilio, comuna, region, registrado 
      FROM usuarios 
      WHERE token IS NOT NULL`
    );
    return result.rows;
  } catch (error) {
    console.error('Error en obtenerPersonaNaturalConToken:', error);
    throw error;
  }
}

// 4. obtenerPersonaEmail(email)
async function obtenerPersonaEmail(email) {
  try {
    const result = await db.execute(`SELECT * FROM usuarios WHERE email = ?`, [email]);
    return result.rows[0];
  } catch (error) {
    console.error('Error en obtenerPersonaEmail:', error);
    throw error;
  }
}

// 5. RegistrarUsuario(nombre, foto_perfil, email, token, refresh_token)
async function RegistrarUsuario(nombre, foto_perfil, email, token, refresh_token) {
  try {
    const result = await db.execute(
      `INSERT INTO usuarios (nombre, foto_perfil, email, token, token_refresh) VALUES (?, ?, ?, ?, ?) RETURNING id`,
      [nombre, foto_perfil, email, token, refresh_token]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Error en RegistrarUsuario:', error);
    throw error;
  }
}

// 6. ActualizarTokenGoogle(token, refresh_token, email)
async function ActualizarTokenGoogle(token, refresh_token, email) {
  try {
    await db.execute(
      `UPDATE usuarios SET token = ?, token_refresh = ? WHERE email = ?`,
      [token, refresh_token, email]
    );
  } catch (error) {
    console.error('Error en ActualizarTokenGoogle:', error);
    throw error;
  }
}

async function actualizarAccessToken(id, token) {
  try {
    await db.execute(`UPDATE usuarios SET token = ? WHERE id = ?`, [token, id]);
  } catch (error) {
    console.error('Error en actualizarAccessToken:', error);
    throw error;
  }
}

// CORRECCIÓN: Cambiar exports por module.exports
module.exports = {
    mostrarContactoNatural,
    obtenerPersonaId,
    obtenerPersonaNaturalConToken,
    obtenerPersonaEmail,
    RegistrarUsuario,
    ActualizarTokenGoogle,
    actualizarAccessToken
};
