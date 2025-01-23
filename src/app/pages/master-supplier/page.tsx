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
import { CreateQueryString, Delete, Get, Post, Put } from "@/components/fetch";
import { Toast } from "primereact/toast";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";

interface DataSupplierTable {
    id: number,
    supplierCode: string;
    supplierName: string;
    tel: string;
    email: string[];
    contactPerson: string[],
    password?: string;
    confirmPassword?: string;
}

export default function UserManagement() {
    const toast = useRef<Toast>(null);
    const defaultNewData: DataSupplierTable = {
        id: -1,
        supplierCode: '',
        supplierName: '',
        tel: '',
        email: [''],
        contactPerson: [''],
        password: '',
        confirmPassword: ''
    }
    const defaultErrorSupplier = {
        supplierCode: false,
        supplierName: false,
        tel: false,
        email: [false],
        contactPerson: [false],
        password: false,
        confirmPassword: false
    }
    const [visibleAdd, setVisibleAdd] = useState<boolean>(false);
    const [addOrEdit, setAddOrEdit] = useState<'A' | 'E' | 'P'>('A');
    const [supplier, setSupplier] = useState<DataSupplierTable[]>([]);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows, setTotalRows] = useState(10);
    const [newSupplier, setNewSupplier] = useState(defaultNewData);
    const [iInvalid, setIInvalid] = useState(defaultErrorSupplier);

    const [filters, setFilters] = useState({
        supplierCode: "",
        supplierName: ""
    })

    const [password, setPassword] = useState({
        pass1: '',
        pass2: ''
    })

    const addNewUser = () => {
        // Logic สำหรับการเพิ่มผู้ใช้ใหม่ (เปิด Modal หรือไปยังหน้าเพิ่มผู้ใช้งาน)
        console.log("Add New supplier clicked");
        setNewSupplier(defaultNewData);
        setIInvalid(defaultErrorSupplier);
        setAddOrEdit('A');
        setVisibleAdd(true);
    };

    const handleInputChangeAdd = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setNewSupplier((old) => ({ ...old, [field]: e.target.value }))
    }

    const checkInvalid = async () => {
        const inInvalid: any = {
            supplierCode: false,
            supplierName: false,
            tel: false,
            email: newSupplier.email.map(() => false),
            contactPerson: newSupplier.contactPerson.map(() => false),
        }
        if (!newSupplier.supplierCode) {
            inInvalid.supplierCode = true
        }
        if (!newSupplier.supplierName) {
            inInvalid.supplierName = true
        }
        if (!newSupplier.tel) {
            inInvalid.tel = true
        }

        newSupplier.email.forEach((email, index) => {
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                inInvalid.email[index] = true;
            }
        });

        newSupplier.contactPerson.forEach((contactPerson, index) => {
            if (!contactPerson) {
                inInvalid.contactPerson[index] = true;
            }
        });

        const hasInvalidFields = Object.keys(inInvalid).some((key) => {
            if (key === "email") {
                return inInvalid.email.some((emailInvalid: boolean) => emailInvalid);
            }
            if (key === "contactPerson") {
                return inInvalid.contactPerson.some((contactPersonInvalid: boolean) => contactPersonInvalid);
            }
            return inInvalid[key];
        });

        if (addOrEdit == 'A' && !newSupplier.confirmPassword) {
            inInvalid.confirmPassword = true
        }
        if (newSupplier.password !== newSupplier.confirmPassword) {
            inInvalid.confirmPassword = true
            toast.current?.show({ severity: 'warn', summary: 'Error', detail: `รหัสผ่านระบุไม่ตรงกัน`, life: 3000 });
            return;
        }

        setIInvalid(inInvalid);
        if (hasInvalidFields) {
            console.log("Validation failed:", inInvalid);
            return;
        }

        let datareturn: Response | null = null
        if (addOrEdit == 'A') {
            datareturn = await Post({
                url: `/supplier`,
                body: JSON.stringify({
                    supplierCode: newSupplier.supplierCode,
                    supplierName: newSupplier.supplierName,
                    tel: newSupplier.tel,
                    email: newSupplier.email,
                    contactPerson: newSupplier.contactPerson
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        } else {
            datareturn = await Put({
                url: `/supplier/${newSupplier.id}`,
                body: JSON.stringify({
                    supplierCode: newSupplier.supplierCode,
                    supplierName: newSupplier.supplierName,
                    tel: newSupplier.tel,
                    email: newSupplier.email,
                    contactPerson: newSupplier.contactPerson
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }

        if (datareturn?.ok) {
            GetDatas();
            setVisibleAdd(false);
            toast.current?.show({ severity: 'success', summary: 'บันทึกสำเร็จ', detail: addOrEdit == 'A' ? `เพิ่ม supplier ใหม่สำเร็จ` : `แก้ไขข้อมูล supplier สำเร็จ`, life: 3000 });
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await datareturn!.json()).message)}`, life: 3000 });
        }


    }

    const DeleteData = async (id: number) => {
        const accept = async () => {
            const res = await Delete({
                url: `/supplier/${id}`,
                body: JSON.stringify({}),
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (res.ok) {
                toast.current?.show({ severity: 'success', summary: 'บันทึกสำเร็จ', detail: `ลบข้อมูล supplier สำเร็จ`, life: 3000 });
                GetDatas()
                setVisibleAdd(false);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
            }
        }

        const reject = () => { }

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
            url: `/supplier/${id}`,
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

    const GetDatas = async () => {
        const quertString = CreateQueryString({
            ...filters,
        });
        const res = await Get({ url: `/supplier?limit=${rows}&offset=${first}&${quertString}` });
        if (res.ok) {
            const res_data = await res.json();
            setTotalRows(res_data.total || 0)
            setSupplier((res_data.data || []).map((x: any) => {
                return {
                    id: x.id,
                    supplierCode: x.supplierCode || "",
                    supplierName: x.supplierName || "",
                    tel: x.tel || "",
                    email: x.email || [],
                    contactPerson: x.contactPerson || []
                }
            }))
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
    }

    useEffect(() => {
        GetDatas()
    }, [])

    return (
        <div className="flex justify-center pt-6 px-6">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="container">
                <h1 className="text-2xl font-bold mb-4 mx-4">Supplier Management</h1>

                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-[calc(100%-100px)]">
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="supplierCode">Supplier Code</label>
                            <InputText
                                id="supplierCode"
                                value={filters.supplierCode}
                                onChange={(e) => setFilters((old) => ({ ...old, supplierCode: e.target.value }))}
                                className="w-full"
                            />

                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="supplierName">Supplier Name</label>
                            <InputText
                                id="supplierName"
                                value={filters.supplierName}
                                onChange={(e) => setFilters((old) => ({ ...old, supplierName: e.target.value }))}
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

                <DataTable value={supplier}
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
                    <Column field="supplierCode" header="Supplier Code" style={{ width: '10%', textAlign: 'center' }}></Column>
                    <Column field="supplierName" header="Supplier Name" style={{ width: '40%' }}></Column>
                    <Column field="tel" header="Tel" style={{ width: '20%', textAlign: 'center' }}></Column>
                    <Column field="email" header="Email" style={{ width: '20%' }} body={(rowData) => {
                        return <div className="flex flex-col gap-2">{(rowData.email || []).map((x: string, index: number) => {
                            return <div key={'email-' + index}>{x}</div>
                        })}</div>
                    }}></Column>
                    <Column field="action" header="Action" style={{ width: '10%', textAlign: 'center' }} body={(arr) => {
                        return <div className="flex justify-center gap-2">
                            <Button icon="pi pi-key" severity="warning" outlined onClick={() => {
                                setNewSupplier(arr);
                                setAddOrEdit('P');
                                setVisibleAdd(true);
                            }} />
                            <Button icon="pi pi-pen-to-square" outlined onClick={() => {
                                setNewSupplier(arr);
                                setAddOrEdit('E');
                                setVisibleAdd(true);
                            }} />
                            <Button icon="pi pi-trash" severity="danger" outlined onClick={() => { DeleteData(arr.id) }} />
                        </div>
                    }}></Column>
                </DataTable>
            </div>
            <Dialog header={addOrEdit == 'A' ? "Add Supplier" : (addOrEdit == 'E' ? "Edit Supplier" : "Fix Password")} visible={visibleAdd} onHide={() => { if (!visibleAdd) return; setVisibleAdd(false); }}
                style={{ width: '50vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }}>
                {
                    addOrEdit == 'P' ? <>
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
                            <Button label="Fix Password" className="p-button-primary" onClick={() => FixPasswordData(newSupplier.id)} />
                        </div>
                    </> : <>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="supplierCode">Supplier Code</label>
                                <InputText
                                    id="supplierCode"
                                    value={newSupplier.supplierCode}
                                    invalid={iInvalid.supplierCode && !newSupplier.supplierCode}
                                    onChange={(e) => handleInputChangeAdd(e, "supplierCode")}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="supplierName">Supplier Name</label>
                                <InputText
                                    id="supplierName"
                                    value={newSupplier.supplierName}
                                    invalid={iInvalid.supplierName && !newSupplier.supplierName}
                                    onChange={(e) => handleInputChangeAdd(e, "supplierName")}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="tel">Tel</label>
                                <InputText
                                    id="tel"
                                    value={newSupplier.tel}
                                    invalid={iInvalid.tel && !newSupplier.tel}
                                    onChange={(e) => handleInputChangeAdd(e, "tel")}
                                    className="w-full"
                                />
                            </div>

                            <div className="w-full border border-solid rounded border-gray-300 pb-4 p-2 px-4">
                                {
                                    newSupplier.email.map((arr: string, index: number) => {
                                        return <div className="flex flex-row gap-2" key={'em-' + index}>
                                            <div className="flex flex-col gap-2 w-[calc(50%-50px)]">
                                                <label htmlFor="contactPerson">Contact Person</label>
                                                <InputText
                                                    id="contactPerson"
                                                    value={newSupplier.contactPerson[index]}
                                                    invalid={iInvalid.contactPerson[index] && !newSupplier.contactPerson[index]}
                                                    onChange={(e) => {
                                                        setNewSupplier((old) => {
                                                            return {
                                                                ...old,
                                                                contactPerson: newSupplier.contactPerson.map((arrj, indexj) => {
                                                                    if (index == indexj) {
                                                                        return e.target.value
                                                                    } else {
                                                                        return arrj
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 w-[calc(50%-50px)]">
                                                <label htmlFor={'email-' + index}>Email {index + 1}</label>
                                                <InputText
                                                    id={'email-' + index}
                                                    type="email"
                                                    value={arr}
                                                    invalid={iInvalid.email[index] && !arr}
                                                    onChange={(e) => {
                                                        setNewSupplier((old) => {
                                                            return {
                                                                ...old,
                                                                email: newSupplier.email.map((arrj, indexj) => {
                                                                    if (index == indexj) {
                                                                        return e.target.value
                                                                    } else {
                                                                        return arrj
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>

                                            {index === 0 ? (
                                                <div className="w-[100px] flex items-end justify-end">
                                                    <Button
                                                        label="ADD"
                                                        icon="pi pi-plus"
                                                        onClick={() => {
                                                            setNewSupplier((prev) => ({
                                                                ...prev,
                                                                email: [...prev.email, ""],
                                                                contactPerson: [...prev.contactPerson, ""],
                                                            }));
                                                        }}
                                                        className="p-button-success"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-[100px] flex items-end justify-end">
                                                    <Button
                                                        icon="pi pi-trash"
                                                        onClick={() => {
                                                            setNewSupplier((prev) => ({
                                                                ...prev,
                                                                email: prev.email.filter((_, i) => i !== index),
                                                            }));
                                                        }}
                                                        className="p-button-danger"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    })
                                }
                            </div>

                            {
                                addOrEdit == 'A' ? <div className="border border-solid border-gray-300 rounded-md p-3 pb-5">
                                    <div className="flex flex-col gap-2 w-full">
                                        <label htmlFor="password">Password</label>
                                        <InputText
                                            id="password"
                                            type="password"
                                            value={newSupplier.password}
                                            invalid={iInvalid.password && !newSupplier.password}
                                            onChange={(e) => handleInputChangeAdd(e, "password")}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <label htmlFor="cpassword">Confirm Password</label>
                                        <InputText
                                            id="cpassword"
                                            type="password"
                                            value={newSupplier.confirmPassword}
                                            invalid={iInvalid.confirmPassword && !newSupplier.confirmPassword}
                                            onChange={(e) => handleInputChangeAdd(e, "confirmPassword")}
                                            className="w-full"
                                        />
                                    </div>
                                </div> : <></>
                            }

                            <div className='flex justify-end mt-2 w-full gap-2'>
                                <Button label={addOrEdit == 'A' ? "Add Supplier" : "Edit Supplier"} className="p-button-primary" onClick={checkInvalid} />
                            </div>
                        </div>
                    </>
                }
            </Dialog>
            <Footer>
                <div className='flex justify-end mt-2 w-full gap-2'>
                    <Button label="Add New Supplier" className="p-button-primary min-w-[150px]" onClick={addNewUser} />
                </div>
            </Footer>
        </div>
    );
}
