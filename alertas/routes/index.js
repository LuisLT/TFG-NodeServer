var express = require('express');
var router = express.Router();

var siteCtrl = require("../controllers/fabric_controller");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
}); 

router.get('/cred', function(req, res, next) {
  res.render('cred');
}); 


//Definicion de rutas 

//rutas de la fábrica

router.get('/products', 		  siteCtrl.index);
router.get('/products/new',      siteCtrl.new);
router.post('/products',         siteCtrl.create);
router.delete('/products/:directionId',  siteCtrl.destroy);


//ruta para mostrar article
router.get(   '/products/:directionId/article',		siteCtrl.show);


//rutas de las alertas que aparecen en el article
router.get('/products/:directionId/newAlert',            siteCtrl.newAlert);
router.post('/products/:directionId/article',         siteCtrl.createAlert);

router.delete('/products/:directionId/article',         siteCtrl.changeState);


//rutas para mostrar puntos de tracking y crearlos
router.get(   '/products/:directionId/showPoints',		siteCtrl.showPoints);

router.get('/products/:directionId/newPoint',          siteCtrl.newPoint);
router.post('/products/:directionId/showPoints',       siteCtrl.createPoint);


module.exports = router;
