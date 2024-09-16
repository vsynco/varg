const db = require("../config/conexion.js");

// Obtener todos los servicios
async function obtenerCobranzas() {
    const query = "SELECT * FROM herramienta_cobranza ORDER BY id;";
    const result = await db.query(query);
    return result.rows;
}

async function obtenerCobranza(id) {
    const query = "SELECT * FROM herramienta_cobranza WHERE id = $1;";
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
}

async function obtenerCobranzaCodigo(codigo) {
    const query = "SELECT * FROM herramienta_cobranza WHERE codigo = $1;";
    const values = [codigo];
    const result = await db.query(query, values);
    return result.rows[0];
}

async function agregarCobranza(cobranza) {
    // Generar un código de seguridad al azar en minúsculas
    const generarCodigo = () => {
        return Math.random().toString(36).substr(2, 10);
    };

    const codigo = generarCodigo();
    
    const query = `
        INSERT INTO herramienta_cobranza (unidad, monto, nombre_moroso, cuotas, convenio, id_juridica, codigo, email)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const values = [cobranza.unidad, cobranza.monto, cobranza.moroso, cobranza.cuotas, cobranza.convenio, cobranza.id_juridica, codigo, cobranza.email];
    const result = await db.query(query, values);
    return result.rows[0];
}


async function aceptarConvenio(convenio) {
    const query = "UPDATE herramienta_cobranza SET cuotas = $1, convenio = 'true' WHERE id = $2 RETURNING *;";
    const values = [convenio.cuotas, convenio.id]; // Aquí ajustamos el array values
    const result = await db.query(query, values);
    return result.rows[0];
}


module.exports = {
    obtenerCobranzas,
    obtenerCobranza,
    agregarCobranza,
    aceptarConvenio,
    obtenerCobranzaCodigo
};
