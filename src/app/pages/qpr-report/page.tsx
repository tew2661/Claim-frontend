'use client';
import React, { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { Calendar } from "primereact/calendar";
import { useRouter } from "next/navigation";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { CreateQueryString, Get } from "@/components/fetch";
import moment from "moment";
import { FormDataQpr, Defect } from "../create-qpr/page";
import { Toast } from "primereact/toast";
import { getSocket } from "@/components/socket/socket";

interface DataActionList {
    id: number,
    date: string,
    qprNo: string,
    problem: string,
    severity: string,
    quickReport: string,
    quickReportClass: "text-green-600" | "text-red-600" | "text-yellow-500",
    success?: boolean
}

interface FilterTable {
    date?: Date,
    qprNo: string,
    severity: string,
    status: string
}

export default function ProblemReportTable() {
    const router = useRouter()
    const toast = useRef<Toast>(null);
    const [qprList, setQprList] = useState<DataActionList[]>([])
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows, setTotalRows] = useState(10);
    const [filters, setFilters] = useState<FilterTable>({
        date: undefined,
        qprNo: "",
        severity: "All",
        status: ""
    })
    const data: DataActionList[] = [
        {
            id: 1,
            qprNo: "QRP-001",
            date: "08/11/2024",
            problem: "สีหลุด",
            severity: "A",
            quickReport: "Issue and sent",
            quickReportClass: "text-green-600",
            success: true
        },
        {
            id: 2,
            qprNo: "QRP-002",
            date: "08/11/2024",
            problem: "ผิวชิ้นงานไม่เรียบ",
            severity: "B",
            quickReport: "Pending",
            quickReportClass: "text-yellow-500",
        },
        {
            id: 3,
            qprNo: "QRP-003",
            date: "08/11/2024",
            problem: "สีเพี้ยน",
            severity: "C",
            quickReport: "Delay",
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
                {rowData.quickReport}
            </span>
        );
    };

    const GetDatas = async () => {
        const quertString = CreateQueryString({
            ...filters,
            date: filters.date ? moment(filters.date).format('YYYY-MM-DD') : undefined,
        });
        const res = await Get({ url: `/qpr?limit=${rows}&offset=${first}&${quertString}` });
        if (res.ok) {
            const res_data = await res.json();
            setTotalRows(res_data.total || 0)
            setQprList((res_data.data || []).map((x: FormDataQpr) => {
                return {
                    id: x.id,
                    date: x.dateReported ? moment(x.dateReported).format('DD/MM/YYYY') : '',
                    qprNo: x.qprIssueNo || '',
                    problem: ((Object.keys(x.defect) as Array<keyof Defect>).map((y: keyof Defect) => {
                        if (y == 'other') {
                            return x.defect.otherDetails
                        } else if (y !== 'otherDetails') {
                            return x.defect[y] ? y : ''
                        } else {
                            return ''
                        }
                    })).filter((z) => z).join(' , '),
                    severity: (x.importanceLevel || '') + (x.urgent ? ` (Urgent)` : ''),
                    quickReport: `${x.quickReportDate ? `${moment(x.quickReportDate).format('DD/MM/YYYY')}` : ""} ${x.quickReportStatus ? `(${x.quickReportStatus})`: ''}`,
                    quickReportClass: x.quickReportStatus == "Approved" ? "text-green-600" : (x.quickReportStatus == "Pending" ? "text-yellow-600" : "text-yellow-600"),
                    report8D: `${x.eightDReportDate ? moment(x.eightDReportDate).format('DD/MM/YYYY') : ''}${x.eightDReportStatus ? `(${x.eightDReportStatus})` : ''}`,
                }
            }))
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
    }

    const SocketConnect = () => {
        const socket = getSocket();
        // Listen for an event
        socket.on("create-qpr", (data: any) => {
            GetDatas();
        });

        // Cleanup on unmount
        return () => {
            socket.off("create-qpr");
        };
    }

    useEffect(() => {
        GetDatas()
        SocketConnect();
    }, [])

    return (
        <div className="flex justify-center pt-6 px-6">
            <Toast ref={toast} />
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
                                <label htmlFor="qprNo" className="font-bold mb-2">
                                    QPR No
                                </label>
                                <InputText 
                                    id="qprNo" 
                                    className="w-full" 
                                    value={filters.qprNo}
                                    onChange={(e) => setFilters({ ...filters, qprNo: e.target.value || "" })}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="severity" className="font-bold mb-2">
                                    ระดับความรุนแรง
                                </label>
                                <Dropdown 
                                    value={filters.severity} 
                                    onChange={(e: DropdownChangeEvent) => setFilters({ ...filters, severity: e.target.value || "" })} 
                                    options={[
                                        { label: 'All' , value: 'All'}, 
                                        { label: 'SP' , value: 'SP'}, 
                                        { label: 'A' , value: 'A' } ,
                                        { label: 'B' , value: 'B' },
                                        { label: 'C' , value: 'C' },
                                    ]} 
                                    optionLabel="label" 
                                    className="w-full" 
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
                                <Button label="Search" icon="pi pi-search" onClick={() => GetDatas() } />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <DataTable
                        value={qprList}
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
                        <Column field="date" header="Date" bodyStyle={{ width: '10%' }} />
                        <Column field="qprNo" header="QPR No"  />
                        <Column field="problem" bodyStyle={{ width: '30%' }} header="ปัญหา"  />
                        <Column field="severity" header="ระดับความรุนแรง" bodyStyle={{ textAlign: 'center' }} />
                        <Column
                            field="quickReport"
                            header="Quick report"
                            body={quickReportBodyTemplate}
                            
                        />
                        <Column field="action" header="" bodyStyle={{ textAlign: 'center', width: '10%' , minWidth: '180px' }} body={(rowData: DataActionList) => {
                            if (rowData.success) {
                                return <div className="min-h-[32px]">&nbsp;</div>
                            } else {
                                return <Button label="Input Data" icon="pi pi-file-edit" onClick={() => router.push(`qpr-report/detail/${rowData.id}`) } />
                            }
                            
                        }} />
                    </DataTable>
                </div>
            </div>
        </div>

    );
}
