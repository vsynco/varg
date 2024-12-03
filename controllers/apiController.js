const apiModel = require("../models/api");

async function recibirProspecto(req, res) {
    try {
      // Verifica si el formulario tiene el token esperado
      const tokenEsperado = "abo";
      const { verificador, nombre, correo, telefono, mensaje } = req.body;
  
      if (verificador !== tokenEsperado) {
        return res.status(403).send("Solicitud no autorizada");
      }
  
      // Valida los datos básicos
      if (!nombre || !correo) {
        return res.status(400).send("Nombre y correo son obligatorios");
      }
  
      // Inserta en la base de datos
      await apiModel.agregarProspecto({ nombre, correo, telefono, mensaje });
  
      res.status(200).send("Prospecto guardado con éxito");
    } catch (error) {
      console.error("Error al recibir prospecto:", error);
      res.status(500).send("Error interno del servidor");
    }
  }
  
  module.exports = {
    recibirProspecto,
  };
  