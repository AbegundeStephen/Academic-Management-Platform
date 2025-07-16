import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/axios'

export interface Course {
    id: string
    title: string
    description: string
    credits: number
    department: string
    lecturer: string
    lecturerId: string
    syllabus?: string
    enrollmentCount: number
    enrolledStudents?: number
    status?: string;
    semester?: string;
    maxEnrollment: number
    isEnrolled?: boolean
}

interface CoursesState {
    courses: Course[]
    enrolledCourses: Course[]
    loading: boolean
    error: string | null
}

const initialState: CoursesState = {
    courses: [],
    enrolledCourses: [],
    loading: false,
    error: null,
}

export const fetchCourses = createAsyncThunk(
    'courses/fetchCourses',
    async () => {
        const response = await api.get('/courses')
        return response.data
    }
)

export const fetchEnrolledCourses = createAsyncThunk(
    'courses/fetchEnrolledCourses',
    async () => {
        const response = await api.get('/courses/enrolled')
        return response.data
    }
)

export const enrollCourse = createAsyncThunk(
    'courses/enrollCourse',
    async (courseId: string) => {
        const response = await api.post(`/courses/${courseId}/enroll`)
        return response.data
    }
)

export const dropCourse = createAsyncThunk(
    'courses/dropCourse',
    async (courseId: string) => {
        const response = await api.post(`/courses/${courseId}/drop`)
        return response.data
    }
)


export const createCourse = createAsyncThunk(
    'courses/createCourse',
    async (courseData: Omit<Course, 'id' | 'enrollmentCount'>) => {
        const response = await api.post('/courses', courseData)
        return response.data
    }
)

const coursesSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourses.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.loading = false
                state.courses = action.payload
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Failed to fetch courses'
            })
            .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
                state.enrolledCourses = action.payload
            })
            .addCase(enrollCourse.fulfilled, (state, action) => {
                state.enrolledCourses.push(action.payload)
            })
            .addCase(dropCourse.fulfilled, (state, action) => {
                state.enrolledCourses = state.enrolledCourses.filter(
                    course => course.id !== action.payload.courseId
                )
            })
            .addCase(createCourse.fulfilled, (state, action) => {
                state.courses.push(action.payload)
            })
    },
})

export const { clearError } = coursesSlice.actions
export default coursesSlice.reducer