#!/usr/bin/env node
// Copyright 2017 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// server.js
// Application entrypoint.
//

const fs = require('fs'),
      http = require('http'),
      path = require('path');

const mimeMap = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

function handleRequest(requestPath, request, response, directoryRequest) {
  if (!fs.existsSync(requestPath)) {
    if (directoryRequest) {
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/plain');
      response.end(path.dirname(requestPath));
    }
    else {
      response.writeHead(404);
      response.end();
    }

    return;
  }

  if (fs.statSync(requestPath).isDirectory()) {
    requestPath = path.join(requestPath, 'index.html');
    handleRequest(requestPath, request, response, /* directoryRequest */ true);
    return;
  }

  fs.readFile(requestPath, (e, data) => {
    if (e) {
      response.statusCode = 500;
      response.end(`Error reading file ${requestPath}:\n${e}`);
    }
    else {
      response.statusCode = 200;

      let contentType = mimeMap[path.parse(requestPath).ext] || 'application/octet-stream';
      response.setHeader('Content-Type', contentType);
      response.setHeader('Content-Length', data.length.toString());

      response.end(data);
    }
  });
}

function serve(root, port) {
  root = path.resolve(root);

  const server = http.createServer((request, response) => {
    console.log(request.url);

    let requestPath = path.resolve(root, './' + request.url);
    handleRequest(requestPath, request, response);
  });

  server.listen(port);
  console.log(`Serving ${root} at http://localhost:${port} ...`);
}

try {
  if (process.argv.length < 4) {
    throw new Error('The path and port arguments must be specified.');
  }

  let root = process.argv[2];
  let port = parseInt(process.argv[3], 10);

  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error('The specified path must be an existing directory.');
  }

  serve(root, port);
}
catch(e) {
  console.error(e.toString());
  console.error('Usage: node server.js path port');

  process.exit(1);
}
