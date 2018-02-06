try {
	var express	= require('express');
	var app	= express();
	var session = require('express-session');
	var request = require('request');

	/* JsonDB */
	var JsonDB = require('node-json-db');
		var requestLoop = setInterval(function(){
		  	request({
		      	url: "http://119.235.252.13:777/load/jsonForRaspberry/9988776655",
		      	method: "GET",
				async: true,
		  	},function(error, response, body){
		      	if(!error && response.statusCode == 200){
		      		loadJsonDb = new JsonDB('fileJson', true, false);
		      		dbRaspi = loadJsonDb.getData("/");
		      		dbCloud = body;
		      		if (dbRaspi == dbCloud) {
		          		// console.log('no update');
		      		}
		      		else {
		      			parseJsonCloud = JSON.parse(dbCloud);
		      			// parseJsonRaspi = JSON.parse(dbRaspi);
		      			zoneDevicesCloud = parseJsonCloud.zone;
		      			zoneDevicesRaspi = dbRaspi.zone;

		      			for (var x in zoneDevicesCloud) {
		      				if (zoneDevicesCloud[x].status != zoneDevicesRaspi[x].status){
		      					command = "";
		      					if (zoneDevicesCloud[x].status_from == "away") {
		      						switch(zoneDevicesCloud[x].status) {
		      							case "on":
		      								switch(zoneDevicesCloud[x].sort){
		      									case "light":
		      										command = "100";
		      									break;
		      									case "ac":
		      										command = "1";
		      									break;
		      									case "tv":
		      										command = "1";
		      									break;
		      								}
		      								ipAddress = parseJsonCloud.controller[zoneDevicesCloud[x].controllerName].ip;
		      								url = "http://" + ipAddress + "/" + zoneDevicesCloud[x].command + "/?value=" + command;
		      								request({
												url: url,
												method: "GET",
												async: true,
												}, function (error, response, body){
													// response
											});
		      								console.log("Eksekusi: " + url);
		      							break;
		      							case "off":
		      								switch(zoneDevicesCloud[x].sort){
		      									case "light":
		      										command = "0";
		      									break;
		      									case "ac":
		      										command = "5";
		      									break;
		      									case "tv":
		      										command = "1";
		      									break;
		      								}
		      								ipAddress = parseJsonCloud.controller[zoneDevicesCloud[x].controllerName].ip;
		      								url = "http://" + ipAddress + "/" + zoneDevicesCloud[x].command + "/?value=" + command;
		      								request({
												url: url,
												method: "GET",
												async: true,
												}, function (error, response, body){
													// response
											});
		      								console.log("Eksekusi: " + url);
		      							break;
		      						}
		      					}
		      				}
		      			}
		      		}

		      		loadJsonDb.push("/", parseJsonCloud, false);
		      	}
		      	else{
		            console.log('error: ' + error);
		      	}
		  	});
		}, 1000);
	app.listen(9191, function() {
		console.log('server has been start with port: 9191');
	});
} catch(e) {
	console.log('error: ' + e);
}

function loadJsonDb(){
	//The First argument is filename
	//The second argument is used to tell the DB to save after each push 
	//If you put false, you'll have to call the save() method. 
	//The third argument is to ask JsonDB to save the database in an human readable format. (default false)
    jsonDb = new JsonDB('fileJson', true, false);

    return jsonDb;
}

