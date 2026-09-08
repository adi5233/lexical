import { useCallback, useEffect, useState } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createParagraphNode } from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";

/**
 * The toolbar is just a set of buttons that dispatch Lexical *commands*.
 * Commands are the canonical way to change editor state from the outside.
 *
 * We also subscribe to selection changes so the Bold/Italic buttons can
 * show their active state based on where the cursor currently is.
 */
export default function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
    }
  }, []);

  useEffect(() => {
    // mergeRegister-style cleanup: each register* returns an unsubscribe fn.
    const unregisterSelection = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        syncToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterUpdate = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(syncToolbar);
    });

    const unregisterCanUndo = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterCanRedo = editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterSelection();
      unregisterUpdate();
      unregisterCanUndo();
      unregisterCanRedo();
    };
  }, [editor, syncToolbar]);

  function formatBlock(type: "paragraph" | "h1" | "h2" | "quote") {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (type === "h1" || type === "h2") {
        $setBlocksType(selection, () => $createHeadingNode(type));
      } else if (type === "quote") {
        $setBlocksType(selection, () => $createQuoteNode());
      } else {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  }

  return (
    <div className="toolbar">
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        aria-label="Undo"
      >
        Undo
      </button>
      <button
        type="button"
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        aria-label="Redo"
      >
        Redo
      </button>

      <span className="toolbar-divider" />

      <button
        type="button"
        className={isBold ? "active" : ""}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        className={isItalic ? "active" : ""}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        className={isUnderline ? "active" : ""}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <u>U</u>
      </button>

      <span className="toolbar-divider" />

      <button type="button" onClick={() => formatBlock("paragraph")}>
        Paragraph
      </button>
      <button type="button" onClick={() => formatBlock("h1")}>
        H1
      </button>
      <button type="button" onClick={() => formatBlock("h2")}>
        H2
      </button>
      <button type="button" onClick={() => formatBlock("quote")}>
        Quote
      </button>

      <span className="toolbar-divider" />

      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      >
        • List
      </button>
      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      >
        1. List
      </button>
    </div>
  );
}
