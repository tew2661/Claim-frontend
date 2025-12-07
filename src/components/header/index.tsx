'use client';
import Image from 'next/image';
import Icon from "@/assets/icon/jtekt.png";
import IconAvatar from '@/assets/icon/profile.png'
import IconLogout from '@/assets/icon/logout.png'
import './style.scss'
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MenuCategory, MenuItem } from './interface';
import { getSocket } from '../socket/socket';
import { Socket } from 'socket.io-client';
import IconDot from '@/assets/icon/dot.png'
import ImageHistory from "@/assets/icon/history.png"

const Header = (props: { IsJtekt: boolean, menu: 'claim' | 'sample' }) => {
    const IsJtekt = props.IsJtekt;
    const claim = props.menu == 'claim';
    const sample = props.menu == 'sample';
    const [menuList, setMenuList] = useState<MenuCategory[]>([])
    const router = useRouter();
    const path = usePathname();
    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [roleSample, setRoleSample] = useState('')

    useEffect(() => {
        const localUser = localStorage.getItem('user') ?? ''
        const jsonUser = JSON.parse(localUser || `{}`);
        const NEXT_TEST = !!(process.env.NEXT_TEST);
        const role = jsonUser.role;
        const menuList: MenuCategory[] = [
            ...IsJtekt && claim ? [{
                label: 'Create Claim',
                items: [],
                icon: undefined,
                url: "/pages-claim/create-qpr",
            }] : [],
            ...IsJtekt && claim ? [{
                label: 'Approve',
                items: [
                    ...role == 'Leader / Engineer' || NEXT_TEST ? [{
                        label: 'Checker 1',
                        icon: IconDot,
                        url: "/pages-claim/approve/checker1",
                    }] : [],
                    ...role == 'Supervision / Asistant Manager' || NEXT_TEST ? [{
                        label: 'Checker 2',
                        icon: IconDot,
                        url: "/pages-claim/approve/checker2",
                    }] : [],
                    ...(role == 'Manager' || role == 'GM / DGM' || role == 'Plant Manager' || NEXT_TEST) ? [{
                        label: 'Approver',
                        icon: IconDot,
                        url: "/pages-claim/approve/checker3",
                    }] : [],
                ],
                icon: undefined,
                // url: "/pages-claim/approve",
            }] : [],
            ...IsJtekt && claim ? [{
                label: 'Summary Report',
                items: [],
                icon: undefined,
                url: "/pages-claim/summary-report",
            }] : [],
            ...IsJtekt && claim && jsonUser.accessMasterManagement == 'Y' ? [{
                label: 'Master Management',
                items: [
                    {
                        label: 'User Management',
                        icon: IconDot,
                        url: "/pages-claim/master-user",
                    },
                    {
                        label: 'Supplier Management',
                        icon: IconDot,
                        url: "/pages-claim/master-supplier",
                    },
                ],
                icon: undefined,
            }] : [],
            ...IsJtekt && claim ? [{
                label: 'Delay',
                items: [],
                icon: undefined,
                url: "/pages-claim/delay",
            }] : [],

            // Sample Menu สำหรับ JTEKT
            ...IsJtekt && sample ? [{
                label: 'Dashboard',
                items: [],
                icon: undefined,
                url: "/pages-sample/dashboard",
            }] : [],
            ...sample ? [{
                label: 'Summary Report',
                items: [],
                icon: undefined,
                url: "/pages-sample/summary-report",
            }] : [],
            ...IsJtekt && sample ? [{
                label: 'SDS Approval',
                items: [],
                icon: undefined,
                url: "/pages-sample/sds-approval",
            }] : [],
            ...IsJtekt && sample && jsonUser.accessMasterManagement == 'Y' ? [{
                label: 'Master Management',
                items: [
                    {
                        label: 'Inspection Detail',
                        icon: IconDot,
                        url: "/pages-sample/inspection-detail",
                    },
                    {
                        label: 'User Management',
                        icon: IconDot,
                        url: "/pages-sample/master-user",
                    },
                    {
                        label: 'Supplier Management',
                        icon: IconDot,
                        url: "/pages-sample/master-supplier",
                    },
                ],
                icon: undefined,
            }] : [],
            ...IsJtekt && sample ? [{
                label: 'Delay',
                items: [],
                icon: undefined,
                url: "/pages-sample/delay",
            }] : [],

            ...!IsJtekt && claim ? [{
                label: 'Action List',
                items: [],
                icon: undefined,
                url: "/pages-claim/action-list",
            }] : [],
            ...!IsJtekt && claim ? [{
                label: 'Create QPR Report',
                items: [],
                icon: undefined,
                url: "/pages-claim/qpr-report",
            }] : [],
            ...!IsJtekt && claim ? [{
                label: 'Create 8D Report',
                items: [],
                icon: undefined,
                url: "/pages-claim/8d-report",
            }] : [],
            ...!IsJtekt && sample ? [{
                label: 'Create SDS',
                items: [],
                icon: undefined,
                url: "/pages-sample/create-sds",
            }] : [],
            ...!IsJtekt && sample ? [{
                label: 'Inspection Detail',
                items: [],
                icon: undefined,
                url: "/pages-sample/inspection-detail",
            }] : [],
            {
                label: 'History',
                items: [],
                icon: undefined,
                url: sample ? "/pages-sample/history" : "/pages-claim/history",
            },
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
            setRoleSample(jsonUser.sampleDataSheetRole)
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
                setRoleSample(data.sampleDataSheetRole)
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
                    onClick={() => {
                        if (sample) {
                            router.push('/pages-sample')
                        } else {
                            router.push('/pages-claim')
                        }
                    }}
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
                    <button className="class-custom-button">
                        <i className="pi pi-desktop mr-2" style={{ fontSize: '14px' }}></i>
                        <label>เลือกระบบ <i className="pi pi-angle-down ml-2" style={{ fontSize: '10px' }}></i></label>
                    </button>
                    <div className="class-custom-dropdown-content class-custom-bar-block class-custom-card-4 right-auto right-auto-custom">
                        <a className="class-custom-bar-item class-custom-button class-custom-menu" onClick={() => {
                            router.push('/pages-claim')
                        }}>
                            <i className="pi pi-building mr-2" style={{ fontSize: '12px' }}></i>
                            System Claim Management
                        </a>
                        <a className="class-custom-bar-item class-custom-button class-custom-menu" onClick={() => {
                            router.push('/pages-sample')
                        }}>
                            <i className="pi pi-file mr-2" style={{ fontSize: '12px' }}></i>
                            System Sample Data Sheet
                        </a>
                    </div>
                </div>
                <div className="class-custom-dropdown-hover">
                    <button className="class-custom-button class-custom-avatar">
                        <div className='mr-2 user'>
                            <div>{name}</div>
                            <div>({sample && IsJtekt ? roleSample : role})</div>
                        </div>
                        <Image src={IconAvatar} alt="Logo" />
                    </button>
                    <div className="class-custom-dropdown-content class-custom-bar-block class-custom-card-4">
                        <a className="class-custom-bar-item class-custom-button class-custom-menu" onClick={() => {
                            router.push('/pages-claim/reset-password?redirect=' + encodeURIComponent(path))
                        }}>
                            <div className='mr-2'>
                                <i className='pi pi-sync'></i>
                            </div>
                            Reset Password
                        </a>
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