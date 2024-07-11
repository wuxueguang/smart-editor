import TemplateEditor from './components/TemplateEditor';
import DocumentEditor from './components/DocumentEditor';
import Catalog from './components/Catalog';

import { default as createMultiRowsBlock } from './customized-slate/elements/MultiRowsBlock/createMultiRowsBlock';

export * from './services';

export type TemplateEditorProps = Parameters<typeof TemplateEditor>[0];
export type DocumentEditorProps = Parameters<typeof DocumentEditor>[0];
export type CatalogProps = Parameters<typeof Catalog>[0];

export {
  createMultiRowsBlock,

  TemplateEditor,
  DocumentEditor,
  Catalog,
};

//
// @ts-ignore
import { version } from '../package.json';
if (new URLSearchParams(location.search).get('console')
  ?.toLowerCase() === 'yes') {
  // eslint-disable-next-line no-console
  console.log(`%cSMART EDITOR VERSION: ${version}`, 'color: green;font-size: 60px;font-weight: 800;');
}
