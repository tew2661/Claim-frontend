'use client';

import { useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Footer from "@/components/footer";
import { TemplatePaginator } from "@/components/template-pagination";
import { Paginator } from "primereact/paginator";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

const mockData = [
    { id: "670001", name: "Mr.A", department: "AAA", role: "Checker", email: "aaa@jtekt.co.th" },
    { id: "620028", name: "Mr.B", department: "AAA", role: "Manager", email: "bbb@jtekt.co.th" },
    { id: "610027", name: "Mr.C", department: "AAA", role: "DGM/GM", email: "ccc@jtekt.co.th" },
    { id: "350012", name: "Mr.D", department: "AAA", role: "Plant Manager", email: "ddd@jtekt.co.th" },
    { id: "570029", name: "Mr.E", department: "AAA", role: "Admin", email: "eee@jtekt.co.th" },
    { id: "600009", name: "Mr.F", department: "AAA", role: "Checker", email: "fff@jtekt.co.th" },
    { id: "320012", name: "Mr.G", department: "AAA", role: "Checker", email: "ggg@jtekt.co.th" },
];

export default function UserManagement() {
    const defaultUser = {
        id: '',
        name: '',
        department: '',
        role: '',
        email: '',
    }

    const defaultErrorUser = {
        id: false,
        name: false,
        department: false,
        role: false,
        email: false,
    }

    const [visibleAdd, setVisibleAdd] = useState<boolean>(false);
    const [addOrEdit, setAddOrEdit] = useState<'A'|'E'>('A');
    const [users, setUsers] = useState(mockData);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows, setTotalRows] = useState(10);
    const [newUser, setNewUser] = useState(defaultUser)
    const [iInvalid, setIInvalid] = useState(defaultErrorUser);

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
        setNewUser((old) => ({ ...old , [field]: e.target.value }))
    }

    const chechInvalid = () => {
        const inInvalid: any = {
            id: false,
            name: false,
            department: false,
            role: false,
            email: false,
        }
        if (!newUser.id) {
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
        setIInvalid(inInvalid);

        if(Object.keys(inInvalid).filter((x: any) => (inInvalid[x])).length) {
            return;
        }
        setVisibleAdd(false);
    }

    return (
        <div className="flex justify-center pt-6 px-6">
            <div className="container">
                <h1 className="text-2xl font-bold mb-4 mx-4">User Management</h1>
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
                    <Column field="id" header="รหัสพนักงาน" style={{ width: '10%' , textAlign: 'center' }}></Column>
                    <Column field="name" header="ชื่อพนักงาน" style={{ width: '35%' }}></Column>
                    <Column field="department" header="หน่วยงาน" style={{ width: '20%' }}></Column>
                    <Column field="role" header="Role" style={{ width: '15%', textAlign: 'center' }}></Column>
                    <Column field="email" header="Email" style={{ width: '20%' }}></Column>
                    <Column field="action" header="Action" style={{ width: '10%', textAlign: 'center' }} body={(arr) => {
                        return <div className="flex justify-center gap-2">
                            <Button icon="pi pi-pen-to-square" outlined onClick={()=> {
                                setNewUser(arr);
                                setAddOrEdit('E');
                                setVisibleAdd(true);
                            }} />
                            <Button icon="pi pi-trash" severity="danger" outlined onClick={() => {}} />
                            
                        </div>
                    }}></Column>
                </DataTable>
            </div>
            <Dialog header={addOrEdit == 'A' ? "Add User" : "Edit User"} visible={visibleAdd} onHide={() => { if (!visibleAdd) return; setVisibleAdd(false); }}
                style={{ width: '50vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }}>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2 w-full">
                        <label htmlFor="id">รหัสพนักงาน</label>
                        <InputText
                            id="id"
                            value={newUser.id}
                            invalid={iInvalid.id && !newUser.id}
                            onChange={(e) => handleInputChangeAdd(e, "id")}
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
                        <InputText
                            id="role"
                            value={newUser.role}
                            invalid={iInvalid.role && !newUser.role}
                            onChange={(e) => handleInputChangeAdd(e, "role")}
                            className="w-full"
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

                    
                    <div className='flex justify-end mt-2 w-full gap-2'>
                        <Button label="Add User" className="p-button-primary" onClick={chechInvalid} />
                    </div>
                </div>
            </Dialog>
            <Footer>
                <div className='flex justify-end mt-2 w-full gap-2'>
                    <Button label="Add New User" className="p-button-primary" onClick={addNewUser} />
                </div>
            </Footer>
        </div>
    );
}
