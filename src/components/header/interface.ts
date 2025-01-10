import { StaticImageData } from "next/image";

export interface MenuItem {
    label: string;
    icon?: StaticImageData; // Assuming the icon is a string representing the path to the icon image
    role?: string[];
    url?: string; // Assuming command is a string representing the route
    script?: () => void;
}

export interface MenuCategory {
    label: string;
    icon?: StaticImageData;
    items: MenuItem[];
    role?: string[];
    url?: string;
    script?: () => void;
}

export interface RoleCategory extends MenuCategory {
    function?: FunctionMenuCategory[],
}

export interface FunctionMenuCategory {
    title?: string,
    group?: string,
    name?: string,
    select?: boolean,
    function?: FunctionMenuCategory[]
}