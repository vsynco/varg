const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Guardar en el directorio persistente de Render
    cb(null, '/var/data/');
  },
  filename: function (req, file, cb) {
    // Renombrar el archivo con una marca de tiempo
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Inicializar multer con la configuración de almacenamiento
const upload = multer({ storage: storage }).single('file');

// Función para mostrar la vista de subir archivo
exports.mostrarFormularioSubida = (req, res) => {
  fs.readdir('/var/data/', (err, files) => {
    if (err) {
      console.error('Error al leer el directorio:', err);
      return res.status(500).send('Error al leer el directorio.');
    }
    // Renderizar la vista con la lista de archivos y un mensaje vacío
    res.render('secciones/upload', { files, message: '' });
  });
};

// Función para procesar la subida de archivo
exports.subirArchivo = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Error al subir el archivo:', err);
      return res.status(500).send('Error al subir el archivo. Detalles: ' + err.message);
    }
    if (!req.file) {
      return res.status(400).send('No se ha subido ningún archivo.');
    }
    // Leer los archivos del directorio después de la subida
    fs.readdir('/var/data/', (err, files) => {
      if (err) {
        console.error('Error al leer el directorio:', err);
        return res.status(500).send('Error al leer el directorio.');
      }
      // Renderizar la vista con la lista de archivos y el mensaje de subida
      res.render('secciones/upload', { 
        message: `Archivo subido: ${req.file.filename}`,
        files
      });
    });
  });
};
