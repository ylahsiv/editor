loadTerminal(function(data) {
  window.addEventListener("resize", adjustWindowSizes);
  terminal.clear();
  attachTerminalCustomHandlers();
  adjustOffset();
});

function loadTerminal(cb) {
  socket = io();
  terminal = new Terminal({
    rows: 58,
    cols: 150,
    fontSize: 13,
    useStyle: true,
    screenKeys: true,
    cursorBlink: false,
    scrollback: 99999999999,
    theme: {
      foreground: '#000000',
      background: '#FFFFFF',
      cursor: '#000000',
      selection: '#0000ff55'
    },
    fontFamily: getComputedStyle(document.body).getPropertyValue('--font-family')
  });

  // initialize addons
fitAddon = new FitAddon.FitAddon();
searchAddon = new SearchAddon.SearchAddon();
webLinksAddon = new WebLinksAddon.WebLinksAddon();
unicode11Addon = new Unicode11Addon.Unicode11Addon();

  // load addons in terminal
terminal.loadAddon(fitAddon);
terminal.loadAddon(searchAddon);
terminal.loadAddon(webLinksAddon);
terminal.loadAddon(unicode11Addon);
terminal.unicode.activeVersion = '11';

  terminal.open(gE('terminal'));

  fitAddon.fit();

  socket.on('output', function (data) {
    terminal.write(data);
  });

  socket.on('connect', () => {
    socket.emit('input',"bash\r", function(data) {});
    socket.emit('lint_input',"bash\r", function(data) {});
    terminal.clear();
  });

  socket.on('disconnect', function () {
    terminal.clear();
  });

  socket.on('lint_output', function (data) {
    data = data.toString().replace(/[\u{0080}-\u{FFFF}]/gu,"");
    if(data.startsWith("\u001b"))  {

    } else {
      lintOutput = lintOutput + data;
      var list = lintOutput.split('\n');
      if(list[list.length - 1].startsWith('$') && list[list.length - 2] && !list[list.length - 2].startsWith('$')) {
        handleLintingOutput(lintOutput);
      }
    }
  });

  terminal.onData((data) => {
    socket.emit('input', data, function(data) {});
  });

  terminal.onKey(function(e) {
    if(e.domEvent.key === 'Escape') {
      toggleTerminal();
    }
  });

  cb(true);
}

function attachTerminalCustomHandlers() {
  terminal.attachCustomKeyEventHandler(function(e) {
    if (e.key === 'v' && e.ctrlKey) {
      return false;
    } else if(e.key === "k" && e.ctrlKey && isvis('terminal')) {
      clearTerminal();
      stopDefaultPropagation(e);
      return true;
    }
  });
}