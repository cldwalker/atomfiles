EditorUtils = require("./packages/chlorine/lib/editor-utils")

# Turn varname (expr) into a top-level def to make debugging easier.
atom.commands.add 'atom-text-editor', 'me:def-binding', ->
  editor = atom.workspace.getActiveTextEditor()
  chlorine = atom.packages.getLoadedPackage('chlorine').mainModule
  chlorine.repl.eval_and_present(
    editor,
    EditorUtils.findNsDeclaration(editor),
    editor.getPath(),
    editor.getSelectedBufferRange(),
    "(def " + editor.getSelectedText() + ")"
  )
