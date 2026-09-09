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
import {$generateHtmlFromNodes} from '@lexical/html';
import type {EditorState, LexicalEditor, SerializedEditorState} from 'lexical';

import {ToolbarPlugin} from './plugins/toolbar-plugin';
// import {LoadContentPlugin} from './plugins/load-content-plugin';

import {LinkEditorPlugin} from './plugins/link-editor-plugin';
import './lexical-editor.css';

export type EditorContent = {
  /** Serialized editor state — the source of truth, persist this. */
  json: SerializedEditorState;
  /** HTML string — for rendering read-only previews or emailing, NOT for reloading. */
  html: string;
};

// Safe fallback: a single empty paragraph. Used whenever no initialContent
// is passed so LexicalComposer always gets a valid state.
const EMPTY_CONTENT: SerializedEditorState = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} as unknown as SerializedEditorState;

type EditorProps = {
  initialContent?: SerializedEditorState;
  onChange?: (content: EditorContent) => void;
};

export default function Editor({initialContent, onChange}: EditorProps) {
  const initialConfig = {
    namespace: 'ArticleEditor',
    editorState: JSON.stringify(initialContent ?? EMPTY_CONTENT),
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, AutoLinkNode],
    onError(error: Error) {
      console.error(error);
    },
  };

  // OnChangePlugin passes (editorState, editor). `$generateHtmlFromNodes` needs
  // the editor instance and must run inside `editorState.read()`.
  const handleChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      onChange?.({
        json: editorState.toJSON(),
        html: $generateHtmlFromNodes(editor, null),
      });
    });
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
          <LinkEditorPlugin />
          {/* <LoadContentPlugin content={initialContent} /> */}
          <OnChangePlugin onChange={handleChange} />
        </div>
      </div>
    </LexicalComposer>
  );
}
