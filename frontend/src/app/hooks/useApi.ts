/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { api as axiosClient } from '@/lib/axios'
import { logout } from '../store/slices/authSlice'

export const useApi = () => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const apiCall = async (
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        data?: any,
        config?: any
    ) => {
        setLoading(true)
        setError(null)

        try {
            const response = await axiosClient({
                method,
                url: endpoint,
                data,
                ...config
            })

            setLoading(false)
            return response.data
        } catch (err: any) {
            setLoading(false)

            if (err.response?.status === 401) {
                dispatch(logout())
            }

            const errorMessage = err.response?.data?.message || 'An error occurred'
            setError(errorMessage)
            throw new Error(errorMessage)
        }
    }

    const get = (endpoint: string, config?: any) =>
        apiCall('GET', endpoint, undefined, config)

    const post = (endpoint: string, data?: any, config?: any) =>
        apiCall('POST', endpoint, data, config)

    const put = (endpoint: string, data?: any, config?: any) =>
        apiCall('PUT', endpoint, data, config)

    const del = (endpoint: string, config?: any) =>
        apiCall('DELETE', endpoint, undefined, config)

    return {
        loading,
        error,
        get,
        post,
        put,
        del
    }
}

export const useFileUpload = () => {
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const uploadFile = async (file: File, endpoint: string) => {
        setUploading(true)
        setError(null)
        setUploadProgress(0)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await axiosClient.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total!
                    )
                    setUploadProgress(progress)
                }
            })

            setUploading(false)
            setUploadProgress(100)
            return response.data
        } catch (err: any) {
            setUploading(false)
            setUploadProgress(0)
            const errorMessage = err.response?.data?.message || 'Upload failed'
            setError(errorMessage)
            throw new Error(errorMessage)
        }
    }

    return {
        uploading,
        uploadProgress,
        error,
        uploadFile
    }
}