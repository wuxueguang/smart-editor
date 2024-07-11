import React from 'react';
import { Utils } from '../../../customized-slate';
import './styles.less';
import VariableElement from './VariableElement';
import ModuleElement from './ModuleElement';
import ContainerAndEdges from './ContainerAndEdges';

const Element: React.FC<Record<string, any>> = (props) => {

  if (Utils.isDataModel(props.element)) {
    if (Utils.isVariable(props.element)) {
      return <VariableElement {...props} />;
    }

    return <ModuleElement {...props} />;
  }

  return <ContainerAndEdges {...props} />;
};

export default Element;
