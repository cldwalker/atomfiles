// Clojure Commands
// ================

// Misc
// ====

// Wrapper around go-to-declaration that handles my clj nonWord config to not contain '/'
atom.commands.add('atom-text-editor', 'me:jump-to-ctags-source', (event) => {
  const cljScope = atom.workspace.getActiveTextEditor().getCursorScope().scopes.includes('source.clojure')

  if (!cljScope) {
    atom.commands.dispatch(event.target, "symbols-view:go-to-declaration")
  } else {
    const value = atom.config.get('editor.nonWordCharacters', {scope: ['clojure.source']})
    // temporarily make '/' a nonword to allow plugin to detect word and then set back
    atom.config.set('editor.nonWordCharacters', value + "/", {scopeSelector: '.clojure.source'})
    atom.commands.dispatch(event.target, "symbols-view:go-to-declaration")
    atom.config.set('editor.nonWordCharacters', value.replace('/', ''), {scopeSelector: '.clojure.source'})
  }
})
