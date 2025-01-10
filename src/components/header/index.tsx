'use client';
import Image from 'next/image';
import Icon from "@/assets/icon/jtekt.png";
import IconAvatar from '@/assets/icon/profile.png'
import IconLogout from '@/assets/icon/logout.png'
import './style.scss'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MenuCategory, MenuItem } from './interface';
import { menuList } from './menuList';

const Header = () => {
    const router = useRouter();
    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    useEffect(() => {
        const localUser = localStorage.getItem('user') ?? ''
        if (localUser) {
            const jsonUser = JSON.parse(localUser);
            setName(jsonUser.fullname);
            setRole(jsonUser.role.name);
        }

    }, [])
    
    return (
        <div className="class-custom-bar">
            <div className="p-bar">
                <div
                    className="class-custom-bar-item class-custom-logo"
                    onClick={() => { router.push('/pages') }}
                >
                    <Image src={Icon} alt="Logo" />
                </div>
                {
                    menuList.map((x: MenuCategory, indexx: number) => {
                        if (!x.role || x.role?.filter((x) => localStorage.getItem('role')! == x).length) {
                            if (x.items?.length) {
                                return <div key={'subitem' + indexx} className="class-custom-dropdown-hover">
                                    <button className="class-custom-button">
                                        {x.icon ? <Image src={x.icon} alt="icon" className="class-custom-dropdown-icon" /> : <></>}
                                        <label>{x.label} <i className="pi pi-angle-down ml-2" style={{ fontSize: '10px' }}></i></label>
                                    </button>
                                    <div className="class-custom-dropdown-content class-custom-bar-block class-custom-card-4">
                                        {
                                            x.items.map((y: MenuItem, indexy: number) => {
                                                return <a key={'subitem' + indexy} className="class-custom-bar-item class-custom-button class-custom-menu" onClick={() => { 
                                                    if (y.url) {
                                                        y.script ? y.script(): () => {}
                                                        router.push(y.url)
                                                    }
                                                    
                                                }}>
                                                    {y.icon ? <Image src={y.icon} alt="icon" className="class-custom-dropdown-icon" /> : <></>}
                                                    {y.label}
                                                </a>
                                            })
                                        }
    
                                    </div>
    
                                </div>
                            } else {
                                return <a key={'subitem' + indexx} className="class-custom-bar-item class-custom-button" onClick={() => { 
                                    if (x.url) {
                                        x.script ? x.script(): () => {}
                                        router.push(x.url)
                                    }
                                 }}>
                                    {x.icon ? <Image src={x.icon} alt="icon" className="class-custom-dropdown-icon" /> : <></>}
                                    <label>{x.label}</label>
                                </a>
                            }
                        } else {
                            return <div key={'subitem' + indexx}></div>
                        }
                    })
                }
            </div>
            <div className="s-bar">
                <div className="class-custom-dropdown-hover">
                    <button className="class-custom-button class-custom-avatar">
                        <div className='mr-2 user'>
                            <div>{name}</div>
                            <div>({role})</div>
                        </div>
                        <Image src={IconAvatar} alt="Logo" />
                    </button>
                    <div className="class-custom-dropdown-content class-custom-bar-block class-custom-card-4">
                        <a className="class-custom-bar-item class-custom-button class-custom-menu" onClick={() => {
                            localStorage.clear();
                            router.push('/login')
                        }}>
                            <Image src={IconLogout} alt="icon" className="class-custom-dropdown-icon" />
                            Logout
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;