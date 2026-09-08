import {useEffect} from 'react';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

import type {SerializedEditorState} from 'lexical';

type LoadContentPluginProps = {
  content?: SerializedEditorState;
};

export function LoadContentPlugin({content}: LoadContentPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!content) {
      return;
    }

    const editorState = editor.parseEditorState(JSON.stringify(content));

    editor.setEditorState(editorState);
  }, [editor, content]);

  return null;
}
