## Description
This is my personal atom config which includes my preferred packages and keybindings. My config is
centered around having vim keybindings, using clojure(script) and web development. This config is
being used on osx with atom version >= 1.37.0.

## Setup

Make sure you have [atom](https://atom.io/) and apm installed. Then:

```
git clone https://github.com/cldwalker/atomfiles ~/.atom
cd ~/.atom
apm install --packages-file my-packages.txt
```

## Misc

After having modified your package list in atom, update the list with `apm ls --installed -bare > ~/.atom/my-packages.txt`.

## Credits

My atom config stands on the shoulders of other helpful atom configs:
* [jasonrudolph/dotfiles](https://github.com/jasonrudolph/dotfiles/tree/master/atom)
* https://github.com/seancorfield/atom-chlorine-setup
* https://gist.github.com/jasongilman/d1f70507bed021b48625