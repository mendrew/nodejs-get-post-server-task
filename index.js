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
      sendIndexHtml(__dirname + '/public/index.html', res);

      return;
    } else {
      console.log(pathname);
      res.end();

    }

  default:
    res.statusCode = 502;
    res.end("Not implemented");
  }

}).listen(3000);

function sendIndexHtml(indexPath, res) {
  let indexStreamOptions = {flags: 'r', autoClose: true};
  let indexHtmlReadStream = fs.createReadStream(
    indexPath, indexStreamOptions);

  indexHtmlReadStream.pipe(res);

  indexHtmlReadStream.on('error', (err) => {
    res.statusCode = 500;
    res.end('Unknow error happended, wile we read index.html file');
    console.error(err);
  });

  res.on('finish', () => {
    console.log('All write are complete');
  });

  res.on('close', () => {
    indexHtmlReadStream.destroy();
  });
}
