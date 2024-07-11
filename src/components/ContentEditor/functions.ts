// import { v4 as uuid } from 'uuid';
// import { Editor, Element as SlateElement, Transforms } from 'slate';

// export const LIST_TYPES = ['numbered-list', 'bulleted-list'];
// export const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

// export const toggleBlock = (editor: Editor, format: string) => {
//   const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type');
//   const isList = LIST_TYPES.includes(format);

//   Transforms.unwrapNodes(editor, {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
//     match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes((n as any).type) && !TEXT_ALIGN_TYPES.includes(format),
//     split: true,
//   });
//   let newProperties: Partial<SlateElement>;

//   if (TEXT_ALIGN_TYPES.includes(format)) {
//     newProperties = {
//       align: isActive ? undefined : format,
//     } as any;
//   } else {
//     newProperties = {
//       type: isActive ? 'paragraph' : isList ? 'list-item' : format,
//     } as any;

//     (newProperties as any).uid = uuid();
//   }

//   Transforms.setNodes<SlateElement>(editor, newProperties);

//   if (!isActive && isList) {
//     const block = { type: format, children: [] };
//     Transforms.wrapNodes(editor, block);
//   }
// };

// export const toggleMark = (editor: Editor, format: string) => {
//   const isActive = isMarkActive(editor, format);

//   if (isActive) {
//     Editor.removeMark(editor, format);
//   } else {
//     Editor.addMark(editor, format, true);
//   }
// };

// export const isBlockActive = (editor: Editor, format: any, blockType = 'type'): boolean => {
//   const { selection } = editor;
//   if (!selection) {
//     return false;
//   }

//   const [match] = Array.from(
//     Editor.nodes(editor, {
//       at: Editor.unhangRange(editor, selection),
//       match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any)[blockType] === format,
//     }),
//   );

//   return !!match;
// };

// export const isMarkActive = (editor: Editor, format: string) => {
//   const marks = Editor.marks(editor);
//   return marks ? (marks as any)[format] === true : false;
// };

// export const createTableElement = (params: { hasHeader: boolean; column: number; row: number }) => {
//   const { row, column, hasHeader } = params;

//   // const ret = {
//   //   type: 'table',
//   //   children: [],
//   // };

//   return {
//     type: 'table',
//     children: [
//       {
//         type: 'table-row',
//         children: [
//           {
//             type: 'table-cell',
//             children: [{ text: '' }],
//           },
//           {
//             type: 'table-cell',
//             children: [{ text: 'Human', bold: true }],
//           },
//           {
//             type: 'table-cell',
//             children: [{ text: 'Dog', bold: true }],
//           },
//           {
//             type: 'table-cell',
//             children: [{ text: 'Cat', bold: true }],
//           },
//         ],
//       },
//       {
//         type: 'table-row',
//         children: [
//           {
//             type: 'table-cell',
//             children: [{ text: '# of Feet', bold: true }],
//           },
//           {
//             type: 'table-cell',
//             children: [{ text: '2' }],
//           },
//           {
//             type: 'table-cell',
//             children: [{ text: '4' }],
//           },
//           {
//             type: 'table-cell',
//             children: [{ text: '4' }],
//           },
//         ],
//       },
//       {
//         type: 'table-row',
//         children: [
//           {
//             type: 'table-cell',
//             children: [{ text: '# of Lives', bold: true }],
//           },
//           {
//             type: 'table-cell',
//             children: [{ text: '1' }],
//           },
//           {
//             type: 'table-cell',
//             children: [{ text: '1' }],
//           },
//           {
//             type: 'table-cell',
//             children: [{ text: '9' }],
//           },
//         ],
//       },
//     ],
//   };
// };
