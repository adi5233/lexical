import {useEffect, useState} from 'react';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {COMMAND_PRIORITY_EDITOR} from 'lexical';
import {TOGGLE_LINK_COMMAND} from '@lexical/link';
import {OPEN_LINK_EDITOR_COMMAND} from './commands';

export function LinkEditorPlugin() {
  const [editor] = useLexicalComposerContext();

  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    return editor.registerCommand(
      OPEN_LINK_EDITOR_COMMAND,
      (payload) => {
        setUrl(payload ?? '');
        setIsOpen(true);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  const applyLink = () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return;
    }

    editor.dispatchCommand(TOGGLE_LINK_COMMAND, trimmedUrl);

    setIsOpen(false);
  };

  const removeLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);

    setIsOpen(false);
  };

  const cancel = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="link-popover"
      onMouseDown={(event) => {
        /*
         * Prevent the popover from changing
         * Lexical's current selection.
         */
        if (event.target instanceof HTMLButtonElement) {
          event.preventDefault();
        }
      }}
    >
      <input
        type="url"
        value={url}
        onChange={(event) => {
          setUrl(event.target.value);
        }}
        placeholder="https://example.com"
        autoFocus
      />

      <button type="button" onClick={applyLink}>
        Apply
      </button>

      <button type="button" onClick={removeLink}>
        Remove
      </button>

      <button type="button" onClick={cancel}>
        Cancel
      </button>
    </div>
  );
}
