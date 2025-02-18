'use client';
import { JSX, useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TemplatePaginator } from "@/components/template-pagination";
import { Paginator } from "primereact/paginator";
import Footer from "@/components/footer";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import { CreateQueryString, Get, fetchFileAsFile } from "@/components/fetch";
import { Toast } from "primereact/toast";
import { Defect, FormDataQpr } from "../create-qpr/page";
import { getSocket } from "@/components/socket/socket";
import moment from "moment";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Socket } from "socket.io-client";

interface DataSummaryReportTable {
    id: number,
    qprNo: string,
    supplier: string,
    problem: string,
    importance: string,
    quickReport: JSX.Element,
    report8D: JSX.Element,
    status: string,
}

interface FilterSummaryReport {
    qprNo: string;
    month: Nullable<Date>;
    supplier: string;
    status: string;
}

export default function SummaryReport() {
    const toast = useRef<Toast>(null);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows, setTotalRows] = useState(10);
    const [qprList, setQprList] = useState<DataSummaryReportTable[]>([])
    const [filters, setFilters] = useState<FilterSummaryReport>({
        qprNo: "",
        month: null,
        supplier: "All",
        status: "All",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFilters({ ...filters, [field]: e.target.value });
    };

    const exportToExcel = async () => {
        // Add logic to export data to Excel here
        console.log("Exporting to Excel...");
        const exportExcel = await fetchFileAsFile(`/qpr/summary-report/exportExcel`);
        if (exportExcel.ok) {
            const data = await exportExcel.blob();
            const urlfile = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileURL = URL.createObjectURL(urlfile);
            const link = document.createElement("a");
            link.href = fileURL;
            link.download = `${'export.xlsx'}`; // กำหนดชื่อไฟล์ที่ดาวน์โหลด
            document.body.appendChild(link);
            link.click(); // คลิกเพื่อดาวน์โหลด
            document.body.removeChild(link);
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await exportExcel!.json()).message)}`, life: 3000 });
        }
    };

    const openPdfQuickReport = async (id: number) => {
        const response = await fetchFileAsFile(`/qpr/pdf/view/${id}`)
        if (response.ok) {
            const data = await response.blob();
            const urlfile = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(urlfile);
            window.open(fileURL, '_blank');
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await response!.json()).message)}`, life: 3000 });
        }
    }

    const openPdfEightDReport = async (id: number) => {
        const response = await fetchFileAsFile(`/qpr/pdf/view-8d/${id}`)
        if (response.ok) {
            const data = await response.blob();
            const urlfile = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(urlfile);
            window.open(fileURL, '_blank');
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await response!.json()).message)}`, life: 3000 });
        }
    }

    const quickReportBodyTemplate = (rowData: any) => {
        return (
            <div
                className={`font-bold w-[200px] flex gap-2 ${rowData.quickReportClass === "text-green-600"
                    ? "text-green-600"
                    : rowData.quickReportClass === "text-red-600"
                        ? "text-red-600"
                        : "text-yellow-500"
                    }`}
            >
                <div className="w-[170px]">{rowData.quickReport}</div>
                <Button icon="pi pi-eye" style={{ padding: 0 }} severity="secondary" outlined rounded onClick={() => openPdfQuickReport(rowData.id)} />
            </div>
        );
    };

    const Report8DClassBodyTemplate = (rowData: any) => {
        return (
            <div
                className={`font-bold w-[200px] flex gap-2 ${rowData.report8DClass === "text-green-600"
                    ? "text-green-600"
                    : rowData.report8DClass === "text-red-600"
                        ? "text-red-600"
                        : "text-yellow-500"
                    }`}
            >
                <div className="w-[170px]">{rowData.report8D}</div>
                <Button icon="pi pi-eye" style={{ padding: 0 }} severity="secondary" outlined rounded onClick={() => openPdfEightDReport(rowData.id)} />
            </div>
        );
    };

    function replaceCheckerName8d(checker: string): string {
        const replacements: Record<string, string> = {
            "checker1": "Checker1",
            "checker2": "Approve1",
            "checker3": "Approve2"
        };
        return replacements[checker] ? `(${replacements[checker]})` : checker
    }

    function replaceCheckerNameQpr(checker: string): string {
        const replacements: Record<string, string> = {
            "checker1": "Checker1",
            "checker2": "Checker2",
            "checker3": "Approve1"
        };
        return replacements[checker] ? `(${replacements[checker]})` : checker
    }

    const GetDatas = async () => {
        const quertString = CreateQueryString({
            ...filters,
        });
        const res = await Get({ url: `/qpr?limit=${rows}&offset=${first}&${quertString}` });
        if (res.ok) {
            const res_data = await res.json();
            setTotalRows(res_data.total || 0)
            setQprList((res_data.data || []).map((x: FormDataQpr) => {
                const objectQPRSupplierNow: any = x.objectQPRSupplier && x.objectQPRSupplier[x.objectQPRSupplier.length - 1] ? x.objectQPRSupplier[x.objectQPRSupplier.length - 1] : undefined;
                const object8DSupplierNow: any = x.objectQPRSupplier && x.objectQPRSupplier[x.objectQPRSupplier.length - 1] ? x.objectQPRSupplier[x.objectQPRSupplier.length - 1] : undefined;

                const latestCheckerobjectQPR = Object.entries(x)
                    .filter(([key, value]) => key.startsWith("quickReportDateChecker") && value) // กรองเฉพาะค่าไม่เป็น null หรือ undefined
                    .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())[0]?.[0] // เรียงตามวันที่และดึงตัวที่มากที่สุด (เช็คว่ามีค่าหรือไม่)
                    ?.replace("quickReportDateChecker", "checker") || ""; // ถ้าไม่มีค่าเลยให้ return เป็น "No valid checker"

                const latestCheckerobject8D = Object.entries(x)
                    .filter(([key, value]) => key.startsWith("eightDDateChecker") && value) // กรองเฉพาะค่าไม่เป็น null หรือ undefined
                    .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())[0]?.[0] // เรียงตามวันที่และดึงตัวที่มากที่สุด (เช็คว่ามีค่าหรือไม่)
                    ?.replace("eightDDateChecker", "checker") || ""; // ถ้าไม่มีค่าเลยให้ return เป็น "No valid checker"

                return {
                    id: x.id,
                    qprNo: x.qprIssueNo || '',
                    supplier: x.supplier?.supplierName || '',
                    problem: x.defectiveContents.problemCase || '',
                    importance: (x.importanceLevel || '') + (x.urgent ? ` (Urgent)` : ''),
                    status: x.status,
                    quickReport: <div>
                        <div>{x.quickReportDate ? `${moment(x.quickReportDate).format('DD/MM/YYYY HH:mm:ss')}` : "-"}</div>
                        <div>{x.quickReportStatus ? `(${x.quickReportStatus})` : '-'}</div>
                        <div>{latestCheckerobjectQPR && objectQPRSupplierNow[latestCheckerobjectQPR] && objectQPRSupplierNow[latestCheckerobjectQPR].updatedBy ? (`${objectQPRSupplierNow[latestCheckerobjectQPR].updatedBy}`) : "-"}</div>
                        <div>{replaceCheckerNameQpr(latestCheckerobjectQPR) || '-'}</div>
                    </div>,
                    report8D: <div>
                        <div>{x.eightDReportDate ? `${moment(x.eightDReportDate).format('DD/MM/YYYY HH:mm:ss')}` : "-"}</div>
                        <div>{x.eightDReportStatus ? `(${x.eightDReportStatus})` : '-'}</div>
                        <div>{latestCheckerobject8D && object8DSupplierNow[latestCheckerobject8D] && object8DSupplierNow[latestCheckerobject8D].updatedBy ? `${object8DSupplierNow[latestCheckerobject8D].updatedBy}` : "-"}</div>
                        <div>{replaceCheckerName8d(latestCheckerobject8D) || '-'}</div>
                    </div>,
                    quickReportClass: x.quickReportStatus == "Approved" ? "text-green-600" :
                        (x.quickReportStatus == "Pending" ? "text-yellow-600" :
                            (x.quickReportStatus == "Rejected" ? "text-red-600" : "text-yellow-600")),
                    report8DClass: x.eightDReportStatus == "Completed" ? "text-green-600" :
                        ((x.eightDReportStatus == "Pending" || x.eightDReportStatus == "Wait for supplier" || x.eightDReportStatus == "Approved") ? "text-yellow-600" :
                            (x.eightDReportStatus == "Rejected" ? "text-red-600" : "text-yellow-600")),

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

        socket.on("reload-status", (x: FormDataQpr) => {
            setQprList((old: DataSummaryReportTable[]) =>
                old.map((arr: DataSummaryReportTable) => {
                    const objectQPRSupplierNow: any = x.objectQPRSupplier && x.objectQPRSupplier[x.objectQPRSupplier.length - 1] ? x.objectQPRSupplier[x.objectQPRSupplier.length - 1] : undefined;
                    const object8DSupplierNow: any = x.objectQPRSupplier && x.objectQPRSupplier[x.objectQPRSupplier.length - 1] ? x.objectQPRSupplier[x.objectQPRSupplier.length - 1] : undefined;

                    const latestCheckerobjectQPR = Object.entries(x)
                        .filter(([key, value]) => key.startsWith("quickReportDateChecker") && value) // กรองเฉพาะค่าไม่เป็น null หรือ undefined
                        .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())[0]?.[0] // เรียงตามวันที่และดึงตัวที่มากที่สุด (เช็คว่ามีค่าหรือไม่)
                        ?.replace("quickReportDateChecker", "checker") || ""; // ถ้าไม่มีค่าเลยให้ return เป็น "No valid checker"

                    const latestCheckerobject8D = Object.entries(x)
                        .filter(([key, value]) => key.startsWith("eightDDateChecker") && value) // กรองเฉพาะค่าไม่เป็น null หรือ undefined
                        .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())[0]?.[0] // เรียงตามวันที่และดึงตัวที่มากที่สุด (เช็คว่ามีค่าหรือไม่)
                        ?.replace("eightDDateChecker", "checker") || ""; // ถ้าไม่มีค่าเลยให้ return เป็น "No valid checker"
                    if (arr.id === x.id) {
                        return {
                            ...arr,
                            status: x.status,
                            quickReport: <div>
                                <div>{x.quickReportDate ? `${moment(x.quickReportDate).format('DD/MM/YYYY HH:mm:ss')}` : "-"}</div>
                                <div>{x.quickReportStatus ? `(${x.quickReportStatus})` : '-'}</div>
                                <div>{latestCheckerobjectQPR && objectQPRSupplierNow[latestCheckerobjectQPR] && objectQPRSupplierNow[latestCheckerobjectQPR].updatedBy ? (`${objectQPRSupplierNow[latestCheckerobjectQPR].updatedBy}`) : "-"}</div>
                                <div>{replaceCheckerNameQpr(latestCheckerobjectQPR) || '-'}</div>
                            </div>,
                            report8D: <div>
                                <div>{x.eightDReportDate ? `${moment(x.eightDReportDate).format('DD/MM/YYYY HH:mm:ss')}` : "-"}</div>
                                <div>{x.eightDReportStatus ? `(${x.eightDReportStatus})` : '-'}</div>
                                <div>{latestCheckerobject8D && object8DSupplierNow[latestCheckerobject8D] && object8DSupplierNow[latestCheckerobject8D].updatedBy ? `${object8DSupplierNow[latestCheckerobject8D].updatedBy}` : "-"}</div>
                                <div>{replaceCheckerName8d(latestCheckerobject8D) || '-'}</div>
                            </div>,
                            quickReportClass: x.quickReportStatus == "Approved" ? "text-green-600" :
                                (x.quickReportStatus == "Pending" ? "text-yellow-600" :
                                    (x.quickReportStatus == "Rejected" ? "text-red-600" : "text-yellow-600")),
                            report8DClass: x.eightDReportStatus == "Completed" ? "text-green-600" :
                                ((x.eightDReportStatus == "Pending" || x.eightDReportStatus == "Wait for supplier" || x.eightDReportStatus == "Approved") ? "text-yellow-600" :
                                    (x.eightDReportStatus == "Rejected" ? "text-red-600" : "text-yellow-600")),
                        } as DataSummaryReportTable
                    } else {
                        return arr
                    }
                })
            );
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
        GetDatas()
        SocketConnect();
        GetSupplier();
    }, [])

    useEffect(() => {
        GetDatas()
    }, [first, rows])

    return (
        <div className="flex justify-center pt-6 px-6">
            {/* Search Fields */}
            <Toast ref={toast} />
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
                            {/* <InputText
                                id="supplier"
                                value={filters.supplier}
                                onChange={(e) => handleInputChange(e, "supplier")}
                                className="w-full"
                            /> */}
                            <Dropdown
                                value={filters.supplier || ""}
                                onChange={(e: DropdownChangeEvent) => handleInputChange({ target: { value: e.value } } as React.ChangeEvent<HTMLInputElement>, "supplier")}
                                options={[{ label: 'All', value: 'All' }, ...supplier]}
                                optionLabel="label"
                                // placeholder="Select Supplier" 
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
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


                {/* Data Table */}
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
                    <Column field="qprNo" header="QPR No." bodyStyle={{ width: '10%' }}></Column>
                    <Column field="supplier" header="Supplier" bodyStyle={{ width: '10%' }}></Column>
                    <Column field="problem" header="ปัญหา" bodyStyle={{ width: '25%' }}></Column>
                    <Column field="importance" header="Importance Level"></Column>
                    <Column field="quickReport" header="Quick Report" body={quickReportBodyTemplate}></Column>
                    <Column field="report8D" header="8D Report" body={Report8DClassBodyTemplate}></Column>
                    <Column field="status" header="Status" bodyStyle={{ width: '10%' }}></Column>
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
