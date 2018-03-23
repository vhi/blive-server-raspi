try {
	var express	= require('express');
	var app	= express();
	var session = require('express-session');
	var request = require('request');
	var fs = require('fs');
	const appPath = '/home/pi/blive-server-raspi/';

	/* JsonDB */
	var JsonDB = require('node-json-db');
	var config = loadConfig();
	config = config.getData('/');
	var url = "http://119.235.252.13:777/load/jsonForRaspberry/" + config.raspberryId;
	var requestLoop = setInterval(function(){
	  	request({
	      	url: url,
	      	method: "GET",
			async: true,
	  	},function(error, response, body){
	      	if(!error && response.statusCode == 200){
	      		let rawdata = fs.readFileSync( appPath + 'jsonDb.json');  
				if (rawdata == "" || rawdata == null || rawdata == "{}" ) {
					fs.writeFileSync(appPath + 'jsonDb.json', body);
			      	console.log('init data..');
				}
				else {
			      	loadJsonDb = new JsonDB(appPath + 'jsonDb', true, false);
		      		dbRaspi = loadJsonDb.getData("/");
		      		dbCloud = body;

		      		if (JSON.stringify(dbRaspi) == dbCloud) {
		          		console.log('no update');
		      		}
		      		else {
		      			console.log('any update');
		      			parseJsonCloud = JSON.parse(dbCloud);
		      			zoneDevicesCloud = parseJsonCloud.zone;
		      			zoneDevicesRaspi = dbRaspi.zone;

		      			for (var x in zoneDevicesCloud) {
		      				if (zoneDevicesRaspi != "") {

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
		      		}
		      		loadJsonDb.push("/", JSON.parse(dbCloud), false);
					
				}
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
    jsonDb = new JsonDB(appPath + 'jsonDb', true, false);

    return jsonDb;
}

function loadConfig() {
	configDb = new JsonDB(appPath + 'config', true, false);

    return configDb;
}

