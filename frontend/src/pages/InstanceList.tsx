import { Input, Typography } from '@arco-design/web-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryFilter, InstanceCard } from '../components/common';
import { useInstanceStore } from '../stores/instance';
import { useTemplateStore } from '../stores/template';
import { CONTRACT_STATUS_LABELS, ContractStatus } from '../types/enums';

const statusOrder: ContractStatus[] = [ContractStatus.Draft, ContractStatus.Signed, ContractStatus.Finalized];

const statusOptions = statusOrder.map((status) => ({
  value: status,
  label: CONTRACT_STATUS_LABELS[status]
}));

export function InstanceList() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { instances, loadInstances, deleteInstance } = useInstanceStore();
  const { templates, loadTemplates } = useTemplateStore();

  useEffect(() => {
    void Promise.all([loadInstances(), loadTemplates()]);
  }, [loadInstances, loadTemplates]);

  const statusCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const status of statusOrder) {
      map[status] = instances.filter((inst) => inst.status === status).length;
    }
    return map;
  }, [instances]);

  const filteredInstances = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return instances.filter((instance) => {
      const statusMatched = statusFilter === 'all' || instance.status === statusFilter;
      const template = templates.find((t) => t.id === instance.templateId);
      const keywordMatched =
        !normalizedKeyword ||
        instance.title.toLowerCase().includes(normalizedKeyword) ||
        template?.title.toLowerCase().includes(normalizedKeyword);
      return statusMatched && keywordMatched;
    });
  }, [instances, templates, keyword, statusFilter]);

  const groupedInstances = useMemo(() => {
    const groups: Record<ContractStatus, typeof filteredInstances> = {
      [ContractStatus.Draft]: [],
      [ContractStatus.Signed]: [],
      [ContractStatus.Finalized]: []
    };
    for (const instance of filteredInstances) {
      groups[instance.status].push(instance);
    }
    return groups;
  }, [filteredInstances]);

  const statusOptionsWithCount = statusOptions.map((opt) => ({
    ...opt,
    count: statusCount[opt.value]
  }));

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <Typography.Title heading={3}>合同实例</Typography.Title>
          <Typography.Text type="secondary">集中查看和管理所有合同实例，按状态分组展示。</Typography.Text>
        </div>
      </div>

      <div className="toolbar-row">
        <Input.Search allowClear placeholder="搜索实例标题或模板名称" value={keyword} onChange={setKeyword} />
        <CategoryFilter value={statusFilter} options={statusOptionsWithCount} onChange={setStatusFilter} />
      </div>

      {filteredInstances.length === 0 ? (
        <div className="empty-state">没有匹配的合同实例。</div>
      ) : (
        statusOrder.map((status) => {
          const list = groupedInstances[status];
          if (statusFilter !== 'all' && list.length === 0) {
            return null;
          }
          return (
            <div key={status} style={{ marginBottom: 32 }}>
              <Typography.Title heading={5} style={{ marginBottom: 14 }}>
                {CONTRACT_STATUS_LABELS[status]}
                <span className="muted" style={{ marginLeft: 8, fontWeight: 400 }}>
                  （{list.length}）
                </span>
              </Typography.Title>
              {list.length === 0 ? (
                <div className="empty-state" style={{ padding: '18px 26px' }}>
                  暂无{CONTRACT_STATUS_LABELS[status]}的合同实例。
                </div>
              ) : (
                <div className="template-grid">
                  {list.map((instance) => (
                    <InstanceCard
                      key={instance.id}
                      instance={instance}
                      template={templates.find((t) => t.id === instance.templateId)}
                      onEdit={() => navigate(`/instances/${instance.id}`)}
                      onViewHistory={() => navigate(`/instances/${instance.id}/versions`)}
                      onDelete={() => void deleteInstance(instance.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}
