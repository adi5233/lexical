import type {EditorState} from 'lexical';
import {$getRoot} from 'lexical';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import ToolbarPlugin from './plugins/toolbar-plugin';

import './lexical-editor.css';

const initialConfig = {
  namespace: 'MyEditor',
  onError(error: Error) {
    console.error(error);
  },
};

export default function LexicalEditor() {
  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const json = editorState.toJSON();
      console.log({json});
      console.log(root.getTextContent());
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="lex-container">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className="lex-content" />}
          placeholder={<div className="lex-placeholder">Start writing...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin onChange={handleChange} />
      </div>
    </LexicalComposer>
  );
}
