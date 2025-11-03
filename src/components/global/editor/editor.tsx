'use client';

import { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  type JSONContent
} from 'novel';

import { ImageResizer, handleCommandNavigation } from 'novel/extensions';
import { Separator } from '@/components/ui/separator';
import EditorMenu from './editor-menu';
import { NodeSelector } from './selectors/node-selector';
import { LinkSelector } from './selectors/link-selector';
import { MathSelector } from './selectors/math-selector';
import { TextButtons } from './selectors/text-buttons';
import { ColorSelector } from './selectors/color-selector';
import { defaultExtensions } from './extensions';
import { slashCommand, suggestionItems } from './slash-command';

// const hljs = require('highlight.js');
import hljs from 'highlight.js';

const extensions = [...defaultExtensions, slashCommand];

export const defaultEditorContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: []
    }
  ]
};

interface EditorProps {
  initialValue?: JSONContent;
  onChange: (content: JSONContent) => void;
  noteId: string;
  userId: string;
  isEditable: boolean;
}

export default function Editor({ initialValue, onChange, noteId, userId, isEditable }: EditorProps) {
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [editorContent, setEditorContent] = useState<JSONContent>(initialValue || defaultEditorContent);
  const [lastSavedContent, setLastSavedContent] = useState<JSONContent>(initialValue || defaultEditorContent);

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  // Apply Codeblock Highlighting on the HTML from editor.getHTML()
  // const highlightCodeblocks = (content: string) => {
  //   const doc = new DOMParser().parseFromString(content, 'text/html');
  //   doc.querySelectorAll('pre code').forEach((el) => {
  //     hljs.highlightElement(el);
  //   });
  //   return new XMLSerializer().serializeToString(doc);
  // };

  // Save to localStorage
  const saveToLocal = (content: JSONContent) => {
    try {
      localStorage.setItem(`editorContent-${noteId}`, JSON.stringify(content));
    } catch (error) {
      console.error('Failed to save content to localStorage:', error);
    }
  };

  // Debounced function to save content after user stops typing for 5 seconds
  const debouncedSave = useCallback(
    debounce((content: JSONContent) => {
      saveToLocal(content);
      setLastSavedContent(content);
      setSaveStatus('Saved');
    }, 5000),
    [noteId]
  );

  // Handles editor content change, triggers debounced auto-save
  const handleEditorChange = (content: JSONContent) => {
    setEditorContent(content);
    debouncedSave(content);
  };

  // Load content from localStorage on component mount
  useEffect(() => {
    try {
      const savedContent = localStorage.getItem(`editorContent-${noteId}`);
      if (savedContent) {
        const parsedContent = JSON.parse(savedContent) as JSONContent;
        setEditorContent(parsedContent);
        setLastSavedContent(parsedContent);
      }
    } catch (error) {
      console.error('Failed to load content from localStorage:', error);
    }
  }, [noteId]);

  // Adds beforeunload event listener to warn user if they attempt to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (JSON.stringify(editorContent) !== JSON.stringify(lastSavedContent)) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editorContent, lastSavedContent]);

  // Flush the debounced save function when the editor loses focus (optional)
  const handleBlur = () => {
    debouncedSave.flush();
  };

  return (
    <div className={`relative w-full max-w-full leading-loose ${isEditable ? '' : 'pointer-events-none'}`}>
      <EditorRoot>
        <EditorContent
          immediatelyRender={false}
          initialContent={editorContent}
          extensions={extensions}
          className={`h-full selection:bg-[#6127FF]/10 text-gray-700 dark:text-gray-100 ${isEditable ? '' : 'cursor-default'}`}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event)
            },
            attributes: {
              class:
                'prose dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full',
            }
          }}
          onUpdate={({ editor }) => {
            const content = editor.getJSON() as JSONContent;
            handleEditorChange(content);
            onChange(content);
          }}
          onBlur={handleBlur}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-white dark:bg-black px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent text-primary"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <EditorMenu open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />

            <Separator orientation="vertical" />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />

            <Separator orientation="vertical" />
            <MathSelector />

            <Separator orientation="vertical" />
            <TextButtons />

            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </EditorMenu>
        </EditorContent>
      </EditorRoot>
    </div>
  );
}
