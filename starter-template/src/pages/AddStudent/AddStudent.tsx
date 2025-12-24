import { dataTagErrorSymbol, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addStudent, getStudent, updateStudent } from 'apis/student.api'
import http from 'pages/utils/http'
import { isAxiosError } from 'pages/utils/utils'
import { useEffect, useMemo, useState } from 'react'
import { useMatch, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Student } from 'types/type.student'

type FormStateType = Omit<Student, 'id'> | Student
const initialFormState: FormStateType = {
  avatar: '',
  btc_address: '',
  country: '',
  email: '',
  first_name: '',
  gender: 'Other',
  last_name: ''
}

type FormError =
  | {
      [key in keyof FormStateType]: string
    }
  | null

export default function AddStudent() {
  const addMatch = useMatch('/students/add')
  const [formState, setFormState] = useState<FormStateType>(initialFormState)

  /* giải thích luồng lỗi
  khi bấm và nút sumit form gửi api tới json server có cofig email
  gửi lỗi nhờ ông useMutation có error nên catch được lỗi
  dùng useMemo tính toán lỗi cho errorForm, sau đó nếu errorForm
  thì hiển thị thẻ p span

  Khi handleChange thì clear error data nhờ reset để error data về
  ban đầu không p span nữa

  Reset form khi thành công có thể thêm onSucces với mutate hoặc dùng ông mutateAysnc asycn try cat
  */

  // mutate xử lý bất đồng bộ nhưng không return 1 promise, có gì dùng mutate asyc để await try catahc nhoa
  const addStudentMutation = useMutation({
    mutationFn: (body: FormStateType) => {
      // call api
      return addStudent(body)
    }
  })
  // phải mang 2 ông add và update lên trên để không lỗi ạ above above
  //Xử lý khi update thì cái Data Explorer trong icon tanstack cập nhật lại khi cập nhật thành công // reset lại cho đúng
  const queryClient = useQueryClient();
  const updateStudentMutation = useMutation({
    mutationFn: (formState: Student) => updateStudent(id as string, formState),
    onSuccess: (data) => {
      queryClient.setQueryData(['student', id], data)
    }
  })
  const errorForm: FormError = useMemo(() => {
    const error = addMatch ? addStudentMutation.error : updateStudentMutation.error

    if (isAxiosError<{ error: FormError }>(error) && error.response?.status === 422) {
      return error.response.data.error
    }
    return null
  }, [addStudentMutation.error, addMatch, updateStudentMutation.error])

  // Dùng currying
  const handleChange = (name: keyof FormStateType) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((pre) => ({
      ...pre,
      [name]: event.target.value
    }))
    if (addStudentMutation.data || addStudentMutation.error) {
      addStudentMutation.reset()
    }
  }

  const { id } = useParams()
  const studentQuery = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id as string),
    enabled: id !== undefined // id khác unde thì qFc mới được gọi
  })

  useEffect(() => {
    if (studentQuery.data && studentQuery.isSuccess) {
      console.log(studentQuery.data.data)
      setFormState(studentQuery.data.data)
    }
  }, [studentQuery.data, studentQuery.isSuccess])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (addMatch) {
      addStudentMutation.mutate(formState, {
        // Cách 01: reset form
        onSuccess: () => {
          setFormState(initialFormState)
          toast.success('Thêm học sinh thành công!')
        }
      })
    } else {
      updateStudentMutation.mutate(formState as Student, {
        onSuccess: (_) => {
          setFormState(initialFormState)
          toast.success('Sửa học sinh thành công!')
        }
      })
    }
  }

  return (
    <div>
      <h1 className='text-lg'>{addMatch ? 'Add Student' : 'Edit Student'}</h1>
      <form className='mt-6' onSubmit={handleSubmit}>
        <div className='group relative z-0 mb-6 w-full'>
          <input
            type='email'
            name='floating_email'
            id='floating_email'
            className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500'
            placeholder=' '
            value={formState.email}
            onChange={handleChange('email')}
            required
          />
          <label
            htmlFor='floating_email'
            className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
          >
            Email address
          </label>

          {errorForm ? (
            <p className='text-red-500'>
              <span className='font-medium'>Lỗi rồi: {errorForm.email}</span>
            </p>
          ) : (
            ''
          )}
        </div>

        <div className='group relative z-0 mb-6 w-full'>
          <div>
            <div>
              <div className='mb-4 flex items-center'>
                <input
                  id='gender-1'
                  type='radio'
                  name='gender'
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                  value='male'
                  checked={formState.gender === 'Male'}
                  onChange={handleChange('gender')}
                />
                <label htmlFor='gender-1' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  Male
                </label>
              </div>
              <div className='mb-4 flex items-center'>
                <input
                  id='gender-2'
                  type='radio'
                  name='gender'
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                  value='female'
                  checked={formState.gender === 'Female'}
                  onChange={handleChange('gender')}
                />
                <label htmlFor='gender-2' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  Female
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  id='gender-3'
                  type='radio'
                  name='gender'
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                  value='other'
                  checked={formState.gender === 'Other'}
                  onChange={handleChange('gender')}
                />
                <label htmlFor='gender-3' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  Other
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className='group relative z-0 mb-6 w-full'>
          <input
            type='text'
            name='country'
            id='country'
            className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500'
            placeholder=' '
            required
            value={formState.country}
            onChange={handleChange('country')}
          />
          <label
            htmlFor='country'
            className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
          >
            Country
          </label>
        </div>
        <div className='grid md:grid-cols-2 md:gap-6'>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='tel'
              name='first_name'
              id='first_name'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500'
              placeholder=' '
              value={formState.first_name}
              onChange={handleChange('first_name')}
            />
            <label
              htmlFor='first_name'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              First Name
            </label>
          </div>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='last_name'
              id='last_name'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500'
              placeholder=' '
              required
              value={formState.last_name}
              onChange={handleChange('last_name')}
            />
            <label
              htmlFor='last_name'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              Last Name
            </label>
          </div>
        </div>
        <div className='grid md:grid-cols-2 md:gap-6'>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='avatar'
              id='avatar'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500'
              placeholder=' '
              required
              value={formState.avatar}
              onChange={handleChange('avatar')}
            />
            <label
              htmlFor='avatar'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              Avatar Base64
            </label>
          </div>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='btc_address'
              id='btc_address'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500'
              placeholder=' '
              required
              value={formState.btc_address}
              onChange={handleChange('btc_address')}
            />
            <label
              htmlFor='btc_address'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              BTC Address
            </label>
          </div>
        </div>

        <button
          type='submit'
          className='w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto'
        >
          {addMatch ? 'Add' : 'Update'}
        </button>
      </form>
    </div>
  )
}
