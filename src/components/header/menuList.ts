
import IconDot from '@/assets/icon/dot.png'
import { MenuCategory } from "./interface";

const menuList: MenuCategory[] = [
    {
        label: 'Create Claim',
        items: [],
        icon: undefined,
        url: "/pages/create-qpr",
    },
    {
        label: 'Approve',
        items: [],
        icon: undefined,
        url: "/pages/approve",
    },
    
    {
        label: 'Summary Report',
        items: [],
        icon: undefined,
        url: "/pages/summary-report",
    },
    {
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
    },
    {
        label: 'Delay',
        items: [],
        icon: undefined,
        url: "/pages/delay",
    },
    {
        label: 'Action List',
        items: [],
        icon: undefined,
        url: "/pages/action-list",
    },
    {
        label: 'Create QPR Report',
        items: [],
        icon: undefined,
        url: "/pages/qpr-report",
    },
    {
        label: 'Create 8D Report',
        items: [],
        icon: undefined,
        url: "/pages/8d-report",
    },
];

export { menuList }