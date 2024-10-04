const db = require('../config/conexion.js');

const cuentasBancariasModel = {
    async crearCuentaBancaria(datosCuenta) {
        const { nombre, tipo_cuenta, numero_cuenta, proyecto_id } = datosCuenta;
        const query = `
            INSERT INTO cuentas_bancarias (nombre, tipo_cuenta, numero_cuenta, proyecto_id) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [nombre, tipo_cuenta, numero_cuenta, proyecto_id]);
        return { id: result.insertId, ...datosCuenta };
    },

    async actualizarCuentaBancaria(id, datosCuenta) {
        const { nombre, tipo_cuenta, numero_cuenta } = datosCuenta;
        const query = `
            UPDATE cuentas_bancarias 
            SET nombre = ?, tipo_cuenta = ?, numero_cuenta = ? 
            WHERE id = ?
        `;
        const [result] = await db.query(query, [nombre, tipo_cuenta, numero_cuenta, id]);
        return result.affectedRows > 0;
    },

    async eliminarCuentaBancaria(id) {
        const query = 'DELETE FROM cuentas_bancarias WHERE id = ?';
        const [result] = await db.query(query, [id]);
        return result.affectedRows > 0;
    },

    async obtenerCuentasBancariasProyecto(proyectoId) {
        const query = 'SELECT * FROM cuentas_bancarias WHERE proyecto_id = ?';
        const [rows] = await db.query(query, [proyectoId]);
        return rows;
    }
};

module.exports = cuentasBancariasModel;