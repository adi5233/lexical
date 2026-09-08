import { useState } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import type { EditorState } from "lexical";

import Toolbar from "./Toolbar";
import "./editor.css";

/**
 * The initial config passed to <LexicalComposer>.
 * - `namespace`   : any string, used for logging / collaboration.
 * - `nodes`       : every custom node type the editor is allowed to contain.
 * - `theme`       : maps Lexical's internal classes -> your CSS class names.
 * - `onError`     : called whenever Lexical throws internally.
 */
const initialConfig = {
  namespace: "LearningEditor",
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
  theme: {
    paragraph: "editor-paragraph",
    heading: {
      h1: "editor-h1",
      h2: "editor-h2",
    },
    quote: "editor-quote",
    list: {
      ul: "editor-ul",
      ol: "editor-ol",
      listitem: "editor-listitem",
    },
    text: {
      bold: "editor-text-bold",
      italic: "editor-text-italic",
      underline: "editor-text-underline",
      strikethrough: "editor-text-strikethrough",
      code: "editor-text-code",
    },
  },
  onError(error: Error) {
    throw error;
  },
};

export default function Editor() {
  const [editorStateJson, setEditorStateJson] = useState<string>("");

  function handleChange(editorState: EditorState) {
    // editorState is immutable. Serialize it so you can persist / inspect it.
    setEditorStateJson(JSON.stringify(editorState.toJSON(), null, 2));
  }

  return (
    <div className="editor-shell">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="editor-container">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="editor-input" aria-placeholder="Start typing…" placeholder={<div className="editor-placeholder">Start typing…</div>} />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <OnChangePlugin onChange={handleChange} />
        </div>
      </LexicalComposer>

      <details className="editor-debug">
        <summary>Editor state (JSON)</summary>
        <pre>{editorStateJson || "Type something to see the serialized state."}</pre>
      </details>
    </div>
  );
}
