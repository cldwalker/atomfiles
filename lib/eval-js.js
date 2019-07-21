// This file supports light-weight repl driven development as well as testing
// init.js changes without having to reload the window. Current implementation
// is simplistic as it evals in a global context. Eval results are displayed
// with notifications or the devtools console. Notifications is the default.
// There is a command to switch to the devtools console as it is a much more
// featureful environment for inspecting results This library took some
// inspiration from https://github.com/robenkleene/run-in-atom. For related
// packages see https://github.com/idleberg/atom-evaluate and
// https://atom.io/packages/eval-javascript
//
// Eval limitations:
// * require to relative paths do not resolve correctly
// * Can't reload any code with top-level const definitions more than once

let vm = require('vm')

let evalHistory = []
// Make this easily accessible for inspection
window.evalHistory = evalHistory

let consoleHandlers = {
  'success': console.log,
  'error': console.error
}

let notificationHandlers = {
  'success' (result) { atom.notifications.addInfo(String(result), {dismissable: true}) },
  'error' (error) { atom.notifications.addError(error.stack, {dismissable: true})}
}

let handlers = notificationHandlers

function evalJS (code) {
    evalHistory.push(code)
    try {
      const result = vm.runInThisContext(code, {filename: '/Users/me/.atom/init.js', columnOffset: 8})
      handlers.success(result)
    } catch (e) {
      handlers.error(e)
    }
}

atom.commands.add('atom-text-editor', 'me:toggle-console-or-notification', () => {
  if (handlers === notificationHandlers) {
    handlers = consoleHandlers
  } else {
    handlers = notificationHandlers
  }
})

atom.commands.add('atom-text-editor', 'me:eval-js', () => {
  const ed = atom.workspace.getActiveTextEditor()
  const code = ed.getSelectedText() || ed.getTextInBufferRange(ed.getCurrentParagraphBufferRange())
  if (code) {
    evalJS(code)
  } else {
    throw new Error("No code to eval!")
  }
})

atom.commands.add('atom-text-editor', 'me:eval-js-file', () => {
  const ed = atom.workspace.getActiveTextEditor()
  evalJS(ed.getText())
})

/* Scratch space
 alert("WOW")
 2 + 2
 atom.commands.add('atom-workspace', 'me:wow', () => {
  alert("No way")
})
let a = 42
a
*/
