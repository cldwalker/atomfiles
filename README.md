## Description
This is my atom config which fully reproduces my keybindings and installed packages 🎉. My config is
centered around web development workflows and primarily using clojure and vim keybindings. This config is
being used on osx with atom version >= 1.37.0.

## Setup

Make sure you have [atom](https://atom.io/) and apm installed. Then:

```
git clone https://github.com/cldwalker/atomfiles ~/.atom
cd ~/.atom
apm install --packages-file my-packages.txt
```

## Miscellaneous

### Personal Package
I also have [git-puns](https://github.com/cldwalker/git-puns) installed. I have not included it in the setup as it is still experimental. So far it is providing a quite handy [ClojureScript REPL](https://github.com/cldwalker/git-puns#repl-features) for introspecting Atom.

### Updating Packages List
After having modified your package list in atom, update the list with `apm ls --installed -bare > ~/.atom/my-packages.txt`.

### Attempted Packages
These are packages I've tried. As someone who has built many editor plugins, this is not meant to make anyone feel bad about their hard work. This section is mostly for me but sharing in case it helps others.

* https://atom.io/packages/git-time-machine - Pretty visualization of commits. Didn't find the default UI to be conducive to a productive keyboard workflow.
* https://atom.io/packages/maximize-panes - [Basic functionality didn't work](https://github.com/santip/maximize-panes/issues/23)

## Credits

My atom config stands on the shoulders of other helpful atom configs:
* [jasonrudolph/dotfiles](https://github.com/jasonrudolph/dotfiles/tree/master/atom)
* https://github.com/seancorfield/atom-chlorine-setup
* https://gist.github.com/jasongilman/d1f70507bed021b48625
