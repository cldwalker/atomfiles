// These commands are useful for inspecting different parts of Atom. This is
// handy when developing Atom commands or debugging 3rd party package issues.

// Utils
// =====
function createSubscriptionToggleFns(createDisposable) {
  let disposable
  return {
    commandOn: () => {
      disposable = createDisposable()
    },
    commandOff: () => {
      disposable.dispose()
    }
  }
}

function toggleCommands(commandOn, commandOff, state) {
  if (state.commandOn) {
    state.commandOn = false
    commandOff()
  } else {
    state.commandOn = true
    commandOn()
  }
}

function createToggleCommand(commandOnFn, commandOffFn) {
  let toggleState = {}
  return () => toggleCommands(commandOnFn, commandOffFn, toggleState)
}

// Commands
// ========

function focusTracer(event) {
  console.log('window.focus =', event.target)
}

// Tweaked from https://github.com/jasonrudolph/dotfiles/blob/master/atom/init.js
// Great for debugging focus issues
let focusFns = {
  // Log each time focus changes to a new element in Atom's UI.
  commandOn: (event) => {
    window.addEventListener('focusin', focusTracer)
  },

  // Stop logging each time focus changes to a new element in Atom's UI.
  commandOff: (event) => {
    window.removeEventListener('focusin', focusTracer)
  }
}

let logFns = createSubscriptionToggleFns(() => {
  return atom.commands.onDidDispatch((event) => {
    console.log("Command", event.type, event)
  })
})

let packageActivateFns = createSubscriptionToggleFns(() => {
  return atom.packages.onDidActivatePackage((package) => {
    console.log("Package activate", package.name, package)
  })
})

// Experiment w/ streaming console messages via notifications to avoid devtools clutter
let origConsoleError = window.console.error
let consoleErrorFns = {
  commandOn: () => {
    window.console.error = (...args) => {
      origConsoleError(...args)
      atom.notifications.addError(args.join(', '), {
        dismissable: true
      })
    }
  },
  commandOff: () => {
    window.console.error = origConsoleError
  }
}

let origConsoleLog = window.console.log
let consoleLogFns = {
  commandOn: () => {
    window.console.log = (...args) => {
      origConsoleLog(...args)
      atom.notifications.addInfo(args.join(', '))
    }
  },
  commandOff: () => {
    window.console.log = origConsoleLog
  }
}

atom.commands.add('atom-workspace', {
  'me:toggle-log-command': createToggleCommand(logFns.commandOn, logFns.commandOff),
  'me:toggle-trace-focus': createToggleCommand(focusFns.commandOn, focusFns.commandOff),
  'me:toggle-package-activate': createToggleCommand(packageActivateFns.commandOn, packageActivateFns.commandOff),
  'me:toggle-console-error': createToggleCommand(consoleErrorFns.commandOn, consoleErrorFns.commandOff),
  'me:toggle-console-log': createToggleCommand(consoleLogFns.commandOn, consoleLogFns.commandOff)
})
