'use client';

import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { Put } from "@/components/fetch";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";

const ResetPassword = () => {
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const [newUser, setNewUser] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [invalid, setInvalid] = useState({
        newPassword: false,
        confirmPassword: false,
        passwordMismatch: false,
        passwordTooShort: false,
        invalidCommonPassword: false,
        clickConfirm: false
    });

    useEffect(() => {
        if (invalid.clickConfirm) {
            validateForm();
        }
    }, [newUser]);

    const FixPasswordData = async () => {
        const res = await Put({
            url: `/users/reset-password`,
            body: JSON.stringify({
                id: -1,
                newPassword: newUser.newPassword
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (res.ok) {
            toast.current?.show({ severity: 'success', summary: 'บันทึกสำเร็จ', detail: `เปลี่ยนรหัสผ่านสำเร็จ`, life: 3000 });
            setTimeout(() => {
                router.push('/pages')
            },1000)
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
    }

    const validateForm = () => {
        let newInvalid: any = {
            password: false,
            confirmPassword: false,
            passwordMismatch: false,
            passwordTooShort: false,
            invalidCommonPassword: false,
        };

        if (!newUser.newPassword) {
            newInvalid.password = true;
        } else if (newUser.newPassword.length < 8) {
            newInvalid.passwordTooShort = true;
        } else if (newUser.newPassword === "P@ssw0rd") {
            newInvalid.invalidCommonPassword = true;
        }

        if (!newUser.confirmPassword) {
            newInvalid.confirmPassword = true;
        }

        if (newUser.newPassword && newUser.confirmPassword && newUser.newPassword !== newUser.confirmPassword) {
            newInvalid.passwordMismatch = true;
        }

        if (Object.keys(newInvalid).filter((x) => x !== 'clickConfirm').filter((x: any) => (newInvalid[x])).length) {
            setInvalid({ ...newInvalid, clickConfirm: true });
            return false;
        }
        return true
    };

    const handleConfirm = () => {
        const check = validateForm();
        if (check)
            FixPasswordData();
    };

    return (
        <div className="home">
            <Toast ref={toast} />
            <div className="border border-solid border-gray-300 rounded-md p-3 pb-5 min-w-[500px] min-h-[300px]">
                <div className="w-full text-center text-lg font-bold my-4">Reset Password</div>
                <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="password">Password</label>
                    <Password
                        id="password"
                        toggleMask
                        feedback={false}
                        value={newUser.newPassword}
                        invalid={invalid.newPassword || invalid.passwordTooShort}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full"
                    />
                </div>
                {invalid.passwordTooShort && invalid.clickConfirm && (
                    <div className="text-red-500 mt-1">* Password must be at least 8 characters long.</div>
                )}

                <div className="flex flex-col gap-2 w-full mt-3">
                    <label htmlFor="cpassword">Confirm Password</label>
                    <Password
                        id="cpassword"
                        toggleMask
                        feedback={false}
                        value={newUser.confirmPassword}
                        invalid={invalid.confirmPassword || invalid.passwordMismatch}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full"
                    />
                </div>
                {invalid.passwordMismatch && invalid.clickConfirm && (
                    <div className="text-red-500 mt-1">* The confirmation password does not match.</div>
                )}

                {invalid.invalidCommonPassword && invalid.clickConfirm && (
                    <div className="text-red-500 mt-1">* This password is not allowed. Please choose another one.</div>
                )}

                <div className="flex flex-col gap-2 w-full mt-5">
                    <Button label="Confirm" className="p-button-primary" onClick={handleConfirm} />
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
