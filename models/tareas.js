
const db = require("../config/conexion.js");

async function agregarRecetaTarea(
  plan_id,
  nombre,
  descripcion,
  precumplimiento,
  visibilidad,
  cancelable,
  precancelado,
  comentarios_cumplimiento,
  comentarios_cancelamiento,
  cancelar_texto,
  documentos,
  rol,
  etiqueta,
  archivos,
  titulo_archivos,
  estado,
  exigencia,
  correo,
  correo_destinatario,
  correo_destinatario_defecto,
  correo_para,
  correo_asunto,
  correo_mensaje
) {
  const query =
    "INSERT INTO receta_tareas (plan_id, nombre, descripcion, precumplimiento, visibilidad, cancelable, precancelado, comentarios_cumplimiento, comentarios_cancelamiento, cancelar_texto, documentos, rol, etiqueta, archivos, titulo_archivos, estado, exigencia, correo, correo_destinatario, correo_destinatario_defecto, correo_para, correo_asunto, correo_mensaje) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)";
  const result = await db.query(query, [
    plan_id,
    nombre,
    descripcion,
    precumplimiento,
    visibilidad,
    cancelable,
    precancelado,
    comentarios_cumplimiento,
    comentarios_cancelamiento,
    cancelar_texto,
    documentos,
    rol,
    etiqueta,
    archivos,
    titulo_archivos,
    estado,
    exigencia,
    correo,
    correo_destinatario,
    correo_destinatario_defecto,
    correo_para,
    correo_asunto,
    correo_mensaje,
  ]);
  return result.rows;
}


async function agregarRecetaTareaRecurrente(
  plan_id,
  nombre,
  descripcion,
  precumplimiento,
  visibilidad,
  cancelable,
  precancelado,
  comentarios_cumplimiento,
  comentarios_cancelamiento,
  cancelar_texto,
  rol,
  etiqueta,
  archivos,
  titulo_archivos,
  correo,
  correo_destinatario,
  correo_destinatario_defecto,
  correo_para,
  correo_asunto,
  correo_mensaje,
  recurrencia,
  variable,
  variable_estado,
  variable_rol,
) {
  const query =
    "INSERT INTO receta_tareas_recurrentes (plan_id, nombre, descripcion, precumplimiento, visibilidad,cancelable, precancelado, comentarios_cumplimiento, comentarios_cancelamiento, cancelar_texto, rol, etiqueta, archivos, titulo_archivos, correo, correo_destinatario, correo_destinatario_defecto, correo_para, correo_asunto, correo_mensaje, recurrencia, variable, variable_estado, variable_rol) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)";
  const result = await db.query(query, [
    plan_id,
    nombre,
    descripcion,
    precumplimiento,
    visibilidad,
    cancelable,
    precancelado,
    comentarios_cumplimiento,
    comentarios_cancelamiento,
    cancelar_texto,
    rol,
    etiqueta,
    archivos,
    titulo_archivos,
    correo,
    correo_destinatario,
    correo_destinatario_defecto,
    correo_para,
    correo_asunto,
    correo_mensaje,
    recurrencia,
    variable,
    variable_estado,
    variable_rol,
  ]);
  return result.rows;
}

async function mostrarRecetasTareas(plan_id) {
  const query = "SELECT * FROM receta_tareas WHERE plan_id = $1";
  const result = await db.query(query, [plan_id]);
  return result.rows;
}

async function mostrarRecetasTareasRecurrentes(plan_id) {
  const query = "SELECT * FROM receta_tareas_recurrentes WHERE plan_id = $1";
  const result = await db.query(query, [plan_id]);
  return result.rows;
}


async function agregarTarea(reglamento_id, nombre, descripcion, etiqueta, plantilla, rol) {
  const query = "INSERT INTO tareas (reglamento_id, nombre, descripcion, etiqueta, plantilla, rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;";
  const values = [reglamento_id, nombre, descripcion, etiqueta, plantilla, rol];
  await db.query(query, values);
}

async function agregarTareaAsunto(asunto_id, nombre, descripcion, etiqueta, plantilla, rol) {
  const query = "INSERT INTO tareas (asunto_id, nombre, descripcion, etiqueta, plantilla, rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;";
  const values = [asunto_id, nombre, descripcion, etiqueta, plantilla, rol];
  await db.query(query, values);
}


