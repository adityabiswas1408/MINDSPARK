'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import BoldExtension from '@tiptap/extension-bold';
import ItalicExtension from '@tiptap/extension-italic';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import { Bold, Italic, List } from 'lucide-react';

interface TipTapEditorProps {
  onChange: (html: string, json: Record<string, unknown>) => void;
  initialContent?: string;
}

export default function TipTapEditor({ onChange, initialContent = '' }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      BoldExtension,
      ItalicExtension,
      BulletList,
      ListItem,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getJSON());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden">
      <div className="flex items-center gap-0.5 border-b border-slate-200 px-2 py-1.5 bg-slate-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded text-slate-600 hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-slate-200 text-slate-900' : ''}`}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded text-slate-600 hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : ''}`}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded text-slate-600 hover:bg-slate-200 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900' : ''}`}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3 min-h-[160px] text-slate-900 [&_.ProseMirror]:outline-none"
      />
    </div>
  );
}
