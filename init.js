////////////////////////////////////////////////////////////////////////////////
// Atom will evaluate this file each time a new window is opened. It is run
// after packages are loaded/activated and after the previous editor state
// has been restored.
////////////////////////////////////////////////////////////////////////////////
require('./lib/clojure');

// Editor Commands
// ================
const callEditorCommand = (command) => {
  const editor = atom.workspace.getActiveTextEditor()
  const editorView = atom.views.getView(editor)
  atom.commands.dispatch(editorView, command)
}

// Tweaks opening of panel section to have reasonable default focus
atom.commands.add('atom-text-editor', 'me:install-packages-and-themes-with-focus', () => {
  callEditorCommand('settings-view:install-packages-and-themes')
  // Hacky but effective
  setTimeout(() =>
    document.querySelector('.search-container .editor-container input').focus()
  , 500)
})

atom.commands.add('atom-text-editor', 'me:view-installed-packages-with-focus', () => {
  callEditorCommand('settings-view:view-installed-packages')
  // Hacky but effective
  setTimeout(() =>
    document.querySelector('.section-container .editor-container input').focus()
  , 500)
})

atom.commands.add('atom-text-editor', 'me:copy-command', () => {
  const command_name = document.querySelector('.command-palette li.selected').getAttribute('data-event-name')
  atom.clipboard.write(command_name)
})

// Component Specific Commands
// ===========================

// Rather than destroy and create pane items like https://github.com/atom/fuzzy-finder/issues/81#issuecomment-339870281,
// this approach uses the pending pane item available in a pane, https://atom.io/docs/api/v1.38.2/Pane.
// This function opens a file in the active pane item unless the current file is modified.
atom.commands.add('.fuzzy-finder atom-text-editor[mini]', 'me:fuzzy-finder-open-in-place', () => {
  const paneItem = atom.workspace.getActivePaneItem()
  // Dispatch with default opening if there are unsaved changes. Do _not_ clobber unsaved changes.
  if (paneItem.isModified && paneItem.isModified()) {
    const target = document.querySelector('.fuzzy-finder atom-text-editor[mini]')
    atom.commands.dispatch(target, "core:confirm")
  } else {
    // Need to set current pane item to pending in order for Workspace#open to work as expected.
    // I do not use pending pane items for anything else so do not restore original pending item
    atom.workspace.getActivePane().setPendingItem(paneItem)
    const selectedUri = atom.packages.getActivePackage('fuzzy-finder').mainModule.projectView.selectListView.getSelectedItem().uri
    // Open with pending to open file in same pane item - https://atom.io/docs/api/v1.38.2/Workspace#instance-open
    atom.workspace.open(selectedUri, {pending: true, searchAllPanes: atom.config.get('fuzzy-finder.searchAllPanes')}).then((editor) => {
      // Disable pending on new editor to avoid unexpected behavior e.g. future file openings replacing current pane item
      editor.terminatePendingState()
    })
  }
})

// Resorts to hack, https://github.com/atom/fuzzy-finder/issues/81#issuecomment-339870281,
// b/c atom.workspace.open failed on incorrectly implemented pane-item.title for this package
atom.commands.add('.recent-files-fuzzy-finder atom-text-editor[mini]', 'me:recent-files-fuzzy-finder-open-in-place', () => {
  const paneItem = atom.workspace.getActivePaneItem()
  const target = document.querySelector('.recent-files-fuzzy-finder atom-text-editor[mini]')
  if (paneItem.isModified && paneItem.isModified()) {
    atom.commands.dispatch(target, "core:confirm")
  } else {
    atom.commands.dispatch(target, "core:confirm")
    atom.workspace.getActivePaneItem().destroy()
  }
})

atom.commands.add('.find-and-replace atom-text-editor[mini]', 'me:replace-all-selection', () => {
  const target = document.querySelector('.find-and-replace atom-text-editor[mini]')
  atom.commands.dispatch(target, 'find-and-replace:toggle-selection-option')
  atom.commands.dispatch(target, 'find-and-replace:replace-all')
  atom.commands.dispatch(target, 'find-and-replace:toggle-selection-option')
})

// Workspace commands
// ==================
function focusTracer (event) {
  console.log('window.focus =', event.target)
}

// Copied from https://github.com/jasonrudolph/dotfiles/blob/master/atom/init.js
// Great for debugging focus issues
atom.commands.add('atom-workspace', {
  // Log each time focus changes to a new element in Atom's UI.
  'me:trace-focus' (event) {
    window.addEventListener('focusin', focusTracer)
  },

  // Stop logging each time focus changes to a new element in Atom's UI.
  'me:untrace-focus' (event) {
    window.removeEventListener('focusin', focusTracer)
  }
})

console.log("Init loaded!")
