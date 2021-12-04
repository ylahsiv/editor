setupInputEvents(['cfei2', 'cfri2']);

setupInputEvents(['cfei', 'cfri', 'rni']);

createNode('cfri2', 'menu2', 2, 'create_new_node', 'folder');

createNode('cfei2', 'menu2', 2, 'create_new_node', 'file');

createNode('cfri', 'menu1', 1, 'create_new_node', 'folder');

createNode('cfei', 'menu1', 1, 'create_new_node', 'file');

gE('tree').addEventListener('contextmenu', e => {
  handleContextMenu2Click(e);
  e.stopPropagation();
  e.preventDefault();
});

function manageResource(api, oT, nT, rL, rpL, orL, rtbm, callback) {
  xhrPost('/api/resource/manage', {resourceType: nT,operationType: oT,resourceLocation: rL,resourceParentLocation: rpL,oldResourceLocation: orL,api: api, resourceToBeMoved: rtbm}, function(data) {
    callback();
  });
}

function cutNode() {
  resourceMoveAction = 'move_node';
  resourceMoveType = ginh('cmt');
  resourceMoveId = ginh('cmid');
  gE('aPaste1').classList.remove('disabled');
  gE('aPaste2').classList.remove('disabled');
  sinh('cmt', '');
}

function copyNode() {
  resourceMoveAction = 'copy_node';
  resourceMoveType = ginh('cmt');
  resourceMoveId = ginh('cmid');
  gE('aPaste1').classList.remove('disabled');
  gE('aPaste2').classList.remove('disabled');
  sinh('cmt', '');
}

function pasteNode(api) {
  if(ginh('cmt') === 'file')  return;
  manageResource(api, resourceMoveAction, resourceMoveType, '', ginh('cmid'), '', resourceMoveId, function(data) {
    if(resourceMoveAction === 'move_node') {
      gE(resourceMoveId).remove();
      if(fileOpened && fileOpened === resourceMoveId && resourceMoveType === 'file') {
        if(api === 1) {
          fileOpened = ginh('cmid') + '/' + getBaseFileName(resourceMoveId);
        }
        else if(api === 2) {
          fileOpened = parentDirectory + getBaseFileName(resourceMoveId);
        }
        if(typeof renameTab === 'function') renameTab(resourceMoveId, fileOpened);
      }
    }
    gE('aPaste1').classList.add('disabled');
    gE('aPaste2').classList.add('disabled');
    resourceMoveAction = '', resourceMoveId = '', resourceMoveType = '';
    if(api === 1)       refreshNode();
    else if(api === 2)  refreshCompleteTree();
  });
}

function deleteNode() {
  const type = ginh('cmt');
  manageResource(1, 'delete_node', type, ginh('cmid'), ginh('cmid'), '', '', function(data) {
    if(type === 'folder' || isFileWithoutParent()) refreshParentNode();
    else if(type === 'file')  refreshNode();
    if (typeof tabClose !== "undefined" && type === 'file') {
      tabClose(ginh('cmid'));
    } else if (typeof tabClose !== "undefined" && type === 'folder') {
      // if we are deleting a folder which has some files opened in editor
      var tabList = gE("tab_browsing_list");
      for(var i=0;tabList.children.length !== 0;i++) {
        if(tabList.children[0].id.startsWith(ginh('cmid'))) {
          tabClose(tabList.children[0].id);
        }
      }
    }
  });
}

gE('rni').addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    hide('menu1');
    var path = ginh('cmid');
    var parent = path.replace(path.replace(/^.*[\\\/]/, ''), '');
    manageResource(1, 'rename_old_node', ginh('cmt'), gE('rni').value, parent, path.replace(/^.*[\\\/]/, ''), '', function(data) {
      const type = ginh('cmt');
      if(type === 'folder' || isFileWithoutParent()) {
        refreshParentNode();
        if(fileOpened && fileOpened === path) {
          fileOpened = fileOpened.replace(path.replace(/^.*[\\\/]/, ''), gE('rni').value);
        }
        if(typeof renameTab === 'function') renameTab(path, parent + gE('rni').value);
      }
      else if(type === 'file') {
        refreshNode();
        if(fileOpened && fileOpened === path) {
          fileOpened = parent + gE('rni').value;
        }
        if(typeof renameTab === 'function') renameTab(path, parent + gE('rni').value);
      }
    });
  }
});

function createNode(element, menu, api, operationType, nodeType) {
  gE(element).addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      hide(menu);
      var resourceParentLocation = '';
      if(api === 1) {
        resourceParentLocation = ginh('cmid');
      } else if (api === 2) {
        resourceParentLocation = parentDirectory;
      }
      manageResource(api, operationType, nodeType, gE(element).value, resourceParentLocation, '', '', function(data) {
        if(api === 2) {
          refreshCompleteTree();
        } else {
          refreshNode();
        }
      });
    }
  });
}

function handleContextMenu1Click(node, e) {
  adjustOffset();
  sinh('cmid', e.srcElement.node.id);
  sinh('cmt', e.srcElement.node.type);
  highlightNode(e.srcElement.node.id, e.srcElement.node.type, true);
  menuClickHandle(e, 'menu1', 'menu2', gE('menu1'), ['cfei', 'cfri', 'rni']);
  gE('rni').value = ginh('cmid').replace(/^.*[\\\/]/, '');
}

function handleContextMenu2Click(e) {
  adjustOffset();
  sinh('cmid', parentDirectory);
  menuClickHandle(e, 'menu2', 'menu1', gE('menu2'), ['cfei2', 'cfri2']);
}

function menuClickHandle(e, smenu, hmenu, menue, listClearInput) {
  hide('menu3');
  hide(hmenu);
  show(smenu);
  menue.style.top = e.pageY + 'px';
  menue.style.left = e.pageX + 'px';
  clearInputFields(listClearInput);
}

function clearInputFields(list) {
  for (var i = 0; i < list.length; i++) {
    gE(list[i]).value = '';
  }
}

function setupInputEvents(list) {
  for (var i = 0; i < list.length; i++) {
    gE(list[i]).addEventListener("click", function(event) {
      event.stopPropagation();
    });
  }
}

function openNode() {
  tree.open(tree.hierarchy()[0].closest('details'));
}

function openParentNode() {
  tree.open(tree.hierarchy()[1].closest('details'));
}

function refreshNode() {
  if(!(isFileWithoutParent()) && tree.hierarchy().length !== 0) {
    tree.unloadFolder(tree.hierarchy()[0]);
    openNode();
  }
}

function refreshParentNode() {
  if(tree.hierarchy().length > 1) {
    tree.unloadFolder(tree.hierarchy()[1]);
    openNode();
  } else if(tree.hierarchy().length === 1) {
    refreshCompleteTree();
  }
}

function refreshCompleteTree() {
  var nodes = tree.siblings();
  for (var i = 0; i < nodes.length; i++) {
    if(nodes[i].closest('details').getAttribute('data-type') === 'folder') {
      nodes[i].closest('details').remove();
    }
  }
  nodes = tree.siblings();
  for (var j = 0; j < nodes.length; j++) {
    gE(nodes[j].id).remove();
  }
  callAndProcess(parentDirectory, function(data, error) {
    if(!error) {
      tree.json(data);
    }
  });
}

function isFileWithoutParent() {
  return tree.hierarchy().length === 1 && tree.hierarchy()[0].node.type === 'file';
}