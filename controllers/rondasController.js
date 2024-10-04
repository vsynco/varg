const rondaModel = require('../models/ronda');
const proyectosModel = require('../models/proyectos');

async function mostrarFormularioCompraTramo(req, res) {
    const { rondaId, tramoId } = req.params;

    try {
        const ronda = await rondaModel.obtenerPorId(rondaId);
        const tramo = await rondaModel.obtenerTramoPorId(tramoId);
        console.log(tramo);

        if (!tramo || tramo.ronda_id !== ronda.id) {
            return res.status(404).send('Tramo no encontrado');
        }

        res.render('rondas/comprar', { ronda, tramo });
    } catch (error) {
        console.error('Error al mostrar formulario de compra de tramo:', error);
        res.status(500).send('Error al cargar el formulario de compra de tramo');
    }
}

async function comprarTramo(req, res) {
    const { rondaId, tramoId } = req.params;
    const { cupon } = req.body;
    const usuarioId = req.session.userId; // Asumiendo que tienes el ID del usuario en la sesión

    try {
        const resultado = await rondaModel.comprar(tramoId, usuarioId, cupon);
        if (resultado) {
            req.flash('success', 'Tramo comprado exitosamente');
            res.redirect(`/rondas/${rondaId}`);
        } else {
            req.flash('error', 'No se pudo completar la compra del tramo');
            res.redirect(`/rondas/${rondaId}/comprar-tramo/${tramoId}`);
        }
    } catch (error) {
        console.error('Error al comprar tramo:', error);
        req.flash('error', 'Error al procesar la compra del tramo');
        res.redirect(`/rondas/${rondaId}/comprar-tramo/${tramoId}`);
    }
}


async function crearRonda(req, res) {
    const { proyecto_id, nombre, porcentajeTotal, fechaInicio, fechaFin, tramos } = req.body;

    try {
        const ronda = await rondaModel.crear({
            proyecto_id,
            nombre,
            porcentajeTotal,
            fechaInicio,
            fechaFin,
            tramos: JSON.parse(tramos)
        });

        res.redirect(`/rondas/${ronda}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear la ronda de inversión');
    }
}

async function mostrarRonda(req, res) {
    const { rondaId } = req.params;

    try {
        const ronda = await rondaModel.obtenerPorId(rondaId);
        res.render('rondas/ronda', { ronda });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al mostrar la ronda de inversión');
    }
}

async function realizarInversion(req, res) {
    const { rondaId } = req.params;
    const { porcentaje } = req.body;
    const usuarioId = req.session.userId; // Asumiendo que tienes el ID del usuario en la sesión

    try {
        const inversion = await Inversion.crear({
            rondaId,
            usuarioId,
            porcentaje
        });

        res.redirect(`/rondas/${rondaId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al realizar la inversión');
    }
}

async function actualizarEstadoInversion(req, res) {
    const { inversionId } = req.params;
    const { estado } = req.body;

    try {
        await Inversion.actualizarEstado(inversionId, estado);
        res.redirect('back');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el estado de la inversión');
    }
}

async function listarRondas(req, res) {
    try {
        const { proyectoId } = req.params;
        const proyecto = await proyectosModel.obtenerProyecto(proyectoId);
        const rondas = await rondaModel.obtenerPorProyecto(proyectoId);

        res.render('rondas/listar', {
            proyecto,
            rondas
        });
    } catch (error) {
        console.error('Error al listar rondas:', error);
        res.status(500).send('Error al listar las rondas de inversión');
    }
}

async function mostrarRondas(req, res) {
    try {
        const rondas = await rondaModel.obtenerRondas();
        console.log(rondas);
        res.render('rondas/rondas', {
            rondas
        });
    } catch (error) {
        console.error('Error al listar rondas:', error);
        res.status(500).send('Error al listar las rondas de inversión');
    }
}


async function crearRondaForm(req, res) {
    const proyectos = await proyectosModel.obtenerTodosProyectosNombreId();
    try {
        res.render('rondas/crear', {
            proyectos
        });
    } catch (error) {
        console.error('Error al mostrar formulario de creación de ronda:', error);
        res.status(500).send('Error al cargar el formulario de creación de ronda');
    }
}

async function listarInversiones(req, res) {
    try {
        const { rondaId } = req.params;
        const ronda = await rondaModel.obtenerPorId(rondaId);
        const inversiones = await Inversion.obtenerPorRonda(rondaId);

        res.render('rondas/inversiones', {
            ronda,
            inversiones
        });
    } catch (error) {
        console.error('Error al listar inversiones:', error);
        res.status(500).send('Error al listar las inversiones de la ronda');
    }
}


module.exports = {
    crearRonda,
    mostrarRonda,
    realizarInversion,
    actualizarEstadoInversion,
    listarRondas,
    crearRondaForm,
    listarInversiones,
    mostrarRondas,
    mostrarFormularioCompraTramo,
    comprarTramo
};
