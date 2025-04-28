const express = require('express');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

// Rutas
const indexRoutes = require('./routes.js');
app.use('/', indexRoutes);

module.exports = app;
