const db = require("../config/conexion.js");
const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');

const API_KEY = '22FC23A4-B5D3-4D19-A517-361LE566EC7F';
const SECRET_KEY = '7dad9aea29daae0c9b343b61bb33720f77b503a6';


async function crearPagoFlow(amount, email) {
    const params = {
      apiKey: API_KEY,
      commerceOrder: Date.now().toString(),
      subject: 'Pago de servicio',
      currency: 'CLP',
      amount: amount,
      email: email,
      urlConfirmation: 'http://tu-sitio.com/confirm',
      urlReturn: 'http://tu-sitio.com/return'
    };
  
    const orderedParams = Object.keys(params).sort().reduce(
      (obj, key) => { 
        obj[key] = params[key]; 
        return obj;
      }, 
      {}
    );
  
    let toSign = '';
    for (const key in orderedParams) {
      toSign += key + orderedParams[key];
    }
  
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(toSign).digest('hex');
    params.s = signature;
  
    const postData = querystring.stringify(params);
  
    const options = {
      hostname: 'www.flow.cl',
      port: 443,
      path: '/api/payment/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
  
    return new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            console.log('Respuesta de la API de Flow:', result);  // Log de la respuesta completa
            if (result.url && result.token) {
              resolve(result);
            } else {
              console.error('Respuesta inválida de la API de Flow:', result);
              reject(new Error('Respuesta inválida de la API de Flow'));
            }
          } catch (error) {
            console.error('Error al analizar la respuesta de la API de Flow:', error);
            reject(error);
          }
        });
      });
  
      request.on('error', (error) => {
        console.error('Error en la solicitud a la API de Flow:', error);
        reject(error);
      });
  
      request.write(postData);
      request.end();
    });
  }
  





// Obtener todos los servicios
async function obtenerServicios() {
    const query = "SELECT * FROM servicios ORDER BY id;";
    const result = await db.query(query);
    return result.rows;
}

async function obtenerServiciosConHitos() {
    const query = `
        SELECT 
            s.*,
            COALESCE(json_agg(h.*) FILTER (WHERE h.id IS NOT NULL), '[]') AS hitos
        FROM 
            servicios s
        LEFT JOIN 
            hitos h ON s.id = h.servicios_id
        GROUP BY 
            s.id
        ORDER BY 
            s.id;
    `;
    const result = await db.query(query);
    return result.rows;
}

async function obtenerServiciosRecurrentes() {
    return (await db.query("SELECT * FROM servicios WHERE tipo = 'Recurrente' ORDER BY id;")).rows;
}

async function obtenerServicioFijos() {
  return (await db.query("SELECT * FROM servicios WHERE tipo = 'Fijo' ORDER BY id;")).rows;
}

// Obtener un servicio por ID
async function obtenerServicio(id) {
    const query = "SELECT * FROM servicios WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
}

