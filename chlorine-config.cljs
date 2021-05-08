;; Some of these copied from https://github.com/seancorfield/atom-chlorine-setup/blob/develop/chlorine-config.cljs
;; Note: This file will eventually replace all commands in clojure.js

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

(defn tap-var []
  (p/let [var (editor/get-var)]
    (when (seq (:text var))
      (-> var
          (update :text wrap-in-tap)
          (editor/eval-and-render)))))

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
