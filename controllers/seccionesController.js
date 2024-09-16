const seccionesModel = require("../models/secciones"); // Reemplaza con el modelo real que estás utilizando
const productosModel = require("../models/productos");
// gestionesController
async function mostrarError(req, res, pageTitle) {
  res.redirect("/");
}

async function mostrarPortada(req, res, pageTitle) {
  try {
    res.render("secciones/portada", {
      title: pageTitle,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}

async function mostrarContacto(req, res, pageTitle) {
  try {
    res.render("secciones/contacto", {
      title: pageTitle,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function mostrarBlog(req, res, pageTitle) {
  try {
    res.render("secciones/blog", {
      title: pageTitle,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function mostrarOnly(req, res, pageTitle) {
  try {
    res.render("secciones/only", {
      title: pageTitle,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function mostrarClases(req, res, pageTitle) {
  const clases = await seccionesModel.obtenerClases()
  const clases_pendientes = await seccionesModel.obtenerClasesPendientes()
  const categorias_clases = await seccionesModel.obtenerCategoriasDeClases()
  try {
    res.render("secciones/clases", {
      title: pageTitle,
      clases,
      clases_pendientes,
      categorias_clases
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}

async function mostrarClasesCategoria(req, res, pageTitle) {
  const clase_categoria = req.params.categoria;
  const categorias_clases = await seccionesModel.obtenerCategoriasDeClases(clase_categoria)
  const clases = await seccionesModel.obtenerClasesCategoria(clase_categoria)
  try {
    res.render("secciones/clases", {
      title: pageTitle,
      clases,
      categorias_clases,
      clase_categoria
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}

async function mostrarClasesBusqueda(req, res, pageTitle) {
  const busqueda = req.query.busqueda;
  const clase_categoria = req.params.categoria;
  const categorias_clases = await seccionesModel.obtenerCategoriasDeClases(clase_categoria)
  const clases = await seccionesModel.buscarClases(busqueda)
  try {
    res.render("secciones/clases", {
      title: pageTitle,
      clases,
      categorias_clases,
      clase_categoria
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}



async function mostrarRepositorio(req, res, pageTitle) {
  const documentos = await seccionesModel.obtenerDocumentos()
  const categorias_repositorio = await seccionesModel.obtenerCategoriasDeRepositorio()
  try {
    res.render("secciones/repositorio", {
      title: pageTitle,
      documentos,
      categorias_repositorio
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function mostrarRepositorioCategoria(req, res, pageTitle) {
  const repositorio_categoria = req.params.categoria;
  const categorias_repositorio = await seccionesModel.obtenerCategoriasDeRepositorio(repositorio_categoria)
  const documentos = await seccionesModel.obtenerRepositorioCategoria(repositorio_categoria)
  try {
    res.render("secciones/repositorio", {
      title: pageTitle,
      documentos,
      categorias_repositorio,
      repositorio_categoria
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}

async function mostrarRepositorioBusqueda(req, res, pageTitle) {
  const busqueda = req.query.busqueda;
  const repositorio_categoria = req.params.categoria;
  const categorias_repositorio = await seccionesModel.obtenerCategoriasDeRepositorio(repositorio_categoria)
  const documentos = await seccionesModel.buscarRepositorio(busqueda)
  try {
    res.render("secciones/repositorio", {
      title: pageTitle,
      documentos,
      categorias_repositorio,
      repositorio_categoria
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}












async function mostrarPreguntas(req, res, pageTitle) {
  const preguntas = await seccionesModel.obtenerPreguntas()
  const categorias_preguntas = await seccionesModel.obtenerCategoriasDePreguntas()
  try {
    res.render("secciones/nosotros", {
      title: pageTitle,
      preguntas,
      categorias_preguntas
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function mostrarPreguntasCategoria(req, res, pageTitle) {
  const preguntas_categoria = req.params.categoria;
  const categorias_preguntas = await seccionesModel.obtenerCategoriasDePreguntas(preguntas_categoria)
  const preguntas = await seccionesModel.obtenerPreguntasCategoria(preguntas_categoria)
  try {
    res.render("secciones/nosotros", {
      title: pageTitle,
      preguntas,
      categorias_preguntas,
      preguntas_categoria
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}

async function mostrarPreguntasBusqueda(req, res, pageTitle) {
  const busqueda = req.query.busqueda;
  const preguntas_categoria = req.params.categoria;
  const categorias_preguntas = await seccionesModel.obtenerCategoriasDePreguntas(preguntas_categoria)
  
  const preguntas = await seccionesModel.buscarPreguntas(busqueda)
  try {
    res.render("secciones/nosotros", {
      title: pageTitle,
      preguntas,
      categorias_preguntas,
      preguntas_categoria
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function mostrarPreguntasDetalle(req, res, pageTitle) {
  const pregunta_id = req.params.id;
  const pregunta = await seccionesModel.obtenerPregunta(pregunta_id)
  try {
    res.render("secciones/nosotros_detalle", {
      title: pageTitle,
      pregunta,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}




async function mostrarPublicaciones(req, res, pageTitle) {
  const productos = await productosModel.obtenerProductos()
  try {
    res.render("secciones/invitacion", {
      title: pageTitle,
      productos
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function mostrarPublicacionesCategoria(req, res, pageTitle) {
  const publicaciones_categoria = req.params.categoria;
  const categorias_publicaciones = await seccionesModel.obtenerCategoriasDePublicaciones(publicaciones_categoria)
  const publicaciones = await seccionesModel.obtenerPublicacionesCategoria(publicaciones_categoria)
  try {
    res.render("secciones/publicaciones", {
      title: pageTitle,
      publicaciones,
      categorias_publicaciones,
      publicaciones_categoria
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}

async function mostrarPublicacionesBusqueda(req, res, pageTitle) {
  const busqueda = req.query.busqueda;
  const publicaciones_categoria = req.params.categoria;
  const categorias_publicaciones = await seccionesModel.obtenerCategoriasDePublicaciones(publicaciones_categoria)
  const publicaciones = await seccionesModel.buscarPublicaciones(busqueda)
  try {
    res.render("secciones/publicaciones", {
      title: pageTitle,
      publicaciones,
      categorias_publicaciones,
      publicaciones_categoria
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function mostrarPublicacionesDetalle(req, res, pageTitle) {
  const publicacion_id = req.params.id;
  const publicacion = await seccionesModel.obtenerPublicacion(publicacion_id)
  try {
    res.render("secciones/publicaciones_detalle", {
      title: pageTitle,
      publicacion,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}

module.exports = {
  mostrarPortada,
  mostrarClases,
  mostrarRepositorio,
  mostrarPreguntas,
  mostrarPreguntasDetalle,
  mostrarPublicaciones,
  mostrarPublicacionesDetalle,
  mostrarError,
  mostrarClasesCategoria,
  mostrarClasesBusqueda,
  mostrarRepositorioCategoria,
  mostrarRepositorioBusqueda,
  mostrarPreguntasCategoria,
  mostrarPreguntasBusqueda,
  mostrarPublicacionesCategoria,
  mostrarPublicacionesBusqueda,
  mostrarPublicacionesDetalle,
  mostrarOnly,
  mostrarContacto,
  mostrarBlog
};
