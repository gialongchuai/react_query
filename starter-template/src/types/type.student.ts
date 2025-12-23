export interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
  gender: string
  country: string
  btc_address: string
  avatar: string
}
// đó là field cần nhưng ta chỉ cần bên dưới

export type ListStudent = Pick<Student, 'id' | 'email' | 'avatar' | 'last_name'>[]

// getStudents trả về ds students với các field đó