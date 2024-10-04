const cuentasBancariasModel = require('../models/cuentas_bancarias');

const cuentasBancariasController = {
    async crearCuentaBancaria(req, res) {
        try {
            const { nombre, tipo_cuenta, numero_cuenta, proyecto_id } = req.body;
            const nuevaCuenta = await cuentasBancariasModel.crearCuentaBancaria({
                nombre,
                tipo_cuenta,
                numero_cuenta,
                proyecto_id
            });
            res.status(201).json({ mensaje: 'Cuenta bancaria creada con éxito', cuentaId: nuevaCuenta.id });
        } catch (error) {
            console.error('Error al crear cuenta bancaria:', error);
            res.status(500).json({ error: 'Error al crear la cuenta bancaria' });
        }
    },

    async actualizarCuentaBancaria(req, res) {
        try {
            const { id } = req.params;
            const { nombre, tipo_cuenta, numero_cuenta } = req.body;
            const actualizado = await cuentasBancariasModel.actualizarCuentaBancaria(id, {
                nombre,
                tipo_cuenta,
                numero_cuenta
            });
            if (actualizado) {
                res.json({ mensaje: 'Cuenta bancaria actualizada con éxito' });
            } else {
                res.status(404).json({ error: 'Cuenta bancaria no encontrada' });
            }
        } catch (error) {
            console.error('Error al actualizar cuenta bancaria:', error);
            res.status(500).json({ error: 'Error al actualizar la cuenta bancaria' });
        }
    },

    async eliminarCuentaBancaria(req, res) {
        try {
            const { id } = req.params;
            const eliminado = await cuentasBancariasModel.eliminarCuentaBancaria(id);
            if (eliminado) {
                res.json({ mensaje: 'Cuenta bancaria eliminada con éxito' });
            } else {
                res.status(404).json({ error: 'Cuenta bancaria no encontrada' });
            }
        } catch (error) {
            console.error('Error al eliminar cuenta bancaria:', error);
            res.status(500).json({ error: 'Error al eliminar la cuenta bancaria' });
        }
    }
};

module.exports = cuentasBancariasController;