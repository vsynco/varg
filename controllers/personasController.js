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
  
  async function mostrarFormularioDeRegistro(req, res, pageTitle) {
    const userData = req.query.i || req.cookies.userData;
    res.render("acceso/acceso_registro", { title: pageTitle, userData, req });
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

  
  async function iniciarAutenticacionGoogle(req, res) {
    // Genera una URL de autenticación de Google y redirige al usuario a ella
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/photoslibrary.readonly',
        'https://www.googleapis.com/auth/documents.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/presentations.readonly',
        'https://www.googleapis.com/auth/calendar.events.readonly',
      ]
    });
    res.redirect(url);
  }
  
  async function manejarCallbackGoogle(req, res) {
    const { code } = req.query;
  
    // Intercambia el código de autorización por tokens
    const { tokens } = await client.getToken(code);
  
    // Verifica el token de id
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
  
    const { name: nombre, email, picture: foto_perfil } = ticket.getPayload();
  
    // Busca al usuario por correo electrónico en tu base de datos
    let usuario = await personas.obtenerPersonaEmail(email);
  
    if (!usuario) {
      // Si el usuario no existe, registra un nuevo usuario y almacena el `refresh_token`
      const userId = await personas.RegistrarUsuario(nombre, foto_perfil, email, tokens.access_token, tokens.refresh_token);
      usuario = { id: userId };
    } else {
      // Si el usuario existe, actualiza el `access_token` y el `refresh_token`
      await personas.ActualizarTokenGoogle(tokens.access_token, tokens.refresh_token, email);
    }
  
    // Almacena la información del usuario en la sesión
    req.session.user = usuario;
  
    // Redirige al usuario a la página que desees después de iniciar sesión
    res.redirect('/');
  }
  
  
  
  async function buscarPersonas(req, res) {
    const buscar = req.query.buscar;
    const clientes = await personas.buscarPersonas(buscar);
    res.json(clientes);
  }  

  async function buscarPersonasJuridicas(req, res) {
    console.log("buscarPersonasJuridicas")
    const buscar = req.query.buscar;
    const clientes = await personas.buscarPersonasJuridicas(buscar);
    res.json(clientes);
  }  

