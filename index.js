'use strict';

let url = require('url');
let fs = require('fs');

let FILES_FOLDER = __dirname + '/files/';

let STATUS_CODES = {
  OK: 200,
  NOT_SUPPORTED: 500,
  FILE_EXIST: 409,
  FILE_TOO_BIG: 413,
  FILE_NOT_FOUND: 404,
  UNSUPPORTED_PATH: 400

};

require('http').createServer(function(req, res) {

  let pathname = decodeURI(url.parse(req.url).pathname);

  switch(req.method) {
    case 'GET':
      if (pathname == '/') {
        // отдачу файлов следует переделать "правильно", через потоки, с нормальной обработкой ошибок
        sendFile(__dirname + '/public/index.html', res);

        return;
      } else {
        let fileName = permitFileName(pathname);
        console.log("FileName: ", fileName, " pathname: ", pathname);
        if (!fileName) {
          errorResponse(400, res);
          return;
        }

        sendFile(FILES_FOLDER + fileName, res);
        return;
        // res.end();

      }

    default:
      res.statusCode = 502;
      res.end("Not implemented");
  }

}).listen(3000);

function errorResponse(code, res) {
  var errorMessage;

  switch(code) {
    case STATUS_CODES.UNSUPPORTED_PATH:
      errorMessage = "Path to file is not supported";
      break;
    case STATUS_CODES.FILE_EXIST:
      errorMessage = "File already exist";
  }

  res.statusCode = code;
  res.end(errorMessage);
}

function permitFileName(fileName) {
  let PERMITTED_FILES_REGEXP = /^\/[^/]+$/;

  let fileNameMatch = fileName.match(PERMITTED_FILES_REGEXP);
  if (!fileNameMatch) return;

  let file = fileNameMatch[0].slice(1);
  if (file === 'favicon.ico') return;

  return file;
}


function sendFile(filePath, res) {
  let options = {flags: 'r', autoClose: true};
  let readFileStream = fs.createReadStream(
    filePath, options);

  readFileStream.pipe(res);

  readFileStream.on('error', (err) => {
    handleFileErorrs(err, res);
  });

  res.on('finish', () => {
    console.log('All write are complete');
  });

  res.on('close', () => {
    readFileStream.destroy();
  });
}

function handleFileErorrs(err, res) {
  let statusCode;
  let errorMessage;

  switch(err.code) {
    case 'ENOENT':
      statusCode = STATUS_CODES.FILE_NOT_FOUND;
      errorMessage = err.message;
      break;

    default:
      statusCode = STATUS_CODES.NOT_SUPPORTED;
      errorMessage = err.message;
  }

  console.error(err);

  res.statusCode = statusCode;
  res.end(errorMessage);
}
