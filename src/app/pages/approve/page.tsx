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

interface FilterApprove {
    date: Nullable<Date>;
    supplier: string;
    reportType: string;
    status: string;
}

const mockData = [
    {
        date: "11/11/2024",
        supplier: "Supplier A",
        reportType: "Quick Report",
        problem: "สีหลุดลอกไม่สม่ำเสมอ",
        importance: "SP",
        status: "Pending",
    },
    {
        date: "11/11/2024",
        supplier: "Supplier B",
        reportType: "8D Report",
        problem: "ผิวชิ้นงานขรุขระ",
        importance: "A",
        status: "Pending",
    },
    {
        date: "11/11/2024",
        supplier: "Supplier C",
        reportType: "8D Report",
        problem: "วัสดุไม่ตรงตามสเปค",
        importance: "B",
        status: "Pending",
    },
    {
        date: "11/11/2024",
        supplier: "Supplier D",
        reportType: "8D Report",
        problem: "สีเพี้ยนไปจาก Standard",
        importance: "C",
        status: "Approved",
    },
    {
        date: "11/11/2024",
        supplier: "Supplier E",
        reportType: "8D Report",
        problem: "ความแข็งแรงต่ำกว่ามาตรฐาน",
        importance: "Urgent",
        status: "Approved",
    },
];

export default function ReportTable() {
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows, setTotalRows] = useState(10);

    const [filters, setFilters] = useState<FilterApprove>({
        date: null,
        supplier: "",
        reportType: "",
        status: "",
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
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="date">Date</label>
                            <Calendar
                                id="date"
                                showIcon
                                value={filters.date}
                                dateFormat="dd/mm/yy"
                                onChange={(e) => setFilters({ ...filters, date: e.value })}
                                className="w-full"
                                style={{ padding: 0 }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="supplier">Supplier</label>
                            <InputText
                                id="supplier"
                                value={filters.supplier}
                                onChange={(e) => handleInputChange(e, "supplier")}
                                className="w-full"
                            />
                            
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="reportType">Report Type</label>
                            <InputText
                                id="reportType"
                                value={filters.reportType}
                                onChange={(e) => handleInputChange(e, "reportType")}
                                className="w-full"
                            />
                            
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="status">Status</label>
                            <InputText
                                id="status"
                                value={filters.status}
                                onChange={(e) => handleInputChange(e, "status")}
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
                    <Column field="date" header="Date"></Column>
                    <Column field="supplier" header="Supplier"></Column>
                    <Column field="reportType" header="Report Type"></Column>
                    <Column field="problem" header="ปัญหา"></Column>
                    <Column field="importance" header="Importance Level"></Column>
                    <Column field="status" header="Status" bodyStyle={{ textAlign: 'center' }}></Column>
                    <Column body={actionBodyTemplate} header="" bodyStyle={{ textAlign: 'center' }}></Column>
                </DataTable>
            </div>

        </div>
    );
}
