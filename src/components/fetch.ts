

// import axios from 'axios';
export interface ResponseData<T> {
    message : string ,
    result : T,
    success : boolean
    token?: boolean
    TotalRows?:number,
    statusCode: number
}

interface PropsGet {
    url : Request | string | URL ,
}
interface PropsPost {
    url : Request | string | URL ,
    headers?: HeadersInit,
    body : any 
}
const domainURL =  process.env.NEXT_PUBLIC_URL_API!;

const CheckEmtyToken = (token : String | null) => {
    if(!token) localStorage.removeItem('access_token');
    return !token ? true : false
}

const RefreshToken = async () => {
    const rtoken = localStorage.getItem('refresh_token')!;
    const body = { refresh_token : rtoken }
    const data = await fetch(domainURL + '/auth/refresh',{
        method: 'POST' ,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });
    if(data.status == 201){
        const res: any = await data.json();
        localStorage.setItem('access_token' , res.result.access_token)
        localStorage.setItem('refresh_token' , res.result.refresh_token)
        return true;
    } else {
        localStorage.clear();
        window.location.href = '/login'
        return false;
    }
}

const Get = async ({ url }:PropsGet): Promise<Response> => {
    const token = localStorage.getItem('access_token')!;
    if(CheckEmtyToken(token)) {
        window.location.href = '/login'
    }

    const data = await fetch(domainURL+url,{
        method: 'GET' ,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token ?? ''}`,
        },
    });
    let res: Response = data;
    if(data.status == 401) {
        if(await RefreshToken()) {
            const token = localStorage.getItem('access_token')!;
            const data = await fetch(domainURL+url,{
                method: 'GET' ,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token ?? ''}`,
                },
            });
            if(data.status == 401) {
                window.location.href = '/login';
            }
            res = data;
        }
    };

    return res ;
    
}

const Post = async ({ url , body , headers }:PropsPost): Promise<Response> => {
    const token = localStorage.getItem('access_token')!;
    if(CheckEmtyToken(token)) {
        window.location.href = '/login'
    }
    const data = await fetch(domainURL+url , {
        method: 'POST',
        headers: {
            ...headers,
            'Authorization': `Bearer ${token ?? ''}`,
        },
        body : body
    });
    let res: Response = data;
    if(data.status == 401) {
        if(await RefreshToken()) {
            const token = localStorage.getItem('access_token')!;
            const data = await fetch(domainURL+url,{
                method: 'POST' ,
                headers: {
                    ...headers,
                    'Authorization': `Bearer ${token ?? ''}`,
                },
                body : body
            });
            if(data.status == 401) {
                window.location.href = '/login';
            }
            res = data
        }
    };
    
    return res ;
    
}

const Login = async ({ url , body }:PropsPost): Promise<any> => {
    const data = await fetch(domainURL+url , {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body : JSON.stringify(body)
    });
    
    const res: any = await data.json();
    return res ;
    
}

const Put = async ({ url , body , headers }:PropsPost): Promise<Response> => {
    // const token:string = process.env.NEXT_PUBLIC_API_KEY ?? '';
    const token = localStorage.getItem('access_token')!;
    if(CheckEmtyToken(token)) {
        window.location.href = '/login'
    }

    const data = await fetch(domainURL+url , {
        method: 'PUT',
        headers: {
            ...headers,
            'Authorization': `Bearer ${token ?? ''}`,
        },
        body : body
    });
    let res: Response = data;
    if(data.status == 401) {
        if(await RefreshToken()) {
            const token = localStorage.getItem('access_token')!;
            const data = await fetch(domainURL+url,{
                method: 'PUT' ,
                headers: {
                    ...headers,
                    'Authorization': `Bearer ${token ?? ''}`,
                },
                body : body
            });
            if(data.status == 401) {
                window.location.href = '/login';
            }
            res = data
        }
    };
    return res ;
    
}

const Delete = async ({ url , body , headers }:PropsPost): Promise<Response> => {
    // const token:string = process.env.NEXT_PUBLIC_API_KEY ?? '';
    const token = localStorage.getItem('access_token')!;
    if(CheckEmtyToken(token)) {
        window.location.href = '/login'
    }

    const data = await fetch(domainURL+url , {
        method: 'DELETE',
        headers: {
            ...headers,
            'Authorization': `Bearer ${token ?? ''}`,
        },
        body : body
    });
    let res: Response = data;
    if(data.status == 401) {
        if(await RefreshToken()) {
            const token = localStorage.getItem('access_token')!;
            const data = await fetch(domainURL+url,{
                method: 'DELETE' ,
                headers: {
                    ...headers,
                    'Authorization': `Bearer ${token ?? ''}`,
                },
                body : body
            });
            if(data.status == 401) {
                window.location.href = '/login';
            }
            res = data
        }
    };
    return res ;
    
}

async function fetchFileAsFile(fileUrl: string): Promise<Response> {
    const domainURL = process.env.NEXT_PUBLIC_URL_API!;
    const token = localStorage.getItem('access_token')!;
    const response = await fetch(domainURL + fileUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': `Bearer ${token ?? ''}`,
        },
    });
    let res: Response = response;
    if(res.status == 401) {
        if(await RefreshToken()) {
            const token = localStorage.getItem('access_token')!;
            const data = await fetch(domainURL+ fileUrl,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Authorization': `Bearer ${token ?? ''}`,
                },
            });
            if(data.status == 401) {
                window.location.href = '/login';
            }
            res = data
        }
    };
    return res;
    const blob = await res.blob();
    // return blob;
}

export {
    Get , Post , Put , Delete , Login , CheckEmtyToken ,fetchFileAsFile
};