const https = require("https");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK);
const client2 = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACKS);
const { google } = require('googleapis');

const accesosModel = require("../models/accesos");

async function mostrarPuig(req, res, pageTitle) {
    res.render("landings/puig/portada", {
      title: pageTitle,
    });
  }




  async function mostrarContactoNaturalConToken(req, res, pageTitle) {
  try {
    const id = req.params.id;
    const pageToken = req.query.pageToken || "";
    const contacto = await accesosModel.mostrarContactoNatural(id);
    const persona = await accesosModel.obtenerPersonaId(id);
    let accessToken = persona.token;
    const refreshToken = persona.token_refresh;
    const pageSize = 100;

    let mediaItemsUrl = `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=${pageSize}`;
    if (pageToken) mediaItemsUrl += `&pageToken=${pageToken}`;

    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    function makeRequest(token) {
      https.get(mediaItemsUrl, { ...options, headers: { Authorization: `Bearer ${token}` } }, (mediaRes) => {
        let data = "";

        mediaRes.on("data", (chunk) => {
          data += chunk;
        });

        mediaRes.on("end", async () => {
          try {
            if (mediaRes.statusCode === 401) {
              try {
                accessToken = await refreshAccessToken(refreshToken, process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, id);
                makeRequest(accessToken);
                return;
              } catch (refreshError) {
                if (refreshError.message === 'REFRESH_TOKEN_EXPIRED') {
                  // Redirigir al usuario para que vuelva a autenticarse
                  return res.render("error", {
                    title: "Reautenticación requerida",
                    message: "Tu sesión ha expirado. Por favor, vuelve a conectar tu cuenta de Google.",
                    redirectUrl: "/auth/google/photos"
                  });
                }
                throw refreshError;
              }
            }

            const response = JSON.parse(data);
            const mediaItems = response.mediaItems || [];
            const nextPageToken = response.nextPageToken;

            mediaItems.forEach((mediaItem) => {
              mediaItem.maxQualityUrl = `${mediaItem.baseUrl}=d`;
              mediaItem.downloadUrl = `${mediaItem.baseUrl}=dv`;
            });

            res.render("gmail/gmail", {
              title: pageTitle,
              contacto,
              persona,
              mediaItems,
              nextPageToken,
              currentPage: pageToken || "Inicio",
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

    makeRequest(accessToken);

  } catch (error) {
    console.error("Error general:", error);
    res.status(500).send("Hubo un error al cargar la sección");
  }
}

  


  async function mostrarVideos(req, res, pageTitle) {
  try {
    const id = req.params.id;
    const pageToken = req.query.pageToken || "";
    const contacto = await accesosModel.mostrarContactoNatural(id);
    const persona = await accesosModel.obtenerPersonaId(id);
    let accessToken = persona.token;
    const refreshToken = persona.token_refresh;
    const pageSize = 100;

    const mediaItemsUrl = `https://photoslibrary.googleapis.com/v1/mediaItems:search`;

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pageSize: pageSize,
        pageToken: pageToken,
        filters: {
          mediaTypeFilter: {
            mediaTypes: ["VIDEO"],
          },
        },
      }),
    };

    function makeRequest(token) {
      const req = https.request(mediaItemsUrl, { ...options, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }, (mediaRes) => {
        let data = "";

        mediaRes.on("data", (chunk) => {
          data += chunk;
        });

        mediaRes.on("end", async () => {
          try {
            if (mediaRes.statusCode === 401) {
              try {
                accessToken = await refreshAccessToken(refreshToken, process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, id);
                makeRequest(accessToken);
                return;
              } catch (refreshError) {
                if (refreshError.message === 'REFRESH_TOKEN_EXPIRED') {
                  return res.render("error", {
                    title: "Reautenticación requerida",
                    message: "Tu sesión ha expirado. Por favor, vuelve a conectar tu cuenta de Google.",
                    redirectUrl: "/auth/google/photos"
                  });
                }
                throw refreshError;
              }
            }

            const response = JSON.parse(data);
            const mediaItems = response.mediaItems || [];
            const nextPageToken = response.nextPageToken;

            const videos = mediaItems.filter((mediaItem) => mediaItem.mimeType.startsWith("video/"));

            videos.forEach((video) => {
              video.maxQualityUrl = `${video.baseUrl}=d`;
              video.downloadUrl = `${video.baseUrl}=dv`;
            });

            res.render("gmail/video", {
              title: pageTitle,
              contacto,
              persona,
              mediaItems: videos,
              nextPageToken,
              currentPage: pageToken || "Inicio",
            });
          } catch (parseError) {
            console.error("Error al analizar la respuesta de Google Photos:", parseError);
            res.status(500).send("Error al procesar los datos multimedia");
          }
        });
      });

      req.on("error", (error) => {
        console.error("Error en la solicitud HTTPS:", error);
        res.status(500).send("Error en la solicitud a Google Photos");
      });

      req.write(options.body);
      req.end();
    }

    makeRequest(accessToken);

  } catch (error) {
    console.error("Error general:", error);
    res.status(500).send("Hubo un error al cargar la sección");
  }
}



  async function mostrarArchivosDrive(req, res, pageTitle) {
    try {
      const id = req.params.id;
      const pageToken = req.query.pageToken || "";
      const contacto = await accesosModel.mostrarContactoNatural(id);
      const persona = await accesosModel.obtenerPersonaId(id);
      let accessToken = persona.token;
      const refreshToken = persona.token_refresh;
      const natural = 'true';
  
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
  
      oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
  
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
  
      async function listFiles(pageToken) {
        try {
          const response = await drive.files.list({
            pageSize: 100,
            pageToken: pageToken,
            fields: 'nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink)',
            q: "mimeType contains 'image/' or mimeType contains 'video/'"
          });
  
          const files = response.data.files;
          const nextPageToken = response.data.nextPageToken;
  
          res.render("gmail/drive", {
            title: pageTitle,
            contacto,
            natural,
            persona,
            files,
            nextPageToken,
          });
        } catch (error) {
          if (error.response && error.response.status === 401) {
            const { tokens } = await oauth2Client.refreshAccessToken();
            accessToken = tokens.access_token;
            persona.token = accessToken;
            await persona.save();
            oauth2Client.setCredentials(tokens);
            return listFiles(pageToken);
          }
          throw error;
        }
      }
  
      await listFiles(pageToken);
  
    } catch (error) {
      console.error("Error general:", error);
      res.status(500).send("Hubo un error al cargar los archivos de Drive");
    }
  }





  async function mostrarContactosGmail(req, res, pageTitle) {
  
    const personas_naturales = await accesosModel.obtenerPersonaNaturalConToken()
    try {
      res.render("gmail/gmails", {
        title: pageTitle,
        personas_naturales,
      });   } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Hubo un error al cargar sección");
    }
  }


async function iniciarAutenticacionGoogle(req, res) {
  // Genera una URL de autenticación de Google y redirige al usuario a ella
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // AGREGAR ESTA LÍNEA - Fuerza a Google a devolver refresh_token
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/photoslibrary.readonly',
    ]
  });
  res.redirect(url);
}


  
async function iniciarAutenticacionGooglePhotos(req, res) {
  // Genera una URL de autenticación de Google y redirige al usuario a ella
  const url = client2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // AGREGAR ESTA LÍNEA - Fuerza a Google a devolver refresh_token
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/photoslibrary.readonly',
    ]
  });
  res.redirect(url);
}

  
  
  async function manejarCallbackGoogle(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      console.error('No se recibió código de autorización');
      return res.redirect('/acceso?error=no_code');
    }

    console.log('Código recibido:', code);

    // Intercambia el código de autorización por tokens
    const { tokens } = await client.getToken(code);
    console.log('Tokens recibidos:', { 
      access_token: tokens.access_token ? 'presente' : 'ausente',
      refresh_token: tokens.refresh_token ? 'presente' : 'ausente',
      id_token: tokens.id_token ? 'presente' : 'ausente'
    });

    // Verifica el token de id
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { name: nombre, email, picture: foto_perfil } = payload;
    
    console.log('Datos del usuario:', { nombre, email, foto_perfil });

    // Convierte el email a minúsculas para consistencia
    const emailLowerCase = email.toLowerCase();

    // Busca al usuario por correo electrónico en tu base de datos
    let usuario = await accesosModel.obtenerPersonaEmail(emailLowerCase);
    console.log('Usuario encontrado:', usuario ? 'Sí' : 'No');

    if (!usuario) {
      // Si el usuario no existe, registra un nuevo usuario
      console.log('Registrando nuevo usuario...');
      
      // Asegúrate de que RegistrarUsuario retorne el objeto completo del usuario, no solo el ID
      const nuevoUsuario = await accesosModel.RegistrarUsuario(nombre, foto_perfil, emailLowerCase, tokens.access_token, tokens.refresh_token);
      
      // Si RegistrarUsuario solo retorna un ID, obtén el usuario completo
      if (typeof nuevoUsuario === 'number' || typeof nuevoUsuario === 'string') {
        usuario = await accesosModel.obtenerPersonaId(nuevoUsuario);
      } else {
        usuario = nuevoUsuario;
      }
      
      console.log('Usuario registrado:', usuario);
    } else {
      // Si el usuario existe, actualiza los tokens
      console.log('Actualizando tokens para usuario existente...');
      await accesosModel.ActualizarTokenGoogle(tokens.access_token, tokens.refresh_token, emailLowerCase);
      
      // Obtén los datos actualizados del usuario
      usuario = await accesosModel.obtenerPersonaEmail(emailLowerCase);
    }

    // Verifica que el usuario tenga la estructura correcta
    if (!usuario || !usuario.id) {
      console.error('Error: Usuario no tiene estructura válida:', usuario);
      return res.redirect('/acceso?error=invalid_user');
    }

    // Almacena la información del usuario en la sesión
    req.session.user = usuario;
    console.log('Usuario guardado en sesión:', { id: usuario.id, email: usuario.email });

    // Redirige al usuario
    const redirectTo = req.session.redirectTo || '/';
    delete req.session.redirectTo;
    
    console.log('Redirigiendo a:', redirectTo);
    res.redirect(redirectTo);

  } catch (error) {
    console.error('Error en manejarCallbackGoogle:', error);
    
    // Manejo específico de errores comunes
    if (error.message.includes('invalid_grant')) {
      return res.redirect('/acceso?error=invalid_grant');
    }
    
    if (error.message.includes('Token used too early')) {
      return res.redirect('/acceso?error=token_timing');
    }
    
    // Error genérico
    res.redirect('/acceso?error=auth_failed');
  }
}





  async function manejarCallbacksGoogle(req, res) {
    const { code } = req.query;
  
    // Intercambia el código de autorización por tokens
    const { tokens } = await client2.getToken(code);
  
    // Verifica el token de id
    const ticket = await client2.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
  
    const { name: nombre, email, picture: foto_perfil } = ticket.getPayload();
  
    // Busca al usuario por correo electrónico en tu base de datos
    let usuario = await accesosModel.obtenerPersonaEmail(email);
  
    if (!usuario) {
      // Si el usuario no existe, registra un nuevo usuario y almacena el `refresh_token`
      const userId = await accesosModel.RegistrarUsuario(nombre, foto_perfil, email, tokens.access_token, tokens.refresh_token);
      usuario = { id: userId };
    } else {
      // Si el usuario existe, actualiza el `access_token` y el `refresh_token`
      await accesosModel.ActualizarTokenGoogle(tokens.access_token, tokens.refresh_token, email);
    }
  
    // Almacena la información del usuario en la sesión
    req.session.user = usuario;
  
    // Redirige al usuario a la página que desees después de iniciar sesión
    res.redirect('/');
  }

async function refreshAccessToken(refreshToken, clientId, clientSecret, userId) {
  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    const { tokens } = await oauth2Client.refreshAccessToken();
    
    // Actualizar el token en la base de datos
    await accesosModel.actualizarAccessToken(userId, tokens.access_token);
    
    return tokens.access_token;
  } catch (error) {
    if (error.message.includes('invalid_grant')) {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }
    throw error;
  }
}


  module.exports = {
    mostrarPuig,
    mostrarContactoNaturalConToken,
    mostrarVideos,
    mostrarArchivosDrive,
    mostrarContactosGmail,
    iniciarAutenticacionGoogle,
    iniciarAutenticacionGooglePhotos,
    manejarCallbackGoogle,
    manejarCallbacksGoogle,
    refreshAccessToken,
  };