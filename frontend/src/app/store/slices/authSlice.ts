import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '@/lib/axios'
import axios from 'axios'
export interface User {
    id: string
    email: string
    role: 'student' | 'lecturer' | 'admin'
    firstName: string
    lastName: string
}

interface AuthState {
    user: User | null
    token: string | null
    loading: boolean
    error: string | null
}

const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
}

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string; role: string }) => {
        const response = await api.post('/auth/login', credentials)
        const { user, token } = response.data
        localStorage.setItem('token', token)
        return { user, token }
    }
)

export const register = createAsyncThunk(
    'auth/register',
    async (userData: {
        email: string
        password: string
        firstName: string
        lastName: string
        role: string
        phone?: string
    }) => {
        const response = await axios.post('http://localhost:5000/auth/register', userData)
        console.log(response)
        return response.data
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        localStorage.removeItem('token')
        return null
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user
            state.token = action.payload.token
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.token = action.payload.token
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Login failed'
            })
            .addCase(register.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Registration failed'
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null
                state.token = null
            })
    },
})

export const { setCredentials, clearError } = authSlice.actions
export default authSlice.reducer