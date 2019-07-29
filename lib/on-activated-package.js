// Package specific Setup
// ======================
function exModeActivate(package) {
  const Ex = package.mainModule.provideEx()

  // Open settings directly b/c Packages tab for Settings takes awhile to load
  // for my packages
  Ex.registerCommand('package_settings', (args) => {
    const name = args.args.trim()
    atom.workspace.open('atom://config/packages/' + name)
  })
  Ex.registerAlias('ps', 'package_settings')

  // Handy way to get at code search, issues and more
  Ex.registerCommand('package_github_url', ({ args }) => {
    const name = args.trim()
    let package = atom.packages.getAvailablePackageMetadata().find(e => e.name == name)
    if (package) {
      const { shell } = require('electron')
      shell.openExternal(package.repository.url)
    } else {
      atom.notifications.addError("Unknown package " + name)
    }
  })
  Ex.registerAlias('pg', 'package_github_url')

  // Poor man's autocomplete
  Ex.registerCommand('package_names', ({ args }) => {
    const query = args.trim()
    const matches = atom.packages.getAvailablePackageNames().filter(e => e.includes(query))

    if (matches.length == 1) {
      atom.clipboard.write(matches[0])
    }
    atom.notifications.addInfo("Packages: " + matches.sort().join(', '), { dismissable: true })
  })
  Ex.registerAlias('pn', 'package_names')
}

// Main hook
atom.packages.onDidActivatePackage((package) => {
  console.log('Activate ' + package.name)
  if (package.name == 'ex-mode') {
    exModeActivate(package)
  }
})
