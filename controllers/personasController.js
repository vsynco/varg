const personas = require("../models/personas");
const https = require("https");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK);

async function mostrarPersonas(req, res, pageTitle) {
    const page = req.query.page || 1;
    const perPage = 8;
  
    try {
      const offset = (page - 1) * perPage;
  
      const listaPersonas = await personas.obtenerPersonaPaginado(
        perPage,
        offset
      );
  
      const totalPersonas = await personas.obtenerTotalPersonas(); // Debes implementar esta función en tu modelo
      const totalPages = Math.ceil(totalPersonas / perPage);
  
      res.render("ad/personas_naturales/personas", {
        title: pageTitle,
        personas: listaPersonas,
        totalPages: totalPages,
        currentPage: page,
      });
    } catch (error) {
      console.error("Error al obtener personas:", error);
      res.status(500).send("Error al obtener personas.");
    }
  }

  async function mostrarPerfil(req, res, pageTitle) {
    try {
      const id = user_sesion.id;
      if (isNaN(id) || id <= 0) {
        throw new Error("ID de persona no válido.");
      }
  
      const persona = await personas.obtenerPersonaId(id);
      res.render("personas/persona_perfil", {
        title: pageTitle,
        persona,
      });
    } catch (error) {
      console.error("Error al obtener persona:", error);
      res.status(500).send("Error al obtener persona.");
    }
  }
  
  async function mostrarPersonaPorId(req, res, pageTitle, pageToken) {
    try {
      const id = req.params.id;
  
      const pageToken = req.query.pageToken || "";
      const persona = await personas.obtenerPersonaId(id);
      const accessToken = persona.token;
  
      // Define el tamaño de página que desees
      const pageSize = 100; // Ajusta según tus necesidades
  
      // Construye la URL con el token de página (pageToken) y el tamaño de página (pageSize)
      const mediaItemsUrl = `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=${pageSize}&pageToken=${pageToken}`;
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
  
      const mediaReq = https.request(mediaItemsUrl, options, (mediaRes) => {
        let data = "";
  
        mediaRes.on("data", (chunk) => {
          data += chunk;
        });
  
        mediaRes.on("end", () => {
          const response = JSON.parse(data);
  
          const mediaItems = response.mediaItems;
  
          if (mediaItems && mediaItems.length > 0) {
            // Ahora, para cada elemento multimedia
            mediaItems.forEach((mediaItem) => {
              // Añade una propiedad "esVideo" para distinguir si es un video o una imagen
              mediaItem.esVideo = mediaItem.mimeType.startsWith("video/");
  
              // Ajusta la URL para obtener la máxima calidad
              mediaItem.maxQualityUrl = mediaItem.baseUrl + "=d"; // Esto obtendrá la máxima calidad
              // Si es un video, proporciona un enlace de descarga
              if (mediaItem.esVideo) {
                mediaItem.downloadUrl = `${mediaItem.baseUrl}=dv`; // Asegúrate de usar =dv
              }
            });
  
            // Renderiza la vista del persona con los medios y el token de página siguiente
            res.render("personas/persona", {
              title: pageTitle,
              persona,
              mediaItems, // Pasa los medios a la vista
              nextPageToken: response.nextPageToken, // Pasa el token de página siguiente
            });
          } else {
            // No hay medios, no se muestra nada
            // Antes de renderizar la vista
            let mediaItems = [];
            if (mediaItems) {
              mediaItems = []; // Asigna un arreglo vacío si mediaItems no está definido
            }
  
            res.render("ad/personas_naturales/persona", {
              title: pageTitle,
              persona,
              mediaItems, // Pasa los medios a la vista (incluso si es un arreglo vacío)
              nextPageToken: response.nextPageToken, // Pasa el token de página siguiente
            });
          }
        });
      });
  
      mediaReq.on("error", (error) => {
        console.error("Error al obtener los medios:", error);
        // En caso de error, no se muestra nada
        res.render("personas/persona", {
          title: pageTitle,
          persona,
        });
      });
  
      mediaReq.end();
    } catch (error) {
      console.error("Error al obtener persona:", error);
      res.status(500).send("Error al obtener persona.");
    }
  }
  
  
  // ELIMINAR
  
  async function mostrarFormularioYAgregarPersona(req, res, pageTitle) {
    try {
      res.render("personas/personas_crear", {
        title: pageTitle,
      });
    } catch (error) {
      console.error("Error al agregar persona:", error);
      res.status(500).send("Error al agregar persona.");
    }
  }
  
  async function mostrarFormularioYEditarPersona(req, res, pageTitle) {
    try {
      const id = req.params.id;
      const persona = await personas.obtenerPersonaId(id);
  
      res.render("ad/personas_naturales/personas_editar", {
        title: pageTitle,
        persona,
      });
    } catch (error) {
      console.error("Error al obtener persona:", error);
      res.status(500).send("Error al obtener persona.");
    }
  }
  
  async function editarPersona(req, res) {
    const { id, nombre, email, foto_perfil } = req.body;
    try {
      await personas.editarPersona(id,nombre,email,foto_perfil);
      res.redirect("/personas/naturales/");
    } catch (error) {
      console.error("Error al editar persona:", error);
      res.status(500).send("Error al editar persona.");
    }
  }
  
  async function eliminarPersona(req, res) {
    const { id } = req.params;
  
    try {
      // Llama a la función del modelo para eliminar el Persona
      await personas.eliminarPersona(id);
      res.redirect("/personas/naturales/");
    } catch (error) {
      console.error("Error al eliminar persona:", error);
      res.status(500).send("Error al eliminar persona.");
    }
  }
  
  async function desconectarPlan(req, res) {
    try {
      const persona = await Persona.findById(req.params.id);
      const planId = req.params.planId;
  
      // Eliminar la plan del persona
      persona.planes.pull(planId);
      await persona.save();
  
      res.redirect(`/personas/editar/${persona.id}`);
    } catch (error) {
      console.error("Error al desconectar plan:", error);
      res.status(500).send("Error al desconectar plan.");
    }
  }
  
  // Función asincrónica para asociar una plan al persona
  async function asociarPlan(req, res) {
    try {
      const persona = await Persona.findById(req.params.id);
      const planId = req.body.plan_id; // Supongamos que el campo de selección se llama 'plan_id'
  
      // Asociar la plan al persona si aún no está asociada
      if (!persona.planes.includes(planId)) {
        persona.planes.push(planId);
        await persona.save();
      }
  
      res.redirect(`/ad/personas_naturales/editar/${persona.id}`);
    } catch (error) {
      console.error("Error al asociar plan:", error);
      res.status(500).send("Error al asociar plan.");
    }
  }


