const SplitterBar = function(container, leftContent, rightContent) {
  const splitPercent = '28%';
  var leftSide, rightSide, splitter;
  if (gE('splitter')) {
    leftSide = gE('leftSide');
    rightSide = gE('rightSide');
    splitter = gE('splitter');
  } else {
    leftSide = ce('div');
    rightSide = ce('div');
    splitter = ce('div');
    leftSide.classList.add('leftSide');
    rightSide.classList.add('rightSide');
    splitter.classList.add('splitter');

    leftSide.id = 'leftSide';
    rightSide.id = 'rightSide';
    splitter.id = 'splitter';

    if (leftContent !== null) {
      leftSide.appendChild(leftContent);
    }

    if (rightContent !== null) {
      rightSide.appendChild(rightContent);
    }

    container.appendChild(splitter);

    splitter.style.left = splitPercent;
    splitter.style.transform = 'translateX(-' + splitPercent + ')';
    splitter.style.background = 'lightgray';
    leftSide.style.left = 0;
    leftSide.style.top = 0;
    leftSide.style.width = splitter.offsetLeft - splitter.offsetWidth / 2 + 'px';
    rightSide.style.left = (splitter.offsetLeft + splitter.offsetWidth / 2) + 'px';
    rightSide.style.top = 0;
    rightSide.style.width = container.offsetWidth - splitter.offsetLeft - 2 +  'px';
    container.appendChild(leftSide);
    container.appendChild(rightSide);
  }

  let mouseIsDown = false;
  let startX = null;
  let globalXCoordinate = null;

  // Will not touch
  splitter.addEventListener('mousedown', function(evt) {
    evt.preventDefault();
    mouseIsDown = true;
    startX = evt.offsetX;
    startY = evt.offsetY;
  });

  leftSide.addEventListener('mousemove', function(evt) {
    evt.preventDefault();
    let left = this.offsetLeft;
    globalXCoordinate = left + evt.offsetX - startX;
    if(ginh('editor')) {
      editor.resize();
    }
  });

  rightSide.addEventListener('mousemove', function(evt) {
    evt.preventDefault();
    let left = this.offsetLeft;
    globalXCoordinate = left + evt.offsetX - startX;
    if(ginh('editor')) {
      editor.resize();
    }
  });

  splitter.addEventListener('mousemove', function(evt) {
    evt.preventDefault();
    let left = this.offsetLeft;
    globalXCoordinate = left + evt.offsetX - startX;
    if(ginh('editor')) {
      editor.resize();
    }
  });


  document.body.addEventListener('mouseup', function(evt) {
    mouseIsDown = false;
  });

  document.addEventListener('mouseup', function(evt) {
    mouseIsDown = false;
  });

  document.addEventListener('mousemove', function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    let containerWidth = container.getBoundingClientRect().width;
    let hoveringOnDocument = evt.target.nodeName == 'HTML' || evt.target.nodeName == 'BODY';
    let docX = evt.offsetX - container.getBoundingClientRect().x - startX;
    if (mouseIsDown) {
      if (hoveringOnDocument) {
        if (docX < 0) {
          docX = 0;
        }
        if (docX + splitter.offsetWidth > container.offsetWidth) {
          docX = containerWidth - splitter.offsetWidth;
        }
        splitter.style.left = docX + 'px';
        leftSide.style.width = splitter.offsetLeft - splitter.offsetWidth / 2 + 'px';
        rightSide.style.width = (container.offsetWidth - leftSide.offsetWidth - splitter.offsetWidth) + 'px';
        rightSide.style.left = splitter.offsetLeft + (splitter.offsetWidth / 2) + 'px';
      } else {
        if (globalXCoordinate + splitter.offsetWidth > containerWidth) {
          globalXCoordinate = containerWidth - splitter.offsetWidth;
        }
        if (globalXCoordinate < 0) {
          globalXCoordinate = 0;
        }
        splitter.style.left = globalXCoordinate + 'px';
        leftSide.style.width = splitter.offsetLeft - splitter.offsetWidth / 2 + 'px';
        rightSide.style.width = (container.offsetWidth - leftSide.offsetWidth - splitter.offsetWidth) + 'px';
        rightSide.style.left = splitter.offsetLeft + splitter.offsetWidth / 2 + 'px';
      }
    }
    aw();
    if(fitAddon) {
      fitAddon.fit();
    }
  });
};