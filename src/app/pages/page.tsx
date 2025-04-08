'use client';
import { MenuCategory } from "@/components/header/interface";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddDocument from "@/assets/icon/add-task.png";
import Image from "next/image";
import ImageApprove from "@/assets/icon/immigration.png";
import ImageBusinessReport from "@/assets/icon/business-report.png";
import ImageUser from "@/assets/icon/manager.png";
import ImageSupplier from "@/assets/icon/partnership.png";
import ImageExpired from "@/assets/icon/expired.png";
import ImageQPR from "@/assets/icon/assignment.png"
import Image8d from "@/assets/icon/issue.png"
import ImageHistory from "@/assets/icon/history.png"

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
                icon: AddDocument,
                url: "/pages/create-qpr",
            }] : [],
            ...IsJtekt ? [{
                label: 'Approve',
                items: [
                    ...role == 'Leader / Engineer' || NEXT_TEST ? [{
                        label: 'Checker 1',
                        icon: ImageApprove,
                        url: "/pages/approve/checker1",
                    }] : [],
                    ...role == 'Supervision / Asistant Manager' || NEXT_TEST ? [{
                        label: 'Checker 2',
                        icon: ImageApprove,
                        url: "/pages/approve/checker2",
                    }] : [],
                    ...(role == 'Manager' || role == 'GM / DGM' || role == 'Plant Manager' || NEXT_TEST) ? [{
                        label: 'Approver',
                        icon: ImageApprove,
                        url: "/pages/approve/checker3",
                    }] : [],
                ],
                icon: undefined,
                // url: "/pages/approve",
            }] : [],

            ...IsJtekt ? [{
                label: 'Summary Report',
                items: [],
                icon: ImageBusinessReport,
                url: "/pages/summary-report",
            }] : [],
            ...IsJtekt && jsonUser.accessMasterManagement == 'Y' ? [{
                label: 'Master Management',
                items: [
                    {
                        label: 'User Management',
                        icon: ImageUser,
                        url: "/pages/master-user",
                    },
                    {
                        label: 'Supplier Management',
                        icon: ImageSupplier,
                        url: "/pages/master-supplier",
                    },
                ],
                icon: undefined,
            }] : [],
            ...IsJtekt ? [{
                label: 'Delay',
                items: [],
                icon: ImageExpired,
                url: "/pages/delay",
            }] : [],
            ...!IsJtekt ? [{
                label: 'Action List',
                items: [],
                icon: ImageBusinessReport,
                url: "/pages/action-list",
            }] : [],
            ...!IsJtekt ? [{
                label: 'Create QPR Report',
                items: [],
                icon: ImageQPR,
                url: "/pages/qpr-report",
            }] : [],
            ...!IsJtekt ? [{
                label: 'Create 8D Report',
                items: [],
                icon: Image8d,
                url: "/pages/8d-report",
            }] : [],
            {
                label: 'History',
                items: [],
                icon: ImageHistory,
                url: "/pages/history",
            },
        ];
        setMenuList(menuList);

    }, [role])
    return (
        <div className="home flex flex-col">
            <h1 className="text-3xl font-bold mb-10">Supplier Claim Management</h1>
            <div className={`menu grid grid-cols-1 md:grid-cols-3 ${ menuList.length > 4 ? 'lg:grid-cols-5' : ( menuList.length > 3 ? 'lg:grid-cols-4' : '')} gap-4`}>
                {menuList.map((category, index) => (
                    <React.Fragment key={index}>
                        {category.items.length === 0 && (
                            <div onClick={() => router.push(category.url!)} className="menu-item text-center p-4 border-solid border-1 border-gray-300 hover:border-gray-500 rounded shadow hover:bg-gray-100 cursor-pointer px-5">
                                { category.icon ? <Image src={category.icon!} className="w-[150px] h-[150px] m-3 mb-5" alt={'icon-'+ index}></Image> : <></> } 
                                <div className="font-bold text-lg">
                                    {category.label}
                                </div>
                            </div>
                        )}
                        {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} onClick={() => router.push(item.url!)} className="menu-item text-center p-4 border-solid border-1 border-gray-300 hover:border-gray-500 rounded shadow hover:bg-gray-100 cursor-pointer px-5">
                                { item.icon ? <Image src={item.icon!} className="w-[150px] h-[150px] m-3 mb-5" alt={'icon-'+ itemIndex}></Image> : <></> } 
                                <div className="font-bold text-lg">
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
