import {useEffect, useMemo, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Input, Select} from 'antd';

import {mapValues} from 'lodash';
import styled from 'styled-components';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';
import {knownResourceKindsSelector} from '@redux/selectors';

import {KeyValueInput} from '@components/atoms';

import {useNamespaces} from '@hooks/useNamespaces';

import Colors from '@styles/Colors';

const ALL_OPTIONS = '<all>';
const ROOT_OPTIONS = '<root>';

const BaseContainer = styled.div`
  min-width: 250px;
`;

const FieldContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 10px;
`;

const FieldLabel = styled.p`
  font-weight: 500;
  margin-bottom: 5px;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitleLabel = styled.span`
  color: ${Colors.grey7};
`;

const StyledTitleButton = styled(Button)`
  padding: 0;
`;

const {Option} = Select;

const makeKeyValuesFromObjectList = (objectList: any[], getNestedObject: (currentObject: any) => any) => {
  const keyValues: Record<string, string[]> = {};
  Object.values(objectList).forEach(currentObject => {
    const nestedObject = getNestedObject(currentObject);
    if (nestedObject) {
      Object.entries(nestedObject).forEach(([key, value]) => {
        if (typeof value !== 'string') {
          return;
        }
        if (keyValues[key]) {
          if (!keyValues[key].includes(value)) {
            keyValues[key].push(value);
          }
        } else {
          keyValues[key] = [value];
        }
      });
    }
  });
  return keyValues;
};

