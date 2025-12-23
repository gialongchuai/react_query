import http from 'pages/utils/http'
import { ListStudent, Student } from 'types/type.student'

export const getStudents = (page: number | string, limit: number | string) => {
  const res = http.get<ListStudent>('students', {
    params: {
      _page: page,
      _limit: limit
    }
  })
  return res
}

export const addStudent = (student: Omit<Student, 'id'>) => {
  return http.post<Student>('students', student)
}

// lúc gửi đi không có id
// sau khi add success thì trả về Student có id

export const getStudent = (id: string) => {
  return http.get<Student>(`students/${id}`)
}

export const deleteStudent = (id: string | number) => {
  return http.delete<{}>(`students/${id}`)
}

export const updateStudent = (id: string, student: Student) => {
  return http.put<Student>(`students/${id}`, student)
}
