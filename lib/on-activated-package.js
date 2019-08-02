// Package specific Setup
// ======================
function exModeActivate(package) {
  // Most Ex commands here couldn't be atom commands because they take arguments
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

  // Returns a package path and url if it exists. For atom packages, it makes a distinction
  // for paths that are in the main repository and those that aren't
  function getPackagePathAndUrl(name) {
    const thirdPartyPkg = atom.packages.getAvailablePackages().find(e => !e.isBundled && e.name == name)
    const checkoutDir = atom.config.get('me.checkoutAtomPackagesDir')
    const pkg = atom.packages.getAvailablePackageMetadata().find(e => e.name == name)
    const url = pkg && pkg.repository.url

    if (thirdPartyPkg) {
      return {path: thirdPartyPkg.path, url: url}
    } else if (checkoutDir) {
      if (pkg) {
        // Distinguish b/n ones embedded in atom
        if (url == 'https://github.com/atom/atom') {
          return {path: checkoutDir + '/atom/packages/' + name, url: url}
        } else {
          return {path: checkoutDir + '/' + name, url: url}
        }
      }
    }
  }

  // Runs the given cmd and then runs cb if stderr or stdout present. cmdDescription used
  // as a concise label for notifications
  function runShellCmd(cmd, cmdDescription, cb) {
    const { exec } = require('child_process')
    exec(cmd, function (error, stdout, stderr) {
        if (error) {
          atom.notifications.addError(cmdDescription + ' exited with error', { detail: error, dismissable: true })
        } else if (stderr) {
          atom.notifications.addWarning(cmdDescription + ' finished with warnings', { detail: stderr, dismissable: true })
          cb()
        } else {
          atom.notifications.addSuccess(cmdDescription + ' succeeded', { detail: stdout })
          cb()
        }
      })
    }

  // Open a package's folder. If it doesn't exist locally, clone it
  function openPackageFolder(name) {
    const pkg = getPackagePathAndUrl(name)
    if (pkg && pkg.path) {
      const fs = require('fs')

      // If path exists, open it for now. May consider updating git repo if this
      // is used long enough
      if (fs.existsSync(pkg.path)) {
        // Would have preferred opening in project but there's a bug where that
        // prevents ~/.atom and a ~/.atom/packages/* folder from being opened in same window
        atom.open({newWindow: true, pathsToOpen: [pkg.path]})
        // atom.project.addPath(pkg.path)
      } else {
        // Redirect stderr b/c progress is on stderr -
        // https://mirrors.edge.kernel.org/pub/software/scm/git/docs/git-clone.html
        const cmd = ['git', 'clone', pkg.url, pkg.path, '2>&1'].join(' ')
        runShellCmd(cmd, 'git clone', () => atom.open({newWindow: true, pathsToOpen: [pkg.path]}))
      }
    } else {
      atom.notifications.addError('Package ' + name + ' not found')
    }
  }
  // This command exists to open a package, read its source and search it. It is not
  // set up for developing on packages
  Ex.registerCommand('package_open', ({args}) => openPackageFolder(args.trim()))
  Ex.registerAlias('po', 'package_open')

  // Scratch space
  // openPackageFolder('wut')
  // openPackageFolder('aligner')
  // openPackageFolder('link')
  // openPackageFolder('find-and-replace')
  // atom.config.get('me.checkoutAtomPackagesDir')
  // Ex = atom.packages.getActivePackage('ex-mode').mainModule.provideEx()

  // keyboard friendly version of 'application:open-safe'
  function openSafeWindow(path) {
    if (path) {
      atom.open({safeMode: true, newWindow: true, pathsToOpen: [path]})
    } else {
      atom.open({safeMode: true, newWindow: true, pathsToOpen: ['/Users/me/.atom']})
    }
  }
  Ex.registerCommand('open_safe', ({args}) => openSafeWindow(args.trim()))

}

// Main hook
atom.packages.onDidActivatePackage((package) => {
  console.log('Activate ' + package.name)
  if (package.name == 'ex-mode') {
    exModeActivate(package)
  }
})
