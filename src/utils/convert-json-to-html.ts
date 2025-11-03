import { JSONContent } from 'novel';

interface Mark {
    type: string;
    attrs?: {
      level?: number;
      [key: string]: string | number | boolean | undefined; // Example type
    };
  }

export default function convertJSONToHTML(node: JSONContent): string {
  if (!node || !node.type) return '';

  const { type, content, text, marks, attrs } = node;

  const childrenHTML = Array.isArray(content)
    ? content.map(convertJSONToHTML).join('')
    : '';

  switch (type) {
    case 'doc':
      return childrenHTML;

    case 'heading':
      const level = attrs?.level || 2;
      return `<h${level}>${childrenHTML}</h${level}>`;

    case 'paragraph':
      return `<p>${childrenHTML}</p>`;

    case 'text': {
      let textHTML = text || '';
      if (marks && marks.length > 0) {
        for (const mark of marks as Mark[]) {
          if (mark.type === 'bold') textHTML = `<strong>${textHTML}</strong>`;
          if (mark.type === 'italic') textHTML = `<em>${textHTML}</em>`;
          if (mark.type === 'underline') textHTML = `<u>${textHTML}</u>`;
          if (mark.type === 'strike') textHTML = `<s>${textHTML}</s>`;
        }
      }
      return textHTML;
    }

    case 'bulletList':
      return `<ul>${childrenHTML}</ul>`;

    case 'orderedList':
      return `<ol>${childrenHTML}</ol>`;

    case 'listItem':
      return `<li>${childrenHTML}</li>`;

    case 'blockquote':
      return `<blockquote>${childrenHTML}</blockquote>`;

    case 'codeBlock':
      return `<pre><code>${childrenHTML}</code></pre>`;

    default:
      // fallback for unexpected node types
      return `<p>${childrenHTML}</p>`;
  }
}
