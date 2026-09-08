import {useState} from 'react';
import type {SerializedEditorState} from 'lexical';

import LexicalEditor from './lexical-editor/lexical-editor';
import css from './App.module.css';

/**
 * Pretend this came from a database / localStorage. It's a serialized editor
 * state — paste a real `onChange` output here to see it load on refresh.
 * Set to `undefined` for an empty editor.
 */
const INITIAL_CONTENT: SerializedEditorState | undefined = undefined;

function App() {
  // The editor owns its own state internally. We keep a copy in React only
  // so the rest of the app (this preview panel, a "Save" button, etc.) can
  // react to it. `onChange` fires on every edit and hands us the new value.
  const [content, setContent] = useState<SerializedEditorState | undefined>(
    INITIAL_CONTENT,
  );

  return (
    <main className={css.header}>
      <h1>Lexical — Rich Text Editor</h1>
      <p className="subtitle">
        A minimal starter for learning Lexical: toolbar commands, rich-text
        plugin, history, lists, and live editor-state serialization.
      </p>

      <LexicalEditor initialContent={INITIAL_CONTENT} onChange={setContent} />

      <section className={css.output}>
        <h2>onChange output (React state)</h2>
        <pre>
          {content
            ? JSON.stringify(content, null, 2)
            : 'Start typing — the serialized editor state shows up here.'}
        </pre>
      </section>
    </main>
  );
}

export default App;
