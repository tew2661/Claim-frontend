
"use client"
import React, { useEffect, useRef, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { Login } from '@/components/fetch';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Controller, useForm } from 'react-hook-form';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { DeleteAllCookie, GetCookie, SetCookie } from '@/components/set-cookie';

interface LOGIN {
    username : string ,
    password : string
}

export default function PresetsDemo() {
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const [loadding , setloadding] = useState<boolean>(false)

    const defaultValues : LOGIN = {
        username: '' , 
        password: ''
    };

    const {
        control,
        formState: { errors },
        handleSubmit,
        reset
    } = useForm({ defaultValues });

    const getFormErrorMessage = (name : keyof LOGIN) => {
        const error:any = errors;
        return error[name] ? <small className="p-error">{error[name].message}</small> : <small className="p-error">&nbsp;</small>;
    };

    const onSubmit = async (data :LOGIN) => {
        setloadding(true);
        Login({ url : `/auth/login${process.env.NEXT_MODE == 'jtekt' ? '' : '-supplier'}` , body : { username : data.username , password : data.password }})
        .catch((err)=>{
            setloadding(false);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((err).message)}` , life: 3000 });
        })
        .then( async (res)=> {
            setloadding(false);
            if(res.statusCode == 200) {
                localStorage.setItem('access_token' , res.access_token);
                localStorage.setItem('refresh_token' , res.refresh_token);
                localStorage.setItem('user', JSON.stringify(res.user));
                localStorage.setItem('role', res.user.role);
                router.push('/pages')
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((res).message)}` , life: 3000 });
            }
        });
    };

    return (
        <div className="container mx-auto px-4 items-center justify-center h-[100vh] flex flex-row">
            <Toast ref={toast} />
            <div className="card flex max-lg:flex-col min-lg:flex-row w-[550px] min-lg:h-[35vw] border rounded-lg drop-shadow-xl">
                <div className='w-full max-lg:w-full flex flex-col border border-solid border-slate-200 py-5 px-[2.2rem] bg-[#ffffff]  shadow-md rounded'>
                    <h1 
                        className='text-center font-extrabold text-[35px] md:text-[45px] lg:text-[50px] duration-300 text-slate-800 tracking-widest leading-[4rem]'
                        style={{
                            textShadow: 'rgb(182 182 182) 4px 1px',
                            margin: '20px 0px'
                        }}
                    >LOGIN</h1>
                    <h4 
                        className='text-center font-extrabold text-slate-800 tracking-widest pb-4 mt-0 text-[20px]'
                        style={{
                            textShadow: 'rgb(182 182 182) 2px 0.5px'
                        }}
                    >Supplier Claim Management</h4>
                    <form onSubmit={handleSubmit(onSubmit)} className=" align-items-center gap-2">
                        <div className='flex-1'>
                            <label htmlFor="username" className="font-bold block mb-2" >
                                Username
                            </label>
                            <Controller
                                name="username"
                                control={control}
                                // rules={{ required: 'กรุณาระบุ username' }}
                                render={({ field, fieldState }) => (
                                    <IconField iconPosition="left">
                                        <InputIcon className="pi pi-user"> </InputIcon>
                                        <InputText
                                            id={field.name}
                                            type="text"
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            className={"w-full " + classNames({ 'border-red-400': fieldState.error })}
                                            style={{ paddingLeft: '40px' }}
                                        />
                                    </IconField>
                                )}
                            />
                            {getFormErrorMessage('username')}
                        </div>
                        <div className='flex-1'>
                            <label htmlFor="username" className="font-bold block mb-2" >
                                Password
                            </label>
                            <Controller
                                name="password"
                                control={control}
                                // rules={{ required: 'กรุณาระบุ password' }}
                                render={({ field, fieldState }) => (
                                    <IconField iconPosition="left">
                                        <InputIcon className="pi pi-key"> </InputIcon>
                                        <InputText
                                            id={field.name}
                                            type="password"
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            className={"w-full " + classNames({ 'border-red-400': fieldState.error })}
                                            style={{ paddingLeft: '40px' }}
                                        />
                                    </IconField>
                                    
                                )}
                            />
                            {getFormErrorMessage('password')}
                        </div>
                        <div className="text-center mt-2">  
                            {
                                loadding ? <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" /> :
                                <Button label="SIGN IN" className='w-full px-5' severity="secondary" />
                            }
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
