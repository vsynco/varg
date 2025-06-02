const https = require("https");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK);
const client2 = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACKS);
const { google } = require('googleapis');

const accesosModel = require("../models/accesos");

async function mostrarPuig(req, res, pageTitle) {
    res.render("landings/puig/portada", {
      title: pageTitle,
    });
  }





  module.exports = {
    mostrarPuig,
  };