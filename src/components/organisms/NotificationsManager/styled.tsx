import {Badge} from 'antd';

import {
  CheckCircleOutlined as RawCheckCircleOutlined,
  CopyOutlined as RawCopyOutlined,
  ExclamationCircleOutlined as RawExclamationCircleOutlined,
  InfoCircleOutlined as RawInfoCircleOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

export const StyledDiv = styled.div`
  margin-bottom: 12px;
`;

export const StyledSpan = styled.span`
  font-weight: 500;
  font-size: 12px;
  display: block;
  margin-bottom: 6px;
`;

export const CheckCircleOutlined = styled(RawCheckCircleOutlined)`
  color: ${Colors.greenOkay};
  font-size: 16px;
`;

export const CopyOutlined = styled(RawCopyOutlined)`
  margin-right: 8px;
  margin-top: 4px;
`;

export const ExclamationCircleOutlined = styled(RawExclamationCircleOutlined)`
  color: ${FontColors.error};
  font-size: 16px;
`;

export const ExclamationCircleOutlinedWarning = styled(RawExclamationCircleOutlined)`
  color: ${Colors.yellowWarning};
  font-size: 16px;
`;

export const InfoCircleOutlined = styled(RawInfoCircleOutlined)`
  color: ${Colors.cyan};
  font-size: 16px;
`;

export const MessageBodyContainer = styled(StyledDiv)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const MessageContainer = styled(StyledDiv)`
  display: flex;
  justify-content: space-between;
`;

export const NoNotificationsContainer = styled(StyledDiv)`
  display: flex;
`;

export const DateSpan = styled(StyledSpan)`
  color: ${Colors.grey500};
`;

export const MessageSpan = styled(StyledSpan)`
  color: ${Colors.whitePure};
  width: 100%;
  margin-bottom: 0px;
`;

export const StatusBadge = styled(Badge)`
  margin-right: 8px;
  margin-top: 4px;
`;

export const TitleSpan = styled(StyledSpan)`
  color: ${Colors.whitePure};
  width: 100%;
  font-size: 14px;
  font-weight: 600;
`;
