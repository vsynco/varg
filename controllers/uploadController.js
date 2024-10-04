const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');
const proyectosModel = require('../models/proyectos');

async function mostrarFormularioSubida(req, res) {
  try {
      const files = await fs.readdir('/var/data/');
      res.render('secciones/upload', { files, message: '' });
  } catch (err) {
      console.error('Error al leer el directorio:', err);
      res.status(500).send('Error al leer el directorio.');
  }
}




async function subirArchivoGeneral(req, res) {
    const destinationPath = '/var/data/';

    const storage = multer.diskStorage({
        destination: async function (req, file, cb) {
            try {
                await fs.mkdir(destinationPath, { recursive: true });
                cb(null, destinationPath);
            } catch (err) {
                cb(err);
            }
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    });

    const upload = promisify(multer({ storage: storage }).single('file'));

    try {
        await upload(req, res);

        if (!req.file) {
            return res.status(400).send('No se ha subido ningún archivo.');
        }

        const files = await fs.readdir(destinationPath);
        res.json({ 
            message: `Archivo subido: ${req.file.filename}`,
            files
        });
    } catch (err) {
        console.error('Error al subir el archivo:', err);
        res.status(500).send('Error al subir el archivo. Detalles: ' + err.message);
    }
}
async function subirProyectoFoto(req, res) {
  const storage = multer.diskStorage({
      destination: async function (req, file, cb) {
          const proyectoId = req.body.proyecto_id;
          if (!proyectoId) {
              return cb(new Error('No se proporcionó el ID del proyecto.'));
          }
          const destinationPath = `/var/data/proyectos/${proyectoId}/foto`;
          try {
              await fs.mkdir(destinationPath, { recursive: true });
              cb(null, destinationPath);
          } catch (err) {
              cb(err);
          }
      },
      filename: function (req, file, cb) {
          cb(null, Date.now() + path.extname(file.originalname));
      }
  });

  const upload = multer({ storage: storage }).fields([
      { name: 'file', maxCount: 1 },
      { name: 'proyecto_id', maxCount: 1 }
  ]);

  upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
          return res.status(500).send('Error de Multer al subir archivo: ' + err.message);
      } else if (err) {
          return res.status(500).send('Error desconocido al subir archivo: ' + err.message);
      }

      if (!req.files || !req.files['file']) {
          return res.status(400).send('No se ha subido ningún archivo.');
      }

      const proyectoId = req.body.proyecto_id;
      if (!proyectoId) {
          return res.status(400).send('No se proporcionó el ID del proyecto.');
      }

      const destinationPath = `/var/data/proyectos/${proyectoId}/foto`;
      try {
          // Eliminar fotos existentes
          const files = await fs.readdir(destinationPath);
          for (const file of files) {
              if (file !== req.files['file'][0].filename) {
                  await fs.unlink(path.join(destinationPath, file));
              }
          }

          // Actualizar la foto en la base de datos
          await proyectosModel.actualizarProyectoFoto(proyectoId, `/proyectos/${proyectoId}/foto/${req.files['file'][0].filename}`);
          console.log('Foto subida:', req.files['file'][0].filename);
          res.redirect('/proyectos/' + proyectoId);
      } catch (err) {
          console.error('Error al procesar la subida de la foto:', err);
          res.status(500).send('Error al procesar la subida de la foto. Detalles: ' + err.message);
      }
  });
}




async function eliminarArchivo(req, res) {
    const filename = req.body.filename;
    const filePath = path.join('/var/data/', filename);

    try {
        await fs.unlink(filePath);
        const files = await fs.readdir('/var/data/');
        res.json({ 
            message: `Archivo eliminado: ${filename}`,
            files
        });
    } catch (err) {
        console.error('Error al eliminar el archivo:', err);
        res.status(500).send('Error al eliminar el archivo. Detalles: ' + err.message);
    }
}

module.exports = {
    subirArchivoGeneral,
    subirProyectoFoto,
    eliminarArchivo,
    mostrarFormularioSubida
};