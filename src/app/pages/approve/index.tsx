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
import { useRouter } from "next/navigation";

interface FilterApprove {
    qprNo: string,
    supplier: string;
    reportType: string;
    status: string;
}

interface DataQPR {
    id: number,
    qprNo: string,
    date: string,
    supplier: string,
    reportType: string,
    problem: string,
    importance: string,
    status: string,
}

const mockData: DataQPR[] = [
    {
        id: 1,
        qprNo: 'QPR-001',
        date: "11/11/2024",
        supplier: "Supplier A",
        reportType: "Quick Report",
        problem: "สีหลุดลอกไม่สม่ำเสมอ",
        importance: "SP",
        status: "Pending",
    },
    {
        id: 2,
        qprNo: 'QPR-002',
        date: "11/11/2024",
        supplier: "Supplier B",
        reportType: "8D Report",
        problem: "ผิวชิ้นงานขรุขระ",
        importance: "A",
        status: "Pending",
    },
    {
        id: 3,
        qprNo: 'QPR-003',
        date: "11/11/2024",
        supplier: "Supplier C",
        reportType: "8D Report",
        problem: "วัสดุไม่ตรงตามสเปค",
        importance: "B",
        status: "Pending",
    },
    {
        id: 4,
        qprNo: 'QPR-004',
        date: "11/11/2024",
        supplier: "Supplier D",
        reportType: "8D Report",
        problem: "สีเพี้ยนไปจาก Standard",
        importance: "C",
        status: "Approved",
    },
    {
        id: 5,
        qprNo: 'QPR-005',
        date: "11/11/2024",
        supplier: "Supplier E",
        reportType: "8D Report",
        problem: "ความแข็งแรงต่ำกว่ามาตรฐาน",
        importance: "C (Urgent)",
        status: "Approved",
    },
];

export default function ApprovedTable(props: { page: 1 | 2 | 3 }) {
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRows, ] = useState<number>(10);
    const router = useRouter()

    const [filters, setFilters] = useState<FilterApprove>({
        qprNo: "",
        supplier: "",
        reportType: "",
        status: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFilters({ ...filters, [field]: e.target.value });
    };

    const actionBodyTemplate = (rowData: DataQPR) => {
        return (
            <Button label="View" className="p-button-primary" outlined onClick={() => router.push(`detail/checker${props.page}/${rowData.id}`) } />
        );
    };

    return (
        <div className="flex justify-center pt-6 px-6">
            <div className="container">
                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-[calc(100%-100px)]">
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="qprNo">QPR No.</label>
                            <InputText
                                id="qprNo"
                                value={filters.qprNo}
                                onChange={(e) => handleInputChange(e, "qprNo")}
                                className="w-full"
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
                    <Column field="qprNo" header="QPR No."></Column>
                    <Column field="supplier" header="Supplier"></Column>
                    <Column field="reportType" header="Report Type"></Column>
                    <Column field="problem" header="ปัญหา" bodyStyle={{ width: '30%' }}></Column>
                    <Column field="importance" header="Importance Level"></Column>
                    <Column field="status" header="Status" bodyStyle={{ textAlign: 'center' }}></Column>
                    <Column body={actionBodyTemplate} header="" bodyStyle={{ textAlign: 'center' }}></Column>
                </DataTable>
            </div>

        </div>
    );
}
