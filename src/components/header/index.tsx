'use client';
import Image from 'next/image';
import Icon from "@/assets/icon/jtekt.png";
import IconAvatar from '@/assets/icon/profile.png'
import IconLogout from '@/assets/icon/logout.png'
import './style.scss'
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MenuCategory, MenuItem } from './interface';
import { getSocket } from '../socket/socket';
import { Socket } from 'socket.io-client';
import IconDot from '@/assets/icon/dot.png'

const Header = (props: { IsJtekt: boolean }) => {
    const IsJtekt = props.IsJtekt;
    const [menuList, setMenuList] = useState<MenuCategory[]>([])
    const router = useRouter();
    const [name, setName] = useState('')
    const [role, setRole] = useState('')

    useEffect(() => {
        const localUser = localStorage.getItem('user') ?? ''
        const jsonUser = JSON.parse(localUser || `{}`);
        const NEXT_TEST = !!(process.env.NEXT_TEST);
        const role = jsonUser.role;
        const menuList: MenuCategory[] = [
            ...IsJtekt ? [{
                label: 'Create Claim',
                items: [],
                icon: undefined,
                url: "/pages/create-qpr",
            }] : [],
            ...IsJtekt ? [{
                label: 'Approve',
                items: [
                    ...role == 'Leader / Engineer' || NEXT_TEST ? [{
                        label: 'Checker 1',
                        icon: IconDot,
                        url: "/pages/approve/checker1",
                    }] : [],
                    ...role == 'Supervision / Asistant Manager' || NEXT_TEST ? [{
                        label: 'Checker 2',
                        icon: IconDot,
                        url: "/pages/approve/checker2",
                    }] : [],
                    ...(role == 'Manager' || role == 'GM / DGM' || role == 'Plant Manager' || NEXT_TEST) ? [{
                        label: 'Approver',
                        icon: IconDot,
                        url: "/pages/approve/checker3",
                    }] : [],
                ],
                icon: undefined,
                // url: "/pages/approve",
            }] : [],

            ...IsJtekt ? [{
                label: 'Summary Report',
                items: [],
                icon: undefined,
                url: "/pages/summary-report",
            }] : [],
            ...IsJtekt ? [{
                label: 'Master Management',
                items: [
                    {
                        label: 'User Management',
                        icon: IconDot,
                        url: "/pages/master-user",
                    },
                    {
                        label: 'Supplier Management',
                        icon: IconDot,
                        url: "/pages/master-supplier",
                    },
                ],
                icon: undefined,
            }] : [],
            ...IsJtekt ? [{
                label: 'Delay',
                items: [],
                icon: undefined,
                url: "/pages/delay",
            }] : [],
            ...IsJtekt ? [{
                label: 'History',
                items: [],
                icon: undefined,
                url: "/pages/history",
            }] : [],
            ...!IsJtekt ? [{
                label: 'Action List',
                items: [],
                icon: undefined,
                url: "/pages/action-list",
            }] : [],
            ...!IsJtekt ? [{
                label: 'Create QPR Report',
                items: [],
                icon: undefined,
                url: "/pages/qpr-report",
            }] : [],
            ...!IsJtekt ? [{
                label: 'Create 8D Report',
                items: [],
                icon: undefined,
                url: "/pages/8d-report",
            }] : [],
        ];
        setMenuList(menuList);

    }, [role])

    const socketRef = useRef<Socket | null>(null);
    useEffect(() => {

        const localUser = localStorage.getItem('user') ?? ''
        if (localUser) {
            const jsonUser = JSON.parse(localUser);
            setName(jsonUser.name);
            setRole(jsonUser.role);
        } else {
            localStorage.clear();
            window.location.href = "/login"
        }


        if (!socketRef.current) {
            socketRef.current = getSocket();
        }

        const socket = socketRef.current;
        // Listen for an event
        socket.on("update-user", (data: any) => {
            const localUser = localStorage.getItem('user') ?? ''
            const jsonUser = JSON.parse(localUser || `{}`);
            if ((data && data.id ? data.id : '-') == jsonUser.id) {
                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('role', data.role);
                setName(data.name);
                setRole(data.role);
            }
        });

        // Cleanup on unmount
        return () => {
            socket.off("update-user");
        };

    }, []);

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
                                                        y.script ? y.script() : () => { }
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
                                        x.script ? x.script() : () => { }
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