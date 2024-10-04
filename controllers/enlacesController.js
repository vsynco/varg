const enlacesModel = require('../models/enlaces');

const enlacesController = {
    async crearEnlace(req, res) {
        try {
            const { proyecto_id, nombre, url } = req.body;
            const nuevoEnlace = await enlacesModel.crearEnlace({ proyecto_id, nombre, url });
            res.status(201).json({ mensaje: 'Enlace creado con éxito', enlaceId: nuevoEnlace.id });
        } catch (error) {
            console.error('Error al crear enlace:', error);
            res.status(500).json({ error: 'Error al crear el enlace' });
        }
    },

    async actualizarEnlace(req, res) {
        try {
            const { id } = req.params;
            const { nombre, url } = req.body;
            const actualizado = await enlacesModel.actualizarEnlace(id, { nombre, url });
            if (actualizado) {
                res.json({ mensaje: 'Enlace actualizado con éxito' });
            } else {
                res.status(404).json({ error: 'Enlace no encontrado' });
            }
        } catch (error) {
            console.error('Error al actualizar enlace:', error);
            res.status(500).json({ error: 'Error al actualizar el enlace' });
        }
    },

    async eliminarEnlace(req, res) {
        try {
            const { id } = req.params;
            const eliminado = await enlacesModel.eliminarEnlace(id);
            if (eliminado) {
                res.json({ mensaje: 'Enlace eliminado con éxito' });
            } else {
                res.status(404).json({ error: 'Enlace no encontrado' });
            }
        } catch (error) {
            console.error('Error al eliminar enlace:', error);
            res.status(500).json({ error: 'Error al eliminar el enlace' });
        }
    },

    async obtenerEnlacesProyecto(req, res) {
        try {
            const { proyectoId } = req.params;
            const enlaces = await enlacesModel.obtenerEnlacesProyecto(proyectoId);
            res.json(enlaces);
        } catch (error) {
            console.error('Error al obtener enlaces:', error);
            res.status(500).json({ error: 'Error al obtener los enlaces' });
        }
    }
};

module.exports = enlacesController;