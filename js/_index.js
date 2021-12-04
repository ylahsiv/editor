var fileOpened, blob, socket, terminal, fitAddon, searchAddon, unicode11Addon, webLinksAddon, alertTimeout, markers = [], lintOutput = '', resourceMoveId, resourceMoveType, resourceMoveAction, parentDirectory, split = false;
const defaultHeight = getDivHeight('tab_browsing_area');
var cursorPositionCachingAllowed = false;
const supportedFilesForSyntaxCheck = ['cpp', 'java'];
const pausableNonTextFileExtensions = ['mp3', 'mp4'];
const supportedNonTextFileExtensions = ['mp3', 'mp4', 'pdf', 'jpeg', 'jpg', 'png', 'gif'];
const supportedFilesExtensionsForRunning = ['py', 'rb', 'cpp', 'java', 'c', 'scala', 'sh'];
const supportedFileExtensionsForEditor = ['properties', 'xml', 'scss', 'py', 'erb', 'plist', 'sh', 'rb', 'ru', 'lock', 'cpp', 'java', 'c', 'scala', 'text', 'txt', 'js', 'json', 'html', 'css', 'csv', 'tsv', 'yml', 'key', 'enc', 'log', 'ts', 'conf', 'md', 'ejs', 'php', 'json5', 'md', 'sql'];
var splitterBar = new SplitterBar(gE('container'), gE('leftContainer'), gE('rightContiner'));

if(gE(terminal)) {
  gE(terminal).style.height = (window.innerHeight - defaultHeight).toString() + px;
}

document.onclick = function(e) {
  hide('menu1');
  hide('menu2');
  hide('menu3');
};

function gE(e) {
  return document.getElementById(e);
}

function sinh(e, value) {
  gE(e).innerHTML = value;
}

function ginh(e) {
  return gE(e).innerHTML;
}

function show(div) {
  gE(div).style.visibility = 'visible';
}

function hide(div) {
  gE(div).style.visibility = 'hidden';
}

function ce(e) {
  return document.createElement(e);
}

function getDivHeight(id) {
  return gE(id).offsetHeight;
}

function getDivWidth(id) {
  return gE(id).offsetWidth;
}

function aw() {
  if (typeof adjustOffset !== "undefined") {
    adjustOffset();
  }
}

function highlightNode(node, type, RC = false) {
  if(type === 'folder') {
    if(RC) node = gE(node).children[0];
    addNodeStyle(node);
    setTimeout(function() {clearNodeStyle(node)}, 300);
  } else if(type === 'file') {
    addNodeStyle(gE(node));
    setTimeout(function() {clearNodeStyle(gE(node))}, 300);
  }
}

function addNodeStyle(node) {
  node.style.borderColor = "#99defd";
  node.style.backgroundColor = "#beebff";
}

function clearNodeStyle(node) {
  node.style.backgroundColor = "";
  node.style.borderColor = "";
}

function loadScriptFile(fileLocation, callback) {
  var fileref;
  if (fileLocation.endsWith('js')) {
    fileref = ce('script');
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", fileLocation);
  }
  else if (fileLocation.endsWith('css')) {
    fileref = ce("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", fileLocation);
  }
  if (typeof fileref !== "undefined") {
    document.getElementsByTagName("body")[0].appendChild(fileref);
  }
  fileref.onload = function(data) {
    callback();
  };
}

// xhr utils
function xhrPost(url, body, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify(body));
  xhr.onload = function (e) {
    callback(xhr.responseText);
  };
}

function xhrGet(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.send();
  xhr.onload = function (e) {
    callback(xhr.responseText);
  };
}

function getBaseFileName(filePath) {
  return filePath.split('\\').pop().split('/').pop();
}

function onFileKeyPressEventsProcesses(e) {
  if( e.key === "k" && e.ctrlKey && isvis('terminal')) {
    clearTerminal();
    stopDefaultPropagation(e);
  } else if( e.key === "r" && e.ctrlKey) {
    runCurrentFile();
    stopDefaultPropagation(e);
  } else if( e.key === "s" && e.ctrlKey) {
    saveCurrentFile();
    stopDefaultPropagation(e);
  } else if( e.key === "d" && e.ctrlKey) {
    clearCurrentSession();
    stopDefaultPropagation(e);
  } else if( e.key === "e" && e.ctrlKey) {
    editor.focus();
    stopDefaultPropagation(e);
  }
}

function escapeKeyPressEvent(e) {
  if (e.key === "Escape") {
    if(isvis('menu1') || isvis('menu2') || isvis('menu3')) {
      hide('menu1');
      hide('menu2');
      hide('menu3');
    } else if(!isvis('nonTextFiles')) {
      toggleTerminal();
    }
  }
}

window.onresize = function(event) {
  splitterBar = new SplitterBar(gE('container'), gE('leftContainer'), gE('rightContiner'));
  aw();
};

document.addEventListener("keydown", function(e){
  onFileKeyPressEventsProcesses(e);
  escapeKeyPressEvent(e);
});

setTimeout(function () {
	terminal.clear();
}, 1000);

// middle click on tab to close teh tab
document.addEventListener("mousedown", function(mouseEvent) {
  if (mouseEvent.button === 1 && mouseEvent && mouseEvent.path && mouseEvent.path.length >= 4 && mouseEvent.path[3].localName === "li") {
    tabClose(mouseEvent.path[3].id);
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
  }
});