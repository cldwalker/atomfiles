////////////////////////////////////////////////////////////////////////////////
// Atom will evaluate this file each time a new window is opened. It is run
// after packages are loaded/activated and after the previous editor state
// has been restored.
////////////////////////////////////////////////////////////////////////////////
require('./lib/clojure');
require('./lib/eval-js');
require('./lib/atom-inspection')
require('./lib/on-activated-package')

// Editor Commands
// ================
function callEditorCommand(command) {
  const editor = atom.workspace.getActiveTextEditor()
  const editorView = atom.views.getView(editor)
  atom.commands.dispatch(editorView, command)
}

// Tweaks opening of panel section to have reasonable default focus
atom.commands.add('atom-text-editor', 'me:install-packages-and-themes-with-focus', () => {
  callEditorCommand('settings-view:install-packages-and-themes')
  // Hacky but effective
  setTimeout(() =>
    document.querySelector('.search-container .editor-container input').focus(), 500)
})

atom.commands.add('atom-text-editor', 'me:view-installed-packages-with-focus', () => {
  callEditorCommand('settings-view:view-installed-packages')
  // Hacky but effective
  setTimeout(() =>
    document.querySelector('.section-container .editor-container input').focus(), 500)
})

atom.commands.add('atom-text-editor', 'me:copy-command', () => {
  const command_name = document.querySelector('.command-palette li.selected').getAttribute('data-event-name')
  atom.clipboard.write(command_name)
})

// Get a package that may not be activated. Activate as needed
async function getUnactivatedPackage(package) {
  if (!atom.packages.isPackageActive(package)) {
    await atom.packages.activatePackage(package)
  }
  return atom.packages.getActivePackage(package);
}

function findCurrentRepositoryDirectory() {
  const dirs = atom.project.getPaths()
  const path = atom.workspace.getActiveTextEditor().getPath()
  return dirs.find(d => path.includes(d))
}

atom.commands.add('atom-text-editor', 'me:project-find-current-repo', async () => {
  const dir = findCurrentRepositoryDirectory()
  const repo = dir.match(/[^/]+$/)[0]
  callEditorCommand('project-find:show')
  const pkg = await getUnactivatedPackage('find-and-replace');
  const view = pkg.mainModule.projectFindView
  view.findEditor.setText(atom.workspace.getActiveTextEditor().getWordUnderCursor())
  view.pathsEditor.setText(repo)
})

atom.commands.add('atom-text-editor', 'me:project-find-current-word', async () => {
  callEditorCommand('project-find:show')
  const pkg = await getUnactivatedPackage('find-and-replace');
  const view = pkg.mainModule.projectFindView
  view.findEditor.setText(atom.workspace.getActiveTextEditor().getWordUnderCursor())
  view.pathsEditor.setText('')
})

atom.commands.add('atom-text-editor', 'me:project-find-in-keymap', async () => {
  callEditorCommand('project-find:show')
  const pkg = await getUnactivatedPackage('find-and-replace');
  const view = pkg.mainModule.projectFindView
  view.findEditor.setText(atom.workspace.getActiveTextEditor().getWordUnderCursor())
  // Have to use pattern b/c exact path doesn't work
  view.pathsEditor.setText('**/keymap.cson')
})

atom.commands.add('atom-text-editor', 'me:yank-current-file', () => {
  const path = atom.workspace.getActiveTextEditor().buffer.file.path
  atom.clipboard.write(path)
})

// Generate tags file for current project directory using exuberant ctags.
// On osx, can install ctags with `brew install ctags`
// Copied from https://github.com/jasonrudolph/dotfiles/blob/082ce1d7026a51b15f4c41faf7de837048c8c16e/atom/init.js#L77-L109
// and then modified
atom.commands.add('atom-text-editor', 'me:generate-ctags', () => {
  const { exec } = require('child_process')
  const fs = require('fs')
  const path = findCurrentRepositoryDirectory()
  const gitignore = path + "/.gitignore"
  atom.notifications.addInfo('Generating ctags for '+ path)

  // Can't use --exclude=@FILE b/c common gitignore patterns like /DIR or DIR/
  // aren't recognized by ctags. See https://github.com/universal-ctags/ctags/issues/218 for more
  const excludePaths = fs.existsSync(gitignore) ?
    fs.readFileSync(gitignore).toString().replace(/\n$/, "").split("\n") :
    ["node_modules", "resources", "log"]
  const tag_command = "/usr/local/bin/ctags " +
    // drop leading or trailing / to make ctags compatible
    excludePaths.map(e => "--exclude='" + e.replace(/^\/|\/$/g, '') + "'").
    join(" ") + " --tag-relative -R"

  exec(tag_command, {cwd: path}, function (error, stdout, stderr) {
    if (error) {
      atom.notifications.addError('ctags exited with error',
        {detail: error, dismissable: true}
      )
    } else if (stderr) {
      atom.notifications.addWarning('Generated ctags (with warnings)',
        {detail: stderr, dismissable: true}
      )
    } else {
      atom.notifications.addSuccess('Finished generating ctags',
        {detail: stdout}
      )
    }
  })
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
    atom.workspace.open(selectedUri, {
      pending: true,
      searchAllPanes: atom.config.get('fuzzy-finder.searchAllPanes')
    }).then((editor) => {
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

atom.commands.add('.package-detail-view button', 'me:button-press-to-click', (event) => {
  event.target.click()
})

console.log("Init loaded!")
