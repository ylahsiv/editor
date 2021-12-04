//  is tab already present with id fileLocation
function isTabAlreadyPresent(fileLocation) {
  if(fileLocation) {
    var tabList = gE("tab_browsing_list");
    for(var i=0;i<tabList.children.length;i++) {
      if(fileLocation === tabList.children[i].id) {
        return true;
      }
    }
  }
  return false;
}

// get the current selected tab id
function getSelectedTab() {
  var tabList = gE("tab_browsing_list");
  for(var i=0;i<tabList.children.length;i++) {
    if(tabList.children[i].attributes[1].nodeValue === "selected") {
      return tabList.children[i].id;
    }
  }
  return '';
}

// get the current selected tab id
function getSelectedTabIndex() {
  var tabList = gE("tab_browsing_list");
  for(var i=0;i<tabList.children.length;i++) {
    if(tabList.children[i].attributes[1].nodeValue === "selected") {
      return i;
    }
  }
  return -1;
}

// deselect tabs other than fileLocation
function deselectOtherTabs(fileLocation) {
  if(fileLocation) {
    var tabList = gE("tab_browsing_list");
    for(var i=0;i<tabList.children.length;i++) {
      if(fileLocation === tabList.children[i].id) {
        tabList.children[i].attributes[1].nodeValue = "selected";
      } else {
        tabList.children[i].attributes[1].nodeValue = "";
      }
    }
  }
}

// move to next tab
function moveToNextTab() {
  var selectedTabIndex = getSelectedTabIndex();
  if(selectedTabIndex === -1) return;
  var nextTabIndex = selectedTabIndex + 1;
  var tabList = gE("tab_browsing_list");
  if(nextTabIndex === tabList.children.length) {
    nextTabIndex = 0;
  }
  gE(tabList.children[nextTabIndex].id + "-a").onclick.apply(gE(tabList.children[nextTabIndex].id + "-a"));
}

// move to previous tab
function moveToPreviousTab() {
  var selectedTabIndex = getSelectedTabIndex();
  if(selectedTabIndex === -1) return;
  var previousTabIndex = selectedTabIndex - 1;
  var tabList = gE("tab_browsing_list");
  if(previousTabIndex === -1) {
    previousTabIndex = tabList.children.length - 1;
  }
  gE(tabList.children[previousTabIndex].id + "-a").onclick.apply(gE(tabList.children[previousTabIndex].id + "-a"));
}

// adjust ofset of all elements
function adjustOffset() {
  var maxRow = 0, widthTabs = 0, tabWithOffsetMap = {}, tabList = gE("tab_browsing_list");
  for(var i=0;i<tabList.children.length;i++) {
    tabWithOffsetMap[tabList.children[i].id] = maxRow;
    widthTabs = widthTabs + getDivWidth(tabList.children[i].id + "-a");
    if(widthTabs > getDivWidth("editor")) {
      tabWithOffsetMap[tabList.children[i].id] = maxRow + 1;
      maxRow = maxRow + 1;
      widthTabs = getDivWidth(tabList.children[i].id + "-a");
    }
  }
  if(gE("tab_browsing_area")) {
    gE("tab_browsing_area").style.height = (defaultHeight + (defaultHeight * maxRow) - maxRow - 1).toString() + "px";
  }
  if(gE("nonTextFiles")) {
    gE("nonTextFiles").style.top = (defaultHeight + (defaultHeight * maxRow) - maxRow).toString() + "px";
    gE("nonTextFiles").style.height = (window.innerHeight - getDivHeight('tab_browsing_area')).toString() + "px";
  }
  if(gE("editor")) {
    var terminalHeight = 0;
    if(gE('terminal').style.visibility === 'visible') {
      terminalHeight = getDivHeight("terminal");
    }
    gE("editor").style.height = (window.innerHeight - getDivHeight('tab_browsing_area') - terminalHeight).toString() + "px";
  }
   editor.resize();
}

function clearAllTabs() {
  sinh('tab_browsing_area', '<ul id="tab_browsing_list" class="menu"></ul>');
}