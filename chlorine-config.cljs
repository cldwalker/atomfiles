;; Some of these copied from https://github.com/seancorfield/atom-chlorine-setup/blob/develop/chlorine-config.cljs
;; Note: This file will eventually replace all commands in clojure.js

;; Tap commands
;; ============
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
