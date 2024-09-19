const proyectosModel = require('../models/proyectos');

const proyectosController = {
    async mostrarProyecto(req, res) {
        try {
            const id = req.params.id;
            const proyecto = await proyectosModel.obtenerProyecto(id);
            if (proyecto) {
                res.render('proyectos/proyecto', { 
                    title: proyecto.nombre,
                    proyecto: proyecto
                });
            } else {
                res.status(404).send('Proyecto no encontrado');
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Hubo un error al cargar el proyecto');
        }
    },

    async listarProyectos(req, res) {
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
    },

    async mostrarFormularioNuevoProyecto(req, res) {
      try {
          res.render('proyectos/proyecto_add', {
              title: 'Nuevo Proyecto',
              proyecto: null // Pasamos null porque es un nuevo proyecto, no una edición
          });
      } catch (error) {
          console.error('Error:', error);
          res.status(500).send('Hubo un error al cargar el formulario de nuevo proyecto');
      }
  },
  async crearProyecto(req, res) {
    try {
        console.log("Datos recibidos:", req.body);

        const { 
            nombre, descripcion, sitioWeb, grupoWhatsapp, sociedad, 
            nombreFantasia, rut, domicilio, ceo,
            bancoNombre, bancoTipoCuenta, bancoNumeroCuenta 
        } = req.body;

        // Validación básica
        if (!nombre || !descripcion) {
            return res.status(400).json({ error: 'Nombre y descripción son campos requeridos' });
        }

        const nuevoProyectoId = await proyectosModel.crearProyecto({
            nombre, 
            descripcion, 
            sitioWeb: sitioWeb || null, 
            grupoWhatsapp: grupoWhatsapp || null, 
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

        // Redireccionar a la lista de proyectos
        res.redirect('/proyectos');
    } catch (error) {
        console.error('Error en crearProyecto:', error);
        res.status(500).json({ error: 'Hubo un error al crear el proyecto', details: error.message });
    }
},


    async actualizarProyecto(req, res) {
        try {
            const id = req.params.id;
            const actualizado = await proyectosModel.actualizarProyecto(id, req.body);
            if (actualizado) {
                res.json({ message: 'Proyecto actualizado con éxito' });
            } else {
                res.status(404).json({ error: 'Proyecto no encontrado' });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Hubo un error al actualizar el proyecto' });
        }
    },

    async eliminarProyecto(req, res) {
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
};

module.exports = proyectosController;