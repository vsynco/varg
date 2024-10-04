const proyectosModel = require("../models/proyectos");

async function mostrarError(req, res, pageTitle) {
  res.redirect("/");
}

async function mostrarPortada(req, res, pageTitle) {
 const proyectos = await proyectosModel.obtenerTodosProyectos();
  try {
    res.render("secciones/portada", {
      title: pageTitle,
      proyectos: proyectos,
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

module.exports = {
  mostrarError,
  mostrarPortada,
  mostrarOnly,
  mostrarContacto,
  mostrarBlog
};
