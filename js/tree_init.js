'use strict';

var tree = new Tree(gE('tree'),{navigate:false});

tree.on('select', function(data) {
  if(tree.hierarchy().length === 1 && tree.hierarchy()[0].node.type === 'folder')  return;
  var th = tree.hierarchy(data);
  if(th.length !== 0 && th[0].node.type !== 'folder') {
    highlightNode(data.id, 'file');
    if(ginh('editor')) {
      handleNodeSelection(data.id);
    } else {
      loadScriptFile('min/ace.js', function() {handleNodeSelection(data.id);});
    }
  }
});

tree.on('fetch', function (folder, e) {
  highlightNode(folder, 'folder');
  tree.select(folder);
  callAndProcess(e.currentTarget.id, function(data, error) {
    if(!error) {
      tree.json(data, folder);
      folder.resolve();
      if(ginh('editor'))  editor.focus();
    }
  });
});

tree.on('created', function(e, node) {
  e.node = node;
});

function callAndProcess(id, cb) {
  xhrGet('/api/tree?id=' + id, function(data) {
    var list = JSON.parse(data);
    var treeList = [];
    for (var i = 0; i < list.length; i++) {
      treeList.push(getNode(list[i]));
    }
    cb(treeList, false);
  });
}

function getNode(data) {
  return {
    name: data.text,
    id: data.id,
    type: data.children ? 'folder' : 'file',
    asynced: data.isLeaf ? false :true,
    selected: false
  };
}

// fetch the tree
if(window.location.search.split('=').length > 1) {
  parentDirectory = window.location.search.split('=')[1];
} else {
  parentDirectory = '/';
}

callAndProcess(parentDirectory, function(data, error) {
  document.title = parentDirectory;
  if(!error) {
    tree.json(data);
  }
});