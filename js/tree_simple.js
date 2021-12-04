'use strict';

{
  const Emitter = typeof window.Emitter === 'undefined' ? class Emitter {
    constructor() {
      this.events = {};
    }
    on(name, callback) {
      this.events[name] = this.events[name] || [];
      this.events[name].push(callback);
    }
    once(name, callback) {
      callback.once = true;
      this.on(name, callback);
    }
    emit(name, ...data) {
      if (this.events[name] === undefined ) {
        return;
      }
      for (const c of [...this.events[name]]) {
        c(...data);
        if (c.once) {
          const index = this.events[name].indexOf(c);
          this.events[name].splice(index, 1);
        }
      }
    }
  } : window.Emitter;
  class SimpleTree extends Emitter {
    constructor(parent, properties = {}) {
      super();
      parent.classList.add('st');
      if (properties.dark) {
        parent.classList.add('dark');
      }
      this.parent = parent.appendChild(ce('details'));
      this.parent.appendChild(ce('summary'));
      this.parent.open = true;
      this.interrupt = node => node;
    }
    append(element, parent, before, callback = () => {}) {
      if (before) {
        parent.insertBefore(element, before);
      }
      else {
        parent.appendChild(element);
      }
      callback();
      return element;
    }
    file(node, parent = this.parent, before) {
      parent = parent.closest('details');
      node = this.interrupt(node);
      const a = this.append(Object.assign(ce('a'), {
        href: '#',
        id: node.id
      }), parent, before);
      this.append(Object.assign(ce('img'), {
        className: 'iconimage',
        alt: node.name,
        src: getIconContentForFile(node.name),
      }), a, null);
      a.innerHTML = a.innerHTML + node.name;
      a.dataset.type = SimpleTree.FILE;
      this.emit('created', a, node);
      return a;
    }
    folder(node, parent = this.parent, before) {
      parent = parent.closest('details');
      node = this.interrupt(node);
      const details = ce('details');
      const summary = Object.assign(ce('summary'), {
        textContent: node.name
      });
      details.appendChild(summary);
      this.append(details, parent, before, () => {
        details.open = node.open;
        details.dataset.type = SimpleTree.FOLDER;
        details.id = node.id;
      });
      this.emit('created', summary, node);
      return summary;
    }
    open(details) {
      details.open = true;
    }
    hierarchy(element = this.active()) {
      if (this.parent.contains(element)) {
        const list = [];
        while (element !== this.parent) {
          if (element.dataset.type === SimpleTree.FILE) {
            list.push(element);
          }
          else if (element.dataset.type === SimpleTree.FOLDER) {
            list.push(element.querySelector('summary'));
          }
          element = element.parentElement;
        }
        return list;
      }
      else {
        return [];
      }
    }
    siblings(element = this.parent.querySelector('a, details')) {
      if (this.parent.contains(element)) {
        if (element.dataset.type === undefined) {
          element = element.parentElement;
        }
        return [...element.parentElement.children].filter(e => {
          return e.dataset.type === SimpleTree.FILE || e.dataset.type === SimpleTree.FOLDER;
        }).map(e => {
          if (e.dataset.type === SimpleTree.FILE) {
            return e;
          }
          else {
            return e.querySelector('summary');
          }
        });
      }
      else {
        return [];
      }
    }
    children(details) {
      const e = details.querySelector('a, details');
      if (e) {
        return this.siblings(e);
      }
      else {
        return [];
      }
    }
  }
  SimpleTree.FILE = 'file';
  SimpleTree.FOLDER = 'folder';

  class AsyncTree extends SimpleTree {
    constructor(parent, options) {
      super(parent, options);
      parent.addEventListener('click', e => {
        const details = e.target.parentElement;
        if (details.open && details.dataset.loaded === 'false') {
          e.stopPropagation();
          e.preventDefault();
        }
      });
      parent.classList.add('async-tree');
    }
    folder(...args) {
      const summary = super.folder(...args);
      const details = summary.closest('details');
      details.addEventListener('toggle', e => {
        editor.focus();
        this.emit(details.dataset.loaded === 'false' && details.open ? 'fetch' : 'open', summary, e);
      });
      summary.resolve = () => {
        details.dataset.loaded = true;
        this.emit('open', summary);
      };
      return summary;
    }
    asyncFolder(node, parent, before) {
      const summary = this.folder(node, parent, before);
      const details = summary.closest('details');
      details.dataset.loaded = false;

      if (node.open) {
        this.open(details);
      }

      return summary;
    }
    unloadFolder(summary) {
      const details = summary.closest('details');
      details.open = false;
      const focused = this.active();
      if (focused && this.parent.contains(focused)) {
        this.select(details);
      }
      [...details.children].slice(1).forEach(e => e.remove());
      details.dataset.loaded = false;
    }
    browse(validate, es = this.siblings()) {
      for (const e of es) {
        if (validate(e)) {
          this.select(e);
          if (e.dataset.type === SimpleTree.FILE) {
            return this.emit('browse', e);
          }
          const parent = e.closest('details');
          if (parent.open) {
            return this.browse(validate, this.children(parent));
          }
          else {
            window.setTimeout(() => {
              this.once('open', () => this.browse(validate, this.children(parent)));
              this.open(parent);
            }, 0);
            return;
          }
        }
      }
      this.emit('browse', false);
    }
  }
  class SelectTree extends AsyncTree {
    constructor(parent, options = {}) {
      super(parent, options);
      parent.addEventListener('click', e => {
        if (e.detail === 1) {
          const active = this.active();
          if (active !== e.target) {
            if (e.target.tagName === 'A' || e.target.tagName === 'SUMMARY') {
              return this.select(e.target, 'click');
            }
          }
          if (active) {
            this.focus(active);
          }
        }
      });
      window.addEventListener('focus', e => {
        const active = this.active();
        if (active) {
          this.focus(active);
        }
      });
      this.on('created', (element, node) => {
        if(gE(node.id)) {
          gE(node.id).addEventListener('contextmenu', e => {
            this.select(e.target, false);
            handleContextMenu1Click(node, e);
            e.preventDefault();
            e.stopPropagation();
          });
          if (node.selected) {
            this.select(element);
          }
        }
      });
      parent.classList.add('select-tree');
    }
    focus(target) {
      window.clearTimeout(this.id);
      this.id = window.setTimeout(() => document.hasFocus() && target.focus(), 0);
    }
    select(target, emitEvent = true) {
      const summary = target.querySelector('summary');
      if (summary) {
        target = summary;
      }
      [...this.parent.querySelectorAll('.selected')].forEach(e => e.classList.remove('selected'));
      target.classList.add('selected');
      this.focus(target);
      if(emitEvent) this.emit('select', target);
    }
    active() {
      return this.parent.querySelector('.selected');
    }
  }
  class JSONTree extends SelectTree {
    json(array, parent) {
      array.forEach(item => {
        if (item.type === SimpleTree.FOLDER) {
          const folder = this[item.asynced ? 'asyncFolder' : 'folder'](item, parent);
          if (item.children) {
            this.json(item.children, folder);
          }
        }
        else {
          this.file(item, parent);
        }
      });
    }
  }
  window.Tree = JSONTree;
}