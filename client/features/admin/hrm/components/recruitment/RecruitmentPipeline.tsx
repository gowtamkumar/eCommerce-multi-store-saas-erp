'use client';

import { motion } from 'framer-motion';
import { Calendar, MoreVertical, Users } from 'lucide-react';
import { Applicant, ApplicantStatus } from '../../hooks/useRecruitmentManager';
import { getPipelineDotClassName } from './recruitmentUi';

interface RecruitmentPipelineProps {
  applicants: Applicant[];
  onStatusChange: (id: string, status: ApplicantStatus) => void;
  onScheduleInterview: (id: string) => void;
}

export default function RecruitmentPipeline({
  applicants,
  onStatusChange,
  onScheduleInterview,
}: RecruitmentPipelineProps) {
  return (
    <div className="flex flex-wrap gap-4 overflow-x-auto pb-8 min-h-150 scrollbar-hide">
      {Object.values(ApplicantStatus).map((status) => {
        const stageApplicants = applicants.filter((applicant) => applicant.status === status);
        return (
          <div key={status} className="shrink-0 w-full sm:w-80 group/col">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getPipelineDotClassName(status)}`} />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 italic">
                  {status}
                </h3>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {stageApplicants.length}
                </span>
              </div>
              <button className="opacity-0 group-hover/col:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-slate-400">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 min-h-125 p-2 bg-slate-50/50 dark:bg-slate-900/20 rounded-4xl border-2 border-dashed border-slate-100 dark:border-slate-800/50">
              {stageApplicants.map((applicant) => (
                <PipelineApplicantCard
                  key={applicant.id}
                  applicant={applicant}
                  onStatusChange={onStatusChange}
                  onScheduleInterview={onScheduleInterview}
                />
              ))}
              {stageApplicants.length === 0 && (
                <div className="py-12 text-center opacity-20 flex flex-col items-center">
                  <Users className="w-8 h-8 mb-2" />
                  <p className="text-[9px] font-black uppercase tracking-widest italic">Empty Stage</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface PipelineApplicantCardProps {
  applicant: Applicant;
  onStatusChange: (id: string, status: ApplicantStatus) => void;
  onScheduleInterview: (id: string) => void;
}

function PipelineApplicantCard({
  applicant,
  onStatusChange,
  onScheduleInterview,
}: PipelineApplicantCardProps) {
  return (
    <motion.div
      layoutId={applicant.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:scale-[1.02] transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xs font-black text-slate-400 italic border border-slate-100 dark:border-slate-700">
          {applicant.firstName.charAt(0)}{applicant.lastName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
            {`${applicant.firstName} ${applicant.lastName}`}
          </p>
          <p className="text-[10px] font-bold text-indigo-500 mt-1 italic uppercase tracking-tighter truncate w-40">
            {applicant.jobPosting?.title}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800" />
          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-indigo-600">
            +
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={applicant.status}
            onChange={(e) => onStatusChange(applicant.id, e.target.value as ApplicantStatus)}
            className="text-[10px] font-black uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {Object.values(ApplicantStatus).map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <button
            onClick={() => onScheduleInterview(applicant.id)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
