import {useEffect} from 'react';

import {Button, Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import path from 'path';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {closeCreateFolderModal} from '@redux/reducers/ui';

import {CreateFolderCallback, checkIfEntityExists, createFolder} from '@utils/files';
import {useFocus} from '@utils/hooks';

const prohibitedFirstSymbols = ['/', '\\'];

const CreateFolderModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui.createFolderModal);

  const [createFolderForm] = useForm();

  const [inputRef, focus] = useFocus<any>();

  const onFinish = (values: {folderName: string}) => {
    const {folderName} = values;

    createFolder(uiState.rootDir, folderName, onCreate);
  };

  const onCreate = (args: CreateFolderCallback) => {
    const {folderName, err} = args;

    if (err) {
      dispatch(
        setAlert({
          title: 'Creating failed',
          message: 'Something went wrong during creating a folder',
          type: AlertEnum.Error,
        })
      );
    } else {
      dispatch(
        setAlert({
          title: 'Successfully created a folder',
          message: `You have successfully created the "${folderName}" folder`,
          type: AlertEnum.Success,
        })
      );

      dispatch(closeCreateFolderModal());
    }
  };

  useEffect(() => {
    if (uiState.isOpen) {
      focus();
    } else {
      createFolderForm.resetFields();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState]);

  if (!uiState.isOpen) {
    return null;
  }

  return (
    <Modal
      title="Create folder"
      visible={uiState.isOpen}
      onCancel={() => {
        dispatch(closeCreateFolderModal());
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            dispatch(closeCreateFolderModal());
          }}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            createFolderForm.submit();
          }}
        >
          Submit
        </Button>,
      ]}
    >
      <Form layout="vertical" form={createFolderForm} initialValues={{directoryName: ''}} onFinish={onFinish}>
        <Form.Item
          label="Folder name"
          name="folderName"
          rules={[
            ({getFieldValue}) => ({
              validator: () => {
                return new Promise((resolve: (value?: any) => void, reject) => {
                  const folderNameValue: string = getFieldValue('folderName').toLowerCase();

                  if (!folderNameValue) {
                    reject(new Error("This field can't be empty"));
                  }

                  if (prohibitedFirstSymbols.some(symbol => symbol === folderNameValue[0])) {
                    reject(new Error(`Folder name can't start with prohibited symbol - "${folderNameValue[0]}"`));
                  }

                  if (checkIfEntityExists(path.join(uiState.rootDir, path.sep, folderNameValue))) {
                    reject(new Error('A file or folder with this name already exists in this location'));
                  }

                  resolve();
                });
              },
            }),
          ]}
        >
          <Input ref={inputRef} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateFolderModal;
