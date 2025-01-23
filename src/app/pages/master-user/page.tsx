'use client';

import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Footer from "@/components/footer";
import { TemplatePaginator } from "@/components/template-pagination";
import { Paginator } from "primereact/paginator";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { CreateQueryString, Delete, Get, Patch, Post, Put } from "@/components/fetch";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";

interface UserData {
    id: number;
    code: string;
    name: string;
    department: string;
    role: string;
    email: string;
    active?: "Y" | "N";
    password?: string;
    confirmPassword?: string;
}

const roleOptions = [
    { label: "Leader / Engineer", value: "Leader / Engineer" },
    { label: "Supervision / Asistant Manager", value: "Supervision / Asistant Manager" },
    { label: "Manager", value: "Manager" },
    { label: "GM / DGM", value: "GM / DGM" },
    { label: "Plant Manager", value: "Plant Manager" },
];

export default function UserManagement() {
    const defaultUser: UserData = {
        id: -1,
        code: '',
        name: '',
        department: '',
        role: '',
        email: '',
        password: '',
        confirmPassword: ''
    }

    const defaultErrorUser = {
        code: false,
        name: false,
        department: false,
        role: false,
        email: false,
        password: false,
        confirmPassword: false
    }

    const toast = useRef<Toast>(null);
    const [visibleAdd, setVisibleAdd] = useState<boolean>(false);
    const [addOrEdit, setAddOrEdit] = useState<'A' | 'E' | 'P'>('A');
    const [users, setUsers] = useState<UserData[]>([]);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows, setTotalRows] = useState(10);
    const [newUser, setNewUser] = useState(defaultUser)
    const [iInvalid, setIInvalid] = useState(defaultErrorUser);

    const [password, setPassword] = useState({
        pass1: '',
        pass2: ''
    })

    const [filters, setFilters] = useState({
        code: "",
        name: ""
    })

    const addNewUser = () => {
        // Logic สำหรับการเพิ่มผู้ใช้ใหม่ (เปิด Modal หรือไปยังหน้าเพิ่มผู้ใช้งาน)
        console.log("Add New User clicked");
        setNewUser(defaultUser);
        setIInvalid(defaultErrorUser);
        setAddOrEdit('A');
        setVisibleAdd(true);
        // setVisibleAdd(true);
    };

    const handleInputChangeAdd = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setNewUser((old) => ({ ...old, [field]: e.target.value }))
    }

    const chechInvalid = async () => {
        const inInvalid: any = {
            code: false,
            name: false,
            department: false,
            role: false,
            email: false,
            password: false,
            confirmPassword: false
        }
        if (!newUser.code) {
            inInvalid.id = true
        }
        if (!newUser.name) {
            inInvalid.name = true
        }
        if (!newUser.department) {
            inInvalid.department = true
        }
        if (!newUser.role) {
            inInvalid.role = true
        }
        if (!newUser.email) {
            inInvalid.email = true
        }
        if (addOrEdit == 'A' && !newUser.password) {
            inInvalid.password = true
        }
        if (addOrEdit == 'A' && !newUser.confirmPassword) {
            inInvalid.confirmPassword = true
        }
        if (newUser.password !== newUser.confirmPassword) {
            inInvalid.confirmPassword = true
            toast.current?.show({ severity: 'warn', summary: 'Error', detail: `รหัสผ่านระบุไม่ตรงกัน`, life: 3000 });
            return;
        }
        setIInvalid(inInvalid);

        if (Object.keys(inInvalid).filter((x: any) => (inInvalid[x])).length) {
            return;
        }

        let datareturn: Response | null = null
        if (addOrEdit == 'A') {
            datareturn = await Post({
                url: `/users`,
                body: JSON.stringify({
                    code: newUser.code,
                    name: newUser.name,
                    department: newUser.department,
                    role: newUser.role,
                    email: newUser.email,
                    password: newUser.password,
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        } else {
            datareturn = await Put({
                url: `/users/${newUser.id}`,
                body: JSON.stringify({
                    code: newUser.code,
                    name: newUser.name,
                    department: newUser.department,
                    role: newUser.role,
                    email: newUser.email,
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }

        if (datareturn?.ok) {
            GetDatas();
            toast.current?.show({ severity: 'success', summary: 'บันทึกสำเร็จ', detail: addOrEdit == 'A' ? `เพิ่ม user ใหม่สำเร็จ` : `แก้ไขข้อมูล user สำเร็จ`, life: 3000 });
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await datareturn!.json()).message)}`, life: 3000 });
        }

        setVisibleAdd(false);
    }

    const GetDatas = async () => {
        const quertString = CreateQueryString({
            ...filters,
        });
        const res = await Get({ url: `/users?limit=${rows}&offset=${first}&${quertString}` });
        if (res.ok) {
            const res_data = await res.json();
            setTotalRows(res_data.total || 0)
            setUsers((res_data.data || []).map((x: any) => {
                return {
                    id: x.id,
                    code: x.code,
                    name: x.name,
                    department: x.department,
                    role: x.role,
                    email: x.email,
                    active: x.active || 'N'
                }
            }))
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
    }

    const DeleteData = async (id: number) => {
        

        const accept = async () => {
            const res = await Delete({
                url: `/users/${id}`,
                body: JSON.stringify({}),
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (res.ok) {
                toast.current?.show({ severity: 'success', summary: 'บันทึกสำเร็จ', detail: `ลบข้อมูล user สำเร็จ`, life: 3000 });
                GetDatas()
                setVisibleAdd(false);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
            }
            
        }
        const reject = () => {}

        confirmDialog({
            message: 'Do you want to delete this record?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept,
            reject
        });
    }

    const ActiveUser = async (id: number, active: "Y" | "N") => {

        const accept = async () => {
            const res = await Put({
                url: `/users/${id}`,
                body: JSON.stringify({
                    active
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (res.ok) {
                toast.current?.show({ severity: 'success', summary: 'บันทึกสำเร็จ', detail: `${active == 'Y' ? "เปิดการใช้งาน" : "ปิดการใช้งาน"} user สำเร็จ`, life: 3000 });
                GetDatas()
                setVisibleAdd(false);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
            } 
        }

        const reject = () => {}

        confirmDialog({
            message: `ต้องการ ${active == 'Y' ? "เปิดการใช้งาน" : "ปิดการใช้งาน"} user นี้ใช่หรือไม่`,
            header: `ยืนยัน${active == 'Y' ? "เปิดการใช้งาน" : "ปิดการใช้งาน"}`,
            icon: 'pi pi-user-edit',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept,
            reject
        });

        
    }

    const FixPasswordData = async (id: number) => {
        if (!password.pass1) {
            toast.current?.show({ severity: 'warn', summary: 'Error', detail: `กรุณาระบุข้อมูล`, life: 3000 });
            return;
        } else if (password.pass1.length < 8) {
            toast.current?.show({ severity: 'warn', summary: 'Error', detail: `รหัสผ่านอย่างน้อย 8 ตัว`, life: 3000 });
            return;
        } else if (password.pass1 !== password.pass2) {
            toast.current?.show({ severity: 'warn', summary: 'Error', detail: `รหัสผ่านระบุไม่ตรงกัน`, life: 3000 });
            return;
        }
        const res = await Put({
            url: `/users/${id}`,
            body: JSON.stringify({
                password: password.pass1
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (res.ok) {
            toast.current?.show({ severity: 'success', summary: 'บันทึกสำเร็จ', detail: `เปลี่ยนรหัสผ่านสำเร็จ`, life: 3000 });
            GetDatas()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
        setVisibleAdd(false);
    }

    useEffect(() => {
        GetDatas()
    }, [])

    return (
        <div className="flex justify-center pt-6 px-6">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="container">
                <h1 className="text-2xl font-bold mb-4 mx-4">User Management</h1>

                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-[calc(100%-100px)]">
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="userCode">รหัสพนักงาน</label>
                            <InputText
                                id="userCode"
                                value={filters.code}
                                onChange={(e) => setFilters((old) => ({ ...old, code: e.target.value }))}
                                className="w-full"
                            />

                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="username">ชื่อพนักงาน</label>
                            <InputText
                                id="username"
                                value={filters.name}
                                onChange={(e) => setFilters((old) => ({ ...old, name: e.target.value }))}
                                className="w-full"
                            />

                        </div>
                    </div>
                    <div className="w-[100px]">
                        <div className="flex flex-col gap-2">
                            <label>&nbsp;</label>
                            <Button label="Search" icon="pi pi-search" onClick={() => GetDatas()} />
                        </div>
                    </div>
                </div>

                <DataTable value={users}
                    showGridlines
                    className='table-header-center mt-4'
                    footer={<Paginator
                        first={first}
                        rows={rows}
                        totalRecords={totalRows}
                        template={TemplatePaginator}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        onPageChange={(event) => {
                            setFirst(event.first);
                            setRows(event.rows);
                        }} />}>
                    <Column field="code" header="รหัสพนักงาน" style={{ width: '10%', textAlign: 'center' }}></Column>
                    <Column field="name" header="ชื่อพนักงาน" style={{ width: '35%' }}></Column>
                    <Column field="department" header="หน่วยงาน" style={{ width: '20%' }}></Column>
                    <Column field="role" header="Role" style={{ width: '15%', textAlign: 'center' }}></Column>
                    <Column field="email" header="Email" style={{ width: '20%' }}></Column>
                    <Column field="active" header="Active" body={(arr: UserData) => {
                        return <InputSwitch inputId="input-metakey" checked={arr.active == 'Y'} onChange={(e) => ActiveUser(arr.id, arr.active == 'Y' ? "N" : "Y")} />
                    }} ></Column>
                    <Column field="action" header="Action" style={{ width: '10%', textAlign: 'center' }} body={(arr: UserData) => {
                        return <div className="flex justify-center gap-2">
                            <Button icon="pi pi-key" severity="warning" outlined onClick={() => {
                                setNewUser(arr);
                                setAddOrEdit('P');
                                setVisibleAdd(true);
                            }} />
                            <Button icon="pi pi-pen-to-square" outlined onClick={() => {
                                setNewUser(arr);
                                setAddOrEdit('E');
                                setVisibleAdd(true);
                            }} />
                            <Button icon="pi pi-trash" severity="danger" outlined onClick={() => { DeleteData(arr.id) }} />
                        </div>
                    }}></Column>
                </DataTable>
            </div>
            <Dialog header={addOrEdit == 'A' ? "Add User" : (addOrEdit == 'E' ? "Edit User" : "Fix Password")} visible={visibleAdd} onHide={() => { if (!visibleAdd) return; setVisibleAdd(false); }}
                style={{ width: '50vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }}>
                <div className="flex flex-col gap-2">
                    {
                        addOrEdit === 'P' ? <>
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="pass1">รหัสผ่านใหม่</label>
                                <InputText
                                    id="pass1"
                                    type="password"
                                    value={password.pass1}
                                    onChange={(e) => setPassword((old) => ({ ...old, pass1: e.target.value || "" }))}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="pass2">ยืนยันรหัสผ่าน</label>
                                <InputText
                                    id="pass2"
                                    type="password"
                                    value={password.pass2}
                                    onChange={(e) => setPassword((old) => ({ ...old, pass2: e.target.value || "" }))}
                                    className="w-full"
                                />
                            </div>
                            <div className='flex justify-end mt-2 w-full gap-2'>
                                <Button label="Fix Password" className="p-button-primary" onClick={() => FixPasswordData(newUser.id)} />
                            </div>
                        </> : <>
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="code">รหัสพนักงาน</label>
                                <InputText
                                    id="code"
                                    value={newUser.code}
                                    invalid={iInvalid.code && !newUser.code}
                                    onChange={(e) => handleInputChangeAdd(e, "code")}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="name">ชื่อพนักงาน</label>
                                <InputText
                                    id="name"
                                    value={newUser.name}
                                    invalid={iInvalid.name && !newUser.name}
                                    onChange={(e) => handleInputChangeAdd(e, "name")}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="department">หน่วยงาน</label>
                                <InputText
                                    id="department"
                                    value={newUser.department}
                                    invalid={iInvalid.department && !newUser.department}
                                    onChange={(e) => handleInputChangeAdd(e, "department")}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="role">Role</label>
                                <Dropdown
                                    id="role"
                                    value={newUser.role}
                                    options={roleOptions}
                                    onChange={(e) => handleInputChangeAdd(e as any as React.ChangeEvent<HTMLInputElement>, "role")}
                                    invalid={iInvalid.role && !newUser.role}
                                    optionLabel="label"
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="email">Email</label>
                                <InputText
                                    id="email"
                                    type="email"
                                    value={newUser.email}
                                    invalid={iInvalid.email && !newUser.email}
                                    onChange={(e) => handleInputChangeAdd(e, "email")}
                                    className="w-full"
                                />
                            </div>
                            {
                                addOrEdit == 'A' ? <div className="border border-solid border-gray-300 rounded-md p-3 pb-5">
                                    <div className="flex flex-col gap-2 w-full">
                                        <label htmlFor="password">Password</label>
                                        <InputText
                                            id="password"
                                            type="password"
                                            value={newUser.password}
                                            invalid={iInvalid.password && !newUser.password}
                                            onChange={(e) => handleInputChangeAdd(e, "password")}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <label htmlFor="cpassword">Confirm Password</label>
                                        <InputText
                                            id="cpassword"
                                            type="password"
                                            value={newUser.confirmPassword}
                                            invalid={iInvalid.confirmPassword && !newUser.confirmPassword}
                                            onChange={(e) => handleInputChangeAdd(e, "confirmPassword")}
                                            className="w-full"
                                        />
                                    </div>
                                </div> : <></>
                            }
                            <div className='flex justify-end mt-2 w-full gap-2'>
                                <Button label="Add User" className="p-button-primary" onClick={chechInvalid} />
                            </div>
                        </>
                    }

                </div>
            </Dialog>
            <Footer>
                <div className='flex justify-end mt-2 w-full gap-2'>
                    <Button label="Add New User" className="p-button-primary min-w-[150px]" onClick={addNewUser} />
                </div>
            </Footer>
        </div>
    );
}

