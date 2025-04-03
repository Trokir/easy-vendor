import React, { useCallback, useState } from 'react';
import { 
  Editor, 
  EditorState, 
  RichUtils, 
  convertToRaw, 
  convertFromRaw,
  DraftHandleValue,
  ContentState,
  KeyBindingUtil,
  getDefaultKeyBinding
} from 'draft-js';
import { 
  Box, 
  Toolbar, 
  IconButton, 
  Tooltip, 
  Divider,
  Select,
  MenuItem,
  Typography,
  Paper
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Link,
  FormatClear
} from '@mui/icons-material';
import 'draft-js/dist/Draft.css';
import './RichTextEditor.css';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const BLOCK_TYPES = [
  { label: 'Normal', style: 'unstyled' },
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'Code Block', style: 'code-block' },
];

const INLINE_STYLES = [
  { icon: <FormatBold />, style: 'BOLD', tooltip: 'Bold (Ctrl+B)' },
  { icon: <FormatItalic />, style: 'ITALIC', tooltip: 'Italic (Ctrl+I)' },
  { icon: <FormatUnderlined />, style: 'UNDERLINE', tooltip: 'Underline (Ctrl+U)' },
  { icon: <Code />, style: 'CODE', tooltip: 'Code' },
];

const getBlockStyle = (block: any) => {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    case 'code-block':
      return 'code-block';
    default:
      return block.getType();
  }
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder,
  readOnly = false,
}) => {
  const [editorState, setEditorState] = useState(() => {
    if (content) {
      try {
        const contentState = convertFromRaw(JSON.parse(content));
        return EditorState.createWithContent(contentState);
      } catch {
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });

  const handleChange = useCallback((newState: EditorState) => {
    setEditorState(newState);
    if (onChange) {
      const contentState = newState.getCurrentContent();
      const raw = convertToRaw(contentState);
      onChange(JSON.stringify(raw));
    }
  }, [onChange]);

  const handleKeyCommand = useCallback((command: string, state: EditorState): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(state, command);
    if (newState) {
      handleChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }, [handleChange]);

  const toggleBlockType = useCallback((blockType: string) => {
    handleChange(RichUtils.toggleBlockType(editorState, blockType));
  }, [editorState, handleChange]);

  const toggleInlineStyle = useCallback((inlineStyle: string) => {
    handleChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  }, [editorState, handleChange]);

  const handleReturn = useCallback((e: React.KeyboardEvent): DraftHandleValue => {
    if (e.shiftKey) {
      handleChange(RichUtils.insertSoftNewline(editorState));
      return 'handled';
    }
    return 'not-handled';
  }, [editorState, handleChange]);

  const currentBlockType = editorState
    .getCurrentContent()
    .getBlockForKey(editorState.getSelection().getStartKey())
    .getType();

  const currentStyle = editorState.getCurrentInlineStyle();

  if (readOnly) {
    return (
      <Box className="RichEditor-root">
        <div className="RichEditor-editor">
          <Editor
            editorState={editorState}
            onChange={handleChange}
            blockStyleFn={getBlockStyle}
            readOnly={true}
          />
        </div>
      </Box>
    );
  }

  return (
    <Paper variant="outlined" className="RichEditor-root">
      <Toolbar variant="dense" className="RichEditor-controls" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Select
          size="small"
          value={currentBlockType}
          onChange={(e) => toggleBlockType(e.target.value)}
          sx={{ width: 120, mr: 1 }}
        >
          {BLOCK_TYPES.map((type) => (
            <MenuItem key={type.style} value={type.style}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        {INLINE_STYLES.map((type) => (
          <Tooltip key={type.style} title={type.tooltip}>
            <IconButton
              size="small"
              onClick={() => toggleInlineStyle(type.style)}
              color={currentStyle.has(type.style) ? 'primary' : 'default'}
              className={currentStyle.has(type.style) ? 'RichEditor-activeButton' : ''}
            >
              {type.icon}
            </IconButton>
          </Tooltip>
        ))}
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            onClick={() => toggleBlockType('unordered-list-item')}
            color={currentBlockType === 'unordered-list-item' ? 'primary' : 'default'}
            className={currentBlockType === 'unordered-list-item' ? 'RichEditor-activeButton' : ''}
          >
            <FormatListBulleted />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered List">
          <IconButton
            size="small"
            onClick={() => toggleBlockType('ordered-list-item')}
            color={currentBlockType === 'ordered-list-item' ? 'primary' : 'default'}
            className={currentBlockType === 'ordered-list-item' ? 'RichEditor-activeButton' : ''}
          >
            <FormatListNumbered />
          </IconButton>
        </Tooltip>
        <Tooltip title="Quote">
          <IconButton
            size="small"
            onClick={() => toggleBlockType('blockquote')}
            color={currentBlockType === 'blockquote' ? 'primary' : 'default'}
            className={currentBlockType === 'blockquote' ? 'RichEditor-activeButton' : ''}
          >
            <FormatQuote />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Tooltip title="Clear Formatting">
          <IconButton
            size="small"
            onClick={() => {
              const selection = editorState.getSelection();
              const contentState = editorState.getCurrentContent();
              const block = contentState.getBlockForKey(selection.getStartKey());
              
              let newState = EditorState.push(
                editorState,
                ContentState.createFromText(block.getText()),
                'change-block-type'
              );
              
              handleChange(newState);
            }}
          >
            <FormatClear />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <div className="RichEditor-editor">
        <Editor
          editorState={editorState}
          onChange={handleChange}
          handleKeyCommand={handleKeyCommand}
          handleReturn={handleReturn}
          placeholder={placeholder}
          blockStyleFn={getBlockStyle}
          spellCheck={true}
        />
      </div>
    </Paper>
  );
}; 