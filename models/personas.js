const db = require("../config/conexion.js");
const bcrypt = require("bcrypt");

// PERSONA

async function obtenerPersonaPaginado(perPage, offset, orderBy = 'DESC') {
    const query = `
        SELECT * FROM usuarios
        ORDER BY creacion ${orderBy}
        LIMIT $1
        OFFSET $2
      `;
    const result = await db.query(query, [perPage, offset]);
    return result.rows;
}

async function obtenerPersonaId(id) {
    const query = "SELECT * FROM usuarios WHERE id = $1;";
    const result = await db.query(query, [id]);
    return result.rows[0]; // Devuelve el usuario encontrado por ID
}

async function obtenerPersonaContactoId(id) {
  const query = "SELECT id,nombre,email,telefono,region,domicilio,comuna,registrado,rut FROM usuarios WHERE id = $1;";
  const result = await db.query(query, [id]);
  return result.rows[0]; // Devuelve el usuario encontrado por ID
}

async function obtenerPersonaContactoEmail(id) {
  const query = "SELECT nombre, email, registrado FROM usuarios WHERE id = $1;";
  const result = await db.query(query, [id]);

  // Verifica si hay resultados y devuelve el nombre, email y registrado
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function obtenerPersonaEmail(email) {
    const query = "SELECT * FROM usuarios WHERE email = $1";
    const result = await db.query(query, [email]);
    return result.rows[0]; // Devuelve el primer usuario encontrado
  }


// PERSONAS

async function obtenerTotalPersonas() {
    const query = "SELECT COUNT(*) FROM usuarios";
    const result = await db.query(query);
    return parseInt(result.rows[0].count);
}

  
// EDITAR, ELIMINAR PERSONA

async function editarPersona(id, nombre, email, foto) {
    const query =
      "UPDATE usuarios SET nombre = $2, email = $3, foto_perfil = $4 WHERE id = $1 RETURNING *";
    const result = await db.query(query, [id, nombre, email, foto]);
    return result.rows[0]; // Devuelve el usuario editado
}

async function eliminarPersona(id) {
    const query = "DELETE FROM usuarios WHERE id = $1";
    await db.query(query, [id]);
}

async function VerificaGestor(user_id) {
    const query =
      "SELECT * FROM roles WHERE user_id = $1 AND rol = 'administrador';";
    const result = await db.query(query, [user_id]);
    return result.rows.length > 0;
  }
  
  async function VerificaRol(user_id) {
    const query = "SELECT * FROM roles WHERE user_id = $1 AND rol = 'Rol';";
    const result = await db.query(query, [user_id]);
    return result.rows.length > 0;
  }
  
  async function ActualizarTokenGoogle(token, refresh_token, email) {
    const query = "UPDATE usuarios SET token = $1, token_refresh = $2 WHERE email = $3;";
    await db.query(query, [token, refresh_token, email]);
  }

  async function obtenerPersonaGestor(id) {
    const query = "SELECT gestor FROM usuarios WHERE id = $1;";
    const result = await db.query(query, [id]);
    return result.rows[0]; // Devuelve el usuario encontrado por ID
  }

  async function obtenerCorreo(id) {
    const query = "SELECT usuario FROM roles WHERE id = $1 LIMIT 1;";
    const result = await db.query(query, [id]);
    return result.rows[0]; // Devuelve el usuario encontrado por ID
  }
  


  

// AGREGAR PERSONA CON GOOGLE (Con foto de perfil)
async function RegistrarUsuario(nombre, foto_perfil, email, token, refresh_token) {
  const query = "INSERT INTO usuarios (nombre, foto_perfil, email, token, token_refresh) VALUES ($1, $2, $3, $4) RETURNING id";
  const result = await db.query(query, [nombre, foto_perfil, email, token, refresh_token]);
  return result.rows[0].id;
}


// Crea usuario registrado
async function insertarPersona({ nombre, email, contrasena, telefono, afiliado }) {
    const query = "INSERT INTO usuarios (nombre, email, contrasena, telefono, afiliado) VALUES ($1, $2, $3, $4, $5) RETURNING id";
    const result = await db.query(query, [nombre, email, contrasena, telefono, afiliado]);
    return result.rows[0].id; // Retorna el id del nuevo usuario
}

// Crea usuario no registrado
async function insertarPersonaContacto(nombre,rut, domicilio,comuna,region,email,telefono) {
  // Primero, verifica si el correo ya existe en la base de datos
  const checkQuery = `SELECT id FROM usuarios WHERE email = $1;`;
  const checkResult = await db.query(checkQuery, [email]);
  
  if (checkResult.rows.length > 0) {
      // Si el correo ya existe, devolver el ID existente
      return checkResult.rows[0].id;
  }
  
  // Si el correo no existe, inserta el nuevo usuario
  const query = `INSERT INTO usuarios (nombre, rut, domicilio, comuna, region, email, telefono, registrado) VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id;`;
  const values = [nombre, rut, domicilio, comuna, region, email, telefono];
  const result = await db.query(query, values);
  return result.rows[0].id;
}

async function insertarPersonaJuridicaContacto(nombre, rut, domicilio, comuna, region) {
  // Primero, verifica si el correo ya existe en la base de datos
  const checkQuery = `SELECT id FROM personas_juridicas WHERE rut = $1;`;
  const checkResult = await db.query(checkQuery, [rut]);
  
  if (checkResult.rows.length > 0) {
      // Si el correo ya existe, devolver el ID existente
      return checkResult.rows[0].id;
  }
  
  // Si el rut no existe, inserta el nuevo usuario
  const query = `INSERT INTO personas_juridicas (nombre, rut, domicilio, comuna, region) VALUES ($1, $2, $3, $4, $5) RETURNING id;`;
  const values = [nombre, rut, domicilio, comuna, region];
  const result = await db.query(query, values);
  return result.rows[0].id;
}





async function buscarPersonas(buscar) {
  const query = "SELECT * FROM usuarios WHERE nombre ILIKE $1 OR email ILIKE $1;";
  const values = [`%${buscar}%`];
  const result = await db.query(query, values);
  return result.rows;
}




async function buscarPersonasJuridicas(buscar) {
  const query = "SELECT * FROM personas_juridicas WHERE nombre ILIKE $1 OR rut ILIKE $1;";
  const values = [`%${buscar}%`];
  const result = await db.query(query, values);
  return result.rows;
}




async function obtenerContactoPrincipalReglamento(id_condominio) {
  // Consulta SQL para obtener los datos de contacto basados en la condición del id_usuario
  const query = `
      WITH usuario_principal AS (
          SELECT * FROM condominios_usuarios 
          WHERE id_condominio = $1 AND principal = true
          LIMIT 1
      )
      SELECT 
          COALESCE(contactos.nombre, usuarios.nombre) AS correo,
          COALESCE(contactos.email, usuarios.email) AS email,
          COALESCE(contactos.telefono, usuarios.telefono) AS telefono
      FROM usuario_principal
      LEFT JOIN contactos ON usuario_principal.id_usuario = 1 AND contactos.id = usuario_principal.contacto_id
      LEFT JOIN usuarios ON usuario_principal.id_usuario <> 1 AND usuarios.id = usuario_principal.id_usuario;
  `;
  const values = [id_condominio];
  const result = await db.query(query, values);

  // Si no hay resultados, devolver null
  if (result.rows.length === 0) {
      return null;
  }

  // Devolver los datos de contacto
  return result.rows[0];
}


async function obtenerContactosReglamento(id_condominio) {
  const query = `
      WITH usuario_principal AS (
          SELECT * FROM condominios_usuarios 
          WHERE id_condominio = $1 AND principal = false
      )
      SELECT 
          COALESCE(contactos.nombre, usuarios.nombre) AS correo,
          COALESCE(contactos.email, usuarios.email) AS email,
          COALESCE(contactos.telefono, usuarios.telefono) AS telefono
      FROM usuario_principal
      LEFT JOIN contactos ON usuario_principal.id_usuario = 1 AND contactos.id = usuario_principal.contacto_id
      LEFT JOIN usuarios ON usuario_principal.id_usuario <> 1 AND usuarios.id = usuario_principal.id_usuario;
  `;
  const values = [id_condominio];
  const result = await db.query(query, values);

  // Devolver un array vacío si no hay resultados
  return result.rows.length > 0 ? result.rows : [];
}





async function obtenerContactoPrincipalAsunto(id_cliente) {
  const query = `
      WITH usuario_principal AS (
          SELECT * FROM clientes_representantes 
          WHERE id_cliente = $1 AND principal = true
          LIMIT 1
      )
      SELECT 
          COALESCE(contactos.nombre, '') AS nombre,
          COALESCE(contactos.email, '') AS email,
          COALESCE(contactos.telefono, '') AS telefono
      FROM usuario_principal
      LEFT JOIN contactos ON contactos.id = usuario_principal.id_contacto;
  `;
  const values = [id_cliente];
  const result = await db.query(query, values);

  // Si no hay resultados, devolver null
  if (result.rows.length === 0) {
      return null;
  }

  // Devolver los datos de contacto
  return result.rows[0];
}

async function obtenerContactosAsunto(id_cliente) {
  const query = `
      WITH usuario_principal AS (
          SELECT * FROM clientes_representantes
          WHERE id_cliente = $1 AND principal = false
      )
      SELECT 
          COALESCE(contactos.nombre) AS correo,
          COALESCE(contactos.email) AS email,
          COALESCE(contactos.telefono) AS telefono
      FROM usuario_principal
      LEFT JOIN contactos ON usuario_principal.id_contacto = 1 AND contactos.id = usuario_principal.id_contacto
  `;
  const values = [id_cliente];
  const result = await db.query(query, values);

  // Devolver un array vacío si no hay resultados
  return result.rows.length > 0 ? result.rows : [];
}






//////////////////////////////
//////////// PERSONAS JURÍDICAS
////////////////////////////



async function obtenerContactoPrincipalPersonaJuridica(id_cliente) {
  const query = `
      WITH usuario_principal AS (
          SELECT * FROM personas_juridicas_usuarios 
          WHERE id_persona_juridica = $1 AND principal = true
          LIMIT 1
      )
      SELECT 
          COALESCE(usuarios.nombre, '') AS nombre,
          COALESCE(usuarios.email, '') AS email,
          COALESCE(usuarios.telefono, '') AS telefono
      FROM usuario_principal
      LEFT JOIN usuarios ON usuarios.id = usuario_principal.id_usuario;
  `;
  const values = [id_cliente];
  const result = await db.query(query, values);

  // Si no hay resultados, devolver null
  if (result.rows.length === 0) {
      return null;
  }

  // Devolver los datos de contacto
  return result.rows[0];
}

async function obtenerContactosPersonaJuridica(id_cliente) {
  const query = `
      WITH usuario_principal AS (
  SELECT * FROM personas_juridicas_usuarios
  WHERE id_persona_juridica = $1 AND principal = false
)
SELECT 
  COALESCE(usuarios.nombre, '') AS nombre,
  COALESCE(usuarios.email, '') AS email,
  COALESCE(usuarios.telefono, '') AS telefono
FROM usuario_principal
LEFT JOIN usuarios ON usuarios.id = usuario_principal.id_usuario;

  `;
  const values = [id_cliente];
  const result = await db.query(query, values);

  // Devolver un array vacío si no hay resultados
  return result.rows.length > 0 ? result.rows : [];
}

async function obtenerContactoEmailPersonaJuridica(id_cliente) {
  const queryPrincipal = `
    WITH usuario_principal AS (
      SELECT * FROM personas_juridicas_usuarios 
      WHERE id_persona_juridica = $1 AND principal = true
      LIMIT 1
    )
    SELECT 
      COALESCE(usuarios.nombre, '') AS nombre,
      COALESCE(usuarios.email, '') AS email,
      COALESCE(usuarios.registrado, false) AS registrado
    FROM usuario_principal
    LEFT JOIN usuarios ON usuarios.id = usuario_principal.id_usuario;
  `;

  const querySecundario = `
    WITH usuario_secundario AS (
      SELECT * FROM personas_juridicas_usuarios
      WHERE id_persona_juridica = $1 AND principal = false
      LIMIT 1
    )
    SELECT 
      COALESCE(usuarios.nombre, '') AS nombre,
      COALESCE(usuarios.email, '') AS email,
      COALESCE(usuarios.registrado, false) AS registrado
    FROM usuario_secundario
    LEFT JOIN usuarios ON usuarios.id = usuario_secundario.id_usuario;
  `;

  const values = [id_cliente];

  // Intentamos obtener el contacto principal
  let result = await db.query(queryPrincipal, values);

  // Si no hay contacto principal, intentamos obtener un contacto secundario
  if (result.rows.length === 0) {
    result = await db.query(querySecundario, values);
  }

  // Si no hay resultados, devolver null
  if (result.rows.length === 0) {
    return null;
  }

  // Devolver los datos de contacto: nombre, registrado y email
  return {
    nombre: result.rows[0].nombre,
    email: result.rows[0].email,
    registrado: result.rows[0].registrado
  };
}



async function obtenerPersonasJuridicas() {
  const query = `
      SELECT 
    c.*, 
    COUNT(CASE WHEN cu.principal = false THEN 1 END) AS principal_false,
    COUNT(CASE WHEN cu.principal = true THEN 1 END) AS principal_true
FROM 
    personas_juridicas c
LEFT JOIN 
    personas_juridicas_usuarios cu ON cu.id_persona_juridica = c.id
GROUP BY 
    c.id
ORDER BY
    c.id;
  `;
  const values = [];
  const result = await db.query(query, values);
  return result.rows;
}



  async function obtenerMisPersonasJuridicas(user_id) {
    const query = "SELECT c.* FROM personas_juridicas c JOIN personas_juridicas_usuarios cu ON c.id = cu.id_persona_juridica WHERE cu.id_usuario = $1;";
    const values = [user_id];
    const result = await db.query(query, values);
    return result.rows;
  }

async function obtenerPersonaJuridica(id) {
    const query = "SELECT * FROM personas_juridicas WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  

  async function obtenerPersonasJuridicasDatos() {
    const query = `
        SELECT 
      c.id,nombre,rut,domicilio,comuna,region,
      COUNT(CASE WHEN cu.principal = false THEN 1 END) AS principal_false,
      COUNT(CASE WHEN cu.principal = true THEN 1 END) AS principal_true
  FROM 
      personas_juridicas c
  LEFT JOIN 
      personas_juridicas_usuarios cu ON cu.id_persona_juridica = c.id
  GROUP BY 
      c.id
  ORDER BY
      c.id;
    `;
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }
  
  async function obtenerPersonaNatural() { 
    const query = "SELECT id,rut,nombre,email,telefono,domicilio,comuna,region,registrado FROM usuarios";
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }


  async function obtenerPersonaNaturalConToken() {
    const query = `
      SELECT id, rut, nombre, email, telefono, domicilio, comuna, region, registrado 
      FROM usuarios 
      WHERE token IS NOT NULL`;
    
    const values = [];
    const result = await db.query(query, values);
    return result.rows;
  }
  
  async function actualizarAccessToken(id, token) {
    const query = "UPDATE usuarios SET token = $1 WHERE id = $2;";
    const values = [token, id];
    await db.query(query, values);
  }


  async function obtenerCondominoUsuariosContactos(id) {
    const query = `
      SELECT
  cu.*,
  u.nombre AS nombre,
  u.email AS email,
  u.telefono AS telefono,
  u.region AS region,
  'Usuario' AS tipo
FROM
  personas_juridicas_usuarios cu
LEFT JOIN
  usuarios u ON cu.id_usuario = u.id
WHERE
  cu.id_persona_juridica = $1
ORDER BY cu.id;

    `;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows;
  }
  
  

async function verificarMiPersonaJuridica(id, idUsuario) {
    const query = "SELECT COUNT(*) FROM personas_juridicas_usuarios WHERE id_usuario = $1 AND id_persona_juridica = $2;";
    const values = [idUsuario, id];
    const result = await db.query(query, values);
    return result.rows[0].count > 0;
  }


  async function obtenerMiPersonaJuridica(id) {
    const query = "SELECT * FROM personas_juridicas WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function buscarPersonasJuridicas(buscar) {
    const query = "SELECT * FROM personas_juridicas WHERE nombre ILIKE $1 OR rut ILIKE $1;";
    const values = [`%${buscar}%`];
    const result = await db.query(query, values);
    return result.rows;
  }

  
  async function agregarPersonaJuridica(nombre, rut, domicilio, comuna) {
    const query = "INSERT INTO personas_juridicas (nombre, rut, domicilio, comuna) VALUES ($1, $2, $3, $4) RETURNING *;";
    const values = [nombre, rut, domicilio, comuna];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function asignarUsuario(id, persona_juridica_id, permiso) {
    // Verificar si ya existe el registro
    const checkQuery = "SELECT * FROM personas_juridicas_usuarios WHERE id_usuario = $1 AND id_persona_juridica = $2;";
    const checkValues = [id, persona_juridica_id];
    const checkResult = await db.query(checkQuery, checkValues);
    
    // Si ya existe, no insertar
    if (checkResult.rowCount > 0) {
      return { message: 'El usuario ya está asignado a esta persona jurídica.' };
    }
  
    // Si no existe, realizar la inserción
    const insertQuery = "INSERT INTO personas_juridicas_usuarios (id_usuario, id_persona_juridica, permiso) VALUES ($1, $2, $3) RETURNING *;";
    const insertValues = [id, persona_juridica_id, permiso];
    const insertResult = await db.query(insertQuery, insertValues);
    
    return insertResult.rows[0];
  }
  

  async function asignarContacto(usuario, contacto, persona_juridica_id, permiso) {
    const query = "INSERT INTO personas_juridicas_usuarios (id_usuario, contacto_id, id_persona_juridica, permiso) VALUES ($1, $2, $3, $4);"
    const values = [usuario, contacto, persona_juridica_id, permiso];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function asignarPrincipal(id) {
    const query = "UPDATE personas_juridicas_usuarios SET principal = true WHERE id = $1 RETURNING id_persona_juridica;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async function desasignarPrincipal(id, persona_juridica_id) {
    const query = "UPDATE personas_juridicas_usuarios SET principal = false WHERE id != $1 AND id_persona_juridica = $2;";
    const values = [id, persona_juridica_id];
    const result = await db.query(query, values);
    return result.rows[0];
  }




  async function mostrarContactoNatural(id) {
    const query = "SELECT * FROM usuarios WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }


  async function mostrarContactoJuridica(id) {
    const query = "SELECT * FROM personas_juridicas WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }




module.exports = {
    obtenerPersonaId,
    obtenerPersonaEmail,
    obtenerPersonaPaginado,
    obtenerTotalPersonas,
    eliminarPersona,
    editarPersona,
    VerificaGestor,
    VerificaRol,
    RegistrarUsuario,
    ActualizarTokenGoogle,
    obtenerPersonaGestor,
    obtenerCorreo,
    insertarPersona,
    buscarPersonas,
    obtenerContactoPrincipalReglamento,
    obtenerContactosReglamento,
    obtenerContactoPrincipalAsunto,
    obtenerContactosAsunto,
    insertarPersonaContacto,

    obtenerCondominoUsuariosContactos,
    asignarUsuario,
    asignarContacto,
    asignarPrincipal,
    desasignarPrincipal,
    obtenerPersonasJuridicas,
    obtenerPersonaJuridica,
    obtenerMisPersonasJuridicas,
    verificarMiPersonaJuridica,
    obtenerMiPersonaJuridica,
    buscarPersonasJuridicas,
    agregarPersonaJuridica,
    obtenerContactoPrincipalAsunto,
    obtenerContactosAsunto,
    asignarUsuario,
    asignarContacto,
    asignarPrincipal,
    desasignarPrincipal,
    obtenerPersonasJuridicas,
    obtenerPersonaJuridica,
    obtenerMisPersonasJuridicas,
    obtenerPersonaContactoId,
    
    
    
    obtenerContactoPrincipalPersonaJuridica,
    obtenerContactosPersonaJuridica,
    obtenerPersonaContactoEmail,
    obtenerContactoEmailPersonaJuridica,
    obtenerPersonaNatural,
    obtenerPersonasJuridicasDatos,
    insertarPersonaJuridicaContacto,
    mostrarContactoNatural,
    mostrarContactoJuridica,
    obtenerPersonaNaturalConToken,
    actualizarAccessToken
};