'use client';
import React, { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { Calendar } from "primereact/calendar";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { CreateQueryString, Get } from "@/components/fetch";
import moment from "moment";
import { FormDataQpr, Defect } from "../create-qpr/page";
import { Toast } from "primereact/toast";
import { getSocket } from "@/components/socket/socket";
import { Socket } from "socket.io-client";
import { Dialog } from "primereact/dialog";

interface DataHistoryTable {
    id: number,
    qprNo: string,
    documentType: string,
    action: string,
    performedBy: any
    performedAt: string,
    remark: string
}

interface DataActionList {
    date: string,
    qprNo: string,
    problem: string,
    severity: string,
    quickReport: string,
    quickReportClass: "text-green-600" | "text-red-600" | "text-yellow-500",
    report8D: string,
}

interface FilterTable {
    date?: Date,
    qprNo: string,
    severity: string,
    status: string
}

export default function ProblemReportTable() {
    const toast = useRef<Toast>(null);
    const [qprList, setQprList] = useState<DataActionList[]>([])
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows, setTotalRows] = useState(10);
    const [filters, setFilters] = useState<FilterTable>({
        date: undefined,
        qprNo: "",
        severity: "All",
        status: "All"
    })

    const quickReportBodyTemplate = (rowData: any) => {
        return (
            <div
                className={`font-bold w-[170px] ${rowData.quickReportClass === "text-green-600"
                    ? "text-green-600"
                    : rowData.quickReportClass === "text-red-600"
                        ? "text-red-600"
                        : "text-yellow-500"
                    }`}
            >
                {rowData.quickReport}
            </div>
        );
    };

    const report8DBodyTemplate = (rowData: any) => {
        return (
            <div
                className={`font-bold w-[170px] ${rowData.report8DClass === "text-green-600"
                    ? "text-green-600"
                    : rowData.report8DClass === "text-red-600"
                        ? "text-red-600"
                        : "text-yellow-500"
                    }`}
            >
                {rowData.report8D}
            </div>
        );
    };

    function replaceStatusName(quickReportSupplierStatus?: string, quickReportStatus?: string, delayDocument?: string): string {
        console.log(quickReportSupplierStatus, quickReportStatus)
        const replacements: Record<string, string> = {
            "Approved-Quick Report-Approved": "Submitted",
            "Approved-Quick Report-Pending": "Submitted",
            "Approved-Quick Report-Completed": "Approved"
        };
        const result = replacements[`${quickReportSupplierStatus}-${delayDocument}-${quickReportStatus || ''}`] ? `${replacements[`${quickReportSupplierStatus}-${delayDocument}-${quickReportStatus || ''}`]}` : (quickReportSupplierStatus || '')
        const replacements2: Record<string, string> = {
            "Save": "Pending",
        };
        return replacements2[result] ? `${replacements2[result]}` : result;
    }

    function replaceStatusName2(quickReportSupplierStatus?: string, quickReportStatus?: string, delayDocument?: string): string {
        console.log(quickReportSupplierStatus, quickReportStatus)
        const replacements: Record<string, string> = {
            "Approved-8D Report-Approved": "Submitted",
            "Approved-8D Report-Pending": "Submitted",
            "Approved-8D Report-Completed": "Approved"
        };
        const result = replacements[`${quickReportSupplierStatus}-${delayDocument}-${quickReportStatus || ''}`] ? `${replacements[`${quickReportSupplierStatus}-${delayDocument}-${quickReportStatus || ''}`]}` : (quickReportSupplierStatus || '')
        const replacements2: Record<string, string> = {
            "Save": "Pending",
        };
        return replacements2[result] ? `${replacements2[result]}` : result;
    }

    const GetDatas = async () => {
        const quertString = CreateQueryString({
            ...filters,
            date: filters.date ? moment(filters.date).format('YYYY-MM-DD') : undefined,
        });
        const res = await Get({ url: `/qpr?limit=${rows}&offset=${first}&page=action-list&${quertString}` });
        if (res.ok) {
            const res_data = await res.json();
            setTotalRows(res_data.total || 0)
            setQprList((res_data.data || []).map((x: FormDataQpr) => {
                return {
                    id: x.id,
                    date: x.dateReported ? moment(x.dateReported).format('DD/MM/YYYY HH:mm:ss') : '',
                    qprNo: x.qprIssueNo || '',
                    problem: x.defectiveContents.problemCase || '',
                    severity: (x.importanceLevel || '') + (x.urgent ? ` (Urgent)` : ''),
                    quickReport: `${x.quickReportSupplierDate ? `${moment(x.quickReportSupplierDate).format('DD/MM/YYYY HH:mm:ss')}` : ""} ${x.quickReportSupplierStatus ? ` (${replaceStatusName(x.quickReportSupplierStatus, x.quickReportStatus, x.delayDocument)})` : ''}`,
                    quickReportClass: replaceStatusName(x.quickReportSupplierStatus, x.quickReportStatus, x.delayDocument) == "Approved" ? "text-green-600" : (replaceStatusName(x.quickReportSupplierStatus, x.quickReportStatus, x.delayDocument) == "Rejected" ? "text-red-600" : "text-yellow-600"),
                    report8D: `${x.eightDReportSupplierDate ? moment(x.eightDReportSupplierDate).format('DD/MM/YYYY HH:mm:ss') : ''}${x.eightDReportSupplierStatus ? ` (${replaceStatusName2(x.eightDReportSupplierStatus, x.eightDReportStatus, x.delayDocument)})` : '-'}`,
                    report8DClass: replaceStatusName2(x.eightDReportSupplierStatus, x.eightDReportStatus, x.delayDocument) == "Approved" ? "text-green-600" : (replaceStatusName2(x.eightDReportSupplierStatus, x.eightDReportStatus, x.delayDocument) == "Rejected" ? "text-red-600" : "text-yellow-600"),
                }
            }))
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
    }

    const socketRef = useRef<Socket | null>(null);
    const SocketConnect = () => {
        if (!socketRef.current) {
            socketRef.current = getSocket();
        }

        const socket = socketRef.current;

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

    useEffect(() => {
        GetDatas()
    }, [first, rows])

    const [visibleHistory, setVisibleHistory] = useState<boolean>(false);
    const [selectedReportHistory, setSelectedReportHistory] = useState<DataHistoryTable[]>([]);

    const [firstHistory, setFirstHistory] = useState(0);
    const [rowsHistory, setRowsHistory] = useState(10);
    const [totalRowsHistory, setTotalRowsHistory] = useState(10);
    const [qprNo, setQprNo] = useState<string>('');
    const fetchReportHistory = async (qprNo: string, openHistory?: boolean) => {
        setQprNo(qprNo);
        const res = await Get({ url: `/logs?limit=${rowsHistory}&offset=${firstHistory}&qprNo=${qprNo}` });
        if (res.ok) {
            const res_data = await res.json();
            setTotalRowsHistory(res_data.total || 0);
            setSelectedReportHistory((res_data.data || []).map((x: any) => {
                return {
                    ...x,
                    performedAt: x.performedAt ? moment(x.performedAt).format('DD/MM/YYYY HH:mm:ss') : ""
                } as DataHistoryTable;
            }));
            setVisibleHistory(openHistory || false);
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
    };

    useEffect(() => {
        if (qprNo)
            fetchReportHistory(qprNo);
    }, [firstHistory, rowsHistory])

    return (
        <div className="flex justify-center pt-6 px-6">
            <Toast ref={toast} />
            <Dialog header="Report History" visible={visibleHistory} style={{ width: '90vw' }} onHide={() => setVisibleHistory(false)}>
                <div>
                    <DataTable
                        value={selectedReportHistory}
                        showGridlines
                        className='table-header-center'
                        footer={<Paginator
                            first={firstHistory}
                            rows={rowsHistory}
                            totalRecords={totalRowsHistory}
                            template={TemplatePaginator}
                            rowsPerPageOptions={[10, 20, 50, 100]}
                            onPageChange={(event) => {
                                setFirstHistory(event.first);
                                setRowsHistory(event.rows);
                            }} />}
                    >
                        <Column field="qprNo" header="QPR No." bodyStyle={{ width: '10%' }}></Column>
                        <Column field="documentType" header="Document Type" bodyStyle={{ width: '10%' }}></Column>
                        <Column field="action" header="Action" body={(data) => {
                            return <>{data.action} {data.IsDocumentOther == 'Y' ? "(Doc Other)" : ""}</>
                        }} bodyStyle={{ width: '10%' }}></Column>
                        {/* <Column field="roleType" header="Action Role" bodyStyle={{ width: '10%' }}></Column>
                        <Column field="performedBy.name" header="Action By" bodyStyle={{ width: '10%' }}></Column> */}
                        <Column field="performedAt" header="Action Date" bodyStyle={{ width: '10%' }}></Column>
                        <Column field="remark" header="Remark" bodyStyle={{ width: '25%' }}></Column>
                    </DataTable>
                </div>
            </Dialog>
            <div className="container">
                <div className="rounded-lg">
                    <div className="mx-4 mb-4 text-2xl font-bold py-3 border-solid border-t-0 border-x-0 border-b-2 border-gray-600">
                        Action List
                    </div>
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
                                    Important Level
                                </label>
                                <Dropdown
                                    value={filters.severity}
                                    onChange={(e: DropdownChangeEvent) => setFilters({ ...filters, severity: e.target.value || "" })}
                                    options={[
                                        { label: 'All', value: 'All' },
                                        { label: 'SP', value: 'SP' },
                                        { label: 'A', value: 'A' },
                                        { label: 'B', value: 'B' },
                                        { label: 'C', value: 'C' },
                                    ]}
                                    optionLabel="label"
                                    className="w-full"
                                />
                                {/* <InputText 
                                    id="severity" 
                                    className="w-full" 
                                    value={filters.severity}
                                    onChange={(e) => setFilters({ ...filters, severity: e.target.value || "" })}
                                /> */}
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="status" className="font-bold mb-2">
                                    Status
                                </label>
                                {/* "Approved" | "Wait for Supplier" | "Rejected" */}
                                <Dropdown
                                    value={filters.status}
                                    onChange={(e: DropdownChangeEvent) =>
                                        setFilters({ ...filters, status: e.value || "" })
                                    }
                                    className="w-full"
                                    optionLabel="label" 
                                    optionGroupLabel="label"
                                    optionGroupChildren="items"
                                    optionGroupTemplate={(option) => {
                                        return (
                                            <div className="flex align-items-center">
                                                <div className="font-bold">{option.label}</div>
                                            </div>
                                        );
                                    }}
                                    options={[
                                        {
                                            label: undefined,
                                            items: [
                                                { label: 'All', value: 'All' , className: 'font-bold' },
                                            ] 
                                        },
                                        {
                                            label: 'QuickReport',
                                            items: [
                                                { label: 'Pending [QuickReport]', value: 'wait-for-supplier-quick-report', className: 'ml-2' },
                                                { label: 'Submitted [QuickReport]', value: 'submitted-quick-report', className: 'ml-2' },
                                                { label: 'Approved [QuickReport]', value: 'approved-quick-report', className: 'ml-2' },
                                                { label: 'Rejected [QuickReport]', value: 'rejected-quick-report', className: 'ml-2' },
                                            ]
                                        },
                                        {
                                            label: '8D Report',
                                            items: [
                                                { label: 'Pending [8D Report]', value: 'wait-for-supplier-8d-report', className: 'ml-2' },
                                                { label: 'Submitted [8D Report]', value: 'submitted-8d-report', className: 'ml-2' },
                                                { label: 'Approved [8D Report]', value: 'approved-8d-report', className: 'ml-2' },
                                                { label: 'Rejected [8D Report]', value: 'rejected-8d-report', className: 'ml-2' },
                                            ]
                                        },
                                    ]}
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

                    {/* Table */}
                    <DataTable
                        value={qprList}
                        showGridlines
                        className='table-header-center mt-4'
                        onRowClick={(e) => fetchReportHistory(e.data.qprNo, true)}
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
                        <Column field="qprNo" header="QPR No" />
                        <Column field="problem" header="Problem" bodyStyle={{ width: '30%' }} />
                        <Column field="severity" header="Important Level" bodyStyle={{ textAlign: 'center' }} />
                        <Column
                            field="quickReport"
                            header="Quick Report"
                            body={quickReportBodyTemplate}

                        />
                        <Column field="report8D" header="8D Report" body={report8DBodyTemplate} />
                    </DataTable>
                </div>
            </div>
        </div>

    );
}
