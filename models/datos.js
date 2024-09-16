const db = require("../config/conexion.js");

async function agregarDato(proyecto_id, tarea_id, receta, dato_nombre, dato_codigo, dato_contenido) {
  const query =
    "INSERT INTO datos (proyecto_id, tarea_id, receta, dato_nombre, dato_codigo, dato_contenido) VALUES ($1, $2, $3, $4, $5, $6)";
  const result = await db.query(query, [proyecto_id, tarea_id, receta, dato_nombre, dato_codigo, dato_contenido]);
  return result.rows;
}

async function mostrarProyectosDatos(proyecto_id) {
  const query = `
    SELECT datos.*, COALESCE(tareas.titulo_archivos, 'Generales') AS titulo_archivos
    FROM datos
    LEFT JOIN tareas ON datos.tarea_id = tareas.id
    WHERE datos.proyecto_id = $1
  `;
  const result = await db.query(query, [proyecto_id]);

  // Agrupar las URLs por titulo_archivos
  const datosPorTarea = {};
  result.rows.forEach(function (dato) {
    const tituloArchivos = dato.titulo_archivos;
    if (!datosPorTarea[tituloArchivos]) {
      datosPorTarea[tituloArchivos] = [];
    }
    datosPorTarea[tituloArchivos].push(dato);
  });

  return datosPorTarea;
}


async function mostrarDatosRelacionadas(recetas) {
  let documentos = [...recetas];

  for (let rec of recetas) {
    const result = await db.query("SELECT documentos FROM tareas WHERE receta = ANY($1::text[])", [[rec.toString()]]);
    const tareas = result.rows;

    for (let tarea of tareas) {
      if (tarea.documentos && tarea.documentos.length > 0) {
        documentos.push(...tarea.documentos);
        const nuevosDocumentos = await mostrarDatosRelacionadas(tarea.documentos);
        documentos = [...new Set([...documentos, ...nuevosDocumentos])];
      }
    }
  }

  return documentos;
}



async function mostrarDocumentosRelacionados(proyecto_id, recetas) {
  const query = `
    SELECT datos.*, COALESCE(tareas.titulo_archivos, 'Generales') AS titulo_archivos
    FROM datos
    LEFT JOIN tareas ON datos.tarea_id = tareas.id
    WHERE datos.proyecto_id = $1 AND datos.receta = ANY($2::int[])
  `;
  const result = await db.query(query, [proyecto_id, recetas.map(Number)]);

  // Agrupar las URLs por titulo_archivos
  const datosPorTarea = {};
  result.rows.forEach(function (dato) {
    const tituloArchivos = dato.titulo_archivos;
    if (!datosPorTarea[tituloArchivos]) {
      datosPorTarea[tituloArchivos] = [];
    }
    datosPorTarea[tituloArchivos].push(dato);
  });

  return datosPorTarea;
}

async function mostrarTareasDatos(proyecto_id, tarea_id) {
  const query = "SELECT * FROM datos WHERE proyecto_id = $1 AND tarea_id = $2";
  const result = await db.query(query, [proyecto_id, tarea_id]);
  return result.rows;
}



module.exports = {
  agregarDato,
  mostrarProyectosDatos,
  mostrarTareasDatos,
  mostrarDocumentosRelacionados,
  mostrarDatosRelacionadas,
};
