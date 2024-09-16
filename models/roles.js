// roles.js (models)
const db = require("../config/conexion.js");
const { Pool } = require("pg");

//

async function obtenerRoles() {
  const query =
    "SELECT v.*, m.nombre AS plan_nombre FROM roles v JOIN planes m ON v.plan_id = m.id;";
  const result = await db.query(query);
  return result.rows;
}

async function getConfigRol(Rol) {
  const query =
    "SELECT servidor_smtp, puerto_smtp, contrasena FROM roles WHERE usuario = $1";
  const result = await db.query(query, [Rol]);
  return result.rows;
}

async function AceptaOfertaRol(id, user_id) {
  const query =
    "UPDATE roles SET estado = 'Activo', user_id = $2, asignacion = CURRENT_TIMESTAMP WHERE id = $1;";
  const result = await db.query(query, [id, user_id]);
  return result.rows;
}

async function RechazaOfertaRol(id) {
  const query = "UPDATE roles SET estado = 'Rechazado' WHERE id = $1;";
  const result = await db.query(query, [id]);
  return result.rows;
}

async function obtenerRolPorId(id) {
  const query = "SELECT * FROM roles WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows[0];
}

async function obtenerRolPorUserId(id, plan_id) {
  const query = "SELECT * FROM roles WHERE id = $1 AND plan_id = $2;";
  const result = await db.query(query, [id, plan_id]);
  return result.rows[0];
}

async function obtenerRolesProyecto(plan_id) {
  const query = "SELECT DISTINCT r.rol FROM roles r JOIN permisos p ON r.id = p.rol_id WHERE p.permiso = 'externalizar_tareas' AND p.plan_id = $1 AND p.activo = true;";
  const result = await db.query(query, [plan_id]);
  return result.rows;
}



async function obtenerCorreoRolPorUserId(user_id) {
  const query = "SELECT correo FROM roles WHERE user_id = $1";
  const result = await db.query(query, [user_id]);
  return result.rows[0];
}

async function obtenerCorreoRolPorId(id) {
  const query = "SELECT correo FROM roles WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows[0];
}

async function obtenerRolPorMarca(plan) {
  const query = "SELECT * FROM roles WHERE marca_id = $1";
  const result = await db.query(query, [plan]);
  return result.rows;
}

async function obtenerRolPorPlan(plan) {
  const query = "SELECT * FROM roles WHERE plan_id = $1";
  const result = await db.query(query, [plan]);
  return result.rows;
}

async function obtenerRolCorreoRol(correo, rol, plan) {
  const query =
    "SELECT EXISTS (SELECT 1 FROM roles WHERE correo = $1 AND rol = $2 AND plan_id = $3 );";
  const result = await db.query(query, [correo, rol, plan]);
  return result.rows[0].exists;
}

async function obtenerRolCorreoRolAdmin(correo, rol, marca_id) {
  const query =
    "SELECT EXISTS (SELECT 1 FROM roles WHERE correo = $1 AND rol = $2 AND marca_id = $3 );";
  const result = await db.query(query, [correo, rol, marca_id]);
  return result.rows[0].exists;
}

async function agregarRol(plan_id, estado, correo, rol) {
  const query =
    "INSERT INTO roles (plan_id, estado, correo, rol) VALUES ($1, $2, $3, $4)";
  const result = await db.query(query, [plan_id, estado, correo, rol]);
  return result.rows;
}

async function agregarRolAdmin(marca_id, estado, correo, rol) {
  const query =
    "INSERT INTO roles (marca_id, estado, correo, rol) VALUES ($1, $2, $3, $4)";
  const result = await db.query(query, [marca_id, estado, correo, rol]);
  return result.rows;
}

async function agregarRolConId(user_id, plan_id, estado, correo, rol) {
  const query =
    "INSERT INTO roles (user_id, plan_id, estado, correo, rol) VALUES ($1, $2, $3, $4, $5)";
  const result = await db.query(query, [user_id, plan_id, estado, correo, rol]);
  return result.rows;
}

