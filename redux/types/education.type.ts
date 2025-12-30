// education.type.ts
export interface Education {
  id: number;
  userId: number;
  startYear: number;
  endYear: number;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  grade?: string;
  gradeScale?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEducationRequest {
  startYear: number;
  endYear?: number;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  grade?: string;
  gradeScale?: string;
  description?: string;
}

export interface UpdateEducationRequest {
  startYear?: number;
  endYear?: number;
  degree?: string;
  fieldOfStudy?: string;
  institution?: string;
  grade?: string;
  gradeScale?: string;
  description?: string;
}

export interface EducationStats {
  total: number;
  byDegree: Record<string, number>;
  byInstitution: Record<string, number>;
}
