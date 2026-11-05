'use client';

import type { Editor } from '@tiptap/react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, List, ListOrdered } from 'lucide-react';

const COLOR_OPTIONS = [
  { value: '#214c9b', label: 'Azul Properlia' },
  { value: '#1a3a5c', label: 'Azul marino' },
  { value: '#2c2c2a', label: 'Carbón' },
  { value: '#888780', label: 'Gris' },
  { value: '#c4a44a', label: 'Dorado (precio)' },
  { value: '#f6f6f2', label: 'Fondo' },
];

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 p-2 bg-white border border-brand-border rounded-lg w-fit flex-wrap">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>

      <div className="w-px h-5 bg-brand-border mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <div className="w-px h-5 bg-brand-border mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Align left"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Align center"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Align right"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      <div className="w-px h-5 bg-brand-border mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Ordered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <div className="w-px h-5 bg-brand-border mx-1" />

      <div className="flex items-center gap-1.5">
        {COLOR_OPTIONS.map(({ value, label }) => {
          const isActive = editor.getAttributes('textStyle').color === value;
          return (
            <button
              key={value}
              type="button"
              title={label}
              onClick={() => editor.chain().focus().setColor(value).run()}
              className={`h-5 w-5 rounded-full border-2 cursor-pointer transition-shadow ${
                isActive ? 'border-brand-blue' : 'border-input hover:border-input'
              }`}
              style={{ backgroundColor: value }}
            />
          );
        })}
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${
        active ? 'bg-brand-pale text-brand-blue' : 'text-brand-carbon/70 hover:bg-brand-bg'
      }`}
    >
      {children}
    </button>
  );
}
