// Clojure Commands
// ================
// Some of the commands below are copied and tweaked from https://github.com/seancorfield/atom-chlorine-setup/blob/master/init.coffee
wrap_in_rebl_submit = (code) => {
  console.log("CODE", code);
  "(let [value " + code + "] " +
    "(try" +
    "  ((requiring-resolve 'cognitect.rebl/submit) '" + code + " value)" +
    "  (catch Throwable _ (println \"Failed to load rebl\")))" +
    " value)"
}
const EditorUtils = require("../packages/chlorine/lib/editor-utils")

// Turn varname (expr) into a top-level def to make debugging easier.
atom.commands.add('atom-text-editor', 'me:def-binding', () => {
  const editor = atom.workspace.getActiveTextEditor()
  const chlorine = atom.packages.getLoadedPackage('chlorine').mainModule
  chlorine.repl.eval_and_present(
    editor,
    EditorUtils.findNsDeclaration(editor),
    editor.getPath(),
    editor.getSelectedBufferRange(),
    "(def " + editor.getSelectedText() + ")"
  )
})

// Like Chlorine's evaluate-selection, but sends it to REBL.
atom.commands.add('atom-text-editor', 'me:inspect-selection', () => {
  const editor = atom.workspace.getActiveTextEditor()
  const chlorine = atom.packages.getLoadedPackage('chlorine').mainModule
  chlorine.repl.eval_and_present(
    editor,
    EditorUtils.findNsDeclaration(editor),
    editor.getPath(),
    editor.getSelectedBufferRange(),
    // wrap doesn't handle wrapping multiple forms
    wrap_in_rebl_submit(editor.getSelectedText())
  )
})

// Send Var at cursor to REBL (as a Var so you can navigate it).
atom.commands.add('atom-text-editor', 'me:inspect-var', () => {
  const editor = atom.workspace.getActiveTextEditor()
  const chlorine = atom.packages.getLoadedPackage('chlorine').mainModule
  chlorine.repl.eval_and_present(
    editor,
    EditorUtils.findNsDeclaration(editor),
    editor.getPath(),
    editor.getSelectedBufferRange(),
    wrap_in_rebl_submit("#'" + EditorUtils.getClojureVarUnderCursor(editor))
  )
})

// Inspect editor's current namespace in REBL (as a Var so you can navigate it).
atom.commands.add('atom-text-editor', 'me:inspect-ns', () => {
  const editor = atom.workspace.getActiveTextEditor()
  const chlorine = atom.packages.getLoadedPackage('chlorine').mainModule
  const ns = EditorUtils.findNsDeclaration(editor)
  chlorine.repl.eval_and_present(
    editor,
    ns,
    editor.getPath(),
    editor.getSelectedBufferRange(),
    wrap_in_rebl_submit("(find-ns '" + ns + ")")
  )
})

// Different than init.js version as it relies on more internal
// activateNow(). Won't make a helper of this yet as it doesn't do
// everything that activate() does like loadGrammars e.g. https://github.com/atom/atom/blob/2d3e332b889bce1e458d154efa608016f47d8b9d/src/package.js#L200
function getUnactivatedPackage(package) {
  if (!atom.packages.isPackageActive(package)) {
    const pkg = atom.packages.getLoadedPackage(package)
    pkg.activateNow()
    return pkg
  } else {
    return atom.packages.getActivePackage(package)
  }
}

atom.commands.add('atom-text-editor', 'me:chlorine-connect-without-prompt', () => {
  const chlorine = getUnactivatedPackage('chlorine').mainModule
  chlorine.repl.connect_bang('localhost', '5555')
})
