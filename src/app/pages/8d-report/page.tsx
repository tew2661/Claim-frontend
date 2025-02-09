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
import { CreateQueryString, Get } from "@/components/fetch";
import moment from "moment";
import { Toast } from "primereact/toast";
import { FormDataQpr, Defect } from "../create-qpr/page";
import { getSocket } from "@/components/socket/socket";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

interface DataActionList {
    id: number,
    date: string,
    qprNo: string,
    problem: string,
    severity: string,
    report8D: string,
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
        status: "All",
    })

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

    const GetDatas = async () => {
        const quertString = CreateQueryString({
            ...filters,
            date: filters.date ? moment(filters.date).format('YYYY-MM-DD') : undefined,
            page: '8d-report'
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
                    problem: x.defectiveContents.problemCase || '',
                    severity: (x.importanceLevel || '') + (x.urgent ? ` (Urgent)` : ''),
                    quickReport: `${x.eightDReportSupplierDate ? `${moment(x.eightDReportSupplierDate).format('DD/MM/YYYY')}` : ""} ${x.eightDReportSupplierStatus ? `(${x.eightDReportSupplierStatus})`: ''}`,
                    quickReportClass: x.eightDReportSupplierStatus == "Approved" ? "text-green-600" : (x.eightDReportSupplierStatus == "Pending" || x.eightDReportSupplierStatus == "Save" ? "text-yellow-600" : "text-yellow-600"),
                    report8D: `${x.eightDReportDate ? moment(x.eightDReportDate).format('DD/MM/YYYY') : ''}${x.eightDReportStatus ? `(${x.eightDReportStatus})` : '-'}`,
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
        SocketConnect()
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
                                <Dropdown 
                                    value={filters.status} 
                                    onChange={(e: DropdownChangeEvent) => setFilters({ ...filters, status: e.target.value || "" })} 
                                    options={[
                                        { label: 'All' , value: 'All'}, 
                                        { label: 'Approved' , value: 'approved-8d-report'}, 
                                        { label: 'Wait for Supplier' , value: 'wait-for-supplier-8d-report' } ,
                                        { label: 'Rejected' , value: 'rejected-8d-report' },
                                    ]} 
                                    optionLabel="label" 
                                    className="w-full" 
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
                            field="report8D"
                            header="8D Report"
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
