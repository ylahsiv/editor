function saveCurrentFile() {
  if(fileOpened) {
    clearAllMarkers();
    xhrPost('/api/resource/save', {fileLocation: fileOpened,fileContent: getEditorContents()}, function(data) {
      if(fileOpened.endsWith('.cpp')) {
        xhrPost('/api/resource/format', {fileLocation: fileOpened}, function(data) {
          fetchTextFile(fileOpened);
          populateAlert(fileOpened + ' saved.');
        });
      } else {
        populateAlert(fileOpened + ' saved.');
        getCompileAndLintingErrors(function(result) {});
      }
    });
  }
}

function runCurrentFile() {
  if(fileOpened && supportedFilesExtensionsForRunning.indexOf(getFilePathExtension(fileOpened)) != -1) {
    xhrPost('/api/resource/save', {fileLocation: fileOpened, fileContent: getEditorContents()}, function(data) {
      xhrPost('/api/resource/format', {fileLocation: fileOpened}, function(data) {
        fetchTextFile(fileOpened);
        showTerminal(function() {
          terminal.clear();
          populateAlert('Run command executed ' + fileOpened + ' ...');
          if(getEditorContents().includes("cin") || getEditorContents().includes("scanf")) {
            setTimeout(function() {terminal.focus();}, 100);
          }
          socket.emit('input', getRunCommand(fileOpened), function(data) {});
        });
      });
    });
  }
}

function clearCurrentSession() {
  clearAllTabs();
  adjustOffset();
  terminal.clear();
  hide('terminal');
  hide('animation');
  fileOpened = null;
  refreshCompleteTree();
  setEditorContents('', '');
  clearNonTextFilesFromSession();
}