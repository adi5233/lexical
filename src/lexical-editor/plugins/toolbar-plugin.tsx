import {useEffect, useState} from 'react';

import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  type EditorState,
  type RangeSelection,
  type LexicalNode,
} from 'lexical';
import {$setBlocksType} from '@lexical/selection';

import {
  $isListNode,
  REMOVE_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$createHeadingNode, $isHeadingNode} from '@lexical/rich-text';

import {ToolbarButton} from './toolbar-button';
import {OPEN_LINK_EDITOR_COMMAND} from './commands';

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3';

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const [blockType, setBlockType] = useState<BlockType>('paragraph');

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // ---------------------------------------
  // Detect whether selection is inside link
  // ---------------------------------------
  const getLinkInfo = (selection: RangeSelection) => {
    let node: LexicalNode | null = selection.anchor.getNode();
    while (node) {
      if ($isLinkNode(node)) {
        return {
          isLink: true,
          url: node.getURL(),
        };
      }
      node = node.getParent();
    }
    return {
      isLink: false,
      url: null,
    };
  };

  // ---------------------------------------
  // Update toolbar state
  // ---------------------------------------
  const updateToolbar = (editorState: EditorState) => {
    editorState.read(() => {
      const selection = $getSelection();

      // No normal text selection
      if (!$isRangeSelection(selection)) {
        setIsBold(false);
        setIsItalic(false);
        setIsUnderline(false);
        setIsStrikethrough(false);

        setBlockType('paragraph');

        setIsBulletList(false);
        setIsNumberedList(false);

        setIsLink(false);
        setLinkUrl(null);

        return;
      }

      // ---------------------------------------
      // Inline formatting
      // ---------------------------------------
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      // ---------------------------------------
      // Reset structural state
      // ---------------------------------------
      setIsBulletList(false);
      setIsNumberedList(false);

      // ---------------------------------------
      // Current block
      // ---------------------------------------
      const anchorNode = selection.anchor.getNode();
      const topLevelElement = anchorNode.getTopLevelElementOrThrow();

      // Heading
      if ($isHeadingNode(topLevelElement)) {
        setBlockType(topLevelElement.getTag() as BlockType);
      }

      // List
      else if ($isListNode(topLevelElement)) {
        setBlockType('paragraph');

        const listType = topLevelElement.getListType();

        setIsBulletList(listType === 'bullet');

        setIsNumberedList(listType === 'number');
      }

      // Paragraph
      else {
        setBlockType('paragraph');
      }

      // ---------------------------------------
      // Link
      // ---------------------------------------
      const linkInfo = getLinkInfo(selection);

      setIsLink(linkInfo.isLink);
      setLinkUrl(linkInfo.url);
    });
  };

  // ---------------------------------------
  // Listen for editor updates
  // ---------------------------------------
  useEffect(() => {
    const unregisterUpdateListener = editor.registerUpdateListener(
      ({editorState}) => {
        updateToolbar(editorState);
      },
    );

    const unregisterSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar(editor.getEditorState());

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterUpdateListener();
      unregisterSelectionListener();
    };
  }, [editor]);

  // ---------------------------------------
  // Undo / Redo availability
  // ---------------------------------------
  useEffect(() => {
    const unregisterUndoListener = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterRedoListener = editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterUndoListener();
      unregisterRedoListener();
    };
  }, [editor]);

  // ---------------------------------------
  // Text formatting
  // ---------------------------------------
  const formatText = (
    format: 'bold' | 'italic' | 'underline' | 'strikethrough',
  ) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  // ---------------------------------------
  // Block formatting
  // ---------------------------------------
  const formatBlock = (type: BlockType) => {
    editor.update(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return;
      }

      if (type === 'paragraph') {
        $setBlocksType(selection, () => $createParagraphNode());

        return;
      }

      $setBlocksType(selection, () => $createHeadingNode(type));
    });
  };

  // ---------------------------------------
  // Lists
  // ---------------------------------------
  const insertBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const insertNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const removeList = () => {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  };

  // ---------------------------------------
  // Links
  // ---------------------------------------
  const insertLink = () => {
    editor.dispatchCommand(OPEN_LINK_EDITOR_COMMAND, linkUrl);
  };

  const removeLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  };

  return (
    <div className="toolbar">
      {/* Block type */}
      <select
        value={blockType}
        onChange={(event) => {
          formatBlock(event.target.value as BlockType);
        }}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        aria-label="Block type"
      >
        <option value="paragraph">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <div className="toolbar-divider" />

      {/* Bold */}
      <ToolbarButton
        label="Bold"
        active={isBold}
        onClick={() => {
          formatText('bold');
        }}
      >
        <strong>B</strong>
      </ToolbarButton>

      {/* Italic */}
      <ToolbarButton
        label="Italic"
        active={isItalic}
        onClick={() => {
          formatText('italic');
        }}
      >
        <em>I</em>
      </ToolbarButton>

      {/* Underline */}
      <ToolbarButton
        label="Underline"
        active={isUnderline}
        onClick={() => {
          formatText('underline');
        }}
      >
        <u>U</u>
      </ToolbarButton>

      {/* Strikethrough */}
      <ToolbarButton
        label="Strikethrough"
        active={isStrikethrough}
        onClick={() => {
          formatText('strikethrough');
        }}
      >
        <s>S</s>
      </ToolbarButton>

      <div className="toolbar-divider" />

      {/* Bullet list */}
      <ToolbarButton
        label="Bullet list"
        active={isBulletList}
        onClick={insertBulletList}
      >
        • List
      </ToolbarButton>

      {/* Numbered list */}
      <ToolbarButton
        label="Numbered list"
        active={isNumberedList}
        onClick={insertNumberedList}
      >
        1. List
      </ToolbarButton>

      {/* Remove list */}
      <ToolbarButton
        label="Remove list"
        disabled={!isBulletList && !isNumberedList}
        onClick={removeList}
      >
        Remove list
      </ToolbarButton>

      <div className="toolbar-divider" />

      {/* Link */}
      <ToolbarButton label="Add link" active={isLink} onClick={insertLink}>
        🔗
      </ToolbarButton>

      {/* Unlink */}
      <ToolbarButton
        label="Remove link"
        disabled={!isLink}
        onClick={removeLink}
      >
        Unlink
      </ToolbarButton>

      <div className="toolbar-divider" />

      {/* Undo */}
      <ToolbarButton
        label="Undo"
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
      >
        ↶
      </ToolbarButton>

      {/* Redo */}
      <ToolbarButton
        label="Redo"
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
      >
        ↷
      </ToolbarButton>
    </div>
  );
}
