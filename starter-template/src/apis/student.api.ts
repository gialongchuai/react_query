import http from 'pages/utils/http'
import { ListStudent } from 'types/type.student'

export const getStudents = (page: number | string, limit: number | string) => {
  const res = http.get<ListStudent>('students', {
    params: {
      _page: page,
      _limit: limit
    }
  })
  return res;
}
