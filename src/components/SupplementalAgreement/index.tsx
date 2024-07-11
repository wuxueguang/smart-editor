// import 'antd/dist/antd.css';

// import React, { useState } from 'react';
// import { Space, Button, Modal } from 'antd';
// // @ts-ignore
// import { DocumentEditor, DocumentEditorProps, createMultiRowsBlock } from '../../../packages/smart-editor/src';
// import type { BaseModule, EditorInstance, WorkMode } from '../../../packages/smart-editor/src/types';

// import datas from './datas';
// import oldContent from './oldContent';
// import usedModules from './usedModules';
// import { SlateElement, Transforms } from 'slate';
// import { CustomizedEditor } from 'packages/smart-editor/src/customized-slate';

// const modes = {
//   'preview': 'edit',
//   'edit': 'preview',
// };

// const des = {
//   'preview': '编辑',
//   'edit': '预览',
// };

// const Demo: React.FC = () => {
//   const editorOld = DocumentEditor.useEditorInstance() as EditorInstance;
//   const editorNew = DocumentEditor.useEditorInstance() as EditorInstance;

//   const [workMode, setWorkMode] = useState<WorkMode>('edit');

//   const [visible, setVisible] = useState(false);

//   return (
//     <div style={{
//       position: 'fixed',
//       zIndex: 1000,
//       top: 0,
//       left: 0,
//       width: '100vw',
//       height: '100vh',
//       overflow: 'auto',
//       backgroundColor: '#ccc',
//       padding: '30px 0',
//     }}>
//       <Space style={{ width: '100%' }} direction="vertical">
//         <Button type="primary" onClick={() => console.log(editorOld)}>旧</Button>
//         <Button type="primary" onClick={() => setVisible(true)}>添加条款</Button>
//         <Button type="primary" onClick={() => setWorkMode(modes[workMode] as unknown as any)}>{des[workMode]}</Button>

//         <div style={{ margin: 'auto', height: workMode === 'preview' ? 'auto' : 500 }}>
//           <DocumentEditor
//             editor={editorNew}
//             placeholder="template editor ..."
//             workMode={workMode}
//             datas={datas}
//           />
//         </div>
//       </Space>

//       <Modal
//         width={1000}
//         open={visible}
//         onCancel={() => setVisible(false)}
//         onOk={() => {
//           setVisible(false);
//           const slateEditor = editorNew.getSlateEditor() as CustomizedEditor;
//           const fragment = editorOld.getSlateEditor().getFragment() as SlateElement[];
//           editorNew.addObjectData('tendereeNotice', {
//             bidOpeningTime: '测试而已',
//           });
//           editorNew.addUsedModule(usedModules[0] as unknown as BaseModule);
//           const fragmentStr = JSON.stringify(fragment);
//           const rowsBlock = createMultiRowsBlock([
//             { type: 'inline-block', children: [{ text: '变更前：' }] },
//             ...JSON.parse(fragmentStr).map((item) => ({ ...item, type: 'inline-block' })),
//           ] as SlateElement[]);

//           if (!slateEditor.isInEmptyBlock()) {
//             Transforms.insertNodes(slateEditor, { type: 'paragraph', children: [{ text: '' }] });
//           }

//           slateEditor.insertFragment([
//             rowsBlock,
//             { type: 'paragraph', children: [{ text: '变更后：' }] },
//             ...JSON.parse(fragmentStr),
//           ]);
//         }}
//       >
//         <DocumentEditor
//           editor={editorOld}
//           placeholder="template editor ..."
//           workMode="edit-richText-only"
//           datas={datas}
//           detail={{
//             modules: usedModules as any,
//             content: oldContent,
//           }}
//         />
//       </Modal>
//     </div>
//   );
// };

// export default Demo;
