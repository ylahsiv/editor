// file utils
function isFile(isLeaf, fileName) {
  var extension = getFilePathExtension(fileName);
  if(isLeaf && (supportedFileExtensionsForEditor.indexOf(extension) >= 0 || supportedNonTextFileExtensions.indexOf(extension) >= 0 || fileName.indexOf('.') == -1)) return true;
  return false;
}

function getFilePathExtension(path) {
	var filename = path.split('\\').pop().split('/').pop();
	var lastIndex = filename.lastIndexOf(".");
	if (lastIndex < 1) return "";
	return filename.substr(lastIndex + 1).toLowerCase();
}

// editor utils
function getModeByFileExtension(path){
  var modelist = ace.require("ace/ext/modelist");
  return modelist.getModeForPath(path).mode;
}

function getEditorContents() {
  var editor = ace.edit("editor");
  return editor.getValue();
}

function setEditorContents(fileName, fileContents) {
  cursorPositionCachingAllowed = false;
  var editor = ace.edit("editor");
  if(fileName) {
    editor.getSession().setMode(getModeByFileExtension(fileName));
  }
  editor.session.setValue(trimTrailingSpaces(fileContents));
  editor.focus();
  cursorPositionCachingAllowed = true;
}

function loadCursorPosition(fileName) {
  var cookieValue = getCookie(fileName);
  if(cookieValue) {
    var positions = JSON.parse(cookieValue);
    editor.gotoLine(positions.row + 1, positions.column, true);
    // editor.scrollToLine(positions.row + 1, true, true, function () {});
  } else {
    editor.gotoLine(0, 0, true);
    // editor.scrollToLine(0, true, true, function () {});
  }
}

function trimTrailingSpaces(fileContents) {
  var contentLines = fileContents.split("\n");
  for (var i = 0; i < contentLines.length; i++) {
    contentLines[i] = contentLines[i].trimRight();
  }
  return contentLines.join("\n");
}

function getCookie(name) {
  var cookieArr = document.cookie.split(";");
    // Loop through the array elements
    for(var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        // Removing whitespace at the beginning of the cookie name and compare it with the given string
        if(name == cookiePair[0].trim()) {
          // Decode the cookie value and return
          return decodeURIComponent(cookiePair[1]);
        }
    }
    // Return null if not found
    return null;
}

function clearTreeSelection(f) {
  setTimeout(function() {gE(f).classList.remove('selected');}, 500);
}

// element utils
function populateAlert(message) {
  clearTimeout(alertTimeout);
  show('animation');
  var alert = gE('statusBar');
  sinh('statusBar',"&nbsp;&nbsp;&nbsp;" + message);
  alertTimeout = setTimeout(function() {sinh('statusBar', ""); hide('animation');}, 1000);
}

function toggleTerminal() {
  if(isvis('terminal')) {
    hide('terminal');
    editor.focus();
  } else {
    showTerminal(function(){
      terminal.focus();
    });
  }
  adjustOffset();
}

function showTerminal(callback) {
  show('terminal');
  adjustOffset();
  callback();
}

function stopDefaultPropagation(e) {
  e.preventDefault();
  e.stopPropagation();
}

function isvis(e) {
  return gE(e).style.visibility === 'visible';
}

// file handling utils
function getServerLocation(fileLocation, extension, fileContent) {
	var type;
	if(extension === 'pdf') {
		type = 'application/pdf';
	} else if(extension ===  'jpg' || extension === 'png' || extension === 'jpeg') {
		type = 'application/image';
	} else if (extension === 'mp4') {
		type = 'video/mp4';
	} else if(extension === 'mp3') {
		type = 'audio/mpeg';
	}
	return URL.createObjectURL(new Blob([fileContent], { type: type }));
}

function clearNonTextFilesFromSession() {
  hide('nonTextFiles');
  revokeExistingBlob();
  sinh('nonTextFiles', '');
}

function revokeExistingBlob() {
  URL.revokeObjectURL(blob);
}

function getPDF(fileName, fileSource) {
  return '<iframe scrolling="no" style="border-width:0px;height:inherit;width:inherit;" src="' + fileSource + '#zoom=100" id="' + fileName + '-">';
}

function getVideo(fileName, fileSource) {
  return '<video id="' + fileName + '-" style="width:inherit;height:inherit;" controls autoplay loop> <source src="' + fileSource + '" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\'> </video>';
}

