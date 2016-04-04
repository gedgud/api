var express = require('express');
var mysql = require('mysql');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');
var https = require('https');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();  

var pool = mysql.createPool({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database: 'nodejs'
});

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database: 'nodejs'
});

app.post("/api/update", function(req, res) {
	
	var data = req.body.data;
 
	var about = data.about;
	var accessToken = data.accessToken;
	
	console.log(about);
	
	var queryString = 'SELECT * FROM users WHERE accessToken = ? LIMIT 1';
 
	connection.query(queryString, [accessToken], function(err, rows, fields) {
		if (err) throw err;
		if (typeof rows[0] != 'undefined') {
			connection.query('UPDATE users SET about = ? WHERE accessToken = ?', [about, accessToken]);
			//console.log(about);
		}
	});
});

app.post("/api/update/photo", function(req, res) {
	
	var data = req.body.data;
 
	var imageData = data.imageData;
	var accessToken = data.accessToken;
	
	console.log("test");
	
	var queryString = 'SELECT * FROM users WHERE accessToken = ? LIMIT 1';
 
	connection.query(queryString, [accessToken], function(err, rows, fields) {
		if (err) throw err;
		if (typeof rows[0] != 'undefined') {
			connection.query('UPDATE users SET photo = ? WHERE accessToken = ?', [imageData, accessToken]);
			//console.log(about);
		}
	});
});

		
app.post("/user/login", function(req, res) {

	var data = req.body.data;

    var post = {
		fbid: data.id,
        accesToken: data.accesToken
    };
 
	var id = data.id;
	var accesToken = data.accesToken;
	
	var queryString = 'SELECT * FROM users WHERE fbid = ? LIMIT 1';
 
	connection.query(queryString, [id], function(err, rows, fields) {
		if (err) throw err;
		
		if (typeof rows[0] != 'undefined') {
				
			var options = {
				host: 'graph.facebook.com',
				path: '/me?access_token=' + accesToken
			};

			https.get(options, function(fbres) {
				console.log("Got response: " + fbres.statusCode);

			fbres.on("data", function(fb) {
				fb = JSON.parse(fb);
				console.log(fb.id);
				if( id == fb.id)
				{
					//
					var userdata = {
						name: rows[0].name,
						about: rows[0].about
					};
					res.json(rows[0]);  
					console.log(userdata);
					connection.query('UPDATE users SET accessToken = ? WHERE fbid = ?', [accesToken, id]);
				} else {
					console.log("KLAIDA!");
				}
			});
		
			}).on('error', function(e) {
				console.log("Got error: " + e.message);
			});
		
		} else {
			connection.query('INSERT INTO users SET ?', post, function(error) {
			if (error) {
				console.log(error.message);
			} else {
				console.log('success');
				res.send("Hello");			
			}
    });
		}
	});
});

app.param(['id'], function (req, res, next, value) {
  console.log('CALLED ONLY ONCE with', value);
  next();
});



	
app.get('/user/:id', function (req, res, next) {
	//console.log('although this matches');
	
	res.setHeader('Content-Type', 'text/plain');
  
	var id = req.params.id;
	var queryString = 'SELECT * FROM users WHERE fbid = ? LIMIT 1';
 
	connection.query(queryString, [id], function(err, rows, fields) {
		if (err) throw err;
		
		if (typeof rows[0] != 'undefined') {
			res.json(rows[0]);  
			console.log(rows[0]);
		} else {
			console.log("Nerasta");
		}
	});
	
	next();
});

app.use('/api', router);





var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})