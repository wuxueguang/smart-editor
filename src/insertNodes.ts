import { BaseEditor as SlateEditor, ParagraphElement, Point, createEditor, Transforms, Node } from 'slate';

// export function insertNodes (source: SlateEditor['children']): (nodes: Node[], opt?: {
//   prefixes: ParagraphElement[][];
//   suffixes: ParagraphElement[][];
//   marks: string[];
//   times: number;
// }) => void;

export function insertNodes(source: SlateEditor['children']) {
  const editor = createEditor();

  editor.children = source;

  return (
    nodes: Node[],
    findLocation: (source: SlateEditor['children']) => Point,
    opt?: {
      prefixes: ParagraphElement[][];
      suffixes: ParagraphElement[][];
      marks: string[];
      times: number;
    }): SlateEditor['children'] => {
    const position = findLocation(source);
    Transforms.insertNodes(editor, nodes, { at: position });

    return editor.children;
  };
}
