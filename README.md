## Description
This is my atom config which fully reproduces my keybindings and installed
packages 🎉. My config is centered around web development, using Clojure and
JavaScript and optimizing for keyboard only workflows. This
config is being used on osx with atom version >= 1.40.0.

## Setup

Make sure you have [atom](https://atom.io/) and apm installed. Then:

```
git clone https://github.com/cldwalker/atomfiles ~/.atom
cd ~/.atom
apm install --packages-file my-packages.txt
```

## Features

### Fast Load Time and Package Bundles

A [long running complaint](https://github.com/atom/atom/issues/2654) of Atom is
its slow startup time. While I didn't experience this initially, this did become
noticeable with 30 packages installed. I was able to reduce startup time to
about a second by using
[package-switch](https://github.com/fstiewitz/package-switch). The package
allowed me to accomplish this by [configuring an auto-disable
blacklist](https://github.com/fstiewitz/package-switch#auto-disable-packages) to
disable all third party packages except for a select few. Then when I need to
activate one of my predefined groups (or bundles) of packages, I [start
it](https://github.com/fstiewitz/package-switch#execute-a-bundlepackage). To
make management of the blacklist and unbundled packages easier, I have a
`me:sync-auto-disabled-packages` command.

My package bundles are listed in [package-switch.bundles](./package-switch.bundles).
Here's a brief description of each bundle:
* `general-often`: Packages I use often regardless of whether I'm writing code or documentation.
  Usually the main bundle I'll load when writing anything.
* `general-sometimes`: Packages I use sometimes e.g. less common workflows and languages.
* `clojure`: Packages that I use when developing in Clojure and other lisps.
* `js`: Packages that I use when developing in JS. There are some packages that
  could be used with other languages like the aligner packages.
* `fun`: Packages that are more fun than pragmatic. This is probably the least used bundle.

### Developing with Clojure

To enable these, start the clojure bundle with the `package-switch:start-packages` command. For `linter-kondo`, you'll need to install clj-kondo e.g. `brew install borkdude/brew/clj-kondo`.

The main packages I use are:
* `chlorine`: Provides a nice modern clj repl using the modern [socket
  repl](https://clojure.org/reference/repl_and_main#_launching_a_socket_server).
  Inline eval, jumping to source and docs just work.
* `lisp-paredit`: Provides the standard paredit features. Not as powerful as emacs or lighttable's paredit but good enough. I do miss the raise operation
* `swackets`: Provides distinctive colors for different parenthesis levels
* `symbols-view`: Built-in package to jump to fns using ctags. Works nicely when not looking to load chlorine
* `linter-kondo`: Linter powered by [clj-kondo](https://github.com/borkdude/clj-kondo). Doesn't auto-remove unused namespaces like Cursive but inline warnings about them are helpful enough
* `./lib/clojure.js`: Some personal customizations mostly around chlorine and specific things to eval or look up

Also see `.clojure.source` section of config.cson.

### Developing with JS

To enable these, start the js bundle with the `package-switch:start-packages` command.

Current packages I use:

* `aligner*`: Packages to align things in JS
* `atom-beautify`: Indent JS code nicely
* `symbols-view`: Built-in package to jump to fns using ctags
* `.lib/eval-js.js`: Let's me do light-weight repl driven development. This works
  well only when things can be globally eval-ed. I also use devtools console when
  wanting to inspect data more and am ok with constrained input

### Developing in Atom
TODO

### Keyboard Centric Workflows
TODO

## Miscellaneous

### Personal Package
I also have [git-puns](https://github.com/cldwalker/git-puns) installed. I have not included it in the setup as it is still experimental. So far it is providing a quite handy [ClojureScript REPL](https://github.com/cldwalker/git-puns#repl-features) for introspecting Atom.

### Updating Packages List
After having modified your package list in atom, update the list with `apm ls --installed --bare > ~/.atom/my-packages.txt`.

### Attempted Packages
These are packages I've tried. As someone who has built many editor plugins, this is not meant to make anyone feel bad about their hard work. This section is mostly so I can remember why I stopped using a plugin. Sharing in case it helps others.

* https://atom.io/packages/git-time-machine - Pretty visualization of commits. Didn't find the default UI to be conducive to a productive keyboard workflow.
* https://atom.io/packages/maximize-panes - [Basic functionality didn't work](https://github.com/santip/maximize-panes/issues/23)
* https://atom.io/packages/move-panes - This functionality already exists with the default commands `Pane: Move Active Item To Pane on ...`
* https://atom.io/packages/atom-alignment - Alignment for multiple cursors didn't work for basic edn case. `simple-align` didn't have a problem
* https://atom.io/packages/Zen - Didn't use it much and when I did I found the `vim-mode-plus:maximize-pane` command to be sufficient
* https://atom.io/packages/open-package - Handy for opening external atom packages. Replaced with my package_open Ex command which supports opening more packages
* https://atom.io/packages/structure-view - Didn't use it much as it didn't have a keyboard friendly workflow and rarely provided a view I was looking for. Once I discovered the bundled 'symbols-view' package, which is keyboard friendly, this no longer makes sense to have.

## License
See LICENSE.md

## Credits

My atom config stands on the shoulders of other helpful atom configs:
* [jasonrudolph/dotfiles](https://github.com/jasonrudolph/dotfiles/tree/master/atom)
* https://github.com/seancorfield/atom-chlorine-setup
* https://gist.github.com/jasongilman/d1f70507bed021b48625
