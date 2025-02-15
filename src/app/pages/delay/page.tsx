'use client';
import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { CreateQueryString, Get } from "@/components/fetch";
import { FormDataQpr, Defect } from "../create-qpr/page";
import { Toast } from "primereact/toast";
import moment from 'moment';
import { getSocket } from "@/components/socket/socket";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Socket } from "socket.io-client";
interface FilterDelay {
    supplier: string;
    qprNo: string;
}

interface DataTableReplay {
    id: number,
    qprNo: string,
    supplier: string,
    problem: string,
    importance: string,
    delayDocument: string,
    commitmentDate: string,
    delayDays: number,
}

export default function ReportTable() {
    const toast = useRef<Toast>(null);
    const [qprList, setQprList] = useState<DataTableReplay[]>([])
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows,setTotalRows] = useState(10);

    const [filters, setFilters] = useState<FilterDelay>({
        supplier: "All",
        qprNo: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFilters({ ...filters, [field]: e.target.value });
    };

    const GetDatas = async () => {
        const quertString = CreateQueryString({
            ...filters,
        });
        const res = await Get({ url: `/qpr/delay?limit=${rows}&offset=${first}&${quertString}` });
        if (res.ok) {
            const res_data = await res.json();
            setTotalRows(res_data.total || 0)
            setQprList((res_data.data || []).map((x: FormDataQpr) => {
                return {
                    id: x.id,
                    qprNo: x.qprIssueNo || '',
                    supplier: x.supplier?.supplierName || '',
                    problem: x.defectiveContents.problemCase || '',
                    importance: (x.importanceLevel || '') + (x.urgent ? ` (Urgent)` : ''),
                    delayDocument: x.delayDocument,
                    commitmentDate: x.replyQuickAction ? moment(x.replyQuickAction).format('DD/MM/YYYY HH:mm:ss') : "-",
                    delayDays: x.replyQuickAction ? (moment().diff(moment(x.replyQuickAction), 'days')): "",
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

                        <div className="flex flex-col gap-2">
                            <label htmlFor="qprNo">QPR No</label>
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
                    <Column field="problem" header="ปัญหา"></Column>
                    <Column field="importance" header="Importance Level"></Column>
                    <Column field="delayDocument" header="Delay Document"></Column>
                    <Column field="commitmentDate" header="Commitment Date"></Column>
                    <Column field="delayDays" header="Delay (Date)" bodyStyle={{ textAlign: 'center' }}></Column>
                    {/* <Column body={actionBodyTemplate} header="" bodyStyle={{ textAlign: 'center' }}></Column> */}
                </DataTable>
            </div>

        </div>
    );
}
