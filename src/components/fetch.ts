// import axios from 'axios';

/**
 * Interface for response data
 */
export interface ResponseData<T> {
    message: string,
    result: T,
    success: boolean,
    token?: boolean,
    TotalRows?: number,
    statusCode: number
}

/**
 * Interface for GET request properties
 */
interface PropsGet {
    url: Request | string | URL,
}

/**
 * Interface for POST request properties
 */
interface PropsPost {
    url: Request | string | URL,
    headers?: HeadersInit,
    body: any
}

/**
 * Base URL for API requests
 */
const domainURL = process.env.NEXT_PUBLIC_URL_API!;

/**
 * Checks if the token is empty and removes it from local storage if so
 * @param token Token to check
 * @returns True if token is empty, false otherwise
 */
const IsTokenEmpty = (token: string | null): boolean => {
    if (!token) localStorage.removeItem('access_token');
    return !token;
}

/**
 * Refreshes the token and updates local storage
 * @returns True if token was refreshed successfully, false otherwise
 */
const RefreshToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refresh_token')!;
    const body = { refresh_token: refreshToken };
    const response = await fetch(`${domainURL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    if (response.ok) {
        const result: any = await response.json();
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
        return true;
    } else {
        localStorage.clear();
        window.location.href = '/login';
        return false;
    }
}

/**
 * Makes a GET request to the API
 * @param props Properties for the request
 * @returns Response from the API
 */
const Get = async ({ url }: PropsGet): Promise<Response> => {
    ShowSpinner();
    const token = localStorage.getItem('access_token')!;
    if (IsTokenEmpty(token)) {
        window.location.href = '/login';
    }

    const response = await fetch(`${domainURL}${url}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token ?? ''}`,
        },
    });

    let result: Response = response;
    if (response.status === 401) {
        if (await RefreshToken()) {
            const newToken = localStorage.getItem('access_token')!;
            const retryResponse = await fetch(`${domainURL}${url}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${newToken ?? ''}`,
                },
            });
            if (retryResponse.status === 401) {
                window.location.href = '/login';
            }
            result = retryResponse;
        }
    }
    HideSpinner();
    return result;
}

/**
 * Makes a POST request to the API
 * @param props Properties for the request
 * @returns Response from the API
 */
const Post = async ({ url, body, headers }: PropsPost): Promise<Response> => {
    ShowSpinner();
    const token = localStorage.getItem('access_token')!;
    if (IsTokenEmpty(token)) {
        window.location.href = '/login';
    }
    const response = await fetch(`${domainURL}${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
            'Authorization': `Bearer ${token ?? ''}`,
        },
        body: body
    });

    let result: Response = response;
    if (response.status === 401) {
        if (await RefreshToken()) {
            const newToken = localStorage.getItem('access_token')!;
            const retryResponse = await fetch(`${domainURL}${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                    'Authorization': `Bearer ${newToken ?? ''}`,
                },
                body: body
            });
            if (retryResponse.status === 401) {
                window.location.href = '/login';
            }
            result = retryResponse;
        }
    }
    HideSpinner();
    return result;
}

/**
 * Makes a login request to the API
 * @param props Properties for the request
 * @returns Response from the API
 */
const Login = async ({ url, body }: PropsPost): Promise<any> => {
    const response = await fetch(`${domainURL}${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    const result: any = await response.json();
    return result;
}

/**
 * Makes a PUT request to the API
 * @param props Properties for the request
 * @returns Response from the API
 */
const Put = async ({ url, body, headers }: PropsPost): Promise<Response> => {
    ShowSpinner();
    const token = localStorage.getItem('access_token')!;
    if (IsTokenEmpty(token)) {
        window.location.href = '/login';
    }

    const response = await fetch(`${domainURL}${url}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
            'Authorization': `Bearer ${token ?? ''}`,
        },
        body: body
    });

    let result: Response = response;
    if (response.status === 401) {
        if (await RefreshToken()) {
            const newToken = localStorage.getItem('access_token')!;
            const retryResponse = await fetch(`${domainURL}${url}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                    'Authorization': `Bearer ${newToken ?? ''}`,
                },
                body: body
            });
            if (retryResponse.status === 401) {
                window.location.href = '/login';
            }
            result = retryResponse;
        }
    }
    HideSpinner();
    return result;
}

