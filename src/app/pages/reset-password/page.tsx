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
    const [userPasswords, setUserPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [validationErrors, setValidationErrors] = useState({
        newPassword: false,
        confirmPassword: false,
        passwordMismatch: false,
        passwordTooShort: false,
        invalidCommonPassword: false,
        clickConfirm: false
    });

    useEffect(() => {
        if (validationErrors.clickConfirm) {
            validateForm();
        }
    }, [userPasswords]);

    const updatePassword = async () => {
        const response = await Put({
            url: `/users/reset-password`,
            body: JSON.stringify({
                id: -1,
                newPassword: userPasswords.newPassword
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            toast.current?.show({ severity: 'success', summary: 'Success', detail: `Password changed successfully`, life: 3000 });
            setTimeout(() => {
                router.push('/pages')
            }, 1000)
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await response.json()).message)}`, life: 3000 });
        }
    }

    const validateForm = () => {
        let errors: any = {
            newPassword: false,
            confirmPassword: false,
            passwordMismatch: false,
            passwordTooShort: false,
            invalidCommonPassword: false,
        };

        if (!userPasswords.newPassword) {
            errors.newPassword = true;
        } else if (userPasswords.newPassword.length < 8) {
            errors.passwordTooShort = true;
        } else if (userPasswords.newPassword === "P@ssw0rd") {
            errors.invalidCommonPassword = true;
        }

        if (!userPasswords.confirmPassword) {
            errors.confirmPassword = true;
        }

        if (userPasswords.newPassword && userPasswords.confirmPassword && userPasswords.newPassword !== userPasswords.confirmPassword) {
            errors.passwordMismatch = true;
        }

        if (Object.keys(errors).filter((key) => key !== 'clickConfirm').some((key: any) => (errors[key]))) {
            setValidationErrors({ ...errors, clickConfirm: true });
            return false;
        }
        return true;
    };

    const handleConfirm = () => {
        const isValid = validateForm();
        if (isValid) updatePassword();
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
                        value={userPasswords.newPassword}
                        invalid={validationErrors.newPassword || validationErrors.passwordTooShort}
                        onChange={(e) => setUserPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full"
                    />
                </div>
                {validationErrors.passwordTooShort && validationErrors.clickConfirm && (
                    <div className="text-red-500 mt-1">* Password must be at least 8 characters long.</div>
                )}

                <div className="flex flex-col gap-2 w-full mt-3">
                    <label htmlFor="cpassword">Confirm Password</label>
                    <Password
                        id="cpassword"
                        toggleMask
                        feedback={false}
                        value={userPasswords.confirmPassword}
                        invalid={validationErrors.confirmPassword || validationErrors.passwordMismatch}
                        onChange={(e) => setUserPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full"
                    />
                </div>
                {validationErrors.passwordMismatch && validationErrors.clickConfirm && (
                    <div className="text-red-500 mt-1">* The confirmation password does not match.</div>
                )}

                {validationErrors.invalidCommonPassword && validationErrors.clickConfirm && (
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
