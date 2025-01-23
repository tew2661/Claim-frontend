'use client';
import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TemplatePaginator } from "@/components/template-pagination";
import { Paginator } from "primereact/paginator";
import Footer from "@/components/footer";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";

interface DataSummaryReportTable {
    id: number,
    qprNo: string,
    supplier: string,
    problem: string,
    importance: string,
    quickReport: string,
    report8D: string,
    status: string,
}

interface FilterSummaryReport {
    qprNo: string;
    month: Nullable<Date>;
    supplier: string;
    status: string;
}

const mockData: DataSummaryReportTable[] = [
    {
        id: 1,
        qprNo: "QPR-001",
        supplier: "Supplier A",
        problem: "สีหลุดลอกไม่สม่ำเสมอ",
        importance: "A",
        quickReport: "Approved 03/11/2024",
        report8D: "Approved 09/11/2024",
        status: "Wait for supplier submit final report",
    },
    {
        id: 2,
        qprNo: "QPR-002",
        supplier: "Supplier B",
        problem: "ผิวชิ้นงานขรุขระ",
        importance: "B",
        quickReport: "Approved 03/11/2024",
        report8D: "Wait for supplier",
        status: "Wait for supplier submit first report",
    },
    {
        id: 3,
        qprNo: "QPR-003",
        supplier: "Supplier C",
        problem: "วัสดุไม่ตรงตาม Spec",
        importance: "C",
        quickReport: "Approved 03/11/2024",
        report8D: "Approved 09/11/2024",
        status: "Wait for final report approve",
    },
    {
        id: 4,
        qprNo: "QPR-004",
        supplier: "Supplier D",
        problem: "สีเพี้ยนไปจาก Standard",
        importance: "SP",
        quickReport: "Approved 03/11/2024",
        report8D: "Approved 09/11/2024",
        status: "Approved",
    },
    {
        id: 5,
        qprNo: "QPR-005",
        supplier: "Supplier E",
        problem: "ความแข็งแรงต่ำกว่ามาตรฐาน",
        importance: "Urgent",
        quickReport: "Approved 03/11/2024",
        report8D: "Approved 09/11/2024",
        status: "Completed",
    },
];

export default function SummaryReport() {
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows, setTotalRows] = useState(10);
    const [filters, setFilters] = useState<FilterSummaryReport>({
        qprNo: "",
        month: null,
        supplier: "",
        status: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFilters({ ...filters, [field]: e.target.value });
    };

    const exportToExcel = () => {
        // Add logic to export data to Excel here
        console.log("Exporting to Excel...");
    };

    return (
        <div className="flex justify-center pt-6 px-6">
            {/* Search Fields */}
            <div className="container">
                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-[calc(100%-100px)]">
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="month">Month</label>
                            <Calendar
                                id="month"
                                showIcon
                                value={filters.month}
                                view="month"
                                dateFormat="mm/yy"
                                onChange={(e) => setFilters({ ...filters, month: e.value })}
                                className="w-full"
                                style={{ padding: 0 }}
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="qprNo">QPR No</label>
                            <InputText
                                id="qprNo"
                                value={filters.qprNo}
                                onChange={(e) => handleInputChange(e, "qprNo")}
                                className="w-full"
                            />

                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="supplier">Supplier</label>
                            <InputText
                                id="supplier"
                                value={filters.supplier}
                                onChange={(e) => handleInputChange(e, "supplier")}
                                className="w-full"
                            />

                        </div>
                        <div className="flex flex-col gap-2 w-full">
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


                {/* Data Table */}
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
                    <Column field="problem" header="ปัญหา" bodyStyle={{ width: '30%' }}></Column>
                    <Column field="importance" header="Importance Level"></Column>
                    <Column field="quickReport" header="Quick Report"></Column>
                    <Column field="report8D" header="8D Report"></Column>
                    <Column field="status" header="Status" bodyStyle={{ width: '20%' }}></Column>
                </DataTable>

                {/* Export Button */}
                <Footer>
                    <div className='flex justify-end mt-2 w-full gap-2'>
                        <Button label="Export AS Excel" className="p-button-success min-w-[150px]" onClick={exportToExcel} />
                    </div>
                </Footer>
            </div>

        </div>
    );
}
