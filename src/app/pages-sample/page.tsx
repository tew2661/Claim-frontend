'use client';
import { MenuCategory } from "@/components/header/interface";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageBusinessReport from "@/assets/icon/business-report.png";
import ImageApprove from "@/assets/icon/immigration.png";
import ImageUser from "@/assets/icon/manager.png";
import ImageSupplier from "@/assets/icon/partnership.png";
import ImageExpired from "@/assets/icon/expired.png";
import ImageHistory from "@/assets/icon/history.png";
import AddDocument from "@/assets/icon/add-task.png";
import Dashboard from "@/assets/icon/dashboard.png";

export default function SampleDataSheet() {
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
            ...IsJtekt ? [
                {
                    label: 'Dashboard',
                    items: [],
                    icon: Dashboard,
                    url: "/pages-sample/dashboard",
                }] : [],
            {
                label: 'Summary Report',
                items: [],
                icon: AddDocument,
                url: "/pages-sample/summary-report",
            },
            ...IsJtekt ? [
                {
                    label: 'SDS Approval',
                    items: [],
                    icon: ImageApprove,
                    url: "/pages-sample/sds-approval",
                },
            ] : [
                {
                    label: 'Create SDS',
                    items: [],
                    icon: ImageApprove,
                    url: "/pages-sample/create-sds",
                }
            ],
            {
                label: 'Inspection Detail',
                items: [],
                icon: ImageBusinessReport,
                url: "/pages-sample/inspection-detail",
            },
            ...IsJtekt ? [
                {
                    label: 'User Management',
                    items: [],
                    icon: ImageUser,
                    url: "/pages-sample/master-user",
                },
                {
                    label: 'Supplier Management',
                    items: [],
                    icon: ImageSupplier,
                    url: "/pages-sample/master-supplier",
                },
                {
                    label: 'Delay',
                    items: [],
                    icon: ImageExpired,
                    url: "/pages-sample/delay",
                },
            ] : [],
            {
                label: 'History',
                items: [],
                icon: ImageHistory,
                url: "/pages-sample/history",
            },

        ];
        setMenuList(menuList);

    }, [role, IsJtekt, router])


    return (
        <div className="home flex flex-col">
            <h1 className="text-3xl font-bold mb-10">Sample Data Sheet</h1>
            <div className={`menu grid grid-cols-1 md:grid-cols-3 ${menuList.length > 4 ? 'lg:grid-cols-5' : (menuList.length > 3 ? 'lg:grid-cols-4' : '')} gap-4`}>
                {menuList.map((category, index) => (
                    <React.Fragment key={index}>
                        {category.items.length === 0 && (
                            <div onClick={() => router.push(category.url!)} className="menu-item text-center p-4 border-solid border-1 border-gray-300 bg-[#ffffffc7] hover:border-gray-500 rounded shadow hover:bg-gray-100 hover:scale-110 cursor-pointer px-5">
                                {category.icon ? <Image src={category.icon!} className="w-[150px] h-[150px] m-3 mb-5" alt={'icon-' + index}></Image> : <></>}
                                <div className="font-bold text-lg">
                                    {category.label}
                                </div>
                            </div>
                        )}
                        {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} onClick={() => router.push(item.url!)} className="menu-item text-center p-4 border-solid border-1 border-gray-300 bg-[#ffffffc7] hover:border-gray-500 rounded shadow hover:bg-gray-100 hover:scale-110 cursor-pointer px-5">
                                {item.icon ? <Image src={item.icon!} className="w-[150px] h-[150px] m-3 mb-5" alt={'icon-' + itemIndex}></Image> : <></>}
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