async function agregarRoladministrador(user_id, plan_id, estado, correo, rol) {
    const query =
    "INSERT INTO roles (user_id, marca_id, estado, correo, rol) VALUES ($1, $2, $3, $4, $5)";
  const result = await db.query(query, [user_id, plan_id, estado, correo, rol]);
  return result.rows;
}

async function marcaRol(id) {
  const query = "SELECT marca_id FROM roles WHERE id = $1";
  const result = await db.query(query, [id]);

  return result.rows[0]?.marca_id; // Devuelve el valor de marca_id si existe, o undefined si no hay filas
}

async function editarRol(
  id,
  user_id,
  plan_id,
  firma,
  puerto_imap,
  servidor_imap,
  puerto_smtp,
  servidor_smtp,
  usuario,
  contrasena,
  remitente
) {
  const query =
    "UPDATE roles SET user_id = $2, plan_id = $3, firma = $4, puerto_imap = $5, servidor_imap = $6, puerto_smtp = $7, servidor_smtp = $8, usuario = $9, contrasena = $10, remitente = $11 WHERE id = $1";
  const result = await db.query(query, [
    id,
    user_id,
    plan_id,
    firma,
    puerto_imap,
    servidor_imap,
    puerto_smtp,
    servidor_smtp,
    usuario,
    contrasena,
    remitente,
  ]);
  return result.rows;
}

async function eliminarRol(id) {
  const query = "DELETE FROM roles WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows;
}

async function buscarTodosLosPermisos(rol_id, plan_id) {
  const query =
    "SELECT id, permiso FROM permisos WHERE rol_id = $1 AND plan_id = $2;";
  const result = await db.query(query, [rol_id, plan_id]);
  return result.rows;
}

async function buscarPermiso(rol_id, plan_id, permiso) {
  const query =
    "SELECT id, activo FROM permisos WHERE rol_id = $1 AND plan_id = $2 AND permiso = $3;";
  const result = await db.query(query, [rol_id, plan_id, permiso]);

  if (result.rows.length > 0) {
    const { id, activo } = result.rows[0];
    return { id, activo };
  } else {
    return null; // O algún valor por defecto si no se encuentra el permiso
  }
}

async function crearPermiso(rol_id, plan_id, user_id, permiso, activo) {
  const query =
    "INSERT INTO permisos (rol_id, plan_id, user_id, permiso, activo) VALUES ($1, $2, $3, $4, $5);";
  const result = await db.query(query, [
    rol_id,
    plan_id,
    user_id,
    permiso,
    activo,
  ]);
  return result.rows;
}

async function editarPermiso(id, activo) {
  const query = "UPDATE permisos SET activo = $2 WHERE id = $1";
  const result = await db.query(query, [id, activo]);
  return result.rows;
}

async function mostrarPermisos(rol_id, plan_id) {
  const query =
    "SELECT permiso, activo FROM permisos WHERE rol_id = $1 AND plan_id = $2;";
  const result = await db.query(query, [rol_id, plan_id]);

  // Crear un objeto con nombres de permisos y estado "checked" o vacío
  const permisosModificados = {};
  result.rows.forEach((permiso) => {
    permisosModificados[permiso.permiso] = permiso.activo ? "checked" : "";
  });

  return permisosModificados;
}



module.exports = {
  getConfigRol,
  obtenerRolCorreoRol,
  obtenerRolPorId,
  obtenerRolPorUserId,
  agregarRol,
  editarRol,
  eliminarRol,
  obtenerRoles,
  obtenerRolPorPlan,
  obtenerCorreoRolPorUserId,
  AceptaOfertaRol,
  RechazaOfertaRol,
  agregarRolConId,
  agregarRoladministrador,
  obtenerRolPorMarca,
  obtenerRolCorreoRolAdmin,
  agregarRolAdmin,
  marcaRol,
  buscarPermiso,
  editarPermiso,
  crearPermiso,
  buscarTodosLosPermisos,
  mostrarPermisos,
  obtenerCorreoRolPorId,
  obtenerRolesProyecto,
};
