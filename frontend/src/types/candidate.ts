export interface Education {
  id?: number
  courseName: string
  institution: string
  concludedAt: string
}

export interface Skill {
  id: number
  name: string
}

export interface User {
  id: number
  name: string
  birth_date: string
  email: string
  phone: string
  cep: string
  interview_time?: string
  address: string
  role: 'candidate' | 'manager'
  city: string
  state: string
  educations: Array<{
    id: number
    course_name: string
    institution: string
    concluded_at: string
  }>
  skills: Skill[]
  selected_for_interview?: boolean
  interview_date?: string
}

export interface SkillOption {
  id: number
  name: string
}
