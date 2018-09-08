var express = require('express');
var router = express.Router();

// repositionnement sur la racine
var n = __dirname.search("routes");
var dirname_racine = __dirname.slice(0, n-1);

/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/
router.get('/', function(request, response) {
		response.setHeader('Content-Type', 'text/plain');
		//response.send( 'Bonjour, ici le serveur Express, je tourne sur ' + __dirname +' (dirname)');
		response.send( 'Bonjour, ici le serveur Express, je tourne sur ' + dirname_racine +' (dirname)');
	})

	.get('/bud_zbud01', function(request, response) {
		// exécuté lorsqu'est appelé zbud01
		 response.sendFile( dirname_racine  + '/bud_zbud01.html')
	})

	.get('/cgef_demat', function(request, response) {
		// exécuté lorsqu'est appelé demat_crossfilter
		 response.sendFile( dirname_racine  + '/cgef_demat.html');
	});

module.exports = router;
