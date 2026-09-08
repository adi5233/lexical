import {useEffect, useState} from 'react';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from 'lexical';
import {$setBlocksType} from '@lexical/selection';

import {$createHeadingNode, $isHeadingNode} from '@lexical/rich-text';

import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';

import {TOGGLE_LINK_COMMAND} from '@lexical/link';

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3';

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const [blockType, setBlockType] = useState<BlockType>('paragraph');

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({editorState}) => {
      editorState.read(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return;
        }

        // Inline formatting
        setIsBold(selection.hasFormat('bold'));
        setIsItalic(selection.hasFormat('italic'));
        setIsUnderline(selection.hasFormat('underline'));
        setIsStrikethrough(selection.hasFormat('strikethrough'));

        // Block type
        const anchorNode = selection.anchor.getNode();

        const topLevelElement = anchorNode.getTopLevelElementOrThrow();

        if ($isHeadingNode(topLevelElement)) {
          const tag = topLevelElement.getTag();
          setBlockType(
            tag === 'h1' || tag === 'h2' || tag === 'h3' ? tag : 'paragraph',
          );
        } else {
          setBlockType('paragraph');
        }
      });
    });
  }, [editor]);

  // Inline formatting
  const formatText = (
    format: 'bold' | 'italic' | 'underline' | 'strikethrough',
  ) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  // Block formatting
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

  // Lists
  const insertBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const insertNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const removeList = () => {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  };

  // Link
  const insertLink = () => {
    const url = window.prompt('Enter URL');
    if (!url) {
      return;
    }
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  };

  const removeLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  };

  return (
    <div className="toolbar">
      {/* Block selector */}

      <select
        value={blockType}
        onChange={(event) => {
          formatBlock(event.target.value as BlockType);
        }}
        onMouseDown={(event) => event.stopPropagation()}
        aria-label="Block type"
      >
        <option value="paragraph">Paragraph</option>

        <option value="h1">Heading 1</option>

        <option value="h2">Heading 2</option>

        <option value="h3">Heading 3</option>
      </select>

      <div className="toolbar-divider" />

      {/* Bold */}

      <button
        type="button"
        className={isBold ? 'active' : ''}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => formatText('bold')}
        aria-label="Bold"
        aria-pressed={isBold}
      >
        <strong>B</strong>
      </button>

      {/* Italic */}

      <button
        type="button"
        className={isItalic ? 'active' : ''}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => formatText('italic')}
        aria-label="Italic"
        aria-pressed={isItalic}
      >
        <em>I</em>
      </button>

      {/* Underline */}

      <button
        type="button"
        className={isUnderline ? 'active' : ''}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => formatText('underline')}
        aria-label="Underline"
        aria-pressed={isUnderline}
      >
        <u>U</u>
      </button>

      {/* Strikethrough */}

      <button
        type="button"
        className={isStrikethrough ? 'active' : ''}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => formatText('strikethrough')}
        aria-label="Strikethrough"
        aria-pressed={isStrikethrough}
      >
        <s>S</s>
      </button>

      <div className="toolbar-divider" />

      {/* Bullet list */}

      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={insertBulletList}
        aria-label="Bullet list"
      >
        • List
      </button>

      {/* Numbered list */}

      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={insertNumberedList}
        aria-label="Numbered list"
      >
        1. List
      </button>

      {/* Remove list */}

      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={removeList}
        aria-label="Remove list"
      >
        Remove list
      </button>

      <div className="toolbar-divider" />

      {/* Link */}

      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={insertLink}
        aria-label="Add link"
      >
        🔗
      </button>

      {/* Remove link */}

      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={removeLink}
        aria-label="Remove link"
      >
        Unlink
      </button>

      <div className="toolbar-divider" />

      {/* Undo */}

      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        aria-label="Undo"
      >
        ↶
      </button>

      {/* Redo */}

      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        aria-label="Redo"
      >
        ↷
      </button>
    </div>
  );
}
