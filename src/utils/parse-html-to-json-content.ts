import { JSONContent } from 'novel';

export function parseHTMLToJSONContent(html: string): JSONContent {
  const parser = new DOMParser();

  // Replace <h1> with <h2> as per previous discussions
  const sanitizedHtml = html.replace(/<h1>/g, '<h2>').replace(/<\/h1>/g, '</h2>');
  const doc = parser.parseFromString(sanitizedHtml, 'text/html');

  const convertNode = (node: Node): JSONContent | null => {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      return null;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      return { type: 'text', text: node.textContent || '' };
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const element = node as HTMLElement;

    switch (element.tagName.toLowerCase()) {
      case 'h1':
        return {
          type: 'heading',
          attrs: { level: 1 },
          content: [
            {
              type: 'text',
              text: element.textContent || '' // Only apply plain text within headings
            }
          ]
        };
      case 'h2':
        return {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: element.textContent || '' // Only apply plain text within headings
            }
          ]
        };
      case 'h3':
        return {
          type: 'heading',
          attrs: { level: 3 },
          content: [
            {
              type: 'text',
              text: element.textContent || ''
            }
          ]
        };
      case 'p':
        return {
          type: 'paragraph',
          content: Array.from(element.childNodes)
            .map(convertNode)
            .filter((child): child is JSONContent => child !== null)
        };
      case 'blockquote':
        return {
          type: 'blockquote',
          content: Array.from(element.childNodes)
            .map(convertNode)
            .filter((child): child is JSONContent => child !== null)
        };
      case 'ul':
        return {
          type: 'bulletList',
          content: Array.from(element.childNodes)
            .map(convertNode)
            .filter((child): child is JSONContent => child !== null)
        };
      case 'ol':
        return {
          type: 'orderedList',
          content: Array.from(element.childNodes)
            .map(convertNode)
            .filter((child): child is JSONContent => child !== null)
        };
      case 'li':
        return {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: Array.from(element.childNodes)
                .map(convertNode)
                .filter((child): child is JSONContent => child !== null)
            }
          ]
        };
      case 'pre':
        return {
          type: 'codeBlock',
          content: Array.from(element.childNodes)
            .map(convertNode)
            .filter((child): child is JSONContent => child !== null)
        };
      case 'strong':
        return {
          type: 'text',
          text: element.textContent || '',
          marks: [{ type: 'bold' }]
        };
      case 'em':
        return {
          type: 'text',
          text: element.textContent || '',
          marks: [{ type: 'italic' }]
        };
      case 'u':
        return {
          type: 'text',
          text: element.textContent || '',
          marks: [{ type: 'underline' }]
        };
      case 's':
        return {
          type: 'text',
          text: element.textContent || '',
          marks: [{ type: 'strike' }]
        };
      default:
        return {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: element.textContent || ''
            }
          ]
        };
    }
  };

  return {
    type: 'doc',
    content: Array.from(doc.body.childNodes)
      .map(convertNode)
      .filter((child): child is JSONContent => child !== null)
  };
}