function getAudio(fileName, fileSource) {
  return '<audio style="width:inherit;" id="' + fileName + '-" controls autoplay loop> <source src="' + fileSource +'" type="audio/mpeg"></audio>';
}

function getImage(fileName, fileSource) {
  return '<img style="width:50%;" id="' + fileName + '-" src="' + fileSource + '"/>';
}

function getNewElement(extension, fileLocation, blob) {
  var ne;
  if(extension === 'pdf') {
    ne = getPDF(fileLocation, blob);
  } else if(extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'gif') {
    ne = getImage(fileLocation, blob);
  } else if(extension === 'mp4') {
    ne = getVideo(fileLocation, blob);
  } else if(extension === 'mp3') {
    ne = getAudio(fileLocation, blob);
  }
  return ne;
}

// terminal utils
function adjustWindowSizes() {
  editor.resize();
  fitAddon.fit();
}

function getRunCommand(fileOpened) {
  var command = '';
  if(fileOpened.endsWith('.cpp')) {
    command += 'cd ' + '"' + fileOpened.replace("\\" + getBaseFileName(fileOpened),'') + '" && g++ -O -fdiagnostics-color=never "' + fileOpened + '" && ./a.exe && rm a.exe \r';
  } else if(fileOpened.endsWith('.rb')) {
    command += 'ruby ' + fileOpened + ' \r';
  } else if(fileOpened.endsWith('.py')) {
    command += 'python ' + fileOpened + ' \r';
  } else if(fileOpened.endsWith('.sh')) {
    command += 'bash ' + fileOpened + ' \r';
  } else if(fileOpened.endsWith('.c')) {
    command += 'gcc ' + fileOpened + '  && ./a.out && rm a.out \r';
  } else if(fileOpened.endsWith('.scala')) {
    command += 'cd ' + '"' + fileOpened.replace("\\" + getBaseFileName(fileOpened),'') + '"' + ' && scalac *.scala && scala ' + getBaseFileName(fileOpened).split('.').slice(0, -1).join('.') + ' && rm *.class \r';
  } else if(fileOpened.endsWith('.java')) {
    command += 'cd ' + '"' + fileOpened.replace("\\" + getBaseFileName(fileOpened),'') + '"' + ' && params=`echo $(for i in ./*.jar ; do if [[ -f "$i" ]]; then echo "$i:"; fi; done) |sed \'s/ //g\'` && if [ -z "$params" ]; then javac *.java && java ' + getBaseFileName(fileOpened).split('.').slice(0, -1).join('.') + ' && rm *.class; else javac -cp $params *.java && java  ' + getBaseFileName(fileOpened).split('.').slice(0, -1).join('.') + ' && rm *.class; fi \r';
  }
  return command;
}

function getLintCommand(fileOpened) {
  if(fileOpened.endsWith('.cpp')) {
    return "g++ -O -fdiagnostics-color=never '" + fileOpened + "'" + " && rm a.exe";
  } else if(fileOpened.endsWith('.java')) {
    return 'cd ' + '"' + fileOpened.replace("\\" + getBaseFileName(fileOpened),'') + '"' + ' && params=`echo $(for i in ./*.jar ; do if [[ -f "$i" ]]; then echo "$i:"; fi; done) |sed \'s/ //g\'` && if [ -z "$params" ]; then javac *.java && rm *.class; else javac -cp $params *.java && rm *.class; fi';
  }
}

function hideAll(parentId) {
  var children = gE(parentId).children;
  if(children.length > 0) {
    for (var i = 0; i < children.length; i++) {
      gE(children[i].id).style.display = 'none';
    }
  }
}

function isPresent(id) {
  var children = gE('nonTextFiles').children;
  if(children.length > 0) {
    for (var i = 0; i < children.length; i++) {
      if(children[i].id === id + '-') return true;
    }
  }
  return false;
}

function pauseOthers(fileLocation) {
  var tabList = gE('nonTextFiles').children;
  for(var i=0;i<tabList.length;i++) {
    var extension = getFilePathExtension(tabList[i].id.slice(0, -1));
    if(pausableNonTextFileExtensions.indexOf(extension) >= 0) {
      gE(tabList[i].id).pause();
    }
  }
  if(gE(fileLocation + '-') && pausableNonTextFileExtensions.indexOf(extension) >= 0) {
    gE(fileLocation + '-').play();
  }
}