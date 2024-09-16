const db = require("../config/conexion.js");

async function activarTareasRecurrentesTodo(diasemana) {
  const tareasRecurrentes = await db.query("SELECT * FROM tareas_recurrentes WHERE recurrencia = 'Semanal' and recurrencia_semanal = $1 AND variable = 'Todo'", [diasemana]);
  return tareasRecurrentes.rows;
}

async function activarTareasRecurrentesEstado(diasemana) {
  const tareasRecurrentes = await db.query("SELECT * FROM tareas_recurrentes WHERE recurrencia = 'Semanal' and recurrencia_semanal = $1 AND variable = 'Estado'", [diasemana]);
  
  const tareasActivas = [];
  for (let tareaRecurrente of tareasRecurrentes.rows) {
    const tareas = await db.query('SELECT * FROM tareas WHERE proyectos_id = $1 AND estado = $2', [tareaRecurrente.proyectos_id, tareaRecurrente.variable_estado]);
    if (tareas.rows.length > 0) {
      tareasActivas.push(tareaRecurrente);
    }
  }

  return tareasActivas;
}

async function activarTareasRecurrentesEstadoRol(diasemana) {
  const tareasRecurrentes = await db.query("SELECT * FROM tareas_recurrentes WHERE recurrencia = 'Semanal' and recurrencia_semanal = $1 AND variable = 'EstadoRol'", [diasemana]);
  
  const tareasActivas = [];
  for (let tareaRecurrente of tareasRecurrentes.rows) {
    const tareas = await db.query('SELECT * FROM tareas WHERE proyectos_id = $1 AND estado = $2 AND rol = $3', [tareaRecurrente.proyectos_id, tareaRecurrente.variable_estado, tareaRecurrente.variable_rol]);
    if (tareas.rows.length > 0) {
      tareasActivas.push(tareaRecurrente);
    }
  }

  return tareasActivas;
}

module.exports = {
    activarTareasRecurrentesTodo,
    activarTareasRecurrentesEstado,
    activarTareasRecurrentesEstadoRol,
    };