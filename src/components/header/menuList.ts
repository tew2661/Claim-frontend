
import IconDot from '@/assets/icon/dot.png'
import { MenuCategory } from "./interface";

const IsJtekt = (process.env.NEXT_MODE == 'jtekt');
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
            {
                label: 'Checker 1',
                icon: IconDot,
                url: "/pages/approve/checker1",
            },
            {
                label: 'Checker 2',
                icon: IconDot,
                url: "/pages/approve/checker2",
            },
            {
                label: 'Approver',
                icon: IconDot,
                url: "/pages/approve/checker3",
            },
        ],
        icon: undefined,
        // url: "/pages/approve",
    }] : [],
    
    ...IsJtekt ? [{
        label: 'Summary Report',
        items: [],
        icon: undefined,
        url: "/pages/summary-report",
    }] :[],
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
    }] :[],
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
    }]:[],
    ...!IsJtekt ? [{
        label: 'Create 8D Report',
        items: [],
        icon: undefined,
        url: "/pages/8d-report",
    }] :[],
];

export { menuList }