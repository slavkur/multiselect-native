var express = require('express');
var server = express();

server.engine('html', require('ejs').renderFile);
server.use('/js', express.static(__dirname + '/js'));
server.use('/styles', express.static(__dirname + '/styles'));

server.get('/', function(req, res) {
    res.render(__dirname + '/index.html');
});

server.listen(8080, '127.0.0.1');