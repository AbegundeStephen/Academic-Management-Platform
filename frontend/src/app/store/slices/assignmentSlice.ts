import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/axios'

export interface Assignment {
    id: string
    title: string
    description: string
    courseId: string
    courseName: string
    dueDate: string
    maxGrade: number
    submission?: {
        id: string
        content: string
        files: string[]
        grade?: number
        feedback?: string
        submittedAt: string
    }
}

interface AssignmentsState {
    assignments: Assignment[]
    loading: boolean
    error: string | null
    uploadProgress: number
}

const initialState: AssignmentsState = {
    assignments: [],
    loading: false,
    error: null,
    uploadProgress: 0,
}

export const fetchAssignments = createAsyncThunk(
    'assignments/fetchAssignments',
    async () => {
        const response = await api.get('/assignments')
        return response.data
    }
)

export const submitAssignment = createAsyncThunk(
    'assignments/submitAssignment',
    async ({ assignmentId, formData }: { assignmentId: string; formData: FormData }) => {
        const response = await api.post(`/assignments/${assignmentId}/submit`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    }
)

export const gradeAssignment = createAsyncThunk(
    'assignments/gradeAssignment',
    async ({
        assignmentId,
        submissionId,
        grade,
        feedback
    }: {
        assignmentId: string
        submissionId: string
        grade: number
        feedback: string
    }) => {
        const response = await api.post(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
            grade,
            feedback
        })
        return response.data
    }
)

const assignmentsSlice = createSlice({
    name: 'assignments',
    initialState,
    reducers: {
        setUploadProgress: (state, action) => {
            state.uploadProgress = action.payload
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAssignments.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchAssignments.fulfilled, (state, action) => {
                state.loading = false
                state.assignments = action.payload
            })
            .addCase(fetchAssignments.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Failed to fetch assignments'
            })
            .addCase(submitAssignment.fulfilled, (state, action) => {
                const index = state.assignments.findIndex(a => a.id === action.payload.assignmentId)
                if (index !== -1) {
                    state.assignments[index].submission = action.payload.submission
                }
            })
            .addCase(gradeAssignment.fulfilled, (state, action) => {
                const assignment = state.assignments.find(a => a.id === action.payload.assignmentId)
                if (assignment?.submission) {
                    assignment.submission.grade = action.payload.grade
                    assignment.submission.feedback = action.payload.feedback
                }
            })
    },
})

export const { setUploadProgress, clearError } = assignmentsSlice.actions
export default assignmentsSlice.reducer