'use client';
import { useEffect, useRef, useState } from "react";
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

export default function ApprovedTable(props: { page: 1 | 2 | 3 }) {
    const toast = useRef<Toast>(null);
    const [qprList, setQprList] = useState<DataQPR[]>([])
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRows, setTotalRows ] = useState<number>(10);
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

    const GetDatas = async () => {
        const quertString = CreateQueryString({
            ...filters,
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
                    supplier: x.supplier?.supplierName || '',
                    problem: ((Object.keys(x.defect) as Array<keyof Defect>).map((y: keyof Defect) => {
                        if (y == 'other') {
                            return x.defect.otherDetails
                        } else if (y !== 'otherDetails') {
                            return x.defect[y] ? y : ''
                        } else {
                            return ''
                        }
                    })).filter((z) => z).join(' , '),
                    importance: (x.importanceLevel || '') + (x.urgent ? ` (Urgent)` : ''),
                    reportType: x.delayDocument,
                    status: x.status,
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
        GetDatas();
        SocketConnect();
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
                    <Column field="status" header="Status" bodyStyle={{ textAlign: 'center' }}></Column>
                    <Column body={actionBodyTemplate} header="" bodyStyle={{ textAlign: 'center' }}></Column>
                </DataTable>
            </div>

        </div>
    );
}