async function verificarTareaCompletada(reglamento_id, plantilla) {
  const query = "SELECT COUNT(*) FROM tareas WHERE reglamento_id = $1 AND plantilla = $2 AND estado = 'completado';";
  const values = [reglamento_id, plantilla];
  const result = await db.query(query, values);
  const count = parseInt(result.rows[0].count);
  return count > 0;
}

async function verificarTareaPendiente(reglamento_id, plantilla) {
  const query = "SELECT COUNT(*) FROM tareas WHERE reglamento_id = $1 AND plantilla = $2 AND estado = 'pendiente';";
  const values = [reglamento_id, plantilla];
  const result = await db.query(query, values);
  const count = parseInt(result.rows[0].count);
  return count > 0;
}

async function completarTarea(id, comentario) {
  const query = "UPDATE tareas SET estado = 'completado', comentario = $2, fecha_completado = now() WHERE id = $1;";
  const values = [id, comentario];
  try {
      await db.query(query, values); // Ejecuta la consulta sin retornar nada
  } catch (error) {
      throw error; // Lanza el error para que sea manejado por el llamador
  }
}

async function completarTareaEspecial(reglamento_id, plantilla) {
    const query = "UPDATE tareas SET estado = 'completado', fecha_completado = now() WHERE reglamento_id = $1 AND plantilla = $2;";
    const values = [reglamento_id, plantilla];
    try {
        const result = await db.query(query, values);
        return result.rows[0]; // Retorna la fila actualizada si la consulta fue exitosa
    } catch (error) {
        throw error; // Lanza el error para que sea manejado por el llamador
    }
}


async function obtenerTareas() {
  const query = "SELECT * FROM tareas WHERE estado = 'pendiente';";
  const values = [];
  const result = await db.query(query, values);
    return result.rows;
}

async function obtenerTarea(id) {
  const query = "SELECT * FROM tareas WHERE id = $1;";
  const values = [id];
  const result = await db.query(query, values);
    return result.rows[0];
}

