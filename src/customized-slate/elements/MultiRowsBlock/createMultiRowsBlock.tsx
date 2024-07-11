import { SlateElement } from 'slate';
import { v4 as uuid } from 'uuid';
import { CONTENT_CONTAINER_OF_MULTI_ROWS_BLOCK, HEAD_EDGE_OF_MULTI_ROWS_BLOCK, MULTI_ROWS_BLOCK, TAIL_EDGE_OF_MULTI_ROWS_BLOCK } from './consts';

export default (nodes: SlateElement[]) => {
  const headEdge = {
    type: HEAD_EDGE_OF_MULTI_ROWS_BLOCK,
    children: [{ text: '' }],
  };

  const tailEdge = {
    type: TAIL_EDGE_OF_MULTI_ROWS_BLOCK,
    children: [{ text: '' }],
  };

  const content = {
    type: CONTENT_CONTAINER_OF_MULTI_ROWS_BLOCK,
    children: nodes,
  };

  return { type: MULTI_ROWS_BLOCK, children: [headEdge, content, tailEdge], uid: uuid() };
};
