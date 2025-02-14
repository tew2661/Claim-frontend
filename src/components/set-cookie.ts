import Cookies from "js-cookie";
import moment from "moment";

export const SetCookie = ({ key, value }: { key: string, value: any }) => {
    Cookies.set(key, value, {
        httpOnly: false, 
        expires: moment().add(7,'d').toDate(), // อายุของ Cookie (จำนวนวัน)
        secure: process.env.NODE_ENV === "production", // ใช้ Secure เฉพาะใน Production
        // sameSite: "Strict", // ป้องกัน CSRF
        sameSite: 'none',
    });
}


export function GetCookie(key: string): string | undefined {
    return Cookies.get(key); // จะคืนค่าของ Cookie ถ้ามี หรือ undefined ถ้าไม่มี
}

export function DeleteCookie(key: string) {
    Cookies.remove(key, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });
}

export function DeleteAllCookie() {
    Object.keys(Cookies.get()).forEach(cookie => Cookies.remove(cookie));
}