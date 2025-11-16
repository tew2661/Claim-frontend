import Swal from 'sweetalert2'
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

const ModalLogin = async (): Promise<boolean> => {
    const userString = localStorage.getItem('user')!;
    const userJson = JSON.parse(userString) ?? {};
    const { value: formValues } = await Swal.fire({
        title: ``,
        html: `
                <h1 class="text-center font-extrabold duration-300 text-slate-800 tracking-widest" style="text-shadow: rgb(182 182 182) 4px 1px; margin: 0px 0px;">
                        LOGIN
                    </h1>
                    <h4 class="text-center font-extrabold text-slate-800 tracking-widest pb-4 mt-0" style="text-shadow: rgb(182 182 182) 2px 0.5px; font-size: 20px">
                        Supplier Claim Management
                    </h4>
              <form id="swal-login-form" class="space-y-4 text-left">
                <div>
                  <label for="swal-username" class="font-bold block mb-2">Username</label>
                  <div class="relative">
                    <i class="pi pi-user absolute top-2.5 left-3 text-gray-500"></i>
                    <input id="swal-username" type="text" placeholder="Username" value="${userJson.code || ''}" disabled
                      class="w-full pl-10 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>
                <div>
                  <label for="swal-password" class="font-bold block mb-2">Password</label>
                  <div class="relative">
                    <i class="pi pi-key absolute top-2.5 left-3 text-gray-500"></i>
                    <input id="swal-password" type="password" placeholder="Password"
                      class="w-full pl-10 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>
              </form>
            `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'SIGN IN',
        cancelButtonText: 'CANCEL',
        customClass: {
            confirmButton: 'bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700',
            cancelButton: 'bg-gray-200 text-black px-6 py-2 rounded ml-2',
            popup: 'p-8 rounded-xl max-w-[500px]'
        },
        preConfirm: () => {
            const username = (document.getElementById('swal-username') as HTMLInputElement)?.value;
            const password = (document.getElementById('swal-password') as HTMLInputElement)?.value;

            if (!username || !password) {
                Swal.showValidationMessage('กรุณากรอก Username และ Password');
                return;
            }

            return { username, password };
        }
    });


    if (formValues) {
        const response = await fetch(`${domainURL}/auth/login${process.env.NEXT_MODE == 'jtekt' ? '' : '-supplier'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: userJson.code || '',
                password: formValues.password
            })
        });

        if (response.ok) {
            const result: any = await response.json();
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('role', result.user.role);
            return true;
        } else if (response.status === 400) {
            const { value: formValues } = await Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Password is incorrect!',
                showCancelButton: true,
                confirmButtonText: 'AGAIN',
                cancelButtonText: 'CANCEL',
            })
            if (formValues) {
                return await ModalLogin();
            } else {
                localStorage.clear();
                window.location.href = '/login';
                return false
            }
            
        } else {
            return false;
        }

    } else {
        // localStorage.clear();
        // window.location.href = '/login';
        return false;
    }
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
        HideSpinner();
        return await ModalLogin()
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
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const buildHeaders = (authToken: string) => ({
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
        'Authorization': `Bearer ${authToken ?? ''}`,
    });

    const buildRequestInit = (authToken: string): RequestInit => ({
        method: 'POST',
        headers: buildHeaders(authToken),
        body: body,
    });

    const response = await fetch(`${domainURL}${url}`, buildRequestInit(token));

    let result: Response = response;
    if (response.status === 401) {
        if (await RefreshToken()) {
            const newToken = localStorage.getItem('access_token')!;
            const retryResponse = await fetch(`${domainURL}${url}`, buildRequestInit(newToken));
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
    ShowSpinner();
    const response = await fetch(`${domainURL}${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    const result: any = await response.json();

    HideSpinner();
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
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const buildHeaders = (authToken: string) => ({
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
        'Authorization': `Bearer ${authToken ?? ''}`,
    });

    const buildRequestInit = (authToken: string): RequestInit => ({
        method: 'PUT',
        headers: buildHeaders(authToken),
        body,
    });

    const response = await fetch(`${domainURL}${url}`, buildRequestInit(token));

    let result: Response = response;
    if (response.status === 401) {
        if (await RefreshToken()) {
            const newToken = localStorage.getItem('access_token')!;
            const retryResponse = await fetch(`${domainURL}${url}`, buildRequestInit(newToken));
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