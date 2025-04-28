var mysql = require('mysql');

// Configuración de la base de datos
const db = mysql.createConnection({
  port: '3306',
  host: '192.168.1.71',
  user: 'root',
  password: 'casaos',
  database: 'tablaperiodica' 
});

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }

  console.log("Conexion exitosa!");
});

module.exports = db;
