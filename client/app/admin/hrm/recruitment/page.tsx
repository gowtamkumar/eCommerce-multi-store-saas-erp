'use client';

import React, { useState } from 'react';
import RecruitmentBoard from '@/features/admin/hrm/components/RecruitmentBoard';
import ApplicantDetails from '@/features/admin/hrm/components/ApplicantDetails';

export default function RecruitmentPage() {
  const [isApplicantOpen, setIsApplicantOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  return (
    <>
      <RecruitmentBoard 
        onViewApplicant={(app) => {
          setSelectedApplicant(app);
          setIsApplicantOpen(true);
        }}
      />

      <ApplicantDetails 
        applicant={selectedApplicant}
        isOpen={isApplicantOpen}
        onClose={() => setIsApplicantOpen(false)}
      />
    </>
  );
}
