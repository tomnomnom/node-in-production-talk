var http = require('http');

var STATS = {
  stuffsDone: 0
};

var server = http.createServer(function(req, res){
  res.writeHead(200, {'Content-Type': 'application/json'});

  STATS.memory = process.memoryUsage();
  STATS.uptime = process.uptime();

  res.end(JSON.stringify(STATS));
}).listen(9090, '127.0.0.1');

setInterval(function(){
  // Do some a stuff
  STATS.stuffsDone++;
}, 1000);
