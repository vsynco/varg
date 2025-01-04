
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

async function mostrarWorker(req, res, pageTitle) {
  try {
    res.render("secciones/worker", {
      title: pageTitle,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function mostrarAguas(req, res, pageTitle) {
  try {
    res.render("secciones/aguas", {
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



async function mostrarMap(req, res, pageTitle) {
  try {
    res.render("secciones/map", {
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
  mostrarBlog,
  mostrarMap,
  mostrarWorker,
  mostrarAguas,
};
