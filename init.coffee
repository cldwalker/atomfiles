## General Commands
## ================

call_editor_command = (command) ->
  editor = atom.workspace.getActiveTextEditor()
  editorView = atom.views.getView(editor)
  atom.commands.dispatch(editorView, command)

# Tweaks opening of panel section to have reasonable default focus
atom.commands.add 'atom-text-editor', 'me:install-packages-and-themes-with-focus', ->
  call_editor_command('settings-view:install-packages-and-themes')
  # Hacky but effective
  setTimeout ->
    document.querySelector('.search-container .editor-container input').focus()
  , 500

# Tweaks opening of panel section to have reasonable default focus
atom.commands.add 'atom-text-editor', 'me:view-installed-packages-with-focus', ->
  call_editor_command('settings-view:view-installed-packages')
  # Hacky but effective
  setTimeout ->
    document.querySelector('.section-container .editor-container input').focus()
  , 500

atom.commands.add 'atom-text-editor', 'me:copy-command', ->
  command_name = document.querySelector('.command-palette li.selected').getAttribute('data-event-name')
  atom.clipboard.write(command_name)

## Clojure Commands
## ================
# Some of the commands below are copied and tweaked from https://github.com/seancorfield/atom-chlorine-setup/blob/master/init.coffee
wrap_in_rebl_submit = (code) ->
  "(let [value " + code + "] " +
    "(try" +
    "  ((requiring-resolve 'cognitect.rebl/submit) '" + code + " value)" +
    "  (catch Throwable _))" +
    " value)"

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

# Like Chlorine's evaluate-selection, but sends it to REBL.
atom.commands.add 'atom-text-editor', 'me:inspect-selection', ->
  editor = atom.workspace.getActiveTextEditor()
  chlorine = atom.packages.getLoadedPackage('chlorine').mainModule
  chlorine.repl.eval_and_present(
    editor,
    EditorUtils.findNsDeclaration(editor),
    editor.getPath(),
    editor.getSelectedBufferRange(),
    # wrap doesn't handle wrapping multiple forms
    wrap_in_rebl_submit(editor.getSelectedText())
  )

# Send Var at cursor to REBL (as a Var so you can navigate it).
atom.commands.add 'atom-text-editor', 'me:inspect-var', ->
  editor = atom.workspace.getActiveTextEditor()
  chlorine = atom.packages.getLoadedPackage('chlorine').mainModule
  chlorine.repl.eval_and_present(
    editor,
    EditorUtils.findNsDeclaration(editor),
    editor.getPath(),
    editor.getSelectedBufferRange(),
    wrap_in_rebl_submit("#'" + EditorUtils.getClojureVarUnderCursor(editor))
  )

  # Inspect editor's current namespace in REBL (as a Var so you can navigate it).
atom.commands.add 'atom-text-editor', 'me:inspect-ns', ->
  editor = atom.workspace.getActiveTextEditor()
  chlorine = atom.packages.getLoadedPackage('chlorine').mainModule
  ns = EditorUtils.findNsDeclaration(editor)
  chlorine.repl.eval_and_present(
    editor,
    ns,
    editor.getPath(),
    editor.getSelectedBufferRange(),
    wrap_in_rebl_submit("(find-ns '" + ns + ")")
  )
