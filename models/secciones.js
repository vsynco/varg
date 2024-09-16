const db = require("../config/conexion.js");

async function obtenerClases() {
    const query = "SELECT * FROM clases WHERE emitido = true;";
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }

async function obtenerClasesPendientes() {
    const query = "SELECT * FROM clases WHERE emitido = false;";
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }

async function obtenerProximaClase() {
    const query = `
      SELECT *
      FROM clases
      WHERE emitido = false 
      ORDER BY fecha_clase ASC
      LIMIT 1;
    `;
    const values = [];
    const result = await db.query(query, values);
    return result.rows[0];
  }

async function buscarClases(busqueda) {
    // Construye la consulta SQL con el parámetro de búsqueda
    const query = `
    SELECT * FROM clases
    WHERE (nombre ILIKE '%${busqueda}%'
       OR categoria ILIKE '%${busqueda}%'
       OR resumen ILIKE '%${busqueda}%')
       AND emitido = true;
  `;
  
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }

 async function obtenerCategoriasDeClases(clase_categoria) {
  const query = "SELECT DISTINCT categoria, categoria_slug FROM clases WHERE emitido = true;";
  const values = [];
  const result = await db.query(query, values);

  const categorias = result.rows.map((row) => {
    return {
      categoria: row.categoria,
      categoria_slug: row.categoria_slug,
      marcado: row.categoria_slug === clase_categoria,
    };
  });
  return categorias;
}

  async function obtenerClasesCategoria(clase_categoria) {
    const query = "SELECT * FROM clases WHERE categoria_slug = $1";
    const values = [clase_categoria]; // agregar clase_categoria como valor
    const result = await db.query(query, values);
    return result.rows;
  }


  async function obtenerPreguntas() {
    const query = "SELECT * FROM preguntas";
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }

  async function buscarPreguntas(busqueda) {
    const query = `
    SELECT * FROM preguntas
    WHERE (pregunta ILIKE '%${busqueda}%'
       OR respuesta ILIKE '%${busqueda}%'
       OR resumen ILIKE '%${busqueda}%');
  `;
  
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }

 async function obtenerCategoriasDePreguntas(preguntas_categoria) {
  const query = "SELECT DISTINCT categoria, categoria_slug FROM preguntas;";
  const values = [];
  const result = await db.query(query, values);

  const categorias = result.rows.map((row) => {
    return {
      categoria: row.categoria,
      categoria_slug: row.categoria_slug,
      marcado: row.categoria_slug === preguntas_categoria,
    };
  });
  return categorias;
}

  async function obtenerPreguntasCategoria(preguntas_categoria) {
    const query = "SELECT * FROM preguntas WHERE categoria_slug = $1";
    const values = [preguntas_categoria]; // agregar clase_categoria como valor
    const result = await db.query(query, values);
    return result.rows;
  }


  async function obtenerPregunta(id) {
    const query = "SELECT * FROM preguntas WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }



  async function obtenerPublicaciones() {
    const query = "SELECT * FROM publicaciones ORDER BY fecha DESC";
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }


  async function obtenerUltimasPublicaciones() {
    const query = `
      SELECT * FROM publicaciones
      ORDER BY fecha DESC
      LIMIT 4;
    `;
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }

  async function buscarPublicaciones(busqueda) {
    // Construye la consulta SQL con el parámetro de búsqueda
    const query = `
    SELECT * FROM publicaciones
    WHERE (titulo ILIKE '%${busqueda}%'
       OR bajada ILIKE '%${busqueda}%'
       OR contenido ILIKE '%${busqueda}%')
  `;
  
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }

 async function obtenerCategoriasDePublicaciones(publicaciones_categoria) {
  const query = "SELECT DISTINCT categoria, categoria_slug FROM publicaciones;";
  const values = [];
  const result = await db.query(query, values);

  const categorias = result.rows.map((row) => {
    return {
      categoria: row.categoria,
      categoria_slug: row.categoria_slug,
      marcado: row.categoria_slug === publicaciones_categoria,
    };
  });
  return categorias;
}

  async function obtenerPublicacionesCategoria(publicaciones_categoria) {
    const query = "SELECT * FROM publicaciones WHERE categoria_slug = $1";
    const values = [publicaciones_categoria]; // agregar clase_categoria como valor
    const result = await db.query(query, values);
    return result.rows;
  }


  async function obtenerPublicacion(id) {
    const query = "SELECT * FROM publicaciones WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function obtenerDocumentos() {
    const query = "SELECT * FROM repositorio";
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }


  async function buscarRepositorio(busqueda) {
    // Construye la consulta SQL con el parámetro de búsqueda
    const query = `
    SELECT * FROM repositorio
    WHERE (nombre ILIKE '%${busqueda}%'
       OR resumen ILIKE '%${busqueda}%')
  `;
  
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }

 async function obtenerCategoriasDeRepositorio(repositorio_categoria) {
  const query = "SELECT DISTINCT categoria, categoria_slug FROM repositorio;";
  const values = [];
  const result = await db.query(query, values);

  const categorias = result.rows.map((row) => {
    return {
      categoria: row.categoria,
      categoria_slug: row.categoria_slug,
      marcado: row.categoria_slug === repositorio_categoria,
    };
  });
  return categorias;
}

  async function obtenerRepositorioCategoria(repositorio_categoria) {
    const query = "SELECT * FROM repositorio WHERE categoria_slug = $1";
    const values = [repositorio_categoria];
    const result = await db.query(query, values);
    return result.rows;
  }

  
  module.exports = {
    obtenerClases,
    obtenerPreguntas,
    obtenerPregunta,
    obtenerPublicaciones,
    obtenerPublicacion,
    obtenerDocumentos,
    obtenerClasesCategoria,
    obtenerCategoriasDeClases,
    buscarClases,
    obtenerClasesPendientes,
    obtenerProximaClase,
    obtenerCategoriasDePreguntas,
    obtenerPreguntasCategoria,
    buscarPreguntas,
    obtenerCategoriasDePublicaciones,
    obtenerPublicacionesCategoria,
    buscarPublicaciones,
    obtenerCategoriasDeRepositorio,
    obtenerRepositorioCategoria,
    buscarRepositorio,
    obtenerUltimasPublicaciones
  };
  