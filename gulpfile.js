"use strict";
var gulp = require("gulp"),
	concat = require("gulp-concat"),
	copy = require("gulp-copy"),
	express = require("express"),
	karma = require('karma'),
	bodyParser = require('body-parser'),
	port = 8080;

var config = {
	copy : {
		source : [ "src/*.html"],
		destination : "dist/"
	},
	css : {
		source : ["src/css/**/*.css"],
		destination : "dist/css/",
		dest_file : "app.min.css"
	},
	js : {
		source : [	"./node_modules/angular/angular.js",
					"./node_modules/angular-ui-router/release/angular-ui-router.js",
					"./node_modules/angular-resource/angular-resource.js",
					"src/js/**/*.js"],
		destination : "dist/js/",
		dest_file : "app.min.js"
	}
};

//server
function startServer(){
	var express = require('express');
	var app = express();
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(express.static(__dirname + '/dist'));
	app.use(function(req, res, next) {
	  	res.setHeader('Access-Control-Allow-Origin', '*');
	  	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	  	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
	  	next();
	});
	var gdata = [{
		title : "testing blog title",
		subject : "blog subject",
		body : "blog body",
		_id : 1
	}];
	
	var _id = 2;

	app.get('/api/blog/:id', function(req, res) {
		var data = gdata.filter(function(obj){
			return obj._id == req.params.id;
		})
		var resData = ( data.length > 0 ) ? data[0] : {};
	  	res.json(resData);
	});
	app.get('/api/blog', function(req, res) {
	  	res.json(gdata);
	});
	
	app.post('/api/blog', function(req, res) {
	  	var data = req.body;
	  	data["_id"] = _id++;
	  	gdata.push( data );
	  	console.log(data);
	  	res.json({'message':'success'});
	});

	app.put('/api/blog/:id', function(req, res){		
		gdata.filter(function(obj){
			if( obj._id == req.params.id ){
				obj.title = req.body.title;
				obj.subject = req.body.subject;
				obj.body = req.body.body;
			}
		})
		console.log( gdata );
		res.json({'message':'success'});
	})

	app.delete('/api/blog/:id', function(req, res){
		gdata = gdata.filter(function(obj){
			return obj._id != req.params.id;
		});
		console.log( gdata );
		res.json({'message':'success'});
	})

	app.listen(port);
}

gulp.task("concat_css", function() {
	return gulp.src( config.css.source )
    	.pipe(concat( config.css.dest_file, {newLine: ';'} ))
    	.pipe(gulp.dest( config.css.destination))
})

gulp.task("concat_js", function() {
	return gulp.src( config.js.source )
    	.pipe(concat( config.js.dest_file))
    	.pipe(gulp.dest( config.js.destination))
})

gulp.task("copy", function(){
	return gulp.src(config.copy.source)
    .pipe(copy(config.copy.destination, { prefix: 1 }) )
    //.dest(config.copy.destination);
})

gulp.task('karma', function(done) {
    karma.server.start({
        configFile: __dirname + '/karma.conf.js'
    }, done);
	/*
    var Server = karma.server;
    server = new Server({
        configFile: __dirname + '/karma.conf.js'
    }, done)
 	server.start();
 	*/
});


gulp.task('build', ['copy','concat_css','concat_js'], function() {
     
});

gulp.task("watchFiles", function(){
	var source = config.copy.source.concat( config.css.source, config.js.source );
	gulp.watch(source, ['build']);
})

gulp.task('serve', ['build', 'watchFiles'], function() {
    //call the server
    startServer();
});

gulp.task('coverage', ['karma'], function() {     
});

gulp.task('default', ['serve']);
