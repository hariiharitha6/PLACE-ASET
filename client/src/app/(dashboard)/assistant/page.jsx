'use client';

import React from 'react';
import PlaceAssistant from '../../../components/assistant/PlaceAssistant';

export default function AssistantPage() {
  return (
    <div style={{
      height: 'calc(100vh - 130px)',
      minHeight: '520px',
      maxHeight: '850px',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <PlaceAssistant isDrawer={false} />
    </div>
  );
}
