import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {LinkPlugin} from '@lexical/react/LexicalLinkPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';

import {HeadingNode} from '@lexical/rich-text';
import {ListNode, ListItemNode} from '@lexical/list';
import {LinkNode, AutoLinkNode} from '@lexical/link';

import type {EditorState, SerializedEditorState} from 'lexical';

import {ToolbarPlugin} from './plugins/toolbar-plugin';
// import {LoadContentPlugin} from './plugins/load-content-plugin';

import './lexical-editor.css';

type EditorProps = {
  initialContent?: SerializedEditorState;
  onChange?: (content: SerializedEditorState) => void;
};

export default function Editor({initialContent, onChange}: EditorProps) {
  const initialConfig = {
    namespace: 'ArticleEditor',
    editorState: initialContent ? JSON.stringify(initialContent) : undefined,
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, AutoLinkNode],
    onError(error: Error) {
      console.error(error);
    },
  };

  const handleChange = (editorState: EditorState) => {
    const json = editorState.toJSON();
    console.log('New content:', json);
    onChange?.(json);
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-wrapper">
        <ToolbarPlugin />

        <div className="editor-container">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                aria-label="Rich text editor"
              />
            }
            placeholder={
              <div className="editor-placeholder">Start writing...</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          {/* <LoadContentPlugin content={initialContent} /> */}
          <OnChangePlugin onChange={handleChange} />
        </div>
      </div>
    </LexicalComposer>
  );
}
