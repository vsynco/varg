const sociosModel = require('../models/socios'); // Asegúrate de que esta ruta sea correcta

async function anadirSocio(req, res) {
    try {
        const { nombre, rut, porcentaje, proyectoId } = req.body;

        // Verificar si el porcentaje total del proyecto no excede el 100%
        const porcentajeValido = await sociosModel.verificarPorcentajeTotal(proyectoId);
        if (!porcentajeValido) {
            return res.status(400).json({ error: "El porcentaje total de socios en este proyecto excedería el 100%" });
        }

        const nuevoSocioId = await sociosModel.anadirSocio(nombre, rut, porcentaje, proyectoId);
        res.status(201).json({ message: "Socio añadido con éxito", socioId: nuevoSocioId });
    } catch (error) {
        console.error("Error al añadir socio:", error);
        res.status(500).json({ error: "Hubo un error al añadir el socio" });
    }
}

async function editarSocio(req, res) {
    try {
        const { id } = req.params;
        const { nombre, rut, porcentaje, proyectoId } = req.body;

        // Obtener el porcentaje actual del socio que se va a editar
        const socioActual = await sociosModel.obtenerSocioPorId(id);
        if (!socioActual) {
            return res.status(404).json({ error: 'Socio no encontrado' });
        }

        // Verificar si el porcentaje total del proyecto, excluyendo el del socio actual, no excede el 100%
        const porcentajeTotalActual = await sociosModel.obtenerPorcentajeTotal(proyectoId);
        const porcentajeRestante = porcentajeTotalActual - socioActual.porcentaje;

        if (porcentajeRestante + parseFloat(porcentaje) > 100) {
            return res.status(400).json({ error: 'El porcentaje total de los socios no puede exceder el 100%' });
        }

        // Editar el socio
        const socioActualizado = await sociosModel.editarSocio(id, nombre, rut, porcentaje);
        if (!socioActualizado) {
            return res.status(500).json({ error: 'Error al actualizar el socio' });
        }

        res.json({ socio: socioActualizado });
    } catch (error) {
        console.error('Error al editar el socio:', error);
        res.status(500).json({ error: 'Hubo un error al editar el socio' });
    }
}

async function eliminarSocio(req, res) {
    console.log("Eliminando socio...");
    try {
        const { id } = req.params;
        const proyecto_id = await sociosModel.obtenerProyectoIDSocio(id);
        const resultado = await sociosModel.eliminarSocio(id);

        if (resultado.eliminado) {
            // Devolver un JSON con éxito
            res.json({ eliminado: true, proyecto_id });
        } else {
            res.status(404).json({ error: "Socio no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar socio:", error);
        res.status(500).json({ error: "Hubo un error al eliminar el socio" });
    }
}



module.exports = {
    anadirSocio,
    editarSocio,
    eliminarSocio
};

