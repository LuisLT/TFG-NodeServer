var models = require('../models');

var Web3 = require("./web3");
var Web3_product = require("./Web3_product");
var moment = require('moment');
var QRc = require('qr-image');

// GET /products
exports.index = function(req, res, next) {

    var contractInstance = Web3.contractInstance;

    var contracts = [];
    var names = [];
    var nAlerts = [];
    var actives = [];
    var nElements = contractInstance.count();
    var i;
    for (i= 0; i<nElements; i++){
        var element = contractInstance.contracts(i);
        contracts.push(element);
    }
    for (i=0; i<nElements; i++){
        var addr_product = contracts[i];
        var MyContract_product = Web3_product.MyContract_product;
        var contractInstance_product = MyContract_product.at(addr_product);
        var name = contractInstance_product.name();
        names.push(name);

        var alert = contractInstance_product.countAlerts().toNumber();
        nAlerts.push(alert);
        var active = contractInstance_product.active();
        actives.push(active);
        
    }
    res.render('products/index', {contracts: contracts, names:names, nAlerts:nAlerts, actives:actives});
};

// GET /products/new
exports.new = function (req, res, next) {

    var productN = {name: "", company: "", key: ""};

    res.render('products/new', {productN: productN});
};


// POST /products/create
exports.create = function (req, res, next) {

    var productN = {nombre: req.body.name, fabrica: req.body.company, key: req.body.key};
   
    // Validar que no estan vacios
    if (!req.body.name || !req.body.company || !req.body.key) {
        res.render('products/new', {productN: productN});
        return;
    }

    var primaryAddress = Web3.primaryAddress;
    var contractInstance = Web3.contractInstance;
    var productN = contractInstance.createProduct.sendTransaction(req.body.name,req.body.company,req.body.key, {from: primaryAddress, gas:2000000 });


    res.redirect('/products');

};

// DELETE /products/:directionId
exports.destroy = function (req, res, next) {

    var addr_product = String(req.params.directionId);

    console.log("delete",addr_product);

    var primaryAddress = Web3.primaryAddress;
    var contractInstance = Web3.contractInstance;

    contractInstance.deleteProduct.sendTransaction(addr_product,{from: primaryAddress, "gas": 400000 });

    res.redirect('/products');
};

exports.changeState = function(req,res,next){
    var addr_product = String(req.params.directionId);

    console.log("baj",addr_product);

    var primaryAddress_product = Web3_product.primaryAddress_product;
    var MyContract_product = Web3_product.MyContract_product;

    var contractInstance_product = MyContract_product.at(addr_product);

    contractInstance_product.productStateOff.sendTransaction({from: primaryAddress_product, "gas": 100000 });

    res.redirect('/products/'+addr_product+'/article');

}


// GET /products/:directionId
exports.show = function (req, res, next) {

    var MyContract_product = Web3_product.MyContract_product;

    var addr_product = String(req.params.directionId);

    var contractInstance_product = MyContract_product.at(addr_product);
    var name = contractInstance_product.name();
    var company = contractInstance_product.company();
    var key = contractInstance_product.key();

    var alerts = [];
    nAlerts = contractInstance_product.countAlerts();
    var i;
    for (i= 0; i<nAlerts; i++){
     var al = contractInstance_product.alerts(i);
     alerts.push(al);
    }

    var qr1 = QRc.svgObject(addr_product, { type: 'svg'});
    var qr = qr1.path;
    var active = contractInstance_product.active();
    res.render('products/article', { name: name, company:company, key:key, addr_product: addr_product, alerts:alerts, qr:qr, nAlerts:nAlerts, active:active});

};


// GET /products/:directionId/newAlert
exports.newAlert= function (req,res,next){

    var alertN = {reason:""};
    var addr_product = String(req.params.directionId);
    console.log("newALert", addr_product);

    res.render('products/newAlert', {alertN: alertN, addr_product:addr_product});
};



// POST /products/:directionId/article/createAlert
exports.createAlert= function (req,res,next){

    var primaryAddress_product = Web3_product.primaryAddress_product;
    var MyContract_product = Web3_product.MyContract_product;

    var addr_product = String(req.params.directionId);

    var alertN = {reason:req.body.reason};

    if (!req.body.reason) {
        res.render('products/newAlert', {alertN: alertN, addr_product:addr_product});
       return;
    }

    var contractInstance_product = MyContract_product.at(addr_product);
    var alertN = contractInstance_product.addAlert.sendTransaction(req.body.reason, {from: primaryAddress_product,"gas": 300000});

    res.redirect('/products/'+addr_product+'/article');

};


// GET /products/:directionId/showPoints
exports.showPoints= function (req,res,next){

    var MyContract_product = Web3_product.MyContract_product;

    var addr_product = String(req.params.directionId);
    var contractInstance_product = MyContract_product.at(addr_product);

    var locations = [];
    var dates = [];

    var nLocs =  contractInstance_product.countLocations();

    var i;
    for (i= 0; i<nLocs; i++){
        var loc = contractInstance_product.locations(i);
        locations.push(loc);

        var a = loc[3].toNumber();
        var m = moment(a*1000).format("DD/MM/YYYY H:mm:ss");
        dates.push(m);
    }

    res.render('products/showPoints', { locations: locations, addr_product:addr_product, dates:dates});

};


// GET /products/:directionId/newPoint
exports.newPoint = function (req,res, next) {

        var pointN = {city:"", longitude:"", latitude:""};
        var addr_product = String(req.params.directionId);

        console.log("newPoint ",addr_product);

    res.render('products/newPoint', {pointN: pointN, addr_product:addr_product});
};

// POST /products/:directionId/showPoints/create

exports.createPoint = function (req, res, next) {

    var primaryAddress_product = Web3_product.primaryAddress_product;
    var MyContract_product = Web3_product.MyContract_product;

    var addr_product = String(req.params.directionId);

    var pointN = {ciudad:req.body.city, longitud:req.body.longitude, latitud:req.body.latitude};

    if(!req.body.city || !req.body.longitude || !req.body.latitude){
        res.render('products/newPoint', {pointN: pointN , addr_product:addr_product});
        return;
    }

    var contractInstance_product = MyContract_product.at(addr_product);

    var pointN = contractInstance_product.addTrackingPoint.sendTransaction(req.body.city, req.body.longitude, req.body.latitude, {from: primaryAddress_product,"gas": 500000});

    res.redirect('/products/'+addr_product+'/showPoints');

};
