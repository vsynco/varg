const db = require("../config/conexion.js");

async function agregarUrl(proyecto_id, tarea_id, receta, url, url_mostrar) {
  const query =
    "INSERT INTO urls (proyecto_id, tarea_id, receta, url, url_mostrar) VALUES ($1, $2, $3, $4, $5)";
  const result = await db.query(query, [proyecto_id, tarea_id, receta, url, url_mostrar]);
  return result.rows;
}

async function mostrarDescargables(proyecto_id) {
  const query = `
    SELECT 
      urls.*, 
      CASE 
        WHEN urls.tarea_id = 0 THEN 'General'
        ELSE tareas.nombre 
      END AS tarea_nombre
    FROM urls
    LEFT JOIN tareas ON urls.tarea_id = tareas.id
    WHERE urls.proyecto_id = $1
  `;
  const result = await db.query(query, [proyecto_id]);
  return result.rows;
}


async function mostrarProyectosUrls(proyecto_id) {
  const query = `
    SELECT urls.*, COALESCE(tareas.titulo_archivos, 'Generales') AS titulo_archivos
    FROM urls
    LEFT JOIN tareas ON urls.tarea_id = tareas.id
    WHERE urls.proyecto_id = $1
  `;
  const result = await db.query(query, [proyecto_id]);

  // Agrupar las URLs por titulo_archivos
  const urlsPorTarea = {};
  result.rows.forEach(function (url) {
    const tituloArchivos = url.titulo_archivos;
    if (!urlsPorTarea[tituloArchivos]) {
      urlsPorTarea[tituloArchivos] = [];
    }
    urlsPorTarea[tituloArchivos].push(url);
  });

  return urlsPorTarea;
}


async function mostrarUrlsRelacionadas(recetas) {
  let documentos = [...recetas];

  for (let rec of recetas) {
    const result = await db.query("SELECT documentos FROM tareas WHERE receta = ANY($1::text[])", [[rec.toString()]]);
    const tareas = result.rows;

    for (let tarea of tareas) {
      if (tarea.documentos && tarea.documentos.length > 0) {
        documentos.push(...tarea.documentos);
        const nuevosDocumentos = await mostrarUrlsRelacionadas(tarea.documentos);
        documentos = [...new Set([...documentos, ...nuevosDocumentos])];
      }
    }
  }

  return documentos;
}



async function mostrarDocumentosRelacionados(proyecto_id, recetas) {
  const query = `
    SELECT urls.*, COALESCE(tareas.titulo_archivos, 'Generales') AS titulo_archivos
    FROM urls
    LEFT JOIN tareas ON urls.tarea_id = tareas.id
    WHERE urls.proyecto_id = $1 AND urls.receta = ANY($2::int[])
  `;
  const result = await db.query(query, [proyecto_id, recetas.map(Number)]);

  // Agrupar las URLs por titulo_archivos
  const urlsPorTarea = {};
  result.rows.forEach(function (url) {
    const tituloArchivos = url.titulo_archivos;
    if (!urlsPorTarea[tituloArchivos]) {
      urlsPorTarea[tituloArchivos] = [];
    }
    urlsPorTarea[tituloArchivos].push(url);
  });

  return urlsPorTarea;
}

async function mostrarTareasUrls(proyecto_id, tarea_id) {
  const query = "SELECT * FROM urls WHERE proyecto_id = $1 AND tarea_id = $2";
  const result = await db.query(query, [proyecto_id, tarea_id]);
  return result.rows;
}



async function mostrarFormatos() {
  const query = "SELECT * FROM documentos";
  const result = await db.query(query);
  return result.rows;
}


// Verficado 20240813
async function mostrarDocumentos() {
  const query = "SELECT id, doc_nombre, doc_codigos FROM documentos";
  const result = await db.query(query);
  return result.rows;
}

// Verficado 20240813
async function mostrarDocumento(documento_id) {
  const query = "SELECT * FROM documentos WHERE id = $1";
  const result = await db.query(query, [documento_id]);
  return result.rows[0];
}

// Verificado 20240813
async function agregarDocumento(doc_nombre, doc_codigos, doc_texto) {
  const query = `
    INSERT INTO documentos (doc_nombre, doc_codigos, doc_texto)
    VALUES ($1, $2, $3)
    RETURNING id`; // Asegúrate de que 'id' es el nombre de la columna primaria en tu tabla 'documentos'
  const result = await db.query(query, [doc_nombre, doc_codigos, doc_texto]);
  return result.rows[0].id; // Devuelve el ID del documento creado
}


// Verficado 20240813
async function editarDocumento(doc_id, doc_nombre, doc_codigos, doc_texto) {
  const query = "UPDATE documentos SET doc_nombre = $1, doc_codigos = $2, doc_texto = $3 WHERE id = $4";
  const result = await db.query(query, [doc_nombre, doc_codigos, doc_texto, doc_id]);
  return result.rows;
}

// Verficado 20240813
async function linkearDocumentoPlan(id_documento, id_plan) {
  const query = "INSERT INTO documentos_plan (id_documento, id_plan) VALUES ($1, $2)";
  const result = await db.query(query, [id_documento, id_plan]);
  return result.rows;
}

// Verficado 20240813
async function eliminarDocumentoPlan(documento_id, plan_id) {
  const query = "DELETE FROM documentos_plan WHERE documento_id = $1 AND plan_id = $2";
  const result = await db.query(query, [documento_id, plan_id]);
  return result.rows;
}

async function buscarDocumentosPlan(plan_id) {
  const query = "SELECT documento_id FROM documentos_plan WHERE plan_id = $1";
  const result = await db.query(query, [plan_id]);
  return result.rows;
}

module.exports = {
  agregarUrl,
  mostrarProyectosUrls,
  mostrarTareasUrls,
  mostrarDocumentosRelacionados,
  mostrarUrlsRelacionadas,
  mostrarFormatos,
  mostrarDocumentos,
  mostrarDocumento,
  agregarDocumento,
  editarDocumento,
  linkearDocumentoPlan,
  eliminarDocumentoPlan,
  buscarDocumentosPlan,
  mostrarDescargables
};
