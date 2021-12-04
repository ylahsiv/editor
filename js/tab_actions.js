// add a tab
function addTab(fileLocation) {
  if(fileLocation) {
    deselectOtherTabs(fileLocation);
    if(!isTabAlreadyPresent(fileLocation)) {
      var tabs = gE("tab_browsing_list");
      tabs.innerHTML = tabs.innerHTML + "<li id='" + fileLocation
      + "' class='selected'><a id='" + fileLocation + "-a' onClick='handleNodeSelection(\"" + fileLocation.replace(/\\/g, '\\\\')
      +  "\", true)' ><b><span>"
      + "<img class='tabimage' height='16' width='16' src='" + getIconContentForFile(fileLocation)
      + "' style='margin-left: 0px;margin-right: 5px;'>"
      + getBaseFileName(fileLocation) + "<img class='tabbutton' height='16' width='16' src='" + getCloseButtonIcon()  + "' id='"
      + fileLocation + "' title=\"Close file\" onclick='tabClose(\"" + fileLocation.replace(/\\/g, '\\\\')
      + "\");event.stopPropagation()'></span></b></a></li>";
      adjustOffset();
    }
  }
}

// close a tab
function tabClose(fileLocation) {
  clearAllMarkers();
  if(fileLocation === fileOpened) fileOpened = '';
  var removedTabIndex;
  var tabList = gE("tab_browsing_list");
  var extension = getFilePathExtension(fileLocation);
  for(var i=0;i<tabList.children.length;i++) {
    if(fileLocation === tabList.children[i].id) {
      tabList.removeChild(tabList.children[i]);
      adjustOffset();
      removedTabIndex = i;
    }
  }
  if(getSelectedTab() !== "" && fileLocation !== getSelectedTab()) {
    adjustOffset();
    return;
  }
  if(tabList.children.length === 0) {
    setEditorContents("", "");
    hide('nonTextFiles');
  } else {
    if(removedTabIndex === 0) {
      handleNodeSelection(tabList.children[0].id, true);
    } else {
      handleNodeSelection(tabList.children[removedTabIndex-1].id, true);
    }
  }
  if(pausableNonTextFileExtensions.indexOf(extension) >= 0 && gE(fileLocation + '-')) {
    gE(fileLocation + '-').pause();
  }
  adjustOffset();
}

// rename a tab
function renameTab(oldTabId, newTabId) {
  console.log(oldTabId);
  console.log(newTabId);
  var tabList = gE("tab_browsing_list");
  for(var i=0;i<tabList.children.length;i++) {
    if(oldTabId === tabList.children[i].id) {
      tabList.children[i].id = newTabId;
      tabList.children[i].innerHTML = "<a id='" + newTabId + "-a' onClick='handleNodeSelection(\""
      + newTabId.replace(/\\/g, '\\\\') +  "\")'><b><span>"
      + "<img class='tabimage' height='16' width='16' src='"
      + getIconContentForFile(newTabId)
      + "' style='margin-left: 0px;margin-right: 5px;position: relative;bottom: 1px;'>"
      + getBaseFileName(newTabId) + "<img class='tabbutton' height='16' width='16' src='" + getCloseButtonIcon()  + "' id='" + newTabId + "' title=\"Close file\" onclick='tabClose(\"" + newTabId.replace(/\\/g, '\\\\') + "\");event.stopPropagation()'></span></b></a>";
    }
  }
}