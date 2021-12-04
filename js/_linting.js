function getCompileAndLintingErrors(callback) {
  var extension = getFilePathExtension(fileOpened);
  if(getEditorContents() !== "" && supportedFilesForSyntaxCheck.indexOf(extension) >= 0) {
    handleLinting(getLintCommand(fileOpened) + '\r', function(data) {
      callback(data);
    });
  } else {
    callback(true);
  }
}

function handleLinting(command, callback) {
  lintOutput = '';
  if(socket) {
    socket.emit('lint_input', command + '\r', function(data) {
      callback(true);
    });
  }
}

function handleLintingOutput(result) {
  if(fileOpened) {
    var extension = getFilePathExtension(fileOpened);
    if(result && supportedFilesForSyntaxCheck.indexOf(extension) >= 0) {
      clearAllMarkers();
      var outputList = result.split("\n");
      var lintCommand = getLintCommand(fileOpened);
      if(outputList[0].includes(lintCommand)) {
        outputList[0] = outputList[0].replace(lintCommand, "");
      }
      if(outputList.length > 2) {
        formattingCompilationErrorListAndErrorHighlightingForCppAndJava(fileOpened, outputList);
      }
    }
  }
}

function formattingCompilationErrorListAndErrorHighlightingForCppAndJava(fileLocation, errorList) {
  markers = [];
  if(errorList.length <= 3) {
    return;
  }
  var annotationList = [], filePathPresent = false, notOnFileOpened = '';
  for (var i = 0; i < errorList.length; i++) {
    if(errorList[i].includes(getBaseFileName(fileOpened))) {
      var stringErrorLocationList = errorList[i].replace(fileLocation, "").split(":");
      var row = stringErrorLocationList[1];
      var column_start = stringErrorLocationList[2];
      if(fileLocation.endsWith("java")) {
        column_start = 0;
      }
      if((fileLocation.endsWith("cpp") && row && column_start) || (fileLocation.endsWith("java") && row && column_start === 0)) {
        var error1 = '', error2 = '', error3 = '', errorString = '', type = '';
        if(errorList[i+1] && !errorList[i+1].includes(fileLocation)) {
          error1 = errorList[i+1];
        }
        if(errorList[i+1] && !errorList[i+1].includes(fileLocation) && errorList[i+2] && !errorList[i+2].includes(fileLocation)) {
          error2 = errorList[i+2];
        }
        if(errorList[i+1] && errorList[i+2] && errorList[i+3] && !errorList[i+1].includes(fileLocation) && !errorList[i+2].includes(fileLocation) && !errorList[i+3].includes(fileLocation)) {
          error3 = errorList[i+3];
        }
        errorString = stringErrorLocationList.slice(3, stringErrorLocationList.length).join(":");
        errorString = errorString.slice(1);
        if(error1 !== '') {
          errorString += "\n" + error1;
        }
        if(error2 !== '') {
          errorString += "\n" + error2;
        }
        if(error3 !== '' && !error3.includes('errors generated') && fileLocation.endsWith('.cpp')) {
          errorString += '\n' + error3;
        }
        errorString += '\n';
        if(errorList[i].includes("error")) {
          type = "error";
        } else if(errorList[i].includes("warning")) {
          type = "warning";
        } else {
          type = "info";
        }
        if(typeof(row) === 'number' && column_start >= getEditorContents().split("\n")[row-1].length) {
          column_start = getEditorContents().split("\n")[row-1].length - 1;
        }
        var Range = require("ace/range").Range;
        var markerId;
        if(typeof(row) === 'number') {
          markerId = editor.session.addMarker(new Range(row-1, column_start, row-1, getEditorContents().split("\n")[row-1].length), 'ace_highlight-marker', '');
        } else if(parseInt(row)) {
          markerId = editor.session.addMarker(new Range(parseInt(row)-1, column_start, parseInt(row)-1, getEditorContents().split("\n")[parseInt(row)-1].length), 'ace_highlight-marker', '');
        }
        markers.push(markerId);
        var errorStringWithoutUnicode = errorString.replace(/\u001b\[\d\dX/g, "");
        errorStringWithoutUnicode = errorStringWithoutUnicode.replace(/\[\d\d\dX/g, "");
        errorStringWithoutUnicode = errorStringWithoutUnicode.replace(/\[\d\dX/g, "");
        errorStringWithoutUnicodeList = errorStringWithoutUnicode.split('\n');
        if(errorStringWithoutUnicodeList[errorStringWithoutUnicodeList.length-2].startsWith("$")) {
          errorStringWithoutUnicodeList.pop();
          errorStringWithoutUnicodeList.pop();
          errorStringWithoutUnicode = errorStringWithoutUnicodeList.join("\n");
        }
        annotationList.push({
          row: row-1,
          column: 0,
          text: errorStringWithoutUnicode,
          type: type
        });
        filePathPresent = true;
      }
    } else if (errorList[i].includes('.java')) {
      notOnFileOpened = notOnFileOpened + errorList[i] + '\n' + errorList[i+1] + '\n' + errorList[i+2] + '\n';
      filePathPresent = true;
    }
  }
  if(filePathPresent === false) {
    annotationList.push({
      row: 0,
      column: 0,
      text: errorList.join('\n'),
      type: "error"
    });
  } else if(!errorList[errorList.length - 1].includes('$')) {
    annotationList.push({
      row: 0,
      column: 0,
      text: errorList[errorList.length - 1],
      type: "info"
    });
  }
  if(notOnFileOpened !== '') {
    var Range = require("ace/range").Range;
    var markerId = editor.session.addMarker(new Range(1, 0, 1, 0), 'ace_highlight-marker', '');
    markers.push(markerId);
    annotationList.push({
      row: 1,
      column: 0,
      text: notOnFileOpened,
      type: "error"
    });
  }
  editor.getSession().setAnnotations(annotationList);
}

function clearAllMarkers() {
  for (var i = 0; i < markers.length; i++) {
    removeMarker(markers[i]);
  }
  editor.getSession().setAnnotations([]);
}

function removeMarker(id) {
  editor.session.removeMarker(id);
}