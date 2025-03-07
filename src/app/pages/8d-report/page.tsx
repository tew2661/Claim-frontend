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
import { FormDataQpr } from "../create-qpr/page";
import { getSocket } from "@/components/socket/socket";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Socket } from "socket.io-client";

// Interface for action list data
interface DataActionList {
    id?: number,
    date: string,
    qprNo: string,
    problem: string,
    severity: string,
    eightDReport: string,
    eightDReportClass: "text-green-600" | "text-red-600" | "text-yellow-500",
    success?: boolean
}

// Interface for table filters
interface FilterTable {
    date?: Date,
    qprNo: string,
    severity: string,
    status: string
}

export default function ProblemReportTable() {
    const router = useRouter();
    const toastRef = useRef<Toast>(null);
    const [qprList, setQprList] = useState<DataActionList[]>([]);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows, setTotalRows] = useState(10);
    const [filters, setFilters] = useState<FilterTable>({
        date: undefined,
        qprNo: "",
        severity: "All",
        status: "All",
    });

    // Template for rendering the 8D report column
    const renderEightDReport = (rowData: DataActionList) => {
        return (
            <div className={`font-bold w-[170px] ${rowData.eightDReportClass}`}>{rowData.eightDReport}</div>
        );
    };

    // Replace status names with more user-friendly terms
    function getFriendlyStatusName(status: string): string {
        const statusMap: Record<string, string> = {
            "Approved": "Submitted",
        };
        return statusMap[status] || status;
    }

    // Fetch data from the server
    const fetchData = async () => {
        const queryString = CreateQueryString({
            ...filters,
            date: filters.date ? moment(filters.date).format('YYYY-MM-DD') : undefined,
            page: '8d-report'
        });
        const response = await Get({ url: `/qpr?limit=${rows}&offset=${first}&${queryString}` });
        if (response.ok) {
            const data = await response.json();
            setTotalRows(data.total || 0);
            setQprList(data.data.map((item: FormDataQpr) => mapToDataActionList(item)));
        } else {
            showErrorToast(await response.json());
        }
    };

    // Map API response to DataActionList
    function mapToDataActionList(item: FormDataQpr): DataActionList {
        return {
            id: item.id,
            date: item.dateReported ? moment(item.dateReported).format('DD/MM/YYYY HH:mm:ss') : '',
            qprNo: item.qprIssueNo || '',
            problem: item.defectiveContents.problemCase || '',
            severity: `${item.importanceLevel || ''}${item.urgent ? ' (Urgent)' : ''}`,
            eightDReport: `${item.eightDReportSupplierDate ? moment(item.eightDReportSupplierDate).format('DD/MM/YYYY HH:mm:ss') : ''} ${item.eightDReportSupplierStatus ? `(${getFriendlyStatusName(item.eightDReportSupplierStatus)})` : ''}`,
            eightDReportClass: getEightDReportClass(item.eightDReportSupplierStatus),
            success: item.eightDReportSupplierStatus === "Approved"
        };
    }

    // Determine the CSS class for the 8D report status
    function getEightDReportClass(status?: string): "text-green-600" | "text-red-600" | "text-yellow-500" {
        if (status === "Approved") return "text-green-600";
        if (status === "Pending" || status === "Save") return "text-yellow-500";
        return "text-red-600";
    }

    // Display an error toast
    function showErrorToast(error: any) {
        toastRef.current?.show({ severity: 'error', summary: 'Error', detail: JSON.stringify(error.message), life: 3000 });
    }

    const socketRef = useRef<Socket | null>(null);

    // Establish socket connection and set up event listeners
    const setupSocketConnection = () => {
        if (!socketRef.current) {
            socketRef.current = getSocket();
        }

        const socket = socketRef.current;
        socket.on("create-qpr", fetchData);
        socket.on("reload-status-reject-8d", updateQprList);

        // Cleanup on unmount
        return () => {
            socket.off("create-qpr");
            socket.off("reload-status-reject-8d");
        };
    };

    // Update the QPR list with new data
    function updateQprList(updatedItem: FormDataQpr) {
        setQprList((currentList) =>
            currentList.map((item) =>
                item.id === updatedItem.id ? mapToDataActionList(updatedItem) : item
            )
        );
    }

    useEffect(() => {
        fetchData();
        setupSocketConnection();
    }, []);

    useEffect(() => {
        fetchData();
    }, [first, rows]);

    return (
        <div className="flex justify-center pt-6 px-6">
            <Toast ref={toastRef} />
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
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="status" className="font-bold mb-2">
                                    Status
                                </label>
                                <Dropdown
                                    value={filters.status}
                                    onChange={(e: DropdownChangeEvent) => setFilters({ ...filters, status: e.target.value || "" })}
                                    options={[
                                        { label: 'All', value: 'All' },
                                        { label: 'Approved', value: 'approved-8d-report' },
                                        { label: 'Wait for Supplier', value: 'wait-for-supplier-8d-report' },
                                        { label: 'Rejected', value: 'rejected-8d-report' },
                                    ]}
                                    optionLabel="label"
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="w-[100px]">
                            <div className="flex flex-col gap-2">
                                <label>&nbsp;</label>
                                <Button label="Search" icon="pi pi-search" onClick={() => fetchData()} />
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
                        <Column field="qprNo" header="QPR No" />
                        <Column field="problem" bodyStyle={{ width: '30%' }} header="Problem" />
                        <Column field="severity" header="Important Level" bodyStyle={{ textAlign: 'center' }} />
                        <Column
                            field="eightDReport"
                            header="8D Report"
                            body={renderEightDReport}
                        />
                        <Column field="action" header="Action" bodyStyle={{ textAlign: 'center', width: '10%', minWidth: '180px' }} body={(rowData: DataActionList) => {
                            if (rowData.success) {
                                return <div className="min-h-[32px]">&nbsp;</div>
                            } else {
                                return <Button label="Input Data" icon="pi pi-file-edit" onClick={() => router.push(`8d-report/detail/${rowData.id}`)} />
                            }
                        }} />
                    </DataTable>
                </div>
            </div>
        </div>
    );
}
