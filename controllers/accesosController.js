


async function mostrarPuig(req, res, pageTitle) {
    res.render("landings/puig/portada", {
      title: pageTitle,
    });
  }



  module.exports = {
    mostrarPuig,
  };