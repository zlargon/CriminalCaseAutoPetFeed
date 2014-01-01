/** nodejs server
 *  for debug and test
 *
 *  depend on "express" module
 *  use following command to install
 *
 *  $ npm install express
 *
 */

var express  = require('express'),
    app = express(),
    port = 3000;

app.use('/', express.static(__dirname + '/'));

// debug
app.get('/debug', function(req, res){
  res.sendfile(__dirname + '/debug.html');
});

// api
app.get('/api', function(req, res){
  res.sendfile(__dirname + '/api/index.html');
});

app.listen(port);
console.log('start express server. port : ' + port + '\n');
