import LexicalEditor from './lexical-editor/lexical-editor'
import css from "./App.module.css";

function App() {
  return (
    <main className={css.header}>
      <h1>Lexical — Rich Text Editor</h1>
      <p className="subtitle">
        A minimal starter for learning Lexical: toolbar commands, rich-text
        plugin, history, lists, and live editor-state serialization.
      </p>
      {/* <Editor /> */}
      <LexicalEditor/>
    </main>
  );
}

export default App;
