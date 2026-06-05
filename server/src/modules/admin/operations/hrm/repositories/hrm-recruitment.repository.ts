import { ApplicantStatus } from '@/common/enums/hrm/hrm-enums'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'
import {
  ApplicantEntity,
  InterviewEntity,
  JobPostingEntity,
} from '../entities/recruitment.entity'

@Injectable()
export class HrmRecruitmentRepository {
  constructor(
    @InjectRepository(JobPostingEntity)
    public readonly jobPostingRepo: Repository<JobPostingEntity>,
    @InjectRepository(ApplicantEntity)
    public readonly applicantRepo: Repository<ApplicantEntity>,
    @InjectRepository(InterviewEntity)
    private readonly interviewRepo: Repository<InterviewEntity>,
  ) {}

  async createJobPosting(data: Partial<JobPostingEntity>): Promise<JobPostingEntity> {
    return this.jobPostingRepo.save(this.jobPostingRepo.create(data))
  }

  async findAllJobPostings(tenantId: string): Promise<JobPostingEntity[]> {
    return this.jobPostingRepo.find({
      where: { tenantId },
      relations: {
        department: true,
      },
    })
  }

  async createApplicant(data: Partial<ApplicantEntity>): Promise<ApplicantEntity> {
    return this.applicantRepo.save(this.applicantRepo.create(data))
  }

  async findAllApplicants(tenantId: string): Promise<ApplicantEntity[]> {
    return this.applicantRepo.find({
      where: { tenantId },
      relations: {
        jobPosting: true,
        interviews: true,
      },
      order: { createdAt: 'DESC' },
    })
  }

  async findApplicantById(id: string, tenantId: string): Promise<ApplicantEntity | null> {
    return this.applicantRepo.findOne({
      where: { id, tenantId },
      relations: {
        jobPosting: true,
      },
    })
  }

  async updateApplicantStatus(id: string, status: ApplicantStatus): Promise<void> {
    await this.applicantRepo.update(id, { status })
  }

  async scheduleInterview(data: Partial<InterviewEntity>): Promise<InterviewEntity> {
    return this.interviewRepo.save(this.interviewRepo.create(data))
  }

  async findInterviewsByApplicant(
    applicantId: string,
    tenantId: string,
  ): Promise<InterviewEntity[]> {
    return this.interviewRepo.find({
      where: { applicantId, tenantId },
      relations: {
        interviewer: {
          user: true,
        },
      },
      order: { createdAt: 'DESC' },
    })
  }

  async countJobPostings(where: FindOptionsWhere<JobPostingEntity>): Promise<number> {
    return this.jobPostingRepo.count({ where })
  }

  async countApplicants(where: FindOptionsWhere<ApplicantEntity>): Promise<number> {
    return this.applicantRepo.count({ where })
  }
}
