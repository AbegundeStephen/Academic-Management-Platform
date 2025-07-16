import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import coursesReducer from './slices/courseSlice'
import assignmentsReducer from './slices/assignmentSlice'
import notificationsReducer from './slices/notificationSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        courses: coursesReducer,
        assignments: assignmentsReducer,
        notifications: notificationsReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch