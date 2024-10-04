const proyectosModel = require('../models/proyectos');
const enlacesModel = require('../models/enlaces');

async function mostrarProyecto(req, res) {
    try {
        const id = req.params.id;
        const proyecto = await proyectosModel.obtenerProyecto(id);
        
        const enlaces = await enlacesModel.obtenerEnlacesProyecto(id);
        console.log("Enlaces:", enlaces);
        if (proyecto) {
            res.render('proyectos/proyecto', { 
                title: proyecto.nombre,
                proyecto: proyecto,
                enlaces: enlaces
            });
        } else {
            res.status(404).render('error', {
                message: 'Proyecto no encontrado',
                error: { status: 404 }
            });
        }
    } catch (error) {
        console.error('Error al cargar el proyecto:', error);
        res.status(500).render('error', {
            message: 'Hubo un error al cargar el proyecto',
            error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
        });
    }
}


async function editarProyecto(req, res) {
    try {
        const id = req.params.id;
        const proyecto = await proyectosModel.obtenerProyecto(id);
        
        const enlaces = await enlacesModel.obtenerEnlacesProyecto(id);
        console.log("Enlaces:", enlaces);
        if (proyecto) {
            res.render('proyectos/proyecto_edit', { 
                title: proyecto.nombre,
                proyecto: proyecto,
                enlaces: enlaces
            });
        } else {
            res.status(404).send('Proyecto no encontrado');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Hubo un error al cargar el proyecto');
    }
}

async function listarProyectos(req, res) {
    try {
        const proyectos = await proyectosModel.obtenerTodosProyectos();
        res.render('proyectos/proyectos', { 
            title: 'Lista de Proyectos',
            proyectos: proyectos
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Hubo un error al cargar la lista de proyectos');
    }
}

async function mostrarFormularioNuevoProyecto(req, res) {
    try {
        res.render('proyectos/proyecto_add', {
            title: 'Nuevo Proyecto',
            proyecto: null
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Hubo un error al cargar el formulario de nuevo proyecto');
    }
}

async function crearProyecto(req, res) {
    try {
        console.log("Datos recibidos:", req.body);

        const { 
            nombre, subtitulo, descripcion, estado, porcentaje_legal, porcentaje_diseno, porcentaje_codigo, sociedad, 
            nombreFantasia, rut, domicilio, ceo,
            bancoNombre, bancoTipoCuenta, bancoNumeroCuenta 
        } = req.body;

        if (!nombre || !descripcion) {
            return res.status(400).json({ error: 'Nombre y descripción son campos requeridos' });
        }

        const nuevoProyectoId = await proyectosModel.crearProyecto({
            nombre, 
            subtitulo,
            descripcion,
            estado,
            porcentaje_legal,
            porcentaje_diseno,
            porcentaje_codigo,
            sociedad: sociedad || null, 
            nombreFantasia: nombreFantasia || null, 
            rut: rut || null, 
            domicilio: domicilio || null, 
            ceo: ceo || null,
            bancoNombre: bancoNombre || null, 
            bancoTipoCuenta: bancoTipoCuenta || null, 
            bancoNumeroCuenta: bancoNumeroCuenta || null
        });

        console.log("Proyecto creado con ID:", nuevoProyectoId);
        res.redirect('/proyectos/' + nuevoProyectoId);
    } catch (error) {
        console.error('Error en crearProyecto:', error);
        res.status(500).json({ error: 'Hubo un error al crear el proyecto', details: error.message });
    }
}

async function actualizarProyecto(req, res) {
    console.log("Editando");
    try {
        const id = req.params.id;
        const actualizado = await proyectosModel.actualizarProyecto(id, req.body);
        console.log("Actualizado:", actualizado);
        if (actualizado) {
            res.redirect(`/proyectos/${id}`);
        } else {
            res.status(404).json({ error: 'Proyecto no encontrado' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al actualizar el proyecto' });
    }
}

async function eliminarProyecto(req, res) {
    try {
        const id = req.params.id;
        const eliminado = await proyectosModel.eliminarProyecto(id);
        if (eliminado) {
            res.json({ message: 'Proyecto eliminado con éxito' });
        } else {
            res.status(404).json({ error: 'Proyecto no encontrado' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al eliminar el proyecto' });
    }
}

module.exports = {
    mostrarProyecto,
    editarProyecto,
    listarProyectos,
    mostrarFormularioNuevoProyecto,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto
};