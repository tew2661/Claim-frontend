'use client';
import { MenuCategory } from "@/components/header/interface";
import React, { useEffect, useState } from "react";
import IconWork from "@/assets/icon/work.png"

export default function Home() {
    const IsJtekt = (process.env.NEXT_MODE == 'jtekt');
    const [menuList, setMenuList] = useState<MenuCategory[]>([])
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
                        icon: IconWork,
                        url: "/pages/approve/checker1",
                    }] : [],
                    ...role == 'Supervision / Asistant Manager' || NEXT_TEST ? [{
                        label: 'Checker 2',
                        icon: IconWork,
                        url: "/pages/approve/checker2",
                    }] : [],
                    ...(role == 'Manager' || role == 'GM / DGM' || role == 'Plant Manager' || NEXT_TEST) ? [{
                        label: 'Approver',
                        icon: IconWork,
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
            ...IsJtekt && jsonUser.accessMasterManagement == 'Y' ? [{
                label: 'Master Management',
                items: [
                    {
                        label: 'User Management',
                        icon: IconWork,
                        url: "/pages/master-user",
                    },
                    {
                        label: 'Supplier Management',
                        icon: IconWork,
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
    return (
        <div className="home flex flex-col">
            <h1 className="text-2xl font-bold">Supplier Claim Management</h1>
            {/* <h2>Select Menu</h2>
            <div className="flex flex-row gap-2 justify-center">
                <div className="columns-3">
                    menu1
                </div>
                <div className="columns-3">
                    menu1
                </div>
                <div className="columns-3">
                    menu1
                </div>
                <div className="columns-3">
                    menu1
                </div>
                <div className="columns-3">
                    menu1
                </div>
            </div> */}
        </div>
    );
}
