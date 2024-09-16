const db = require("../config/conexion.js");

async function agregarEnlace(proyecto_id, tarea_id, receta, url, url_mostrar) {
  const query =
    "INSERT INTO enlaces (proyecto_id, tarea_id, receta, url, url_mostrar) VALUES ($1, $2, $3, $4, $5)";
  const result = await db.query(query, [proyecto_id, tarea_id, receta, url, url_mostrar]);
  return result.rows;
}

async function mostrarProyectosEnlaces(proyecto_id) {
  const query = `
    SELECT enlaces.*, COALESCE(tareas.titulo_archivos, 'Generales') AS titulo_archivos
    FROM enlaces
    LEFT JOIN tareas ON enlaces.tarea_id = tareas.id
    WHERE enlaces.proyecto_id = $1
  `;
  const result = await db.query(query, [proyecto_id]);

  // Agrupar las URLs por titulo_archivos
  const enlacesPorTarea = {};
  result.rows.forEach(function (enlace) {
    const tituloArchivos = enlace.titulo_archivos;
    if (!enlacesPorTarea[tituloArchivos]) {
      enlacesPorTarea[tituloArchivos] = [];
    }
    enlacesPorTarea[tituloArchivos].push(enlace);
  });

  return enlacesPorTarea;
}


async function mostrarEnlacesRelacionadas(recetas) {
  let documentos = [...recetas];

  for (let rec of recetas) {
    const result = await db.query("SELECT documentos FROM tareas WHERE receta = ANY($1::text[])", [[rec.toString()]]);
    const tareas = result.rows;

    for (let tarea of tareas) {
      if (tarea.documentos && tarea.documentos.length > 0) {
        documentos.push(...tarea.documentos);
        const nuevosDocumentos = await mostrarEnlacesRelacionadas(tarea.documentos);
        documentos = [...new Set([...documentos, ...nuevosDocumentos])];
      }
    }
  }

  return documentos;
}



async function mostrarDocumentosRelacionados(proyecto_id, recetas) {
  const query = `
    SELECT enlaces.*, COALESCE(tareas.titulo_archivos, 'Generales') AS titulo_archivos
    FROM enlaces
    LEFT JOIN tareas ON enlaces.tarea_id = tareas.id
    WHERE enlaces.proyecto_id = $1 AND enlaces.receta = ANY($2::int[])
  `;
  const result = await db.query(query, [proyecto_id, recetas.map(Number)]);

  // Agrupar las URLs por titulo_archivos
  const enlacesPorTarea = {};
  result.rows.forEach(function (enlace) {
    const tituloArchivos = enlace.titulo_archivos;
    if (!enlacesPorTarea[tituloArchivos]) {
      enlacesPorTarea[tituloArchivos] = [];
    }
    enlacesPorTarea[tituloArchivos].push(enlace);
  });

  return enlacesPorTarea;
}

async function mostrarTareasEnlaces(proyecto_id, tarea_id) {
  const query = "SELECT * FROM enlaces WHERE proyecto_id = $1 AND tarea_id = $2";
  const result = await db.query(query, [proyecto_id, tarea_id]);
  return result.rows;
}



module.exports = {
  agregarEnlace,
  mostrarProyectosEnlaces,
  mostrarTareasEnlaces,
  mostrarDocumentosRelacionados,
  mostrarEnlacesRelacionadas,
};
