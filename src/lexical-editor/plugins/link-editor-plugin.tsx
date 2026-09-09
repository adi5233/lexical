import {useEffect, useRef, useState} from 'react';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  type RangeSelection,
} from 'lexical';

import {TOGGLE_LINK_COMMAND} from '@lexical/link';

import {OPEN_LINK_EDITOR_COMMAND} from './commands/commands';

import {LinkEditorPopover} from './components/link-editor-popover';

export function LinkEditorPlugin() {
  const [editor] = useLexicalComposerContext();

  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');

  /*
   * This ref stores the Lexical selection that existed
   * when the user opened the link editor.
   */
  const savedSelectionRef = useRef<RangeSelection | null>(null);

  useEffect(() => {
    return editor.registerCommand(
      OPEN_LINK_EDITOR_COMMAND,
      (payload) => {
        /*
         * Read the current Lexical selection.
         */
        editor.getEditorState().read(() => {
          const selection = $getSelection();

          if (!$isRangeSelection(selection)) {
            return;
          }

          /*
           * Clone it because the selection object belongs
           * to the current EditorState.
           */
          savedSelectionRef.current = selection.clone();
        });

        setUrl(payload ?? '');
        setIsOpen(true);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  const restoreSelection = () => {
    const savedSelection = savedSelectionRef.current;

    if (!savedSelection) {
      return;
    }

    editor.update(() => {
      /*
       * Put our saved selection back into
       * the active EditorState.
       */
      $setSelection(savedSelection.clone());
    });
  };

  const handleApply = () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return;
    }

    /*
     * First restore the selection that existed
     * before the popover received focus.
     */
    restoreSelection();

    /*
     * Then apply the link to that selection.
     */
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, trimmedUrl);

    setIsOpen(false);
    savedSelectionRef.current = null;
  };

  const handleRemove = () => {
    restoreSelection();

    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);

    setIsOpen(false);
    savedSelectionRef.current = null;
  };

  const handleCancel = () => {
    setIsOpen(false);
    savedSelectionRef.current = null;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <LinkEditorPopover
      initialUrl={url}
      onApply={handleApply}
      onRemove={handleRemove}
      onCancel={handleCancel}
    />
  );
}
