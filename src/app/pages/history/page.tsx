'use client';
import { JSX, useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TemplatePaginator } from "@/components/template-pagination";
import { Paginator } from "primereact/paginator";
import Footer from "@/components/footer";
import { Nullable } from "primereact/ts-helpers";
import { CreateQueryString, Get } from "@/components/fetch";
import { Toast } from "primereact/toast";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import moment from "moment";

interface DataSummaryReportTable {
    id: number,
    qprNo: string,
    documentType: string,
    action: string,
    performedBy: any
    performedAt: string,
    remark: string
}

interface FilterSummaryReport {
    qprNo: string;
    date: Nullable<Date>;
    user: string;
    documentType: string,
    action: string;
}

export default function SummaryReport() {
    const toast = useRef<Toast>(null);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows, setTotalRows] = useState(10);
    const [qprList, setQprList] = useState<DataSummaryReportTable[]>([])
    const [filters, setFilters] = useState<FilterSummaryReport>({
        qprNo: "",
        date: undefined,
        user: "All",
        documentType: "All",
        action: "All",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFilters({ ...filters, [field]: e.target.value });
    };

    const GetDatas = async () => {
        const quertString = CreateQueryString({
            ...filters,
            date: filters.date ? moment(filters.date).format('YYYY-MM-DD') : undefined,
        });
        const res = await Get({ url: `/logs?limit=${rows}&offset=${first}&${quertString}` });
        if (res.ok) {
            const res_data = await res.json();
            setTotalRows(res_data.total || 0)
            setQprList((res_data.data || []).map((x: any) => {
                return {
                    ...x,
                    performedAt: x.performedAt ? moment(x.performedAt).format('DD/MM/YYYY HH:mm:ss'): ""
                } as DataSummaryReportTable
            }))

        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
    }

    const [user, setUser] = useState<{ label: string, value: string }[]>([]);
    const GetUser = async () => {
        const res = await Get({ url: `/users/dropdown` });
        if (res.ok) {
            const res_data = await res.json();
            setUser((res_data || []))
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
    }

    useEffect(() => {
        GetDatas()
        GetUser();
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
                            <label htmlFor="qprNo">QPR No</label>
                            <InputText
                                id="qprNo"
                                value={filters.qprNo}
                                onChange={(e) => handleInputChange(e, "qprNo")}
                                className="w-full"
                            />

                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="user">Document Type</label>
                            <Dropdown
                                value={filters.documentType}
                                onChange={(e: DropdownChangeEvent) => setFilters({ ...filters, documentType: e.target.value || "" })}
                                options={[
                                    { label: 'All', value: 'All' },
                                    { label: 'Quick Report', value: 'Quick-Report' },
                                    { label: '8D Report', value: '8D-Report' },
                                ]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="user">Action By</label>
                            {/* <InputText
                                id="user"
                                value={filters.user}
                                onChange={(e) => handleInputChange(e, "user")}
                                className="w-full"
                            /> */}
                            <Dropdown
                                value={filters.user || ""}
                                onChange={(e: DropdownChangeEvent) => handleInputChange({ target: { value: e.value } } as React.ChangeEvent<HTMLInputElement>, "user")}
                                options={[{ label: 'All', value: 'All' }, ...user]}
                                optionLabel="label"
                                // placeholder="Select Supplier" 
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="qprNo">Action Date</label>
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
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="action">Action</label>
                            <Dropdown
                                value={filters.action}
                                onChange={(e: DropdownChangeEvent) => setFilters({ ...filters, action: e.target.value || "" })}
                                options={[
                                    { label: 'All', value: 'All' },
                                    { label: 'Created', value: 'created' },
                                    { label: 'Updated', value: 'updated' },
                                    { label: 'Approved', value: 'approved' },
                                    { label: 'Rejected', value: 'rejected' },
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
                    <Column field="documentType" header="Document Type" bodyStyle={{ width: '10%' }}></Column>
                    <Column field="action" header="Action" body={(data) => {
                        return <>{data.action} {data.IsDocumentOther == 'Y' ? "(Doc Other)" : ""}</>
                    }}  bodyStyle={{ width: '10%' }}></Column>
                    <Column field="roleType" header="Action Role" bodyStyle={{ width: '10%' }}></Column>
                    <Column field="performedBy.name" header="Action By" bodyStyle={{ width: '10%' }}></Column>
                    <Column field="performedAt" header="Action Date" bodyStyle={{ width: '10%' }}></Column>
                    <Column field="remark" header="Remark" bodyStyle={{ width: '25%' }}></Column>
                </DataTable>

                {/* Export Button */}
                <Footer>
                    <div className='flex justify-end mt-2 w-full gap-2'>
                    </div>
                </Footer>
            </div>

        </div>
    );
}
