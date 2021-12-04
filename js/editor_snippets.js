function loadCustomSnippets() {
  var snippetManager = ace.require("ace/snippets").snippetManager;
  var config = ace.require("ace/config");
  ace.config.loadModule("ace/snippets/c_cpp", function(m) {
    if (m) {
      snippetManager.files.c_cpp = m;
      m.snippets = snippetManager.parseSnippetFile(m.snippetText);
      m.snippets.push({
        content: "#include <${1:}>",
        name: "include",
        tabTrigger: "inc"
      });
      m.snippets.push({
        content: 'printf("${1}")',
        name: "printf",
        tabTrigger: "printf"
      });
      m.snippets.push({
        content: 'scanf("${1}")',
        name: "scanf",
        tabTrigger: "scanf"
      });
      m.snippets.push({
        content: "#include <bits/stdc++.h>\n\nusing namespace std;\n\nint main() {\n\t${1}\n}",
        name: "main",
        tabTrigger: "main"
      });
      m.snippets.push({
        content: "vector<${1:T}> ${2}",
        name: "vector",
        tabTrigger: "vector"
      });
      m.snippets.push({
        content: "set<${1:T}> ${2}",
        name: "set",
        tabTrigger: "set"
      });
      m.snippets.push({
        content: "array<${1:T}, ${2:N}> ${3}",
        name: "array",
        tabTrigger: "array"
      });
      m.snippets.push({
        content: "deque<${1:T}> ${2}",
        name: "deque",
        tabTrigger: "deque"
      });
      m.snippets.push({
        content: "forward_list<${1:T}> ${2}",
        name: "forward_list",
        tabTrigger: "forward_list"
      });
      m.snippets.push({
        content: "list<${1:T}> ${2}",
        name: "list",
        tabTrigger: "list"
      });
      m.snippets.push({
        content: "map<${1:Key}, ${2:T}> ${3}",
        name: "map",
        tabTrigger: "map"
      });
      m.snippets.push({
        content: "multimap<${1:Key}, ${2:T}> ${3}",
        name: "multimap",
        tabTrigger: "multimap"
      });
      m.snippets.push({
        content: "unordered_set<${1:T}> ${2}",
        name: "unordered_set",
        tabTrigger: "unordered_set"
      });
      m.snippets.push({
        content: "unordered_map<${1:Key}, ${2:T}> ${3}",
        name: "unordered_map",
        tabTrigger: "unordered_map"
      });
      m.snippets.push({
        content: "unordered_multiset<${1:T}> ${2}",
        name: "unordered_multiset",
        tabTrigger: "unordered_multiset"
      });
      m.snippets.push({
        content: "unordered_multimap<${1:Key}, ${2:T}> ${3}",
        name: "unordered_multimap",
        tabTrigger: "unordered_multimap"
      });
      m.snippets.push({
        content: "stack<${1:T}> ${2}",
        name: "stack",
        tabTrigger: "stack"
      });
      m.snippets.push({
        content: "queue<${1:T}> ${2}",
        name: "queue",
        tabTrigger: "queue"
      });
      m.snippets.push({
        content: "priority_queue<${1:T}> ${2}",
        name: "priority_queue",
        tabTrigger: "priority_queue"
      });
      m.snippets.push({
        content: 'void printArray(int a[], int size) {\n\tfor (int i = 0; i < size; i++) {\n\t\tprintf("%d ", a[i]);\n\t}\n\tprintf("\\n");\n}',
        name: "print array",
        tabTrigger: "pa"
      });
      m.snippets.push({
        content: 'while(${1}) {\n\t${2}\n}',
        name: "while",
        tabTrigger: "while"
      });
      m.snippets.push({
        content: 'cin >> ${1};',
        name: "cin",
        tabTrigger: "cin"
      });
      m.snippets.push({
        content: 'cout << ${1} << endl;',
        name: "cout",
        tabTrigger: "cout"
      });
      m.snippets.push({
        content: 'void printVector(vector<int> v) {\n\tfor (int i = 0; i < v.size(); i++) {\n\t\tprintf("%d ", v[i]);\n\t}\n\tprintf("\\n");\n}',
        name: "print vector",
        tabTrigger: "pv"
      });
      m.snippets.push({
        content: 'void printGraph(vector<int> graph[], int v) {\n\tfor (int i = 0; i < v; i++) {\n\t\tprintf("%d => ", i);\n\t\tfor (int j = 0; j < graph[i].size(); j++) {\n\t\t\tprintf("%d ", graph[i][j]);\n\t\t}\n\t\tprintf("\\n");\n\t}\n}',
        name: "print graph",
        tabTrigger: "pg"
      });
      m.snippets.push({
        content: 'void print2dVector(vector<vector<int> > v) {\n\tfor (int i = 0; i < v.size(); i++) {\n\t\tfor (int j = 0; j < v[i].size(); j++) {\n\t\t\tcout << v[i][j] << "\t";\n\t\t}\n\t\tcout << endl;\n\t}\n}',
        name: "print 2d vector",
        tabTrigger: "print2dVector"
      });
      m.snippets.push({
        content: 'void swap(${1:int} *a, ${1:int} *b) {\n\t${1:int} temp = *a;\n\t*a = *b;\n\t*b = temp;\n}',
        name: "swap two integers",
        tabTrigger: "swap"
      });
      m.snippets.push({
        content: "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\n\t\n};\n\nint main() {\n\t${1}\n}",
        name: "leet",
        tabTrigger: "leet"
      });
      m.snippets.push({
        content: "#define sz(a, t) sizeof(a) / sizeof(t)",
        name: "size",
        tabTrigger: "sz"
      });
      snippetManager.register(m.snippets, m.scope);
    }
  });
}