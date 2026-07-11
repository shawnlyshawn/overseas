// 공통 API 응답
export interface ApiResponse<T> {
    result: 'success' | 'failed';
    data: T;
    message?: string;
}

export interface PaginatedApiResponse<T> {
    result: 'success' | 'failed';
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
    message?: string;
}