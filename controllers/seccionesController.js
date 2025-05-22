
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


module.exports = {
  mostrarError,
  mostrarPortada,
  mostrarWorker,
};
