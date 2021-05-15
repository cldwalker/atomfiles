;; Some of these copied from https://github.com/seancorfield/atom-chlorine-setup/blob/develop/chlorine-config.cljs

;; Tap commands
;; ============
(ns user
  ;; Resolves most kondo warnings but still one left
  {:clj-kondo/config '{:linters {:unresolved-symbol :off}}})

(defn- wrap-in-tap [code]
  (str "(let [value " code
       "      rr      (try (resolve 'requiring-resolve) (catch Throwable _))]"
       "  (if-let [rs (try (rr 'cognitect.rebl/submit) (catch Throwable _))]"
       "    (rs '" code " value)"
       "    (tap> value))"
       "  value)"))

(defn tap-block []
  (p/let [block (editor/get-block)]
    (when (seq (:text block))
      (-> block
          (update :text wrap-in-tap)
          (editor/eval-and-render)))))

(defn tap-word []
  (p/let [var (editor/get-var)]
    (when (seq (:text var))
      (-> var
          (update :text wrap-in-tap)
          (editor/eval-and-render)))))

(defn tap-var
  "Also handles full namespaces"
  []
  (p/let [block (editor/get-var)]
         (when (seq (:text block))
           (-> block
               (update :text #(str "(or (find-ns '" % ") (resolve '" % "))"))
               (update :text wrap-in-tap)
               (editor/eval-and-render)))))

(defn tap-ns
  "Handles all namespaces including ns aliases"
  []
  (p/let [block (editor/get-namespace)
          here  (editor/get-selection)]
         (when (seq (:text block))
           (-> block
               (update :text #(str "(find-ns '" % ")"))
               (update :text wrap-in-tap)
               (assoc :range (:range here))
               (editor/eval-and-render)))))

(defn tap-selection []
  (p/let [block (editor/get-selection)]
    (when (seq (:text block))
      (-> block
          (update :text wrap-in-tap)
          (editor/eval-and-render)))))

;; Print cmds
;; ==========
(defn pprint-block []
  (p/let [block (editor/get-block)]
    (when (seq (:text block))
      (-> block
          (update :text #(str "(clojure.pprint/pprint " % ")"))
          (editor/eval-and-render)))))

(defn prn-block []
  (p/let [block (editor/get-block)]
    (when (seq (:text block))
      (-> block
          (update :text #(str "(prn " % ")"))
          (editor/eval-and-render)))))

;; Def cmds
;; ========
(defn def-block
  "Evals result to r0 var and returns result"
  []
  (p/let [block (editor/get-block)]
         (when (seq (:text block))
           (-> block
               (update :text #(str "(let [res " % "] (def r0 res) res)"))
               (editor/eval-and-render)))))

(defn def-let-bindings
  "Evals let block bindings to vars"
  []
  (p/let [block (editor/get-selection)]
         (when (seq (:text block))
           (let [text (-> (:text block)
                          ;; Remove optional let wrapping
                          (clojure.string/replace-first #"^\s*\(let\s*" ""))
                 code (->> (read-string text)
                           (partition 2)
                           (map #(cons 'def %))
                           (cons 'do))]
             (-> block
                 (assoc :text code)
                 (editor/eval-and-render))))))

;; Doc cmds
;; ========
(defn open-var-in-clojuredocs
  "Open var in clojuredocs.org"
  []
  (p/let [block (editor/get-var)]
         (when (seq (:text block))
           (-> block
               (update :text #(str "(symbol (resolve '" % "))"))
               (update :text #(str "(clojure.java.shell/sh \"open\" \"-n\""
                                   " (str \"https://clojuredocs.org/\"" %
                                   "))"))
               (editor/eval-and-render)))))

(defn open-javadoc
  "Open selection or var in javadoc"
  []
  (p/let [block (editor/get-selection)
          block (if (< 1 (count (:text block))) block (editor/get-var))]
         (when (seq (:text block))
           (-> block
               (update :text
                       #(str
                         "(let [c-o-o " %
                         " ^Class c (if (instance? Class c-o-o) c-o-o (class c-o-o))] "
                         "(clojure.java.shell/sh \"open\" \"-n\""
                         "  (clojure.string/replace"
                         "   ((requiring-resolve 'clojure.java.javadoc/javadoc-url)"
                         "    (.getName c))"
                         ;; strip inner class
                         "   #\"\\$[a-zA-Z0-9_]+\" \"\""
                         ")))"))
               (update :text wrap-in-tap)
               (editor/eval-and-render)))))

;; Misc cmds
;; =========
(defn setup-portal
  []
  ;; Have to invoke a block even if not using text
  (p/let [block (editor/get-selection)]
         (editor/eval-and-render
          (merge block
                 {:text "(do (require '[portal.api :as p]) (def p (p/open)) (add-tap #'p/submit))"}))))
