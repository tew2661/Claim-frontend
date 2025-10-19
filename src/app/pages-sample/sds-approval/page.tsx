'use client';
import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { useRouter } from "next/navigation";
import moment from "moment";
import { Toast } from "primereact/toast";
import { getSocket } from "@/components/socket/socket";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Socket } from "socket.io-client";
import ReportHistoryModal from "./report-history-modal";

interface FilterSDSApprove {
    monthYear: string;
    supplierName: string;
    partNo: string;
    sdsType: string;
    status: string;
}

interface DataSDS {
    id: number,
    no: number,
    monthYear: string,
    supplierCode: string,
    supplierName: string,
    partNo: string,
    partName: string,
    model: string,
    sdsType: string,
    status: string,
    dueDate: string,
    action?: boolean
}

export function SDSApprovalTable(props: { checker: 1 | 2 | 3 }) {
    const toast = useRef<Toast>(null);
    const [sdsList, setSdsList] = useState<DataSDS[]>([])
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRows, setTotalRows] = useState<number>(0);
    const router = useRouter()

    const role: string = localStorage.getItem('role')!
    const [currentChecker, setCurrentChecker] = useState<1 | 2 | 3>(props.checker);

    const [filters, setFilters] = useState<FilterSDSApprove>({
        monthYear: "All",
        supplierName: "All",
        partNo: "All",
        sdsType: "All",
        status: "All",
    });

    const handleInputChange = (value: string, field: string) => {
        setFilters({ ...filters, [field]: value });
    };

    const actionBodyTemplate = (rowData: DataSDS) => {
        if (rowData.action) {
            return (
                <Button
                    label="View"
                    className="p-button-primary"
                    outlined
                    onClick={() => router.push(`sds-approval/detail/checker${currentChecker}/${rowData.id}`)}
                />
            );
        } else {
            return <div className="w-[100px]">&nbsp;</div>
        }
    };

    const sdsTypeBodyTemplate = (rowData: DataSDS) => {
        return (
            <div className={rowData.sdsType === 'Special' ? 'text-red-600 font-medium' : ''}>
                {rowData.sdsType}
            </div>
        );
    };

    const statusBodyTemplate = (rowData: DataSDS) => {
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'Approved':
                case 'Completed':
                    return 'text-green-600';
                case 'Rejected':
                    return 'text-red-600';
                case 'Wait for JATH Approve':
                case 'Pending':
                    return 'text-orange-500';
                default:
                    return 'text-gray-500';
            }
        };

        return (
            <div className={`font-medium ${getStatusColor(rowData.status)}`}>
                {rowData.status}
            </div>
        );
    };

    // Mock data - ในการใช้งานจริงจะเรียก API
    const GetDatas = async () => {
        // Mock data based on checker level
        const mockData = [
            {
                id: 1,
                no: 1,
                monthYear: '08-2025 Special',
                supplierCode: 'AAA',
                supplierName: 'AAA CO. LTD',
                partNo: '90151-06811',
                partName: 'SCREWFLATHEAD',
                model: 'XXX',
                sdsType: 'Special',
                status: 'Wait for JATH Approve',
                dueDate: '17-08-2025',
                action: currentChecker === 1
            },
            {
                id: 2,
                no: 2,
                monthYear: '08-2025 Special',
                supplierCode: 'BBB',
                supplierName: 'BBB CO. LTD',
                partNo: '90151-06811',
                partName: 'SCREWFLATHEAD',
                model: 'XXX',
                sdsType: 'Special',
                status: 'Wait for JATH Approve',
                dueDate: '21-08-2025',
                action: currentChecker === 1
            },
            {
                id: 3,
                no: 3,
                monthYear: '08-2025',
                supplierCode: 'CCC',
                supplierName: 'CCC CO. LTD',
                partNo: '90151-06811',
                partName: 'SCREWFLATHEAD',
                model: 'XXX',
                sdsType: 'Normal',
                status: 'Wait for JATH Approve',
                dueDate: '31-08-2025',
                action: currentChecker === 1
            },
            {
                id: 4,
                no: 4,
                monthYear: '08-2025',
                supplierCode: 'DDD',
                supplierName: 'DDD CO. LTD',
                partNo: '90151-06811',
                partName: 'SCREWFLATHEAD',
                model: 'XXX',
                sdsType: 'Normal',
                status: 'Wait for JATH Approve',
                dueDate: '31-08-2025',
                action: currentChecker === 2
            },
            {
                id: 5,
                no: 5,
                monthYear: '08-2025',
                supplierCode: 'EEE',
                supplierName: 'EEE CO. LTD',
                partNo: '90151-06811',
                partName: 'SCREWFLATHEAD',
                model: 'XXX',
                sdsType: 'Normal',
                status: 'Wait for JATH Approve',
                dueDate: '31-08-2025',
                action: currentChecker === 2
            },
        ];

        setSdsList(mockData);
        setTotalRows(mockData.length);
    };

    const socketRef = useRef<Socket | null>(null);
    const SocketConnect = () => {
        if (!socketRef.current) {
            socketRef.current = getSocket();
        }

        const socket = socketRef.current;

        socket.on("sds-update", () => GetDatas());

        return () => {
            socket.off("sds-update");
        };
    };

    const [supplierList] = useState([
        { label: 'AAA CO. LTD', value: 'AAA CO. LTD' },
        { label: 'BBB CO. LTD', value: 'BBB CO. LTD' },
        { label: 'CCC CO. LTD', value: 'CCC CO. LTD' },
        { label: 'DDD CO. LTD', value: 'DDD CO. LTD' },
        { label: 'EEE CO. LTD', value: 'EEE CO. LTD' },
    ]);

    // History modal states
    const [visibleHistory, setVisibleHistory] = useState<boolean>(false);
    const [selectedReportHistory, setSelectedReportHistory] = useState<any[]>([]);
    const [firstHistory, setFirstHistory] = useState<number>(0);
    const [rowsHistory, setRowsHistory] = useState<number>(5);
    const [totalRowsHistory, setTotalRowsHistory] = useState<number>(0);

    // Mock history data fetch
    const GetHistoryDatas = async (sdsId: number, page = 0, size = 5) => {
        // In real implementation call API with sdsId, page and size
        const mockHistory = [
            { qprNo: 'SDS-001', documentType: 'SDS', action: 'Created', actionRole: 'Supplier', actionBy: 'sup_user', actionDate: '2025-08-10 10:15', remark: 'Initial upload' },
            { qprNo: 'SDS-001', documentType: 'SDS', action: 'Submitted', actionRole: 'Checker1', actionBy: 'checker1', actionDate: '2025-08-11 09:05', remark: 'Please review' },
            { qprNo: 'SDS-001', documentType: 'SDS', action: 'Reviewed', actionRole: 'Checker2', actionBy: 'checker2', actionDate: '2025-08-12 11:25', remark: 'OK' },
            { qprNo: 'SDS-001', documentType: 'SDS', action: 'Approved', actionRole: 'Approver', actionBy: 'approver', actionDate: '2025-08-13 14:40', remark: 'Approved' },
        ];

        // simple pagination simulation
        const start = page;
        const end = Math.min(start + size, mockHistory.length);
        const pageData = mockHistory.slice(start, end);

        setSelectedReportHistory(pageData);
        setTotalRowsHistory(mockHistory.length);
    };

    const openHistory = async (row: DataSDS) => {
        await GetHistoryDatas(row.id, 0, rowsHistory);
        setFirstHistory(0);
        setVisibleHistory(true);
    }

    const exportToCSV = () => {
        if (!sdsList || sdsList.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'No data', detail: 'No records to export' });
            return;
        }

        const headers = ['No', 'Month-Year', 'Supplier Code', 'Supplier Name', 'Part No', 'Part Name', 'Model', 'SDS Type', 'Status', 'Due Date'];
        const rowsCsv = sdsList.map((r) => [r.no, r.monthYear, r.supplierCode, r.supplierName, r.partNo, r.partName, r.model, r.sdsType, r.status, r.dueDate]);

        const escapeCsv = (value: any) => `"${String(value ?? '').replace(/"/g, '""')}"`;

        const csvContent = [headers.map(escapeCsv).join(',')]
            .concat(rowsCsv.map(row => row.map(escapeCsv).join(',')))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sds_approval_${moment().format('YYYYMMDD_HHmmss')}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        setCurrentChecker(props.checker);
        GetDatas();
        SocketConnect();
    }, [props.checker])

    useEffect(() => {
        GetDatas()
    }, [first, rows])

    return (
        <div className="flex justify-center pt-6 px-6">
            <Toast ref={toast} />
            <div className="container">
                <div className="step-indicator px-6 mb-3">
                    <div className={"step create " + (currentChecker == 1 || currentChecker == 2 || currentChecker == 3 ? 'active' : 'disabled')} onClick={() => router.push('/pages-sample/sds-approval/checker1')}>Checker 1</div>
                    <div className={"step confirm " + (currentChecker == 2 || currentChecker == 3 ? 'active' : 'disabled')} onClick={() => router.push('/pages-sample/sds-approval/checker2')}>Checker 2</div>
                    <div className={"step delivery " + (currentChecker == 3 ? 'active' : 'disabled')} onClick={() => router.push('/pages-sample/sds-approval/checker3')}>Approver</div>
                </div>
                <div className="mx-4 mb-4 text-2xl font-bold py-3 border-solid border-t-0 border-x-0 border-b-2 border-gray-600">
                    SDS Approval : Checker {currentChecker}
                </div>

                {/* Filter Section */}
                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 w-[calc(100%-100px)]">
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="monthYear">Month-Year</label>
                            <Dropdown
                                value={filters.monthYear}
                                onChange={(e: DropdownChangeEvent) => handleInputChange(e.value, "monthYear")}
                                options={[
                                    { label: 'All', value: 'All' },
                                    { label: '08-2025', value: '08-2025' },
                                ]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="supplierName">Supplier Name</label>
                            <Dropdown
                                value={filters.supplierName}
                                onChange={(e: DropdownChangeEvent) => handleInputChange(e.value, "supplierName")}
                                options={[{ label: 'All', value: 'All' }, ...supplierList]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="partNo">Part No.</label>
                            <Dropdown
                                value={filters.partNo}
                                onChange={(e: DropdownChangeEvent) => handleInputChange(e.value, "partNo")}
                                options={[
                                    { label: 'All', value: 'All' },
                                    { label: '90151-06811', value: '90151-06811' },
                                ]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="sdsType">SDS Type</label>
                            <Dropdown
                                value={filters.sdsType}
                                onChange={(e: DropdownChangeEvent) => handleInputChange(e.value, "sdsType")}
                                options={[
                                    { label: 'All', value: 'All' },
                                    { label: 'Special', value: 'Special' },
                                    { label: 'Normal', value: 'Normal' },
                                ]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="status">Status</label>
                            <Dropdown
                                value={filters.status}
                                onChange={(e: DropdownChangeEvent) => handleInputChange(e.value, "status")}
                                options={[
                                    { label: 'All', value: 'All' },
                                    { label: 'Pending', value: 'Pending' },
                                    { label: 'Approved', value: 'Approved' },
                                    { label: 'Rejected', value: 'Rejected' },
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
                    value={sdsList}
                    showGridlines
                    className='table-header-center mt-4'
                    onRowClick={(e) => openHistory(e.data as DataSDS)}
                    footer={
                        <Paginator
                            first={first}
                            rows={rows}
                            totalRecords={totalRows}
                            template={TemplatePaginator}
                            rowsPerPageOptions={[10, 20, 50, 100]}
                            onPageChange={(event) => {
                                setFirst(event.first);
                                setRows(event.rows);
                            }}
                        />
                    }
                >
                    <Column field="no" header="No." bodyStyle={{ width: '5%', textAlign: 'center' }}></Column>
                    <Column field="monthYear" header="Month-Year" bodyStyle={{ width: '10%' }}></Column>
                    <Column field="supplierCode" header="Supplier Code" bodyStyle={{ width: '8%' }}></Column>
                    <Column field="supplierName" header="Supplier Name" bodyStyle={{ width: '12%' }}></Column>
                    <Column field="partNo" header="Part No." bodyStyle={{ width: '10%' }}></Column>
                    <Column field="partName" header="Part Name" bodyStyle={{ width: '12%' }}></Column>
                    <Column field="model" header="Model" bodyStyle={{ width: '8%' }}></Column>
                    <Column field="sdsType" header="SDS Type" body={sdsTypeBodyTemplate} bodyStyle={{ width: '8%' }}></Column>
                    <Column field="status" header="Status" body={statusBodyTemplate} bodyStyle={{ width: '10%' }}></Column>
                    <Column field="dueDate" header="Due Date" bodyStyle={{ width: '10%' }}></Column>
                    <Column field="action" header="View" body={actionBodyTemplate} bodyStyle={{ width: '7%', textAlign: 'center' }}></Column>
                </DataTable>
                <ReportHistoryModal
                    visible={visibleHistory}
                    onHide={() => setVisibleHistory(false)}
                    historyData={selectedReportHistory}
                    first={firstHistory}
                    rows={rowsHistory}
                    totalRecords={totalRowsHistory}
                    onPageChange={(event) => {
                        setFirstHistory(event.first);
                        setRowsHistory(event.rows);
                        // fetch new page slice
                        // event.first contains the index of the first item => use it as offset
                        GetHistoryDatas(0, event.first, event.rows);
                    }}
                />
            </div>
        </div>
    );
}

export default function MasterFunction() {
    return <SDSApprovalTable checker={1} />
};