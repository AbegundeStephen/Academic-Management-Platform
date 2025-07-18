import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '@/lib/axios'
import { RootState } from '../store'

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
        const { user, accessToken } = response.data;
        localStorage.setItem('token', accessToken)
        return { user, accessToken };
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
        const response = await api.post('/auth/register', userData)
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
/**
 * Updates the authentication state with the provided user and token.
 *
 * @param state - The current authentication state.
 * @param action - The action containing the user and token payload.
 */

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
                state.token = action.payload.accessToken
                console.log(state.user)
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
export const selectCurrentUser = (state: RootState) => state.auth;
export const selectUserRole = (state: RootState) => state.auth.user?.role;
export const selectAccessToken = (state: RootState) => state.auth.token;
export default authSlice.reducer