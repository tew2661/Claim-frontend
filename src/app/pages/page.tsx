'use client';
import { MenuCategory } from "@/components/header/interface";
import React, { useEffect, useState } from "react";
import IconWork from "@/assets/icon/work.png"
import { useRouter } from "next/navigation";

export default function Home() {
    const IsJtekt = (process.env.NEXT_MODE == 'jtekt');
    const [menuList, setMenuList] = useState<MenuCategory[]>([])
    const [role, setRole] = useState('')
    const router = useRouter();
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
            <h1 className="text-2xl font-bold mb-4">Supplier Claim Management</h1>
            <div className="menu grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuList.map((category, index) => (
                    <React.Fragment key={index}>
                        {category.items.length === 0 && (
                            <div onClick={() => router.push(category.url!)} className="menu-item text-center p-4 bg-gray-100 rounded shadow hover:bg-gray-200 cursor-pointer">
                                {category.label}
                            </div>
                        )}
                        {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} onClick={() => router.push(item.url!)} className="menu-item text-center p-4 bg-gray-100 rounded shadow hover:bg-gray-200 cursor-pointer">
                                {item.label}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
