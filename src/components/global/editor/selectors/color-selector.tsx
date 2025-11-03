import { Check, ChevronDown } from 'lucide-react'
import { EditorBubbleItem, useEditor } from 'novel'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
export interface BubbleColorMenuItem {
  name: string
  color: string
}

const TEXT_COLORS: BubbleColorMenuItem[] = [
  {
    name: 'Default',
    color: 'var(--novel-black)'  // No background
  },
  {
    name: 'Gray',
    color: '#9B9B9B'  // Gray background
  },
  {
    name: 'Brown',
    color: '#BA8570'  // Brown background
  },
  {
    name: 'Orange',
    color: '#C87D48'  // Orange background
  },
  {
    name: 'Yellow',
    color: '#CA9849'  // Yellow background
  },
  {
    name: 'Green',
    color: '#529E71'  // Green background
  },
  {
    name: 'Blue',
    color: '#5E87C9'  // Blue background
  },
  {
    name: 'Purple',
    color: '#9D68D3'  // Purple background
  },
  {
    name: 'Pink',
    color: '#D15896'  // Pink background
  },
  {
    name: 'Red',
    color: '#DF5452'  // Red background
  }
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "var(--novel-highlight-default)",
  },
  {
    name: "Gray",
    color: "var(--novel-highlight-gray)",
  },
  {
    name: "Orange",
    color: "var(--novel-highlight-orange)",
  },
  {
    name: "Yellow",
    color: "var(--novel-highlight-yellow)",
  },
  {
    name: "Green",
    color: "var(--novel-highlight-green)",
  },
  {
    name: "Blue",
    color: "var(--novel-highlight-blue)",
  },
  {
    name: "Purple",
    color: "var(--novel-highlight-purple)",
  },
  {
    name: "Red",
    color: "var(--novel-highlight-red)",
  },
  {
    name: "Pink",
    color: "var(--novel-highlight-pink)",
  },
];



interface ColorSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ColorSelector = ({ open, onOpenChange }: ColorSelectorProps) => {
  const { editor } = useEditor()

  if (!editor) return null
  const activeColorItem = TEXT_COLORS.find(({ color }) =>
    editor.isActive('textStyle', { color })
  )

  const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) =>
    editor.isActive('highlight', { color })
  )

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button size='sm' className='gap-2 rounded-none' variant='ghost'>
          <span
            className='rounded-sm px-1 rouned'
            style={{
              color: activeColorItem?.color,
              backgroundColor: activeHighlightItem?.color
            }}
          >
            A
          </span>
          <ChevronDown className='h-4 w-4' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        sideOffset={5}
        className='my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded border p-1 shadow-xl'
        align='start'
      >
        <div className='flex flex-col'>
          <div className='my-1 px-2 text-sm font-semibold text-muted-foreground'>
            Color
          </div>
          {TEXT_COLORS.map(({ name, color }) => (
            <EditorBubbleItem
              key={name}
              onSelect={() => {
                editor.commands.unsetColor()
                // name !== 'Default' &&
                //   editor
                //     .chain()
                //     .focus()
                //     .setColor(color || '')
                //     .run()
                // onOpenChange(false)
                if (name !== 'Default') {
                  editor.chain().focus().setColor(color || '').run();
                }
                onOpenChange(false);
              }}
              className='flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent'
            >
              <div className='flex items-center gap-2'>
                <div
                  className='rounded-sm border px-2 py-px font-medium'
                  style={{ color }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
            </EditorBubbleItem>
          ))}
        </div>
        <div>
          <div className='mt-4 mb-1 px-2 text-xs font-semibold text-muted-foreground'>
            Background color
          </div>
          {HIGHLIGHT_COLORS.map(({ name, color }) => (
            <EditorBubbleItem
              key={name}
              onSelect={() => {
                editor.commands.unsetHighlight()
                // name !== 'Default' &&
                //   editor.chain().focus().setHighlight({ color }).run()
                // onOpenChange(false)
                if (name !== 'Default') {
                  editor.chain().focus().setHighlight({ color }).run();
                }
                onOpenChange(false);
              }}
              className='flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent'
            >
              <div className='flex items-center gap-2'>
                <div
                  className='rounded-sm px-2 py-px font-medium'
                  style={{ backgroundColor: color }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
              {editor.isActive('highlight', { color }) && (
                <Check className='h-4 w-4' />
              )}
            </EditorBubbleItem>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}