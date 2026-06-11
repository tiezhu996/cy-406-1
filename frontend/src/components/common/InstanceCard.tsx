import { Button, Card, Popconfirm, Space, Tag, Typography } from '@arco-design/web-react';
import { IconDelete, IconEdit, IconHistory } from '@arco-design/web-react/icon';
import { ContractInstance } from '../../types/contract-instance';
import { CONTRACT_STATUS_LABELS, ContractStatus } from '../../types/enums';
import { Template } from '../../types/template';

const statusColorMap: Record<ContractStatus, string> = {
  [ContractStatus.Draft]: 'gray',
  [ContractStatus.Signed]: 'green',
  [ContractStatus.Finalized]: 'arcoblue'
};

interface InstanceCardProps {
  instance: ContractInstance;
  template?: Template;
  onEdit?: (instance: ContractInstance) => void;
  onViewHistory?: (instance: ContractInstance) => void;
  onDelete?: (instance: ContractInstance) => void;
}

export function InstanceCard({ instance, template, onEdit, onViewHistory, onDelete }: InstanceCardProps) {
  return (
    <Card className="template-card" hoverable>
      <div className="template-card__header">
        <div>
          <Typography.Title heading={6}>{instance.title}</Typography.Title>
          <span className="muted">更新于 {new Date(instance.updatedAt).toLocaleString()}</span>
        </div>
        <Tag color={statusColorMap[instance.status]}>{CONTRACT_STATUS_LABELS[instance.status]}</Tag>
      </div>

      <div className="template-card__meta">
        <span>
          模板：{template?.title ?? '未知模板'}
        </span>
        <span>{instance.versionIds.length} 个版本</span>
      </div>

      <div className="card-actions">
        {onEdit && (
          <Button icon={<IconEdit />} type="primary" onClick={() => onEdit(instance)}>
            编辑
          </Button>
        )}
        {onViewHistory && (
          <Button icon={<IconHistory />} onClick={() => onViewHistory(instance)}>
            版本对比
          </Button>
        )}
        {onDelete && (
          <Popconfirm title="确认删除该合同实例？" onOk={() => onDelete(instance)}>
            <Button icon={<IconDelete />} status="danger">
              删除
            </Button>
          </Popconfirm>
        )}
      </div>
    </Card>
  );
}
