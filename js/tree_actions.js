function handleNodeSelection(fileLocation, tabSwitch = false) {
  adjustOffset();
  clearTreeSelection(fileLocation);
  if(getSelectedTab() === fileLocation) return;
  var extension = getFilePathExtension(fileLocation);
  if(supportedFileExtensionsForEditor.indexOf(extension) >= 0) {
    hide('nonTextFiles');
    handleTextFile(fileLocation);
    addTab(fileLocation);
    populateAlert('Opened ' + fileLocation);
  } else if(supportedNonTextFileExtensions.indexOf(extension) >= 0) {
    if(tabSwitch) {
      show('nonTextFiles');
      hideAll('nonTextFiles');
      gE(fileLocation + '-').style.display = 'block';
      populateAlert('Switched to ' + fileLocation);
    } else {
      populateAlert('Opened ' + fileLocation);
      handleNonTextFile(fileLocation, extension);
    }
    addTab(fileLocation);
    pauseOthers(fileLocation);
  }
}

function handleTextFile(fileLocation) {
  if(fileOpened) {
    clearAllMarkers();
    if(!editor.session.getUndoManager().isClean()) {
      xhrPost('/api/resource/save', {fileLocation: fileOpened,fileContent: getEditorContents()}, function(data) {
        fetchTextFile(fileLocation);
      });
    } else {
      fetchTextFile(fileLocation);
    }
  } else {
    fetchTextFile(fileLocation);
  }
}

function fetchTextFile(fileLocation) {
  xhrGet('/api/resource?file=' + encodeURIComponent(fileLocation), function(result) {
    fileOpened = fileLocation;
    setEditorContents(fileLocation, result);
    loadCursorPosition(fileLocation);
    getCompileAndLintingErrors(function(result) {});
  });
}

function handleNonTextFile(fileLocation, extension) {
  if(fileLocation && fileOpened !== fileLocation) {
    show('nonTextFiles');
    if(fileOpened && supportedFileExtensionsForEditor.indexOf(getFilePathExtension(fileOpened)) >= 0 && !editor.session.getUndoManager().isClean()) {
      clearAllMarkers();
      xhrPost('/api/resource/save', {fileLocation: fileOpened,fileContent: getEditorContents()}, function(data) {
        fetchNonTextFile(fileLocation, extension, function(result, error) {});
      });
    } else {
      fetchNonTextFile(fileLocation, extension, function(result, error) {});
    }
  }
}

function fetchNonTextFile(fileLocation, extension, callback) {
  var http = new XMLHttpRequest();
  http.responseType = 'arraybuffer';
  http.open('POST', '/api/resource/download', true);
  http.setRequestHeader('Content-type', 'application/json');
  http.send(JSON.stringify({'fileLocation': fileLocation}));
  http.onreadystatechange = function() {
    if(http.readyState == 4 && http.status == 200) {
      fileOpened = fileLocation;
      blob = getServerLocation(fileLocation, extension, http.response);
      if(!isPresent(fileLocation)) {
        sinh('nonTextFiles', ginh('nonTextFiles') + getNewElement(extension, fileLocation, blob));
      }
      hideAll('nonTextFiles');
      gE(fileLocation + '-').style.display = 'block';
      callback(http.response, false);
    } else {
      callback('', true);
    }
  };
}