async function mostrarContacto(req, res, pageTitle) {
  const contacto_id = req.params.id;
  const contacto = await contactosModel.obtenerContacto(contacto_id)
  try {
    res.render("admin/contacto", {
      title: pageTitle,
      contacto
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}





//////////////////////////7
// NUEVA SECCIÓN CONTACTOS
///////////////////////////





async function mostrarContactosPersonas(req, res, pageTitle) {
  
  const personas_juridicas = await personas.obtenerPersonasJuridicasDatos()
  const personas_naturales = await personas.obtenerPersonaNatural()
  try {
    res.render("ad/contactos/contactos", {
      title: pageTitle,
      personas_juridicas,
      personas_naturales
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}

async function mostrarContactosGmail(req, res, pageTitle) {
  
  const personas_naturales = await personas.obtenerPersonaNaturalConToken()
  try {
    res.render("ad/gmail/gmails", {
      title: pageTitle,
      personas_naturales
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function agregarContactoForm(req, res, pageTitle) {
  try {
    res.render("ad/contactos/contacto_add", {
      title: pageTitle,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}

async function agregarContacto(req, res, pageTitle) {
  let contacto = "";
  if (req.body.persona === 'natural') {
    try {
      const contacto = await personas.insertarPersonaContacto(req.body.nombre,req.body.rut,req.body.domicilio,req.body.comuna,req.body.region,req.body.email,req.body.telefono)
      console.log(contacto)
      
      return res.redirect(`/contactos/natural/${contacto}`);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Hubo un error al cargar sección");
    }
  } else {
    try {
      const contacto = await personas.insertarPersonaJuridicaContacto(req.body.nombre,req.body.rut,req.body.domicilio,req.body.comuna,req.body.region)
      console.log(contacto)
      return res.redirect(`/contactos/juridica/${contacto}`);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Hubo un error al cargar sección");
    }
  }

  
}

async function mostrarContactoNatural(req, res, pageTitle) {
  const contacto = await personas.mostrarContactoNatural(req.params.id)
  const natural = 'true'
  console.log(contacto)
  try {
    res.render("ad/contactos/contacto", {
      title: pageTitle,
      contacto,
      natural
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function mostrarContactoNaturalConToken(req, res, pageTitle) {
  try {
    const id = req.params.id;
    const pageToken = req.query.pageToken || "";
    const contacto = await personas.mostrarContactoNatural(id);
    const persona = await personas.obtenerPersonaId(id);
    let accessToken = persona.token;
    const refreshToken = persona.token_refresh; // Asegúrate de que también estés obteniendo el refresh token
    const natural = 'true';

    // Define el tamaño de página
    const pageSize = 100; // Ajusta según tus necesidades

    // Construye la URL con el token de página y el tamaño de página
    const mediaItemsUrl = `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=${pageSize}&pageToken=${pageToken}`;
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    // Función para hacer la solicitud a la API de Google Photos
    function makeRequest(token) {
      https.get(mediaItemsUrl, { ...options, headers: { Authorization: `Bearer ${token}` } }, (mediaRes) => {
        let data = "";

        mediaRes.on("data", (chunk) => {
          data += chunk;
        });

        mediaRes.on("end", async () => {
          try {
            if (mediaRes.statusCode === 401) {
              // El token ha expirado, intenta refrescarlo
              console.log("Token expirado. Intentando refrescar...");

              // Llama a la función para obtener un nuevo access token
              accessToken = await refreshAccessToken(refreshToken, process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, id);
              // Guarda el nuevo token en la base de datos si es necesario
              persona.token = accessToken;
              await persona.save();

              // Vuelve a intentar la solicitud con el nuevo token
              makeRequest(accessToken);
              return;
            }

            // Si la respuesta fue exitosa
            const response = JSON.parse(data);
            const mediaItems = response.mediaItems || []; // Asegúrate de que mediaItems sea un arreglo

            // Procesar los elementos multimedia
            mediaItems.forEach((mediaItem) => {
              mediaItem.esVideo = mediaItem.mimeType.startsWith("video/");
              mediaItem.maxQualityUrl = `${mediaItem.baseUrl}=d`;

              if (mediaItem.esVideo) {
                mediaItem.downloadUrl = `${mediaItem.baseUrl}=dv`; // Asegúrate de usar =dv
              }
            });

            // Renderiza la vista con los datos
            res.render("ad/gmail/gmail", {
              title: pageTitle,
              contacto,
              natural,
              persona,
              mediaItems, // Pasa los medios a la vista (incluso si es un arreglo vacío)
              nextPageToken: response.nextPageToken, // Pasa el token de página siguiente
            });
          } catch (parseError) {
            console.error("Error al analizar la respuesta de Google Photos:", parseError);
            res.status(500).send("Error al procesar los datos multimedia");
          }
        });
      }).on("error", (error) => {
        console.error("Error en la solicitud HTTPS:", error);
        res.status(500).send("Error en la solicitud a Google Photos");
      });
    }

    // Inicia la solicitud
    makeRequest(accessToken);

  } catch (error) {
    console.error("Error general:", error);
    res.status(500).send("Hubo un error al cargar la sección");
  }
}

// Función para refrescar el token
async function refreshAccessToken(refreshToken, clientId, clientSecret, userId) {
  try {
    // Realiza la solicitud para obtener un nuevo access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    // Analiza la respuesta
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error al refrescar el token: ${data.error_description || 'Unknown error'}`);
    }

    const newAccessToken = data.access_token;

    // Actualiza el nuevo access token en la base de datos usando el modelo
    await personas.actualizarAccessToken(userId, newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("Error al refrescar el token de acceso:", error);
    throw error;
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














async function mostrarContactoJuridica(req, res, pageTitle) {
  
  const usuarios = await personas.obtenerCondominoUsuariosContactos(req.params.id)
  const contacto = await personas.mostrarContactoJuridica(req.params.id)
  
  const natural = 'false'
  console.log(contacto)
  try {
    res.render("ad/contactos/contacto", {
      title: pageTitle,
      contacto,
      usuarios,
      natural
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}

//////////////////////////7
// PERSONAS JURÍDICAS
///////////////////////////


// PersonaJuridicas

async function mostrarPersonasJuridicas(req, res, pageTitle) {
  const personas_juridicas = await personas.obtenerPersonasJuridicas()
  try {
    res.render("ad/personas_juridicas/juridicas_listado", {
      title: pageTitle,
      personas_juridicas,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}

async function mostrarPersonaJuridica(req, res, pageTitle) {
  const persona_juridica_id = req.params.id;
  const persona_juridica = await personas.obtenerPersonaJuridica(persona_juridica_id)
  const usuarios = await personas.obtenerCondominoUsuariosContactos(persona_juridica_id)
  try {
    res.render("ad/personas_juridicas/juridica", {
      title: pageTitle,
      persona_juridica,
      usuarios,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}

async function buscarPersonaJuridicas(req, res) {
  const buscar = req.query.buscar;
  const personas_juridicas = await personas.buscarPersonasJuridicas(buscar);
  res.json(personas_juridicas);
}  

async function agregarPersonaJuridica(req, res, pageTitle) {
  try {
    res.render("ad/personas_juridicas/juridica_agregar", {
      title: pageTitle,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}




async function mostrarMisPersonaJuridicas(req, res, pageTitle) {
  const personas_juridicas = await clientesModel.obtenerClientesPropios(user_sesion.id)
  const tipo = "mis-personas_juridicas"
  try {
    res.render("gestion/personas_juridicas_listado", {
      title: pageTitle,
      personas_juridicas,
      tipo,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}



async function agregarPersonaJuridicaPost(req, res, pageTitle) {
  await personas.agregarPersonaJuridica(req.body.nombre,req.body.rut,req.body.domicilio,req.body.comuna)
  try {
    return res.redirect("/personas/juridicas/");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}





async function asignarUsuario(req, res, pageTitle) {
  await personas.asignarUsuario(req.body.user_id, req.body.id, "administrar")
  try {
    return res.redirect(`/contactos/juridica/${req.body.id}`);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function asignarPrincipal(req, res, pageTitle) {
  const principal = await personas.asignarPrincipal(req.params.id)
  await personas.desasignarPrincipal(req.params.id, principal.id_persona_juridica)
  try {
    return res.redirect(`/contactos/juridica/${principal.id_persona_juridica}`);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


// Mis personas_juridicas

async function mostrarMiPersonaJuridica(req, res, pageTitle) {
  const persona_juridica_id = req.params.id;
  const user_id =  user_sesion.id;
  const verificacion = await personas.verificarMiPersonaJuridica(persona_juridica_id, user_id)

  if (verificacion < 1) {
    return res.redirect('/mispersonas_juridicas');
  }


  const persona_juridica = await personas.obtenerMiPersonaJuridica(persona_juridica_id)
  const tipo = "mis-personas_juridicas"
  try {
    res.render("gestion/persona_juridica", {
      title: pageTitle,
      persona_juridica,
      tipo
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function agregarMiPersonaJuridica(req, res, pageTitle) {
  const tipo = "mis-personas_juridicas"
  try {
    res.render("gestion/persona_juridica_agregar", {
      title: pageTitle,
      tipo
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
}


async function agregarMiPersonaJuridicaPost(req, res, pageTitle) {
  
  const cond = await personas.agregarPersonaJuridica(req.body.nombre,req.body.rut,req.body.domicilio,req.body.comuna)
  await personas.asignarUsuario(user_sesion.id, cond.id, "administrar")
  try {
    return res.redirect("/mis-personas_juridicas/");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Hubo un error al cargar sección");
  }
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
    mostrarFormularioDeRegistro,
    cerrarSesion,
    iniciarSesion,
    registrarPersona,
    iniciarAutenticacionGoogle,
    manejarCallbackGoogle,
    buscarPersonas,
    mostrarContacto,
    mostrarPersonasJuridicas,
    mostrarPersonaJuridica,
    buscarPersonaJuridicas,
    agregarPersonaJuridica,
    mostrarMisPersonaJuridicas,
    mostrarMiPersonaJuridica,
    agregarMiPersonaJuridica,
    agregarMiPersonaJuridicaPost,
    agregarPersonaJuridicaPost,
    asignarUsuario,
    asignarPrincipal,
    buscarPersonasJuridicas,
    mostrarContactosPersonas,
    agregarContactoForm,
    agregarContacto,
    mostrarContactoNatural,
    mostrarContactoJuridica,
    mostrarContactosGmail,
    mostrarContactoNaturalConToken
  };