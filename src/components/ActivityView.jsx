import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  ArrowLeft, 
  History
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, Tabs, EmptyState } from './ui';

export default function ActivityView() {
  const { activities, navigateTo } = useApp();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'verification' | 'issuance' | 'revocation'

  const verificationCount = activities.filter((a) => a.type === 'verification').length;
  const issuanceCount = activities.filter((a) => a.type === 'issuance').length;
  const revocationCount = activities.filter((a) => a.type === 'revocation').length;

  const tabOptions = [
    { id: 'all', label: 'All', count: activities.length },
    { id: 'verification', label: 'Verifications', count: verificationCount },
    { id: 'issuance', label: 'Issuance', count: issuanceCount },
    { id: 'revocation', label: 'Revocations', count: revocationCount }
  ];

  const filteredActivities = activities.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'verification':
        return { icon: Building2, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'issuance':
        return { icon: GraduationCap, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'revocation':
        return { icon: ShieldAlert, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { icon: ShieldCheck, color: 'var(--brand-royal-blue)', bg: 'rgba(37, 99, 235, 0.15)' };
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>
            Recent Activity
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Real-time decentralized identity audit log
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={() => navigateTo('dashboard')}>
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div style={{ padding: '14px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Verifications</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10B981', marginTop: '2px' }}>{verificationCount}</div>
        </div>

        <div style={{ padding: '14px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Issuances</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#3B82F6', marginTop: '2px' }}>{issuanceCount}</div>
        </div>

        <div style={{ padding: '14px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Revocations</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#EF4444', marginTop: '2px' }}>{revocationCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Tabs
          tabs={tabOptions}
          activeTab={filterType}
          onChange={(tab) => setFilterType(tab)}
          style={{ width: '100%', justifyContent: 'space-around', maxWidth: '440px' }}
        />
      </div>

      {/* Activities Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredActivities.length === 0 ? (
          <EmptyState
            icon={History}
            title="No activity recorded"
            description="No events match the selected activity filter."
            actionLabel="View All Activity"
            onAction={() => setFilterType('all')}
          />
        ) : (
          filteredActivities.map((act) => {
            const { icon: Icon, color, bg } = getActivityIcon(act.type);

            return (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: bg,
                      color: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {act.title}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {act.subtitle || act.credentialTitle}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      <Clock size={12} />
                      <span>{act.timestamp}</span>
                      <span>•</span>
                      <span className="mono-text" style={{ color: 'var(--brand-royal-blue)' }}>{act.hash}</span>
                    </div>
                  </div>
                </div>

                <Badge status={act.badgeType}>
                  {act.badgeText}
                </Badge>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
