import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {FORMAT_TEXT_COMMAND} from 'lexical';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <div className="toolbar">
      <button type="button" onClick={() => formatText('bold')}>
        B
      </button>

      <button type="button" onClick={() => formatText('italic')}>
        I
      </button>

      <button type="button" onClick={() => formatText('underline')}>
        U
      </button>
      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }
      >
        S
      </button>
    </div>
  );
}
