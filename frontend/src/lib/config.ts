// File: frontend/src/lib/config.ts
interface AppConfig {
    apiBaseUrl: string;
    authTokenKey: string;
    defaultPageSize: number;
    fileUploadMaxSize: number;
}

const config: AppConfig = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    authTokenKey: 'academic-platform-token',
    defaultPageSize: 10,
    fileUploadMaxSize: 5 * 1024 * 1024, // 5MB
};

export default config;