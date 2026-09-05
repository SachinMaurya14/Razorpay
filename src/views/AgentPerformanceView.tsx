import React from 'react';
import { AgentPerformanceDashboard } from '../components/agents/AgentPerformanceDashboard';

interface AgentPerformanceViewProps {
  onRunWorkflowDemo?: () => void;
  isProcessing?: boolean;
}

export const AgentPerformanceView: React.FC<AgentPerformanceViewProps> = ({
  onRunWorkflowDemo,
  isProcessing = false,
}) => {
  return (
    <div className="space-y-6">
      <AgentPerformanceDashboard
        onRunWorkflowDemo={onRunWorkflowDemo}
        isProcessing={isProcessing}
      />
    </div>
  );
};
