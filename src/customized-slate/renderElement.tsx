import React from 'react';

import { NormalElement, DataModelElement, MultiRowsBlock } from './elements';

export const renderElement = (props: any) => (
  <>
    <MultiRowsBlock {...props} />
    <DataModelElement {...props} />
    <NormalElement {...props} />
  </>
);