// Obtener un servicio por ID
async function obtenerServicioNombre(id) {
  const query = "SELECT nombre FROM servicios WHERE id = $1;";
  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function crearServicio(nombre, precio, moneda, pago_unico, pago_cuotas, pago_hitos, pago_recurrente, cuotas, visible, tipo, hitos, pago_anual, pago_semestral, pago_mensual) {
    const query = `
        INSERT INTO servicios 
        (nombre, precio, moneda, pago_unico, pago_cuotas, pago_hitos, pago_recurrente, cuotas, visible, tipo, hitos, pago_anual, pago_semestral, pago_mensual) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
        RETURNING *;
    `;
    const values = [nombre, precio, moneda, pago_unico, pago_cuotas, pago_hitos, pago_recurrente, cuotas, visible, tipo, hitos, pago_anual, pago_semestral, pago_mensual];
    const result = await db.query(query, values);
    return result.rows[0];
}



// Editar un servicio existente
async function editarServicio(id, nombre, precio, moneda, pago_unico, pago_cuotas, pago_hitos, pago_recurrente, cuotas) {
    const query = `
        UPDATE servicios 
        SET nombre = $2, precio = $3, moneda = $4, pago_unico = $5, pago_cuotas = $6, pago_hitos = $7, pago_recurrente = $8, cuotas = $9 
        WHERE id = $1 
        RETURNING *;
    `;
    const values = [id, nombre, precio, moneda, pago_unico, pago_cuotas, pago_hitos, pago_recurrente, cuotas];
    const result = await db.query(query, values);
    return result.rows[0];
}

// Obtener todos los contratos
async function obtenerContratos() {
  const query = `
      SELECT 
          c.*, 
          TO_CHAR(c.inicio, 'DD-MM-YYYY') AS inicio,
          TO_CHAR(c.creacion, 'DD-MM-YYYY HH24:MI:SS') AS creacion,
          COALESCE(u.nombre, pj.nombre) AS nombre_cliente,
          s.nombre AS nombre_servicio,
          INITCAP(REPLACE(c.forma_pago, 'pago_', ' ')) AS forma_pago
      FROM 
          contratos c
      LEFT JOIN 
          usuarios u ON c.persona_natural = TRUE AND c.user_id = u.id
      LEFT JOIN 
          personas_juridicas pj ON c.persona_natural = FALSE AND c.pj_id = pj.id
      LEFT JOIN 
          servicios s ON c.servicio_id = s.id;
  `;

  const result = await db.query(query);
  return result.rows;
}





// Obtener un contrato por ID
async function obtenerContrato(id) {
    const query = `
        SELECT contratos.*, servicios.nombre AS nombre_servicio, contactos.nombre AS nombre_contacto
        FROM contratos
        JOIN servicios ON contratos.servicio_id = servicios.id
        JOIN contactos ON contratos.contacto_id = contactos.id
        WHERE contratos.id = $1;
    `;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
}

// Añadir un nuevo contrato
async function crearContrato(user_id, pj_id, comentarios, servicio_id, forma_pago, descuento, tipo, estado, inicio, persona_natural, persona_juridica) {
    const query = `
    INSERT INTO contratos 
    (user_id, pj_id, comentarios, servicio_id, forma_pago, descuento, tipo, estado, inicio, persona_natural, persona_juridica) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
    RETURNING *;
`;
const values = [user_id, pj_id, comentarios, servicio_id, forma_pago, descuento, tipo, estado, inicio, persona_natural, persona_juridica];
const result = await db.query(query, values);
return result.rows[0];
}


// Añadir un nuevo contrato
async function crearContratoRecurrente(user_id, pj_id, comentarios, servicio_id, forma_pago, descuento, tipo, estado, inicio, persona_natural, persona_juridica) {
    const query = `
    INSERT INTO contratos 
    (user_id, pj_id, comentarios, servicio_id, forma_pago, descuento, tipo, estado, inicio, persona_natural, persona_juridica) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
    RETURNING *;
`;
const values = [user_id, pj_id, comentarios, servicio_id, forma_pago, descuento, tipo, estado, inicio, persona_natural, persona_juridica];
const result = await db.query(query, values);
return result.rows[0];
}




// Obtener todos los cobros de un contrato
async function obtenerCobrosPorContrato(contrato_id) {
    const query = `
        SELECT * 
        FROM cobros 
        WHERE contrato_id = $1 
        ORDER BY id;
    `;
    const values = [contrato_id];
    const result = await db.query(query, values);
    return result.rows;
}

async function obtenerCobrosPendientesPorContrato(contrato_id) {
  const query = `
      SELECT * 
      FROM cobros 
      WHERE contrato_id = $1 AND estado = 'Pendiente'
      ORDER BY id;
  `;
  const values = [contrato_id];
  const result = await db.query(query, values);
  return result.rows;
}


// Obtener un cobro específico
async function obtenerCobro(id) {
    const query = "SELECT * FROM cobros WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
}

async function cambiarEstadoCobro(id, estado) {
    const query = "UPDATE cobros SET estado = $2 WHERE id = $1 RETURNING *;";
    const values = [id, estado];
    const result = await db.query(query, values);
    return result.rows[0];
}


// Crear un nuevo cobro
async function crearCobro(contrato_id, persona, cliente_id, precio, estado, fecha, nombre) {
    // Asume que la fecha está en formato DD-MM-YYYY
    
    const query = `
        INSERT INTO cobros 
        (contrato_id, persona, cliente_id, precio, estado, fecha, nombre) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *;
    `;
    const values = [contrato_id, persona, cliente_id, precio, estado, fecha, nombre];
    const result = await db.query(query, values);
    return result.rows[0];
}

async function obtenerCobros() {
  const query = `
      SELECT c.*, 
             COALESCE(u.nombre, pj.nombre) AS nombre_persona
      FROM cobros c
      LEFT JOIN usuarios u ON c.persona = 'natural' AND c.cliente_id = u.id
      LEFT JOIN personas_juridicas pj ON c.persona = 'juridica' AND c.cliente_id = pj.id;
  `;
  const result = await db.query(query);

  return result.rows.map(row => {
      if (row.fecha instanceof Date) {
          const day = row.fecha.getDate().toString().padStart(2, '0');
          const month = (row.fecha.getMonth() + 1).toString().padStart(2, '0');
          const year = row.fecha.getFullYear();
          row.fecha = `${day}-${month}-${year}`;
      }
      return row;
  });
}



module.exports = {
    obtenerServicios,
    obtenerServicio,
    crearServicio,
    editarServicio,
    obtenerContratos,
    obtenerContrato,
    crearContrato,
    obtenerCobrosPorContrato,
    obtenerCobro,
    crearCobro,
    obtenerServiciosConHitos,
    obtenerServiciosRecurrentes,
    obtenerCobros,
    crearContratoRecurrente,
    crearPagoFlow,
    cambiarEstadoCobro,
    obtenerServicioFijos,
    obtenerServicioNombre,
    obtenerCobrosPendientesPorContrato
};
