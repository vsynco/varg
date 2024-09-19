const mysql = require('mysql2/promise');
const db = require("../config/conexion.js");
const ImapFlow = require("imapflow");

// Función para mostrar correos
async function mostrarCorreos(user_id) {
  const query =
    "SELECT * FROM correos WHERE receiver IN (SELECT usuario FROM roles WHERE user_id = ?)";
  const [rows] = await db.execute(query, [user_id]);
  return rows;
}

async function mostrarCorreosProyecto(proyecto_id) {
  const query = `
    SELECT correos.*, COALESCE(tareas.nombre, 'Generales') AS nombre_tarea
    FROM correos
    LEFT JOIN tareas ON correos.tarea_id = tareas.id
    WHERE correos.proyecto_id = ?
  `;
  const [rows] = await db.execute(query, [proyecto_id]);

  // Agrupar los correos por nombre_tarea
  const correosPorTarea = {};
  rows.forEach(function (correo) {
    const nombreTarea = correo.nombre_tarea;
    if (!correosPorTarea[nombreTarea]) {
      correosPorTarea[nombreTarea] = [];
    }
    correosPorTarea[nombreTarea].push(correo);
  });

  return correosPorTarea;
}

async function mostrarCorreosTarea(tarea_id) {
  const query = "SELECT * FROM correos WHERE tarea_id = ?";
  const [rows] = await db.execute(query, [tarea_id]);
  return rows;
}

async function mostrarCorreoPorSender(sender) {
  const query = "SELECT * FROM correos WHERE sender = ?";
  const [rows] = await db.execute(query, [sender]);
  return rows;
}

async function mostrarCorreoPorId(id) {
  const query = "SELECT * FROM correos WHERE id = ?";
  const [rows] = await db.execute(query, [id]);
  return rows[0];
}

async function mostrarCorreoPorTipo(tipo) {
  const query = "SELECT * FROM correos WHERE type = ?";
  const [rows] = await db.execute(query, [tipo]);
  return rows;
}

async function eliminarCorreo(id) {
  const query = "DELETE FROM correos WHERE id = ?";
  await db.execute(query, [id]);
}

async function enviarCorreo(
  sender,
  receiver,
  subject,
  text,
  proyecto_id,
  tarea_id
) {
  try {
    const timestamp = new Date().toISOString();
    const tipo = "Enviados"; // Agrega el tipo "Enviados" aquí
    const query =
      "INSERT INTO correos (sender, receiver, subject, text, type, timestamp, proyecto_id, tarea_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    await db.execute(query, [
      sender,
      receiver,
      subject,
      text,
      tipo,
      timestamp,
      proyecto_id,
      tarea_id,
    ]);

    // Resto del código para enviar el correo...
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    // Manejo de errores...
  }
}

async function guardarDescarga(nombre, descargas_url, formato, correo_id) {
  const query =
    "INSERT INTO descargas (nombre, descargas_url, formato, correo_id) VALUES (?, ?, ?, ?)"; 
  const [result] = await db.execute(query, [
    nombre,
    descargas_url,
    formato,
    correo_id,
  ]);
  return result.insertId;
}

async function guardarCorreo(
  sender,
  receiver,
  subject,
  text,
  message_id,
  referentes,
  to_reply
) {
  try {
    // Verificar si el message_id ya existe en la base de datos
    const checkQuery = "SELECT COUNT(*) AS count FROM correos WHERE message_id = ?";
    const [checkRows] = await db.execute(checkQuery, [message_id]);
    const messageExists = parseInt(checkRows[0].count) > 0;

    if (messageExists) {
      console.error("El message_id ya existe en la base de datos.");
      // Puedes decidir cómo manejar esta situación, por ejemplo, mostrar un mensaje de error.
      return;
    }

    const timestamp = new Date().toISOString();
    const tipo = "Recibidos"; // Agrega el tipo "Recibidos" aquí
    const insertQuery =
      "INSERT INTO correos (sender, receiver, subject, text, type, timestamp, message_id, referentes, to_reply) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      
    // Verifica si referentes y to_reply son undefined y define valores por defecto
    const referentesValor = referentes || null;
    const toReplyValor = to_reply || null;

    const [result] = await db.execute(insertQuery, [
      sender,
      receiver,
      subject,
      text,
      tipo,
      timestamp,
      message_id,
      referentesValor,
      toReplyValor,
    ]);

    const id = result.insertId; // Aquí está el ID del nuevo correo
    return id; // Devuelve el ID
  } catch (error) {
    console.error("Error al guardar el correo:", error);
    // Manejo de errores...
  }
}

async function getConfigRol(Rol) {
  const query =
    "SELECT servidor_smtp, puerto_smtp, contrasena FROM roles WHERE usuario = ?";
  const [rows] = await db.execute(query, [Rol]);
  return rows;
}

async function getConfigImap(Rol) {
  const query =
    "SELECT servidor_imap, puerto_imap, contrasena FROM roles WHERE usuario = ?";
  const [rows] = await db.execute(query, [Rol]);
  return rows;
}

module.exports = {
  eliminarCorreo,
  enviarCorreo,
  guardarCorreo,
  getConfigRol,
  getConfigImap,
  guardarDescarga,
  mostrarCorreos,
  mostrarCorreoPorId,
  mostrarCorreoPorTipo,
  mostrarCorreoPorSender,
  mostrarCorreosTarea,
  mostrarCorreosProyecto,
};
