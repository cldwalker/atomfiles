// Clojure Commands
// ================
// Note: Some of the commands below depend on my fork of chlorine - https://github.com/cldwalker/atom-chlorine

// Util
// ====
// Helpers require forked chlorine API
const EditorUtils = require("../packages/chlorine/lib/editor-utils")

// Easily eval clojure and have callback operate on js version of result.
// Different from chlorine.repl.eval_and_present_at_pos in that it doesn't do
// standard display of result inline and to repl console. Instead just passes
// result to callback
function cljEval(editor, code, callback) {
  chlorine.repl.evaluate_aux(
    editor,
    EditorUtils.findNsDeclaration(editor),
    editor.getPath(),
    1, 0, //filler values
    code,
    (result) => {
      if (callback) {
        // Don't know if cljs.core is available in non dev modes of Chlorine
        const jsResult = cljs.core.clj__GT_js(result)
        jsResult.error ? atom.notifications.addError(
          jsResult.error.ex.message, {dismissable: true}
          //, {stack: jsResult.error.ex.stack.join("\n")}
        ) : callback(jsResult.result) }
    }
  )
}

// Print code to console and then do standard eval
function printAndEval(code) {
  // TODO: Make this a inkConsole.logInput
  console.log("Eval input:", code)
  const chlorine = atom.packages.getLoadedPackage('chlorine').mainModule
  chlorine.repl.eval_and_present_at_pos(code)
}

// Inspect Cmds
// ============
// Most of these inspect commands are copied and tweaked from https://github.com/seancorfield/atom-chlorine-setup/blob/master/init.coffee

wrap_in_rebl_submit = (code) => {
  console.log("CODE", code);
  "(let [value " + code + "] " +
    "(try" +
    "  ((requiring-resolve 'cognitect.rebl/submit) '" + code + " value)" +
    "  (catch Throwable _ (println \"Failed to load rebl\")))" +
    " value)"
}

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

// Doc cmds
// ========


atom.commands.add('atom-text-editor', 'me:open-var-in-clojuredocs', () => {
  const editor = atom.workspace.getActiveTextEditor()
  const chlorine = atom.packages.getLoadedPackage('chlorine').mainModule
  const { shell } = require('electron')
  cljEval(
    editor,
    "(-> #'" + EditorUtils.getClojureVarUnderCursor(editor) + " symbol)",
    (result) => shell.openExternal("https://clojuredocs.org/" + result)
  )
})

atom.commands.add('atom-text-editor', 'me:open-var-in-official-clojure-docs', () => {
  const editor = atom.workspace.getActiveTextEditor()
  const chlorine = atom.packages.getLoadedPackage('chlorine').mainModule
  const { shell } = require('electron')
  cljEval(
    editor,
    "(-> #'" + EditorUtils.getClojureVarUnderCursor(editor) + " symbol)",
    (result) => shell.openExternal("https://clojure.github.io/clojure/clojure.core-api.html#" + result)
  )
})

// Handles classes. May not handle objects
atom.commands.add('atom-text-editor', 'me:open-word-with-javadoc', () => {
  const editor = atom.workspace.getActiveTextEditor()
  const chlorine = atom.packages.getLoadedPackage('chlorine').mainModule
  cljEval(
    editor,
    "(clojure.java.javadoc/javadoc " + editor.getWordUnderCursor() + ")"
  )
})

// Misc
// ====

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

// Turn varname (expr) into a top-level def to make debugging easier.
atom.commands.add('atom-text-editor', 'me:def-binding', () => {
  const editor = atom.workspace.getActiveTextEditor()
  // Prepare text to be evaled:
  // - Remove optional let wrapping
  let text = editor.getSelectedText().replace(/^\s*\(let\s*/,'')
  // - Ensure vec form before reading
  if (!/^\[.*\]$/sm.test(text)) {
    text = "[" + text + "]"
  }
  // - Escape double quotes for eval
  text = text.replace(/"/g, '\\"')

  // read-string correcty parses multi-line let declarations into a vec of symbols
  // Don't use clojure.edn one b/c we do want to read in regexs and anon fns
  const code = "(->> (read-string \"" + text + "\")" +
  // Had to eval here or do a nested chlorine eval
  " (partition 2) (map #(cons 'def %)) (cons 'do) (#(doto % prn)) eval)"
  printAndEval(code)
})