async function mostrarFormularioDeAcceso(req, res, pageTitle) {
    res.render("acceso/acceso_login", {
      title: pageTitle,
      message: req.flash("error"),
    });
  }
  
  async function mostrarPerfil(req, res, pageTitle) {
    try {
      const usuario = await personas.obtenerPersonaId(user_sesion.id);
      res.render("acceso/acceso_perfil", {
        title: pageTitle,
        usuario,
      });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      res.status(500).send("Error al obtener usuario.");
    }
  }
  
  function cerrarSesion(req, res) {
    req.session = null;
    res.redirect('/');
  }
  
  async function iniciarSesion(req, res) {
    const { email, contrasena } = req.body;
    const usuario = await personas.obtenerPersonaEmail(email);
  
    if (!usuario) {
      req.flash('error_msg', 'El correo electrónico es incorrecto');
      res.redirect('/acceso');
      return;
    }
  
    const match = await bcrypt.compare(contrasena, usuario.contrasena);
  
    if (!match) {
      req.flash('error_msg', 'La contraseña es incorrecta');
      res.redirect('/acceso');
      return;
    }
  
    req.session.user = usuario;
    const redirectTo = req.session.redirectTo || '/';
    delete req.session.redirectTo;
    res.redirect(redirectTo);
  };
  
  async function registrarPersona(req, res) {
    let { nombre, email, contrasena, telefono, afiliado } = req.body;

    // Convertir email a minúsculas
    email = email.toLowerCase();

    // Convertir cada palabra del nombre a título (primera letra en mayúscula)
    nombre = nombre.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

    // Verificar si el email ya está registrado
    const usuario = await personas.obtenerPersonaEmail(email);
    if (usuario) {
        return res.status(409).send({ message: "El correo electrónico ya está registrado." });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar nueva persona
    const userId = await personas.insertarPersona({ nombre, email, contrasena: hashedPassword, telefono, afiliado });

    // Crear sesión del usuario
    req.session.user = { id: userId };
    res.redirect('/');
}


module.exports = {
    mostrarPersonas,
    mostrarPerfil,
    mostrarPersonaPorId,
    mostrarFormularioYAgregarPersona,
    mostrarFormularioYEditarPersona,
    editarPersona,
    eliminarPersona,
    desconectarPlan,
    asociarPlan,
    mostrarFormularioDeAcceso,
    mostrarPerfil,
    cerrarSesion,
    iniciarSesion,
    registrarPersona,
  };