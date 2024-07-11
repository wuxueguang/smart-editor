import React from 'react';
import {
  BaseElment as SlateBaseElement,
  BaseEditor as SlateBaseEditor,
  Text as SlateText,
  Element,
  Node,
} from 'slate';

/**
 * 变量的定义（用户可以自定义位置， 值永远是text类型）
 **/
export interface Variable {

  /** 同 Form.Item 中的 name 属性  */
  name: string;

  /** 变量中文名，同 Form.Item 中的 label 属性 */
  label?: string;

  /** 是否可编辑 */
  editable?: boolean;

  /** display: !hidden */
  hidden?: boolean;

  /* Form.Item's required */
  required: boolean;

  /** 是否可用 */
  enabled: boolean;

  /** 变量描述 */
  description?: string;

}

// 对象定义（用户不能自己决定展示，只有开发可以）
export interface BaseObject {

  /** 对象值得key（唯一） */
  name: string;

  /** 同 Form.Item 的 label props */
  label?: string;

  /** 对象的显示模式 */
  displayType: 'inline' | 'block';

  /** 对象数据类型 */
  dataType: 'object' | 'array';

  /** 对象使用到的变量 */
  variables: Variable[];
}

/** objects group */
export interface BaseModule {
  id: string;
  label: string;

  /* 组件内的变量是否可单独插入文档，可单独插入的组件不可作为整体插入 */
  pickable: boolean;
  template: string;
  description: string;

  /* 组件使用到的对象 */
  objects: BaseObject[];

  displayType: 'inline' | 'block';

  formUrl: string;
  formName: string;
  formVersion: string;
}

type BaseData = Record<Variable['name'], any>;
export type ObjectData = BaseData | BaseData[];

/** 变量名路径 */
export type NamePath = string;

export type WorkMode =
  |'preview'
  | 'select' // 用来做选中的模式，previw 模式下有组件无法选中的情况
  | 'edit'
  | 'edit-struct'
  | 'edit-content'
  | 'edit-richText-only'
;

export interface EditorInstance {

  /** 获取SlateEditor，对外不暴露 */
  getSlateEditor: () => CustomizedEditor;

  /** 获取富文本结构，和插入的组件ids */
  getDetail: () => { content: CustomizedEditor['children']; moduleIds: Array<BaseModule['id']>; };

  /** 监听detail变动 */
  onDetailChange: (handle: DetailChangeHandle) => void;

  /** 监听修改插入组件数据的Form提交事件 */
  onFormSubmit: (handle: FormSubmitHandle) => void;

  onSelectionConfirm: (handle: (fragment: SlateBaseEditor['fragment']) => void) => void;

  focus: () => void;

  isFocused: () => boolean;

  /* 如果提供validater函数，editor.validate_函数内部单纯执行validater函数，并且返回结果为validater函数的返回结果 */
  validate_: (
    validater?: (
      datas: Record<BaseObject['name'], BaseObjectData>,
      modules: BaseModule[],
      warn: (variables: Array<{ label: Variable['label'] } & Record<string, any>>) => void,
    ) => any,
  ) => any;

  getDatas: () => Record<BaseObject['name'], Record<Variable['name'], any>>;

  getUsedModulesRecord: () => Record<BaseModule['id'], BaseModule>;

  addObjectData: (objectName: BaseObject['name'], data: ObjectData) => void;

  addUsedModule: (module: BaseModule) => void;
}

export interface BaseEditorProps {
  topBar?: ReactElement | (() => ReactElement<any, any> | null);
  style?: React.CSSProperties;

  placeholder?: string;

  /** 工作模式 */
  workMode: WorkMode;
  editor?: EditorInstance;
  editorType: 'template' | 'document';
}

/** 基础编辑器定义 */
export interface BaseEditor {
  (props: BaseEditorProps): ReturnType<React.FC<BaseEditorProps>>;
  useEditorInstance: () => EditorInstance;
  useEditor: () => [EditorInstance];
}

export interface TemplateEditorProps extends Omit<BaseEditorProps, 'editorType' | 'editor'> {
  editor?: Omit<EditorInstance, 'getSlateEditor' | 'validate' | 'getDatas'>;
  workMode: Exclude<WorkMode, 'edit-content'>;
  modules: BaseModule[];
  detail?: {
    content?: string;
    modules?: BaseModule[];
  };
}

/** 模板编辑器 */
/** 结构编辑态模板编辑器 */
export interface TemplateEditor {
  (props: TemplateEditorProps): React.ReactElement | null;
  useEditor: () => [Omit<EditorInstance, 'getSlateEditor' | 'getDatas'>];
  useEditorInstance: () => Omit<EditorInstance, 'getSlateEditor' | 'getDatas'>;
}

export interface DocumentEditorProps extends Omit<BaseEditorProps, 'editorType' | 'editor'> {
  editor?: EditorInstance;
  workMode: Exclude<WorkMode, 'edit-struct'>;
  modules?: BaseModule[];
  detail?: { content?: string; modules?: BaseModule[] };
  datas: Record<BaseObject['name'], any>;
}

/** 文档编辑器 */
export interface DocumentEditor {
  (props: DocumentEditorProps): React.ReactElement | null;
  useEditor: () => [Omit<EditorInstance, 'getSlateEditor'>];
  useEditorInstance: () => Omit<EditorInstance, 'getSlateEditor'>;
}

/* extend slate types */
declare module 'slate' {
  interface BaseEditor extends SlateBaseEditor {
    type?: string;
  }

  interface BaseElement extends SlateBaseElement {
    uid?: string;
    type?: string;
    dataModel?: boolean;
  }

  type SlateNode = Node;

  interface SlateElement extends BaseElement {
    isInline?: boolean;
    uneditable?: boolean;
    undeletable?: boolean;
  }

  interface ParagraphElement extends Element {
    type: 'paragraph';
  }

  interface DataModelElement<T extends 'variable' | 'module' = 'variable' | 'module'> extends SlateElement {
    type: T;
    dataModel: true;
    moduleId: string;
    modelData?: Record<Object['name'], ObjectData>;
  }

  interface VariableElement extends DataModelElement<'variable'> {
    names: [BaseObject['name'], Variable['name']];
  }

  type ModuleElement = DataModelElement<'module'>;
}
