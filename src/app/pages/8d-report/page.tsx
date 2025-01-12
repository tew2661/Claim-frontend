'use client';
import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { Calendar } from "primereact/calendar";
import { useRouter } from "next/navigation";

interface DataActionList {
    id: number,
    date: string,
    problem: string,
    severity: string,
    report8D: string,
    quickReportClass: "text-green-600" | "text-red-600" | "text-yellow-500",
    success?: boolean
}

interface FilterTable {
    date?: Date,
    severity: string,
    status: string
}

export default function ProblemReportTable() {
    const router = useRouter()
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows,] = useState(10);
    const [filters, setFilters] = useState<FilterTable>({
        date: undefined,
        severity: "",
        status: ""
    })
    const data: DataActionList[] = [
        {
            id: 1,
            date: "08/11/2024",
            problem: "สีหลุด",
            severity: "A",
            report8D: "Issue and sent",
            quickReportClass: "text-green-600",
            success: true
        },
        {
            id: 2,
            date: "08/11/2024",
            problem: "ผิวชิ้นงานไม่เรียบ",
            severity: "B",
            report8D: "Pending",
            quickReportClass: "text-yellow-500",
        },
        {
            id: 3,
            date: "08/11/2024",
            problem: "สีเพี้ยน",
            severity: "C",
            report8D: "Delay",
            quickReportClass: "text-red-600",
        },
    ];

    const quickReportBodyTemplate = (rowData: any) => {
        return (
            <span
                className={`font-bold ${rowData.quickReportClass === "text-green-600"
                    ? "text-green-600"
                    : rowData.quickReportClass === "text-red-600"
                        ? "text-red-600"
                        : "text-yellow-500"
                    }`}
            >
                {rowData.report8D}
            </span>
        );
    };

    return (
        <div className="flex justify-center pt-6 px-6">
            <div className="container">
                <div className="p-4 rounded-lg">
                    {/* Filters */}
                    <div className="flex gap-2 mx-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-[calc(100%-100px)]">

                            <div className="flex flex-col">
                                <label htmlFor="date" className="font-bold mb-2">
                                    Date
                                </label>
                                <Calendar
                                    id="date"
                                    showIcon
                                    value={filters.date}
                                    dateFormat="dd/mm/yy"
                                    onChange={(e) => setFilters({ ...filters, date: e.value || undefined })}
                                    className="w-full"
                                    showButtonBar
                                    style={{ padding: 0 }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="severity" className="font-bold mb-2">
                                    ระดับความรุนแรง
                                </label>
                                <InputText 
                                    id="severity" 
                                    className="w-full" 
                                    value={filters.severity}
                                    onChange={(e) => setFilters({ ...filters, severity: e.target.value || "" })}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="status" className="font-bold mb-2">
                                    Status
                                </label>
                                <InputText 
                                    id="status" 
                                    className="w-full" 
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value || "" })}
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

                    {/* Table */}
                    <DataTable
                        value={data}
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
                        <Column field="date" header="Date"  />
                        <Column field="problem" bodyStyle={{ width: '40%' }} header="ปัญหา"  />
                        <Column field="severity" header="ระดับความรุนแรง" bodyStyle={{ textAlign: 'center' }} />
                        <Column
                            field="report8D"
                            header="8D report"
                            body={quickReportBodyTemplate}
                            
                        />
                        <Column field="action" header="" bodyStyle={{ textAlign: 'center', width: '10%' , minWidth: '180px' }} body={(rowData: DataActionList) => {
                            if (rowData.success) {
                                return <div className="min-h-[32px]">&nbsp;</div>
                            } else {
                                return <Button label="Input Data" icon="pi pi-file-edit" onClick={() => router.push(`8d-report/detail/${rowData.id}`) } />
                            }
                            
                        }} />
                    </DataTable>
                </div>
            </div>
        </div>

    );
}
