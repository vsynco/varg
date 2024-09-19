async function mostrarJaskier(req, res, pageTitle) {
    try {
      res.render("proyectos/jaskier", {
        title: pageTitle,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Hubo un error al cargar sección");
    }
  }

  async function mostrarArmis(req, res, pageTitle) {
    try {
      res.render("proyectos/armis", {
        title: pageTitle,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Hubo un error al cargar sección");
    }
  }

  async function mostrarAuda(req, res, pageTitle) {
    try {
      res.render("proyectos/auda", {
        title: pageTitle,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Hubo un error al cargar sección");
    }
  }

  async function mostrarBuzo(req, res, pageTitle) {
    try {
      res.render("proyectos/buzo", {
        title: pageTitle,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Hubo un error al cargar sección");
    }
  }

  async function mostrarPuig(req, res, pageTitle) {
    try {
      res.render("proyectos/puig", {
        title: pageTitle,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Hubo un error al cargar sección");
    }
  }

  async function mostrarSynco(req, res, pageTitle) {
    try {
      res.render("proyectos/synco", {
        title: pageTitle,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Hubo un error al cargar sección");
    }
  }

  async function mostrarClubon(req, res, pageTitle) {
    try {
      res.render("proyectos/clubon", {
        title: pageTitle,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Hubo un error al cargar sección");
    }
  }

  module.exports = {
    mostrarJaskier,
    mostrarArmis,
    mostrarAuda,
    mostrarBuzo,
    mostrarPuig,
    mostrarSynco,
    mostrarClubon
  };
  