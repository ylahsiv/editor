const fs = require('fs');
var http = require('spdy');
var pty = require('node-pty');
const pathLib = require('path');
const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const compression = require('compression');

const port = 443;
const app = express();

var options = {
  key: fs.readFileSync('./key/server.key'),
  cert: fs.readFileSync('./key/server.crt'),
  ca: fs.readFileSync('./key/server.csr')
};

var server = http.createServer(options, app).listen(port);
var io = require('socket.io')(server, {pingTimeout: 60000});
var terminals = [];

app.use(compression());

app.use(express.static(__dirname, {
  etag: true,
  lastModified: false,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'max-age=31536000');
  },
}));

app.use(bodyParser.json({limit: '1024mb'}));
app.use(bodyParser.urlencoded({limit: '1024mb', extended: true}));

// render the home page
app.get('/directory', function(req, res) {
  res.sendFile(pathLib.join(__dirname + '/index.html'));
});

// render the home page
app.get('/', function(req, res) {
  res.sendFile(pathLib.join(__dirname + '/index.html'));
});

// api to fetch a file
app.get('/api/resource', function(req, res) {
  res.send(fs.readFileSync(req.query.file, 'UTF-8'));
});

// api to save a file
app.post('/api/resource/save', function(req, res) {
  fs.writeFile(req.body.fileLocation, req.body.fileContent, function (err) {
    if (err){
      res.send(err);
    } else {
      res.send('File ' + req.body.fileLocation + ' saved !');
    }
  });
});

// api to format c++ files
app.post('/api/resource/format', function(req, res) {
  exec('clang-format -i "' + req.body.fileLocation + '"', (err, stdout, stderr) => {
    res.send('success');
  });
});

// api to create a directory or a file
app.post('/api/resource/manage', function(req, res) {
  var resourceToBeMoved;
  var resourceType = req.body.resourceType;
  var operationType = req.body.operationType;
  var resourceLocation = req.body.resourceLocation;
  var resourceParentLocation = req.body.resourceParentLocation;
  var api = req.body.api;
  if(operationType === 'create_new_node') {
    if(resourceType === 'folder') {
      console.log('create_new_node folder : cd "' + resourceParentLocation + '" && mkdir "' + resourceLocation + '"');
      exec('cd "' + resourceParentLocation + '" && mkdir "' + resourceLocation + '"', (err, stdout, stderr) => {
        res.send('success');
      });
    } else if(resourceType === 'file') {
      console.log('create_new_node file : cd  + resourceParentLocation +  && touch  + resourceLocation + ');
      exec('cd "' + resourceParentLocation + '" && touch "' + resourceLocation + '"', (err, stdout, stderr) => {
        res.send('success');
      });
    }
  } else if(operationType === 'delete_node') {
    console.log('delete_node : rm -rf "' + resourceLocation + '"');
    exec('rm -rf "' + resourceLocation + '"', (err, stdout, stderr) => {
      res.send('success');
    });
  } else if(operationType === 'rename_old_node') {
    console.log('rename_old_node : cd  + resourceParentLocation +  && mv  + req.body.oldResourceLocation +   + resourceLocation + ');
    exec('cd "' + resourceParentLocation + '" && mv "' + req.body.oldResourceLocation + '" "' + resourceLocation + '"', (err, stdout, stderr) => {
      res.send('success');
    });
  }  else if(operationType === 'move_node') {
    console.log('move_node : cd  + resourceParentLocation +  && mv  + req.body.resourceToBeMoved +  .');
    exec('cd "' + resourceParentLocation + '" && mv "' + req.body.resourceToBeMoved + '" .', (err, stdout, stderr) => {
      res.send('success');
    });
  } else if(operationType === 'copy_node') {
    console.log('copy_node : cd  + resourceParentLocation +  && cp -r  + req.body.resourceToBeMoved +  .');
    exec('cd "' + resourceParentLocation + '" && cp -r "' + req.body.resourceToBeMoved + '" .', (err, stdout, stderr) => {
      res.send('success');
    });
  }
});

// api to fetch the directory nodes
app.get('/api/tree', function(req, res) {
  var response = [];
  var result = [];
  fs.readdir(req.query.id, function(err, list) {
    if(list) {
      var sortedList = list.sort(naturalCompare);
      sortedList = separateOnExtensions(sortedList);
      for (var i = 0; i <= sortedList.length - 1; i++) {
        if(!sortedList[i].startsWith(".") && !sortedList[i].includes("Icon\r") && !sortedList[i].includes("System Volume Information") && !sortedList[i].includes("$RECYCLE.BIN")) {
          response.push(processNode(req.query.id, sortedList[i]));
        }
      }
      result = putFilesInFront(response);
      res.json(result);
    } else {
      res.json(null);
    }

  });
});

// api to download a non text file
app.post('/api/resource/download', function(req, res) {
  res.download(req.body.fileLocation, "report.pdf");
});

function separateOnExtensions(list) {
  var output = [];
  var set1 = new Set();
  for (var i = 0; i < list.length; i++) {
    set1.add(pathLib.extname(list[i]));
  }
  var extList = Array.from(set1);
  for (var j = 0; j < extList.length; j++) {
    for (var k = 0; k < list.length; k++) {
      if(extList[j] === pathLib.extname(list[k])) {
        output.push(list[k]);
      }
    }
  }
  return output;
}

function processNode(path, f) {
  var s = fs.statSync(pathLib.join(path, f));
  return {
    "id": pathLib.join(path, f),
    "text": f,
    "li_attr": {
      "base": pathLib.join(path, f),
      "isLeaf": !s.isDirectory()
    },
    "children": s.isDirectory()
  };
}

function putFilesInFront(response) {
  var files = [];
  var dirs = [];
  for( var i = 0; i <= response.length-1; i++) {
    if ( response[i].li_attr.isLeaf === true) {
      files.push(response[i]);
    } else {
      dirs.push(response[i]);
    }
  }
  return dirs.concat(files);
}

function naturalCompare(a, b) {
  var ax = [], bx = [];
  a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
  b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
  while(ax.length && bx.length) {
    var an = ax.shift();
    var bn = bx.shift();
    var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
    if(nn) return nn;
  }
  return ax.length - bx.length;
}

io.on('connection', function(socket) {
  var terminal1 = pty.spawn('powershell.exe', [], {
    name: 'xterm-color',
    cols: 200,
    rows: 100,
    cwd: process.env.HOME,
    env: process.env
  });
  var terminal2 = pty.spawn('powershell.exe', [], {
    name: 'xterm-color',
    cols: 2000,
    rows: 1000,
    cwd: process.env.HOME,
    env: process.env
  });

  terminals.push(terminal1);
  terminals.push(terminal2);

  terminal1.on('data', function(data) {
    socket.emit('output', data);
  });
  terminal2.on('data', function(data) {
    socket.emit('lint_output', data);
  });
  socket.on('input', (data, fn) => {
    terminal1.write(data);
    fn(data);
  });
  socket.on('lint_input', (data, fn) => {
    terminal2.write(data);
    fn(data);
  });
  socket.on("disconnect", function() {
    terminal1.destroy();
    terminal2.destroy();
  });
});
