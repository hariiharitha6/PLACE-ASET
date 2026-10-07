'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import PlaceAssistant from '../../../components/assistant/PlaceAssistant';
import PageHeader from '../../../components/ui/PageHeader';
import styles from './mentor.module.css';

export default function AIMentorPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        badge="Academic guidance"
        badgeIcon={<GraduationCap size={14} />}
        title="AI Personal Mentor"
        subtitle="Structured tutoring for concepts, study plans, and interview preparation—grounded in your learning context."
      />
      <div className={styles.chatShell}>
        <PlaceAssistant isDrawer={false} />
      </div>
    </div>
  );
}
