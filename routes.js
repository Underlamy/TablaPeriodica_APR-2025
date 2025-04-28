const express = require('express');
const router = express.Router();
const db = require('./connection.js');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/tablaPeriodica', (req, res) => {
  const z = parseInt(req.query.z, 10); // Convierte z a número entero
	const masa = parseInt(req.query.masa, 10);
	let query;

  if (z) {
	  if(masa){
		query = 'select * from elementos INNER JOIN isotopos ON elementos.numAtomico = isotopos.z WHERE elementos.numAtomico = ? order by case when isotopos.masaAtomica = ' + masa + ' then 0 else 1 end, isotopos.abundancia desc;';
	  }
	  else{
		query = 'select * from elementos INNER JOIN isotopos ON elementos.numAtomico = isotopos.z WHERE elementos.numAtomico = ? order by isotopos.abundancia DESC;';
	  }
    // Ejecuta la consulta de forma segura con parámetros
    db.query(query, [z], (err, results) => {
      if (err) {
        console.error('Error ejecutando la consulta:', err);
        return res.status(500).send('Error en la base de datos');
      }

      if (results.length === 0) {
		return res.render('info', { elementos: null, mensaje: 'No se encontraron elementos.' });
      }

		console.log(masa);
		console.log(results[0]);
      // Renderiza la vista EJS con los datos obtenidos
      res.render('info', { datos: results[0], isotopos: results });
		// Envía el primer resultado (si esperas un único elemento)
    });
  } else {
    // Si no se proporciona `z`, renderiza la tabla principal
    res.render('tabla');
  }
});

router.get('/laboratorio', (req, res) => {
const get = req.query.m;

if(get == undefined){
 res.render('eleccionLab');
}else{
db.query('SELECT * FROM elementos', (err, elementos) => {
    if (err) throw err;

    let wrapper = elementos.map((elemento) => {
      return new Promise((resolve, reject) => {

        db.query(`SELECT Estados FROM oxidacion WHERE z = ${elemento.numAtomico}`, (err, category) => {
          if (err) {
            reject(err);
          } else {
            resolve(category[0]);
          };
        });
      });
    });


    Promise.all(wrapper).then((results) => {
      let arr = elementos.map((elemento, index) => {
        elemento.oxidacion = results[index];
        return elemento;
      });
      arr.map((wawa) => {
        const estados = wawa.oxidacion.Estados?.slice(1, -1).split(', ') || [];
        wawa.oxidacion.Estados = estados;
      });

      res.render('laboratorio', { elementos: arr, get: get });
    }).catch((err) => {
      console.error(err);
    });
  });
}
});

router.get('/community', (req, res) => {
	const get = req.query.q;
	const userData = req.cookies.userData ? JSON.parse(req.cookies.userData) : null;

	switch(get){
		case "sugerencias":
			let query = "SELECT s.IDSugerencia, s.IDUsuario, s.Texto, s.Tipo, s.Titulo, DATE_FORMAT(s.fecha, '%d/%m/%Y') AS Fecha, GROUP_CONCAT(v.IDVote) AS IDVotes, GROUP_CONCAT(v.Like) As Likes, GROUP_CONCAT(v.IDAutor) AS IDAutores FROM sugerencias s LEFT JOIN votes v ON s.IDSugerencia = v.IDSugerencia GROUP BY s.IDSugerencia, s.IDUsuario, s.Texto, s.Tipo, s.Titulo, s.fecha;";
			db.query(query, (err, resultados) => {
				if (err) throw err;
				
				console.log(resultados);
				res.render('sugerencias', { sugerencias: resultados, user: userData });
			});
			break;

		case "bitacora":
			res.render('bitacora');
			break;

		case "login":
			res.render('login', { user: userData });
			break;

		case "logout":
			req.cookies = {};
			res.clearCookie("userData");

			res.redirect('/community');
			break;

		case "register":
			res.render("register", { user: userData });
			break;

		default:
			res.render('community', { user: userData });
			break;
	}
});

router.post('/loginProcess', (req, res) => {
    const { username, password } = req.body;

    let query = "SELECT * FROM usuarios WHERE Username = ? AND Password = ?";
    db.query(query, [username, password], (err, resultados) => {
        if (err) throw err;

        if (resultados.length === 0) {
            return res.send('Usuario o contraseña incorrectos'); // ✅ Finaliza correctamente si el usuario no existe
        }

        // Crear objeto de usuario sin datos sensibles
        const userData = {
            IDUsuario: resultados[0].IDUsuario,
            Username: resultados[0].Username,
            Dificultad: resultados[0].Dificultad,
            UserInfo: resultados[0].UserInfo
        };

        // Guardar cookie y luego redirigir
        res.cookie('userData', JSON.stringify(userData), { 
            secure: false,
            httpOnly: true 
        });

        // ✅ Redirigir solo si no hubo error y no se envió respuesta antes
        res.redirect('/community');
    });
});

router.post('/registerProcess', (req, res) => {
    const post = req.body;
	console.log(post);

    let query = "INSERT INTO usuarios (Username, Password, Dificultad, UserInfo) VALUES ('" + post.username + "', '" + post.password + "','', 0);";
    db.query(query, (err, resultados) => {
        if (err) throw err;
    });

	res.redirect('/community?q=login');
});

function getMySQLDatetime() {
    let now = new Date();
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, "0"); // Mes comienza en 0
    let day = String(now.getDate()).padStart(2, "0");
    let hours = String(now.getHours()).padStart(2, "0");
    let minutes = String(now.getMinutes()).padStart(2, "0");
    let seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

router.post('/sendSugerencia', (req, res) => {
	const post = req.body;
	let time = getMySQLDatetime();

	let query = "INSERT INTO sugerencias (IDUsuario, Titulo, Texto, Tipo, Fecha) VALUES ('" + post.idUsuario + "', '" + post.titulo + "', '" + post.texto + "', '" + post.tipo + "', '" + time + "');";
	
	db.query(query, (err, resultados) => {
		if (err) throw err;
	});

	res.redirect('/community?q=sugerencias');
});

router.post('/like', (req, res) => {
	const post = req.body;

	let query = "INSERT INTO votes (IDSugerencia, IDAutor, `Like`) VALUES (" + post.idSugerencia + ", " + post.idUsuario + ", 'up');";
	
	db.query(query, (err, resultados) => {
		if (err) throw err;
	});

	console.log("Like");
});

router.post('/antilike', (req, res) => {
	const post = req.body;

	let query = "DELETE FROM votes WHERE IDSugerencia = " + post.idSugerencia + " AND IDAutor = " + post.idUsuario + " AND `Like` = 'up';";
	
	db.query(query, (err, resultados) => {
		if (err) throw err;
	});

	console.log("AntiLike");
});

router.post('/dislike', (req, res) => {
	const post = req.body;

	let query = "INSERT INTO votes (IDSugerencia, IDAutor, `Like`) VALUES (" + post.idSugerencia + ", " + post.idUsuario + ", 'down');";
	
	db.query(query, (err, resultados) => {
		if (err) throw err;
	});
	console.log("DisLike");	
});

router.post('/antidislike', (req, res) => {
	const post = req.body;

	let query = "DELETE FROM votes WHERE IDSugerencia = " + post.idSugerencia + " AND IDAutor = " + post.idUsuario + " AND `Like` = 'down';";
	
	db.query(query, (err, resultados) => {
		if (err) throw err;
	});
	console.log("AntiDisLike");
});

module.exports = router;