const ResourceFilter = () => {
  const dispatch = useAppDispatch();

  const [annotations, setAnnotations] = useState<Record<string, string | null>>({});
  const [fileOrFolderContainedIn, setFileOrFolderContainedIn] = useState<string>();
  const [labels, setLabels] = useState<Record<string, string | null>>({});
  const [kind, setKind] = useState<string>();
  const [name, setName] = useState<string>();
  const [namespace, setNamespace] = useState<string>();
  const [wasLocalUpdate, setWasLocalUpdate] = useState<boolean>(false);

  const [allNamespaces] = useNamespaces({extra: ['all', 'default']});

  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const areFiltersDisabled = useAppSelector(
    state => Boolean(state.main.checkedResourceIds.length) || Boolean(state.main.clusterDiff.selectedMatches.length)
  );
  const fileMap = useAppSelector(state => state.main.fileMap);
  const filtersMap = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const allResourceKinds = useMemo(() => {
    return [
      ...new Set([
        ...knownResourceKinds,
        ...Object.values(resourceMap)
          .filter(r => !knownResourceKinds.includes(r.kind))
          .map(r => r.kind),
      ]),
    ].sort();
  }, [knownResourceKinds, resourceMap]);

  const allLabelsData = useMemo<Record<string, string[]>>(() => {
    return makeKeyValuesFromObjectList(Object.values(resourceMap), resource => resource.content?.metadata?.labels);
  }, [resourceMap]);
  const allLabelsSchema = useMemo(() => mapValues(allLabelsData, () => 'string'), [allLabelsData]);

  const allAnnotationsData = useMemo<Record<string, string[]>>(() => {
    return makeKeyValuesFromObjectList(Object.values(resourceMap), resource => resource.content?.metadata?.annotations);
  }, [resourceMap]);
  const allAnnotationsSchema = useMemo(() => mapValues(allAnnotationsData, () => 'string'), [allAnnotationsData]);

  const fileOrFolderContainedInOptions = useMemo(() => {
    return Object.keys(fileMap).map(option => (
      <Option key={option} value={option}>
        {option}
      </Option>
    ));
  }, [fileMap]);

  const resetFilters = () => {
    setWasLocalUpdate(true);
    setName('');
    setKind(ALL_OPTIONS);
    setNamespace(ALL_OPTIONS);
    setLabels({});
    setAnnotations({});
    setFileOrFolderContainedIn(ROOT_OPTIONS);
  };

  const updateName = (newName: string) => {
    setWasLocalUpdate(true);
    setName(newName);
  };

  const updateLabels = (newLabels: Record<string, string | null>) => {
    setWasLocalUpdate(true);
    setLabels(newLabels);
  };
  const updateAnnotations = (newAnnotations: Record<string, string | null>) => {
    setWasLocalUpdate(true);
    setAnnotations(newAnnotations);
  };

  const updateKind = (selectedKind: string) => {
    setWasLocalUpdate(true);
    if (selectedKind === ALL_OPTIONS) {
      setKind(undefined);
    } else {
      setKind(selectedKind);
    }
  };

  const updateNamespace = (selectedNamespace: string) => {
    setWasLocalUpdate(true);
    if (selectedNamespace === ALL_OPTIONS) {
      setNamespace(undefined);
    } else {
      setNamespace(selectedNamespace);
    }
  };

  const updateFileOrFolderContainedIn = (selectedFileOrFolder: string) => {
    setWasLocalUpdate(true);
    if (selectedFileOrFolder === ALL_OPTIONS) {
      setFileOrFolderContainedIn(undefined);
    } else {
      setFileOrFolderContainedIn(selectedFileOrFolder);
    }
  };

  useDebounce(
    () => {
      if (!wasLocalUpdate) {
        return;
      }

      const updatedFilter = {
        name,
        kind: kind === ALL_OPTIONS ? undefined : kind,
        namespace: namespace === ALL_OPTIONS ? undefined : namespace,
        labels,
        annotations,
        fileOrFolderContainedIn: fileOrFolderContainedIn === ROOT_OPTIONS ? undefined : fileOrFolderContainedIn,
      };

      dispatch(updateResourceFilter(updatedFilter));
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [name, kind, namespace, labels, annotations, fileOrFolderContainedIn]
  );

  useEffect(() => {
    if (!wasLocalUpdate) {
      setName(filtersMap.name);
      setKind(filtersMap.kind);
      setNamespace(filtersMap.namespace);
      setLabels(filtersMap.labels);
      setAnnotations(filtersMap.annotations);
      setFileOrFolderContainedIn(filtersMap.fileOrFolderContainedIn);
    }
  }, [wasLocalUpdate, filtersMap]);

  useEffect(() => {
    setWasLocalUpdate(false);
  }, [filtersMap]);

  return (
    <BaseContainer>
      <StyledTitleContainer>
        <StyledTitleLabel>Filter resources by:</StyledTitleLabel>
        <StyledTitleButton type="link" onClick={resetFilters} disabled={areFiltersDisabled}>
          Reset all
        </StyledTitleButton>
      </StyledTitleContainer>
      <FieldContainer>
        <FieldLabel>Name:</FieldLabel>
        <Input
          autoFocus
          disabled={areFiltersDisabled}
          placeholder="All or part of name..."
          defaultValue={name}
          value={name}
          onChange={e => updateName(e.target.value)}
        />
      </FieldContainer>

      <FieldContainer>
        <FieldLabel>Kind:</FieldLabel>
        <Select
          showSearch
          disabled={areFiltersDisabled}
          defaultValue={ALL_OPTIONS}
          value={kind || ALL_OPTIONS}
          onChange={updateKind}
          style={{width: '100%'}}
        >
          <Option key={ALL_OPTIONS} value={ALL_OPTIONS}>
            {ALL_OPTIONS}
          </Option>
          {allResourceKinds.map(resourceKind => (
            <Option key={resourceKind} value={resourceKind}>
              {resourceKind}
            </Option>
          ))}
        </Select>
      </FieldContainer>

      <FieldContainer>
        <FieldLabel>Namespace:</FieldLabel>
        <Select
          showSearch
          disabled={areFiltersDisabled}
          defaultValue={ALL_OPTIONS}
          value={namespace || ALL_OPTIONS}
          onChange={updateNamespace}
          style={{width: '100%'}}
        >
          {allNamespaces.map(ns => {
            if (typeof ns !== 'string') {
              return null;
            }

            return (
              <Option key={ns} value={ns}>
                {ns}
              </Option>
            );
          })}
        </Select>
      </FieldContainer>

      <FieldContainer>
        <KeyValueInput
          label="Labels:"
          schema={allLabelsSchema}
          data={allLabelsData}
          value={labels}
          onChange={updateLabels}
          disabled={areFiltersDisabled}
        />
      </FieldContainer>

      <FieldContainer>
        <KeyValueInput
          disabled={areFiltersDisabled}
          label="Annotations:"
          schema={allAnnotationsSchema}
          data={allAnnotationsData}
          value={annotations}
          onChange={updateAnnotations}
        />
      </FieldContainer>

      <FieldContainer>
        <FieldLabel>Contained in file/folder:</FieldLabel>
        <Select
          defaultValue={ROOT_OPTIONS}
          disabled={areFiltersDisabled}
          showSearch
          style={{width: '100%'}}
          value={fileOrFolderContainedIn || ROOT_OPTIONS}
          onChange={updateFileOrFolderContainedIn}
        >
          {fileOrFolderContainedInOptions}
        </Select>
      </FieldContainer>
    </BaseContainer>
  );
};

export default ResourceFilter;
