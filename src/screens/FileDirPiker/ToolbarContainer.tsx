import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

import { Toolbar } from '../../components/Toolbar';

interface ToolbarContainerProps {
  type?: 'move' | 'copy';
  onDone?: (key: 'add' | 'done') => void;
}

const ToolbarContainer = observer<ToolbarContainerProps>(props => {
  const { t } = useTranslation();

  const list = [
    {
      title: t('fileManager:add.folder'),
      key: 'add',
    },
    {
      title: t(`fileManager:${props.type ?? 'move'}.text`),
      key: 'done',
    },
  ];

  function handleToolbarPress(key: 'add' | 'done') {
    props.onDone?.(key);
  }

  return <Toolbar visible list={list} onPress={handleToolbarPress} />;
});

export default ToolbarContainer;
