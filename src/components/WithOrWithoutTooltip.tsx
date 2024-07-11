import React, { useMemo, PropsWithChildren } from 'react';
import { Tooltip } from 'antd';

const WithOrWithoutTooltip: React.FC<
  PropsWithChildren<{
    title: string;
    maxLength: number;
  }>
> = (props) => {
  const { title, maxLength, children } = props;
  const needTooltip = useMemo(() => title.length > maxLength, [maxLength, title.length]);

  return needTooltip ? <Tooltip title={title}>{children}</Tooltip> : <>{children}</>;
};

export default WithOrWithoutTooltip;