async function obtenerTareasPendientesReglamento(reglamento_id) {
    const query = "SELECT * FROM tareas WHERE reglamento_id = $1 AND estado = 'pendiente' ORDER BY id ASC;";
    const values = [reglamento_id];
    const result = await db.query(query, values);
    return result.rows;
  }

  async function obtenerTareasCompletadasReglamento(reglamento_id) {
    const query = "SELECT * FROM tareas WHERE reglamento_id = $1 AND estado = 'completado' ORDER BY id ASC;";
    const values = [reglamento_id];
    const result = await db.query(query, values);
    return result.rows;
  }


  async function obtenerTareasPendientesAsunto(asunto_id) {
    const query = "SELECT * FROM tareas WHERE asunto_id = $1 AND estado = 'pendiente' ORDER BY id ASC;";
    const values = [asunto_id];
    const result = await db.query(query, values);
    return result.rows;
  }

  async function obtenerTareasCompletadasAsunto(asunto_id) {
    const query = "SELECT * FROM tareas WHERE asunto_id = $1 AND estado = 'completado' ORDER BY id ASC;";
    const values = [asunto_id];
    const result = await db.query(query, values);
    return result.rows;
  }


  async function agregarTareax(
    id,
    proyectos_id,
    plan_id,
    nombre,
    descripcion,
    estado,
    precumplimiento,
    visibilidad,
    cancelable,
    precancelado,
    comentarios_cumplimiento,
    comentarios_cancelamiento,
    cancelar_texto,
    documentos,
    rol,
    etiqueta,
    archivos,
    titulo_archivos,
    exigencia,
    correo,
    correo_destinatario,
    correo_destinatario_defecto,
    correo_para,
    correo_asunto,
    correo_mensaje
  ) {
    
    const query =
      "INSERT INTO tareas (receta, proyectos_id, plan_id, nombre, descripcion, estado, precumplimiento, visibilidad, cancelable, precancelado, comentarios_cumplimiento, comentarios_cancelamiento, cancelar_texto, documentos, rol, etiqueta, archivos, titulo_archivos, exigencia, correo, correo_destinatario, correo_destinatario_defecto, correo_para, correo_asunto, correo_mensaje) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)";
    const result = await db.query(query, [
      id,
      proyectos_id,
      plan_id,
      nombre,
      descripcion,
      estado,
      precumplimiento,
      visibilidad,
      cancelable,
      precancelado,
      comentarios_cumplimiento,
      comentarios_cancelamiento,
      cancelar_texto,
      documentos,
      rol,
      etiqueta,
      archivos,
      titulo_archivos,
      exigencia,
      correo,
      correo_destinatario,
      correo_destinatario_defecto,
      correo_para,
      correo_asunto,
      correo_mensaje,
    ]);
    return result.rows;
  }
  
  async function tareasPendientesDashboard() {
    const query = "SELECT * FROM tareas WHERE estado = 'Activo' ORDER BY id";
    const result = await db.query(query);
  
    // Agrupar tareas por rol
    const tareasAgrupadas = {};
  
    result.rows.forEach(function (tarea) {
      const rol = tarea.rol;
  
      if (!tareasAgrupadas[rol]) {
        tareasAgrupadas[rol] = [];
      }
  
      tareasAgrupadas[rol].push(tarea);
    });
  
    return tareasAgrupadas;
  }
  







  async function mostrarTareasPropias(proyectos_id, user_id, plan_id) {
    const query = `
        SELECT *
        FROM tareas
        WHERE proyectos_id = $1
          AND rol IN (
            SELECT rol
            FROM roles
            WHERE user_id = $2 AND plan_id = $3
          )
        ORDER BY id;
      `;
  
    const queryParams = [proyectos_id, user_id, plan_id];
  
    const result = await db.query(query, queryParams);
  
    // Define el orden de los estados
    const ordenEstados = ["Activo", "Inactivo", "Completado", "Cancelado"];
  
    // Agrupar tareas por estado
    const tareasPorEstado = {};
    result.rows.forEach(function (tarea) {
      const estado = tarea.estado;
      if (!tareasPorEstado[estado]) {
        tareasPorEstado[estado] = [];
      }
      tareasPorEstado[estado].push(tarea);
    });
  
    // Ordenar estados según el orden definido
    const estadosOrdenados = Object.keys(tareasPorEstado).sort(function (a, b) {
      return ordenEstados.indexOf(a) - ordenEstados.indexOf(b);
    });
  
    // Agrupar tareas por rol dentro de cada estado
    const tareasOrdenadas = {};
    estadosOrdenados.forEach(function (estado) {
      const tareasEnEstado = tareasPorEstado[estado];
      const tareasPorRol = {};
  
      tareasEnEstado.forEach(function (tarea) {
        const rol = tarea.rol;
        if (!tareasPorRol[rol]) {
          tareasPorRol[rol] = [];
        }
        tareasPorRol[rol].push(tarea);
      });
  
      tareasOrdenadas[estado] = tareasPorRol;
    });
  
    return tareasOrdenadas;
  }
  
  async function mostrarTareasExternas(proyectos_id, rol) {
  
    const query = `
    SELECT *
    FROM tareas
    WHERE proyectos_id = $1
      AND rol = $2
      AND estado = 'Activo'
    ORDER BY id;
  `;
    const queryParams = [proyectos_id, rol];
    const result = await db.query(query, queryParams);
    return result.rows;
  }
  
  
  
  async function mostrarTareasTerceros(proyectos_id, user_id, plan_id) {
    const query =
      "SELECT *  FROM tareas WHERE proyectos_id = $1 AND rol NOT IN (SELECT rol FROM roles WHERE user_id = $2 AND plan_id = $3) ORDER BY id;";
  
    const queryParams = [proyectos_id, user_id, plan_id];
  
    const result = await db.query(query, queryParams);
  
    // Define el orden de los estados
    const ordenEstados = ["Activo", "Inactivo", "Completado", "Cancelado"];
  
    // Agrupar tareas por estado
    const tareasPorEstado = {};
    result.rows.forEach(function (tarea) {
      const estado = tarea.estado;
      if (!tareasPorEstado[estado]) {
        tareasPorEstado[estado] = [];
      }
      tareasPorEstado[estado].push(tarea);
    });
  
    // Ordenar estados según el orden definido
    const estadosOrdenados = Object.keys(tareasPorEstado).sort(function (a, b) {
      return ordenEstados.indexOf(a) - ordenEstados.indexOf(b);
    });
  
    // Agrupar tareas por rol dentro de cada estado
    const tareasOrdenadas = {};
    estadosOrdenados.forEach(function (estado) {
      const tareasEnEstado = tareasPorEstado[estado];
      const tareasPorRol = {};
  
      tareasEnEstado.forEach(function (tarea) {
        const rol = tarea.rol;
        if (!tareasPorRol[rol]) {
          tareasPorRol[rol] = [];
        }
        tareasPorRol[rol].push(tarea);
      });
  
      tareasOrdenadas[estado] = tareasPorRol;
    });
  
    return tareasOrdenadas;
  }
  







  async function guardarTarea(tarea, contenido) {
    const query = "UPDATE tareas SET resultado = $2 WHERE id = $1";
    const result = await db.query(query, [tarea, contenido]);
    return result.rows;
  }




  async function mostrarTareaDetalle(tarea_id) {
    const query = "SELECT * FROM tareas WHERE id = $1";
    const result = await db.query(query, [tarea_id]);
    return result.rows[0]; // Devuelve el primer elemento del resultado
  }






  async function procesarTareasDependientes(proyectos_id, receta, estado) {
    try {
      // Busca las tareas que tengan el mismo campo con proyectos_id y que contengan documento_origen en su campo "documentos"
      const tareaQuery = `
        SELECT *
        FROM tareas
        WHERE proyectos_id = $1
          AND $2 = ANY(documentos)
          AND estado = 'Inactivo';
      `;
  
      const tareaResult = await db.query(tareaQuery, [proyectos_id, receta]);
  
      for (const tarea of tareaResult.rows) {
        
        if (Array.isArray(tarea.documentos) && tarea.documentos.length === 1) {
          if (estado === 'Cancelado') {
            await db.query("UPDATE tareas SET estado = $2, resultado = precancelado WHERE id = $1 RETURNING *", [tarea.id, estado]);
          } else {
            await db.query("UPDATE tareas SET estado = $2 WHERE id = $1", [tarea.id, estado]);
          }
        } else {
          
          // Si exigencia específica tiene algún elemento, 
          // Revisa si los elementos marcados como esenciales están en estado
  
          // else
  
          async function obtenerVerificados(tarea) {
            const verificados = [];
            for (const documento_id of tarea.documentos) {
              const documento = await db.query(
                "SELECT estado FROM tareas WHERE receta = $1 AND proyectos_id = $2",
                [documento_id, proyectos_id]
              );
              verificados.push(documento.rows[0].estado);
            }
          
            if (verificados.every((estado) => estado === "Completado")) {
              return "todosCompletados";
            } else if (verificados.every((estado) => estado === "Cancelado")) {
              return "todosCancelados";
            } else if (
              verificados.every(
                (estado) => estado === "Completado" || estado === "Cancelado"
              )
            ) {
              return "todosVerificados";
            } else if (verificados.includes("Cancelado")) {
              return "UnoCancelado";
            }
          }
  
          const resultadoVerificados = await obtenerVerificados(tarea);
  
          if (tarea.exigencia && resultadoVerificados === "UnoCancelado") {
            
            await db.query(
              "UPDATE tareas SET estado = 'Cancelado', resultado = precancelado WHERE id = $1",
              [tarea.id]
            );
          } else if (resultadoVerificados === "todosCompletados") {
            await db.query("UPDATE tareas SET estado = 'Activo' WHERE id = $1", [
              tarea.id,
            ]);
          } else if (resultadoVerificados === "todosCancelados") {
            await db.query(
              "UPDATE tareas SET estado = 'Cancelado', resultado = precancelado WHERE id = $1",
              [tarea.id]
            );
          } else if (
            // acá se podría añadir una exigencia específica
            // si es que hay exigencia específica, al menos se requiere que dicha tarea esté completada.
            !tarea.exigencia &&
            resultadoVerificados === "todosVerificados"
          ) {
            await db.query("UPDATE tareas SET estado = 'Activo' WHERE id = $1", [
              tarea.id,
            ]);
          }
  
        }
      }
  
      return { success: true, message: "Tareas activadas correctamente" };
    } catch (error) {
      console.error("Error al activar tareas:", error);
      return { success: false, message: "Error al activar tareas" };
    }
  }
  



module.exports = {
  agregarTarea,
    obtenerTareas,
    obtenerTarea,
    completarTarea,
    verificarTareaCompletada,
    completarTareaEspecial,
    obtenerTareasPendientesReglamento,
    obtenerTareasCompletadasReglamento,
    verificarTareaPendiente,
    agregarTareaAsunto,
    obtenerTareasPendientesAsunto,
    obtenerTareasCompletadasAsunto,
    tareasPendientesDashboard,
    guardarTarea,
    agregarTareax,
    agregarRecetaTarea,
    agregarRecetaTareaRecurrente,
    mostrarRecetasTareas,
    mostrarRecetasTareasRecurrentes,
    mostrarTareasPropias,
    mostrarTareasExternas,
    mostrarTareasTerceros,
    mostrarTareaDetalle,
    procesarTareasDependientes,
};
