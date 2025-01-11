'use client';
import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";

interface FilterDelay {
    supplier: string;
}

const mockData = [
    {
        supplier: "Supplier A",
        problem: "สีหลุดลอกไม่สม่ำเสมอ",
        importance: "A",
        delayDocument: "Final report",
        commitmentDate: "11/11/2024",
        delayDays: 5,
    },
    {
        supplier: "Supplier B",
        problem: "ผิวชิ้นงานขรุขระ",
        importance: "B",
        delayDocument: "First Report",
        commitmentDate: "10/11/2024",
        delayDays: 6,
    },
    {
        supplier: "Supplier C",
        problem: "วัสดุไม่ตรงตาม Spec",
        importance: "C",
        delayDocument: "Final Report",
        commitmentDate: "09/11/2024",
        delayDays: 7,
    },
    {
        supplier: "Supplier D",
        problem: "สีเพี้ยนไปจาก Standard",
        importance: "SP",
        delayDocument: "First Report",
        commitmentDate: "11/11/2024",
        delayDays: 5,
    },
    {
        supplier: "Supplier E",
        problem: "ความแข็งแรงต่ำกว่ามาตรฐาน",
        importance: "Urgent",
        delayDocument: "First Report",
        commitmentDate: "11/11/2024",
        delayDays: 5,
    },
];

export default function ReportTable() {
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows,] = useState(10);

    const [filters, setFilters] = useState<FilterDelay>({
        supplier: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFilters({ ...filters, [field]: e.target.value });
    };

    const actionBodyTemplate = () => {
        return (
            <Button label="View" className="p-button-primary" outlined />
        );
    };

    return (
        <div className="flex justify-center pt-6 px-6">
            <div className="container">
                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-[calc(100%-100px)]">
                        
                        <div className="flex flex-col gap-2">
                            <label htmlFor="supplier">Supplier</label>
                            <InputText
                                id="supplier"
                                value={filters.supplier}
                                onChange={(e) => handleInputChange(e, "supplier")}
                                className="w-full"
                            />
                            
                        </div>
                        
                    </div>
                    <div className="w-[100px]">
                        <div className="flex flex-col gap-2">
                            <label>&nbsp;</label>
                            <Button label="Search" icon="pi pi-search" />
                        </div>
                    </div>
                </div>

                <DataTable
                    value={mockData}
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
                        }} />}
                >
                    <Column field="supplier" header="Supplier"></Column>
                    <Column field="problem" header="ปัญหา"></Column>
                    <Column field="importance" header="Importance Level"></Column>
                    <Column field="delayDocument" header="Delay Document"></Column>
                    <Column field="commitmentDate" header="Commitment Date"></Column>
                    <Column field="delayDays" header="Delay (Date)" bodyStyle={{ textAlign: 'center' }}></Column>
                    {/* <Column body={actionBodyTemplate} header="" bodyStyle={{ textAlign: 'center' }}></Column> */}
                </DataTable>
            </div>

        </div>
    );
}
