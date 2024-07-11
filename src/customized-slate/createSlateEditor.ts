import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { withDataModel, CustomizedEditor } from './withDataModel';

export const createSlateEditor = () => withDataModel(withHistory(withReact(createEditor() as CustomizedEditor)));
