'use client';
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { useRouter } from "next/navigation";
import { CreateQueryString, Get } from "@/components/fetch";
import moment from "moment";
import { Toast } from "primereact/toast";
import { FormDataQpr, Defect } from "../create-qpr/page";
import { getSocket } from "@/components/socket/socket";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

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
    action?: boolean
}

export default function ApprovedTable(props: { checker: 1 | 2 | 3 }) {
    const toast = useRef<Toast>(null);
    const [qprList, setQprList] = useState<DataQPR[]>([])
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRows, setTotalRows] = useState<number>(10);
    const router = useRouter()

    const [filters, setFilters] = useState<FilterApprove>({
        qprNo: "",
        supplier: "All",
        reportType: "All",
        status: "All",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFilters({ ...filters, [field]: e.target.value });
    };

    const actionBodyTemplate = (rowData: DataQPR) => {
        if (rowData.action) {
            return (
                <Button label="View" className="p-button-primary" outlined onClick={() => router.push(`detail/checker${props.checker}/${rowData.id}`)} />
            );
        } else {
            return <div className="w-[100px]">&nbsp;</div>
        }

    };

    const GetDatas = async () => {
        const quertString = CreateQueryString({
            ...filters,
        });
        const res = await Get({ url: `/qpr?limit=${rows}&offset=${first}&${quertString}` });
        if (res.ok) {
            const res_data = await res.json();
            setTotalRows(res_data.total || 0)
            setQprList((res_data.data || []).map((x: FormDataQpr) => {
                let action;

                if (x.quickReportSupplierStatus !== 'Approved') {
                    action = false;
                } else if (props.checker == 1 && x.delayDocument == 'Quick Report') {
                    action = x.quickReportStatus == 'Pending' && !x.quickReportStatusChecker1;
                } else if (props.checker == 2 && x.delayDocument == 'Quick Report' && x.quickReportStatusChecker1 == 'Approved') {
                    action = x.quickReportStatus == 'Pending' && !x.quickReportStatusChecker2;
                } else if (props.checker == 3 && x.delayDocument == 'Quick Report' && x.quickReportStatusChecker2 == 'Approved') {
                    action = x.quickReportStatus == 'Pending' && !x.quickReportStatusChecker3 ;
                } else if (props.checker == 1 && x.delayDocument == '8D Report') {
                    action = x.eightDReportStatus == 'Pending' && !x.eightDStatusChecker1;
                } else if (props.checker == 2 && x.delayDocument == '8D Report' && x.eightDStatusChecker1 == 'Approved') {
                    action = x.eightDReportStatus == 'Pending' && !x.eightDStatusChecker2;
                } else if (props.checker == 3 && x.delayDocument == '8D Report' && x.eightDStatusChecker2 == 'Approved') {
                    action = x.eightDReportStatus == 'Pending' && !x.eightDStatusChecker3 ;
                } else {
                    action = false; // ค่าเริ่มต้น กรณีที่ไม่ตรงกับเงื่อนไขใด
                }

                let status: "Pending" | "Approved" | "Rejected" | "Wait for Supplier" = "Wait for Supplier";
                if (x.quickReportSupplierStatus && x.quickReportSupplierStatus !== 'Approved' && x.delayDocument == 'Quick Report') {
                    status = "Wait for Supplier";
                } else if (x.eightDReportSupplierStatus && x.eightDReportSupplierStatus !== 'Approved' && x.delayDocument == '8D Report') {
                    status = "Wait for Supplier";
                } else if (props.checker == 1 && x.delayDocument == 'Quick Report') {
                    status = x.quickReportStatusChecker1 || "Pending";
                } else if (props.checker == 2 && x.delayDocument == 'Quick Report') {
                    status = x.quickReportStatusChecker2 || "Pending";
                } else if (props.checker == 3 && x.delayDocument == 'Quick Report') {
                    status = x.quickReportStatusChecker3 || "Pending";
                } else if (props.checker == 1 && x.delayDocument == '8D Report' && x.quickReportStatusChecker3 == 'Approved') {
                    status = x.eightDStatusChecker1 || "Pending";
                } else if (props.checker == 2 && x.delayDocument == '8D Report' && x.eightDStatusChecker1 == 'Approved') {
                    status = x.eightDStatusChecker2 || "Pending";
                } else if (props.checker == 3 && x.delayDocument == '8D Report' && x.eightDStatusChecker2 == 'Approved') {
                    status = x.eightDStatusChecker3 || "Pending";
                }

                return {
                    id: x.id,
                    date: x.dateReported ? moment(x.dateReported).format('DD/MM/YYYY HH:mm:ss') : '',
                    qprNo: x.qprIssueNo || '',
                    supplier: x.supplier?.supplierName || '',
                    problem: x.defectiveContents.problemCase || '',
                    importance: (x.importanceLevel || '') + (x.urgent ? ` (Urgent)` : ''),
                    reportType: x.delayDocument,
                    status,
                    action
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

const [supplier, setSupplier] = useState<{ label: string, value: string }[]>([]);
const GetSupplier = async () => {
    const res = await Get({ url: `/supplier/dropdown` });
    if (res.ok) {
        const res_data = await res.json();
        setSupplier((res_data || []))
    } else {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
    }
}

useEffect(() => {
    GetDatas();
    SocketConnect();
    GetSupplier();
}, [])

return (
    <div className="flex justify-center pt-6 px-6">
        <Toast ref={toast} />
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
                        <Dropdown
                            value={filters.supplier || ""}
                            onChange={(e: DropdownChangeEvent) => handleInputChange({ target: { value: e.value } } as React.ChangeEvent<HTMLInputElement>, "supplier")}
                            options={[{ label: 'All', value: 'All' }, ...supplier]}
                            optionLabel="label"
                            // placeholder="Select Supplier" 
                            className="w-full"
                        />

                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="reportType">Report Type</label>
                        {/* <InputText
                                id="reportType"
                                value={filters.reportType}
                                onChange={(e) => handleInputChange(e, "reportType")}
                                className="w-full"
                            /> */}
                        <Dropdown
                            value={filters.reportType}
                            onChange={(e: DropdownChangeEvent) => handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "reportType")}
                            options={[
                                { label: 'All', value: 'All' },
                                { label: 'Quick Report', value: 'quick-report' },
                                { label: '8D Report', value: '8d-report' },
                            ]}
                            optionLabel="label"
                            className="w-full"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="status">Status</label>
                        <Dropdown
                            value={filters.status}
                            onChange={(e: DropdownChangeEvent) => setFilters({ ...filters, status: e.target.value || "" })}
                            options={[
                                { label: 'All', value: 'All' },
                                { label: 'Approved [QuickReport]', value: 'approved-quick-report' },
                                { label: 'Wait for Supplier [QuickReport]', value: 'wait-for-supplier-quick-report' },
                                { label: 'Rejected [QuickReport]', value: 'rejected-quick-report' },
                                { label: 'Approved [8D Report]', value: 'approved-8d-report' },
                                { label: 'Wait for Supplier [8D Report]', value: 'wait-for-supplier-8d-report' },
                                { label: 'Rejected [8D Report]', value: 'rejected-8d-report' },
                            ]}
                            optionLabel="label"
                            className="w-full"
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
                <Column field="qprNo" header="QPR No."></Column>
                <Column field="supplier" header="Supplier"></Column>
                <Column field="reportType" header="Report Type"></Column>
                <Column field="problem" header="ปัญหา" bodyStyle={{ width: '30%' }}></Column>
                <Column field="importance" header="Importance Level"></Column>
                <Column field="status" header="Status" bodyStyle={{ textAlign: 'center', width: '15%' }}></Column>
                <Column body={actionBodyTemplate} header="Action" bodyStyle={{ textAlign: 'center' }}></Column>
            </DataTable>
        </div>

    </div>
);
}
