import {ipcRenderer} from 'electron';

import {useEffect, useState} from 'react';
import {useMeasure} from 'react-use';

import styled from 'styled-components';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLayoutSize} from '@redux/reducers/ui';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors} from '@styles/Colors';

const StyledFooter = styled.footer`
  width: 100%;
  padding: 0px;
  padding-left: 10px;
  margin: 0px;
  background: ${BackgroundColors.darkThemeBackground};
  border-top: ${AppBorders.pageDivider};
  color: ${Colors.grey7};
  user-select: none;
`;

const PageFooter = () => {
  const [appVersion, setAppVersion] = useState('');
  const [footerText, setFooterText] = useState('');
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const rootEntry = fileMap[ROOT_FILE_ENTRY];

  const layoutSize = useAppSelector(state => state.ui.layoutSize);

  const [footerRef, {height: footerHeight}] = useMeasure<any>();

  useEffect(() => {
    if (!layoutSize.footer && footerHeight) {
      dispatch(setLayoutSize({...layoutSize, footer: footerHeight}));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footerHeight]);

  // not counting the root
  const nrOfFiles = Object.values(fileMap).filter(f => !f.children).length;

  ipcRenderer.send('app-version');
  ipcRenderer.once('app-version', (_, {version}) => {
    setAppVersion(version);
  });

  useEffect(() => {
    setFooterText(
      `Monokle ${appVersion} - kubeshop.io 2022${
        rootEntry && rootEntry.children ? ` - ${rootEntry.filePath} - ${nrOfFiles} files` : ''
      }`
    );
  }, [appVersion, nrOfFiles, rootEntry]);

  return <StyledFooter ref={footerRef}>{footerText}</StyledFooter>;
};

export default PageFooter;
