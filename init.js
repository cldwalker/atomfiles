////////////////////////////////////////////////////////////////////////////////
// Atom will evaluate this file each time a new window is opened. It is run
// after packages are loaded/activated and after the previous editor state
// has been restored.
////////////////////////////////////////////////////////////////////////////////
require('./lib/clojure');
require('./lib/eval-js');
require('./lib/atom-inspection')

// Editor Commands
// ================
function callEditorCommand (command) {
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

function findCurrentRepositoryDirectory () {
  const dirs = atom.project.getRepositories().map(r => r.repo.workingDirectory)
  const path = atom.workspace.getActiveTextEditor().buffer.file.path
  return dirs.find(d => path.includes(d))
}

atom.commands.add('atom-text-editor', 'me:project-find-current-repo', () => {
  const dir = findCurrentRepositoryDirectory()
  const repo = dir.match(/[^/]+$/)[0]
  callEditorCommand('project-find:show')
  // will fail first time if find-and-replace hasn't been used yet
  const view = atom.packages.getActivePackage('find-and-replace').mainModule.projectFindView
  view.findEditor.setText(atom.workspace.getActiveTextEditor().getWordUnderCursor())
  view.pathsEditor.setText(repo)
})

atom.commands.add('atom-text-editor', 'me:project-find-current-word', () => {
  callEditorCommand('project-find:show')
  // will fail first time if find-and-replace hasn't been used yet
  const view = atom.packages.getActivePackage('find-and-replace').mainModule.projectFindView
  view.findEditor.setText(atom.workspace.getActiveTextEditor().getWordUnderCursor())
  view.pathsEditor.setText('')
})

atom.commands.add('atom-text-editor', 'me:project-find-in-keymap', () => {
  callEditorCommand('project-find:show')
  // will fail first time if find-and-replace hasn't been used yet
  const view = atom.packages.getActivePackage('find-and-replace').mainModule.projectFindView
  view.findEditor.setText(atom.workspace.getActiveTextEditor().getWordUnderCursor())
  // Have to use pattern b/c exact path doesn't work
  view.pathsEditor.setText('**/keymap.cson')
})

// Component Specific Commands
// ===========================

// Rather than destroy and create pane items like https://github.com/atom/fuzzy-finder/issues/81#issuecomment-339870281,
// this approach uses the pending pane item available in a pane, https://atom.io/docs/api/v1.38.2/Pane.
// This function opens a file in the active pane item unless the current file is modified.
atom.commands.add('.fuzzy-finder atom-text-editor[mini]', 'me:fuzzy-finder-open-in-place', (event) => {
  const paneItem = atom.workspace.getActivePaneItem()
  // Dispatch with default opening if there are unsaved changes. Do _not_ clobber unsaved changes.
  if (paneItem.isModified && paneItem.isModified()) {
    atom.commands.dispatch(event.target, "core:confirm")
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
atom.commands.add('.recent-files-fuzzy-finder atom-text-editor[mini]', 'me:recent-files-fuzzy-finder-open-in-place', (event) => {
  const paneItem = atom.workspace.getActivePaneItem()
  if (paneItem.isModified && paneItem.isModified()) {
    atom.commands.dispatch(event.target, "core:confirm")
  } else {
    atom.commands.dispatch(event.target, "core:confirm")
    atom.workspace.getActivePaneItem().destroy()
  }
})

atom.commands.add('.find-and-replace atom-text-editor[mini]', 'me:replace-all-selection', (event) => {
  atom.commands.dispatch(event.target, 'find-and-replace:toggle-selection-option')
  atom.commands.dispatch(event.target, 'find-and-replace:replace-all')
  atom.commands.dispatch(event.target, 'find-and-replace:toggle-selection-option')
})

console.log("Init loaded!")
