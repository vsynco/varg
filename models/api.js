const db = require('../config/turso');

async function agregarProspecto({ nombre, correo, telefono, mensaje }) {
    try {
      const query = `
        INSERT INTO prospectos_abo (nombre, correo, telefono, mensaje, estado, visto)
        VALUES (?, ?, ?, ?, 'pendiente', false)
      `;
      await db.execute(query, [nombre, correo, telefono, mensaje]);
    } catch (error) {
      console.error("Error en agregarProspecto:", error);
      throw error;
    }
  }
  

module.exports = {
    agregarProspecto
};