/**
 * Makes a PATCH request to the API
 * @param props Properties for the request
 * @returns Response from the API
 */
const Patch = async ({ url, body, headers }: PropsPost): Promise<Response> => {
    ShowSpinner();
    const token = localStorage.getItem('access_token')!;
    if (IsTokenEmpty(token)) {
        window.location.href = '/login';
    }

    const response = await fetch(`${domainURL}${url}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
            'Authorization': `Bearer ${token ?? ''}`,
        },
        body: body
    });

    let result: Response = response;
    if (response.status === 401) {
        if (await RefreshToken()) {
            const newToken = localStorage.getItem('access_token')!;
            const retryResponse = await fetch(`${domainURL}${url}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                    'Authorization': `Bearer ${newToken ?? ''}`,
                },
                body: body
            });
            if (retryResponse.status === 401) {
                window.location.href = '/login';
            }
            result = retryResponse;
        }
    }
    HideSpinner();
    return result;
}

/**
 * Makes a DELETE request to the API
 * @param props Properties for the request
 * @returns Response from the API
 */
const DeleteRequest = async ({ url, body, headers }: PropsPost): Promise<Response> => {
    ShowSpinner();
    const token = localStorage.getItem('access_token')!;
    if (IsTokenEmpty(token)) {
        window.location.href = '/login';
    }

    const response = await fetch(`${domainURL}${url}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
            'Authorization': `Bearer ${token ?? ''}`,
        },
        body: body
    });

    let result: Response = response;
    if (response.status === 401) {
        if (await RefreshToken()) {
            const newToken = localStorage.getItem('access_token')!;
            const retryResponse = await fetch(`${domainURL}${url}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                    'Authorization': `Bearer ${newToken ?? ''}`,
                },
                body: body
            });
            if (retryResponse.status === 401) {
                window.location.href = '/login';
            }
            result = retryResponse;
        }
    }
    HideSpinner();
    return result;
}

/**
 * Fetches a file as a file object
 * @param fileUrl URL of the file to fetch
 * @returns Response from the API
 */
async function FetchFileAsFile(fileUrl: string): Promise<Response> {
    ShowSpinner();
    const token = localStorage.getItem('access_token')!;
    const response = await fetch(domainURL + fileUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': `Bearer ${token ?? ''}`,
        },
    });
    let result: Response = response;
    if (response.status === 401) {
        if (await RefreshToken()) {
            const newToken = localStorage.getItem('access_token')!;
            const retryResponse = await fetch(`${domainURL}${fileUrl}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Authorization': `Bearer ${newToken ?? ''}`,
                },
            });
            if (retryResponse.status === 401) {
                window.location.href = '/login';
            }
            result = retryResponse;
        }
    }
    HideSpinner();
    return result;
}

/**
 * Creates a query string from a filter object
 * @param filter Object containing query parameters
 * @returns Query string
 */
const CreateQueryString = (filter: any): string => {
    const query = new URLSearchParams();

    // Loop through the filter object
    for (const [key, value] of Object.entries(filter)) {
        if (value !== 'ALL' && `${value}`.toLocaleLowerCase() !== 'all' && value) { // Exclude parameters with the value 'ALL'
            query.append(key, String(value)); // Cast value to string
        }
    }

    return query.toString();
};

/**
 * Shows the loading spinner
 */
const ShowSpinner = async () => {
    const $ = (await import('jquery')).default;
    $(document).ready(function () {
        $('#loadingSpinner').css('display', 'block');
    });
}

/**
 * Hides the loading spinner
 */
const HideSpinner = async () => {
    const $ = (await import('jquery')).default;
    $(document).ready(function () {
        $('#loadingSpinner').css('display', 'none');
    });
}

export {
    Get, Post, Put, Patch, DeleteRequest as Delete, Login, IsTokenEmpty, FetchFileAsFile, CreateQueryString
};