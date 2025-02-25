import React, {useEffect, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Checkbox, Form, Input, Tooltip} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import _ from 'lodash';

import {DEFAULT_KUBECONFIG_DEBOUNCE, PREDEFINED_K8S_VERSION} from '@constants/constants';
import {AutoLoadLastProjectTooltip} from '@constants/tooltips';

import {Project, ProjectConfig} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  changeCurrentProjectName,
  changeProjectsRootPath,
  setKubeConfig,
  setScanExcludesStatus,
  updateApplicationSettings,
  updateClusterSelectorVisibilty,
  updateFileIncludes,
  updateFolderReadsMaxDepth,
  updateK8sVersion,
  updateLoadLastProjectOnStartup,
  updateProjectConfig,
  updateScanExcludes,
} from '@redux/reducers/appConfig';
import {activeProjectSelector, currentConfigSelector} from '@redux/selectors';

import FileExplorer from '@components/atoms/FileExplorer';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {Settings} from './Settings';

import * as S from './styled';

const {Panel} = S.Collapse;

const SettingsManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject: Project | undefined = useAppSelector(activeProjectSelector);
  const mergedConfig: ProjectConfig = useAppSelector(currentConfigSelector);
  const appConfig = useAppSelector(state => state.config);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isClusterSelectorVisible = useAppSelector(state => state.config.isClusterSelectorVisible);
  const loadLastProjectOnStartup = useAppSelector(state => state.config.loadLastProjectOnStartup);
  const projectsRootPath = useAppSelector(state => state.config.projectsRootPath);

  const [activePanels, setActivePanels] = useState<number[]>([3]);
  const [currentProjectsRootPath, setCurrentProjectsRootPath] = useState(projectsRootPath);

  const [settingsForm] = useForm();

  useEffect(() => {
    if (highlightedItems.clusterPaneIcon) {
      setActivePanels(_.uniq([...activePanels, 3]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedItems.clusterPaneIcon]);

  const handlePaneCollapse = (value: any) => {
    setActivePanels(_.uniq([...value]));
  };

  const changeProjectConfig = (config: ProjectConfig) => {
    dispatch(updateProjectConfig({config, fromConfigFile: false}));
  };

  const changeApplicationConfig = (config: ProjectConfig) => {
    dispatch(
      updateApplicationSettings({
        ...config.settings,
        helmPreviewMode: config.settings?.helmPreviewMode || 'template',
        kustomizeCommand: config.settings?.kustomizeCommand || 'kubectl',
      })
    );

    if (!_.isEqual(config.kubeConfig?.path, appConfig.kubeConfig.path)) {
      dispatch(setKubeConfig({...appConfig.kubeConfig, path: config.kubeConfig?.path}));
    }
    if (!_.isEqual(config?.folderReadsMaxDepth, appConfig.folderReadsMaxDepth)) {
      dispatch(updateFolderReadsMaxDepth(config?.folderReadsMaxDepth || 10));
    }
    if (!_.isEqual(config?.k8sVersion, appConfig.k8sVersion)) {
      dispatch(updateK8sVersion(config?.k8sVersion || PREDEFINED_K8S_VERSION));
    }
    if (!_.isEqual(_.sortBy(config?.scanExcludes), _.sortBy(appConfig.scanExcludes))) {
      dispatch(setScanExcludesStatus('outdated'));
      dispatch(updateScanExcludes(config?.scanExcludes || []));
    }
    if (!_.isEqual(_.sortBy(config?.fileIncludes), _.sortBy(appConfig.fileIncludes))) {
      dispatch(updateFileIncludes(config?.fileIncludes || []));
    }
  };

  const handleChangeLoadLastFolderOnStartup = (e: any) => {
    dispatch(updateLoadLastProjectOnStartup(e.target.checked));
  };

  const handleChangeClusterSelectorVisibilty = (e: any) => {
    dispatch(updateClusterSelectorVisibilty(e.target.checked));
  };

  const onProjectNameChange = (projectName: string) => {
    if (projectName) {
      dispatch(changeCurrentProjectName(projectName));
    }
  };

  useEffect(() => {
    settingsForm.setFieldsValue({projectsRootPath});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsRootPath]);

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        settingsForm.setFieldsValue({projectsRootPath: folderPath});
        setCurrentProjectsRootPath(folderPath);
      }
    },
    {isDirectoryExplorer: true}
  );

  useDebounce(
    () => {
      if (currentProjectsRootPath && currentProjectsRootPath !== projectsRootPath) {
        dispatch(changeProjectsRootPath(currentProjectsRootPath));
      }
    },
    DEFAULT_KUBECONFIG_DEBOUNCE,
    [currentProjectsRootPath]
  );

  return (
    <>
      <S.Collapse bordered={false} activeKey={activePanels} onChange={handlePaneCollapse}>
        <Panel header="Global Settings" key="1">
          <Form
            form={settingsForm}
            initialValues={() => ({projectsRootPath})}
            autoComplete="off"
            onFieldsChange={(field, allFields) => {
              const rootPath = allFields.filter(f => _.includes(f.name.toString(), 'projectsRootPath'))[0].value;
              setCurrentProjectsRootPath(rootPath);
            }}
          >
            <>
              <S.Heading>Projects Root Path</S.Heading>
              <Form.Item required tooltip="The local path where your projects will live.">
                <Input.Group compact>
                  <Form.Item
                    name="projectsRootPath"
                    noStyle
                    rules={[
                      {
                        required: true,
                        message: 'Please provide your projects root path!',
                      },
                    ]}
                  >
                    <Input style={{width: 'calc(100% - 100px)'}} />
                  </Form.Item>
                  <Button style={{width: '100px'}} onClick={openFileExplorer}>
                    Browse
                  </Button>
                </Input.Group>
              </Form.Item>
            </>
          </Form>
          <S.Div>
            <S.Span>On Startup</S.Span>
            <Tooltip title={AutoLoadLastProjectTooltip}>
              <Checkbox checked={loadLastProjectOnStartup} onChange={handleChangeLoadLastFolderOnStartup}>
                Automatically load last project
              </Checkbox>
            </Tooltip>
          </S.Div>
          <S.Div style={{marginTop: 16}}>
            <Checkbox checked={isClusterSelectorVisible} onChange={handleChangeClusterSelectorVisibilty}>
              Show Cluster Selector
            </Checkbox>
          </S.Div>
        </Panel>
        <Panel header="Default Project Settings" key="2">
          <Settings config={appConfig} onConfigChange={changeApplicationConfig} />
        </Panel>
        {activeProject && (
          <Panel header="Active Project Settings" key="3">
            <Settings
              config={mergedConfig}
              onConfigChange={changeProjectConfig}
              showProjectName
              projectName={activeProject.name}
              onProjectNameChange={onProjectNameChange}
              isClusterPaneIconHighlighted={highlightedItems.clusterPaneIcon}
            />
          </Panel>
        )}
      </S.Collapse>
      <FileExplorer {...fileExplorerProps} />
    </>
  );
};

export default SettingsManager;
