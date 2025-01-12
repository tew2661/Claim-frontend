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
    { supplierCode: "670001", supplierName: "Mr.A", tel: '09293939393', email: ["aaa@jtekt.co.th"] },
    { supplierCode: "620028", supplierName: "Mr.B", tel: '09293939393', email: ["bbb@jtekt.co.th"] },
    { supplierCode: "610027", supplierName: "Mr.C", tel: '09293939393', email: ["ccc@jtekt.co.th"] },
    { supplierCode: "350012", supplierName: "Mr.D", tel: '09293939393', email: ["ddd@jtekt.co.th"] },
    { supplierCode: "570029", supplierName: "Mr.E", tel: '09293939393', email: ["eee@jtekt.co.th"] },
    { supplierCode: "600009", supplierName: "Mr.F", tel: '09293939393', email: ["fff@jtekt.co.th"] },
    { supplierCode: "320012", supplierName: "Mr.G", tel: '09293939393', email: ["ggg@jtekt.co.th"] },
];

export default function UserManagement() {
    const defaultNewData = {
        supplierCode: '',
        supplierName: '',
        tel: '',
        email: [''],
        contact_person: ''
    }
    const defaultErrorSupplier = {
        supplierCode: false,
        supplierName: false,
        tel: false,
        email: [false],
        contact_person: false
    }
    const [visibleAdd, setVisibleAdd] = useState<boolean>(false);
    const [addOrEdit, setAddOrEdit] = useState<'A'|'E'>('A');
    const [supplier, setSupplier] = useState(mockData);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows, setTotalRows] = useState(10);
    const [newSupplier, setNewSupplier] = useState(defaultNewData);
    const [iInvalid, setIInvalid] = useState(defaultErrorSupplier);

    const addNewUser = () => {
        // Logic สำหรับการเพิ่มผู้ใช้ใหม่ (เปิด Modal หรือไปยังหน้าเพิ่มผู้ใช้งาน)
        console.log("Add New User clicked");
        setNewSupplier(defaultNewData);
        setIInvalid(defaultErrorSupplier);
        setAddOrEdit('A');
        setVisibleAdd(true);
    };

    const handleInputChangeAdd = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setNewSupplier((old) => ({ ...old, [field]: e.target.value }))
    }

    const checkInvalid = () => {
        const inInvalid: any = {
            supplierCode: false,
            supplierName: false,
            tel: false,
            email: newSupplier.email.map(() => false),
            contact_person: false
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

        if (!newSupplier.contact_person) {
            inInvalid.contact_person = true
        }

        const hasInvalidFields = Object.keys(inInvalid).some((key) => {
            if (key === "email") {
                return inInvalid.email.some((emailInvalid: boolean) => emailInvalid);
            }
            return inInvalid[key];
        });

        setIInvalid(inInvalid); 
        if (hasInvalidFields) {
            console.log("Validation failed:", inInvalid);
            return; 
        }
        
        setVisibleAdd(false);
    }

    return (
        <div className="flex justify-center pt-6 px-6">
            <div className="container">
                <h1 className="text-2xl font-bold mb-4 mx-4">Supplier Management</h1>
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
                        return <div className="flex gap-2">{(rowData.email || []).map((x: string, index: number) => {
                            return <div key={'email-' + index}>{x}</div>
                        })}</div>
                    }}></Column>
                    <Column field="action" header="Action" style={{ width: '10%', textAlign: 'center' }} body={(arr) => {
                        return <div className="flex justify-center gap-2"> 
                            <Button icon="pi pi-pen-to-square" outlined onClick={()=> {
                                setNewSupplier(arr);
                                setAddOrEdit('E');
                                setVisibleAdd(true);
                            }} />
                            <Button icon="pi pi-trash" severity="danger" outlined onClick={() => {}} />
                        </div>
                    }}></Column>
                </DataTable>
            </div>
            <Dialog header={addOrEdit == 'A' ? "Add Supplier" : "Edit Supplier"} visible={visibleAdd} onHide={() => { if (!visibleAdd) return; setVisibleAdd(false); }}
                style={{ width: '50vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }}>
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
                                    <div className="flex flex-col gap-2 w-[calc(100%-100px)]">
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
                                        <div className="w-[100px] flex items-end">
                                            <Button
                                                label="ADD"
                                                icon="pi pi-plus"
                                                onClick={() => {
                                                    setNewSupplier((prev) => ({
                                                        ...prev,
                                                        email: [...prev.email, ""],
                                                    }));
                                                }}
                                                className="p-button-success"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-[100px] flex items-end">
                                            <Button
                                                icon="pi pi-times"
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
                    <div className="flex flex-col gap-2 w-full">
                        <label htmlFor="contact_person">Contact Person</label>
                        <InputText
                            id="contact_person"
                            value={newSupplier.contact_person}
                            invalid={iInvalid.contact_person && !newSupplier.contact_person}
                            onChange={(e) => handleInputChangeAdd(e, "contact_person")}
                            className="w-full"
                        />
                    </div>
                    <div className='flex justify-end mt-2 w-full gap-2'>
                        <Button label="Add Supplier" className="p-button-primary" onClick={checkInvalid} />
                    </div>
                </div>
            </Dialog>
            <Footer>
                <div className='flex justify-end mt-2 w-full gap-2'>
                    <Button label="Add New Supplier" className="p-button-primary min-w-[150px]" onClick={addNewUser} />
                </div>
            </Footer>
        </div>
    );
}
