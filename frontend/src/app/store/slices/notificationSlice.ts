import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Notification {
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timestamp: Date
}

interface NotificationsState {
    notifications: Notification[]
}

const initialState: NotificationsState = {
    notifications: [],
}

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
            state.notifications.push({
                ...action.payload,
                id: Date.now().toString(),
                timestamp: new Date(),
            })
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload)
        },
        clearNotifications: (state) => {
            state.notifications = []
        },
    },
})

export const { addNotification, removeNotification, clearNotifications } = notificationsSlice.actions
export default notificationsSlice.reducer