import type { JobFormData, RecruitmentDepartment } from "../hooks/useRecruitmentManager";

export function buildRecruitmentJobSummary(
  form: JobFormData,
  departments: RecruitmentDepartment[],
): string {
  const departmentName =
    departments.find((department) => department.id === form.departmentId)?.name || "Unspecified";

  return [
    "Context: job posting draft",
    form.title.trim() ? `Position title: ${form.title.trim()}` : "Position title: unspecified",
    `Department: ${departmentName}`,
    form.location ? `Work setup: ${form.location}` : null,
    form.salaryRange.trim() ? `Salary range: ${form.salaryRange.trim()}` : null,
    form.description.trim() ? `Existing description notes: ${form.description.trim()}` : null,
    form.requirements.trim()
      ? `Existing requirement hints:\n${form.requirements.trim()}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildRecruitmentJobCopyPayload(
  jobSummary: string,
  existingDraft?: string,
  tone?: string,
) {
  return {
    jobSummary,
    existingDraft: existingDraft?.trim() || undefined,
    tone: tone?.trim() || undefined,
  };
}
