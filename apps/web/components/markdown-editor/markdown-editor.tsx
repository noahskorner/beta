'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import CodeMirror, {
  Decoration,
  DecorationSet,
  EditorView,
  RangeSetBuilder,
  ViewPlugin,
  ViewUpdate,
} from '@uiw/react-codemirror';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import './markdown-editor.css';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { DecorationRange } from './decoration-range';
import { headings } from './headings';
import { italics } from './italics';
import { lists } from './lists';
import { strongs } from './strongs';
import { tables } from './tables';
import { horizontalRules } from './horizontal-rules';

const mdExtension = markdown({
  codeLanguages: languages,
});

export interface MarkdownEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  height?: string;
  editable?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
}

export const MarkdownEditor = ({
  content,
  onContentChange,
  height = '100vh',
  editable = true,
  autoFocus = false,
  onBlur,
}: MarkdownEditorProps) => {
  const { resolvedTheme } = useTheme();
  const [value, setValue] = useState(content);
  const editorViewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    setValue(content);
  }, [content]);

  const onChange = (val: string) => {
    setValue(val);
    onContentChange(val);
  };

  const handleBlur = () => {
    const view = editorViewRef.current;
    if (!view) {
      onBlur?.();
      return;
    }

    const { head } = view.state.selection.main;
    view.dispatch({
      selection: { anchor: head },
    });
    onBlur?.();
  };

  return (
    <CodeMirror
      className="w-full h-full outline-none bg-transparent"
      value={value}
      height={height}
      theme={resolvedTheme === 'dark' ? vscodeDark : vscodeLight}
      extensions={[mdExtension, markdownPlugin]}
      onChange={onChange}
      onCreateEditor={(view) => {
        editorViewRef.current = view;
      }}
      editable={editable}
      autoFocus={autoFocus}
      onBlur={handleBlur}
    />
  );
};

const markdownPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView) {
      const builder = new RangeSetBuilder<Decoration>();

      const decorations: Array<DecorationRange> = [];
      for (const { from: initialFrom, to: initialTo } of view.visibleRanges) {
        const content = view.state.doc.sliceString(initialFrom, initialTo);
        const lines = content.split('\n');
        const cursorPosition = view.state.selection.main.head;
        const cursorLine = view.state.doc.lineAt(cursorPosition).number;

        let position = initialFrom;
        let listCount = 0;
        let tableCount = 0;
        for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
          const line = view.state.doc.line(lineNumber);
          const lineText = lines[lineNumber - 1];
          const isActive = lineNumber == cursorLine;
          const from = position;
          const to = position + lineText.length;

          // Strongs
          decorations.push(...strongs(lineText, isActive, from));

          // Italics
          decorations.push(...italics(lineText, isActive, from));

          // Headings
          decorations.push(...headings(line, lineText, isActive, from, to));

          // Lists
          const { count: updatedListCount, decorations: listDecorations } = lists(
            line,
            lineText,
            isActive,
            from,
            to,
            listCount
          );
          listCount = updatedListCount;
          decorations.push(...listDecorations);

          // Tables
          const { count: updatedTableCount, decorations: tableDecorations } = tables(
            line,
            lineText,
            isActive,
            from,
            to,
            tableCount
          );
          tableCount = updatedTableCount;
          decorations.push(...tableDecorations);

          // Horizontal Rules
          decorations.push(...horizontalRules(lineText, isActive, from, to));

          // Code

          // Increment the position
          position += lineText.length + 1;
        }
      }

      // Apply the decorations
      decorations.sort(
        (a, b) =>
          a.from - b.from || (a.decoration.spec.startSide ?? 0) - (b.decoration.spec.startSide ?? 0)
      );
      for (const range of decorations) {
        builder.add(range.from, range.to, range.decoration);
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);
