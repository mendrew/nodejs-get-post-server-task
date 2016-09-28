'use strict';

let url = require('url');
let fs = require('fs');

let FILES_FOLDER = __dirname + '/files';

require('http').createServer(function(req, res) {

  let pathname = decodeURI(url.parse(req.url).pathname);

  switch(req.method) {
  case 'GET':
    if (pathname == '/') {
      // отдачу файлов следует переделать "правильно", через потоки, с нормальной обработкой ошибок
      fs.readFile(__dirname + '/public/index.html', (err, content) => {
        if (err) throw err;
        res.setHeader('Content-Type', 'text/html;charset=utf-8');
        res.end(content);
      });
      return;
    } else {
      
    }

  default:
    res.statusCode = 502;
    res.end("Not implemented");
  }

}).listen(3000);