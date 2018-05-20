const mysql = require("mysql");
const con = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'password'
});

var SOCKET_LIST = {};


/*con.connect((err) => {
	if(err) {
		console.log("There has been an error");
		return;
	} else {
		console.log("Connection Established");
	}
});

con.end((err) => {

});	*/

const express = require("express");
var router = express.Router();
const fs = require("fs");
const logins = require(__dirname+"\\logins")
const aes = require("crypto-js/aes");
const crypto = require("crypto-js");
var app = express();
var dbo = null;
var db = null;
var regex = /\i/;

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get("/",function(req,res) {
	res.send("Login");
});
module.exports = router;

app.use(express.static(__dirname, + "/"));

/*app.get("/view.html",function(req,res) {
	dbo.open(function(err,db) {
		assert.equal(null,err);
		var cursor = dbo.collection("Patients").find().limit(1).sort({$natural:-1});
		cursor.each(function(err,doc) {
			assert.equal(err,null);
			if(doc != null) {
				req.status(200).json(doc);
				return;
			}
		});
	});
});*/


var server = app.listen(8080, "127.0.0.1",function() {
	var port = server.address().port;
	console.log("Server Running at Port %s",port);
});

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  dbo = db.db("db");
  db = db;
  //console.log(JSON.stringify(dbo));
  /*var myobj = { name: "Company Inc", illness: "broken", report: "gjhfjhgf" };
  dbo.collection("Patients").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });*/
});

var io = require("socket.io")(server);

io.on("connection",function(socket) {
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	socket.on("disconnect",function() {
		delete SOCKET_LIST[socket.id];
	});
	socket.on("login",function(data) {
		var ubytes = aes.decrypt(data[0],"pass");
		var u = ubytes.toString(crypto.enc.Utf8);
		var pbytes = aes.decrypt(data[1],"pass");
		var p = pbytes.toString(crypto.enc.Utf8);
		console.log(u+":"+p);
		var contents = JSON.parse(fs.readFileSync(__dirname+"\\logins.json","utf8"));
		for(var i=0;i<contents.length;i++) {
			if(contents[i].user == u && contents[i].pass == p) {
				socket.emit("lsuccess");
			}
		}
	});
	socket.on("submitReport",function(data) {
		var myobj = { name: data[0], illness: data[1], report: data[2] };
  		dbo.collection("Patients").insertOne(myobj, function(err, res) {
	    	if (err) throw err;
	    	console.log("1 document inserted");
 		});
	});
	socket.on("requestdb",function(data) {
		var query = { "name":data };
		if(data !== "all-db") {
			dbo.collection("Patients").find({name:{$regex:new RegExp(data,"i")}}).sort({"name":1}).toArray(function(err,result) {
				if(err) throw err;
				socket.emit("senddb",result);
			});
		} else {
			dbo.collection("Patients").find({}).sort({"name":1}).toArray(function(err,result) {
				if(err) throw err;
				socket.emit("senddb",result);
			});
		}
	});
	console.log("User Connected, Socket ID: ",socket.id);
});