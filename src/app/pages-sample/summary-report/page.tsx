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
import { CreateQueryString, Get, FetchFileAsFile } from "@/components/fetch";
import { Toast } from "primereact/toast";
import moment from "moment";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Socket } from "socket.io-client";
import { getSocket } from "@/components/socket/socket";
import ReportHistoryModal from "./report-history-modal";

interface DataSummaryReportTable {
    no: number,
    monthYear: string,
    supplierName: string,
    partNo: string,
    partName: string,
    model: string,
    sdsType: string,
    supplierStatus: string,
    sdsStatus: string,
    dueDate: string,
    view: JSX.Element,
}

interface DataHistoryTable {
    id: number,
    qprNo: string,
    documentType: string,
    action: string,
    actionRole: string,
    actionBy: string,
    actionDate: string,
    remark: string
}

interface FilterSummaryReport {
    monthYear: string;
    supplierName: string;
    partNo: string;
    partName: string;
    model: string;
    sdsType: string;
    supplierStatus: string;
    sdsStatus: string;
    delayNotDelay: string;
}

export default function SummaryReport() {
    const toast = useRef<Toast>(null);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [firstHistory, setFirstHistory] = useState(0);
    const [rowsHistory, setRowsHistory] = useState(10);
    const [totalRowsHistory, setTotalRowsHistory] = useState(0);
    const [sampleDataList, setSampleDataList] = useState<DataSummaryReportTable[]>([])
    const [filters, setFilters] = useState<FilterSummaryReport>({
        monthYear: "All",
        supplierName: "All",
        partNo: "All",
        partName: "All",
        model: "All",
        sdsType: "All",
        supplierStatus: "All",
        sdsStatus: "All",
        delayNotDelay: "All",
    });

    const [visibleHistory, setVisibleHistory] = useState<boolean>(false);
    const [selectedReportHistory, setSelectedReportHistory] = useState<DataHistoryTable[]>([]);
    const [partNo, setPartNo] = useState<string>('');

    // Mock data for dropdowns
    const [supplierList] = useState([
        { label: 'AAA CO. LTD', value: 'AAA CO. LTD' },
        { label: 'BBB CO. LTD', value: 'BBB CO. LTD' },
        { label: 'CCC CO. LTD', value: 'CCC CO. LTD' },
        { label: 'DDD CO. LTD', value: 'DDD CO. LTD' },
        { label: 'EEE CO. LTD', value: 'EEE CO. LTD' },
        { label: 'FFF CO. LTD', value: 'FFF CO. LTD' },
        { label: 'GGG CO. LTD', value: 'GGG CO. LTD' },
    ]);

    const [partNumberList] = useState([
        { label: '90151-06811', value: '90151-06811' },
    ]);

    const [modelList] = useState([
        { label: 'XXX', value: 'XXX' },
    ]);

    const [sdsTypeList] = useState([
        { label: 'Special', value: 'Special' },
        { label: 'Normal', value: 'Normal' },
    ]);

    const [supplierStatusList] = useState([
        { label: 'Pending', value: 'Pending' },
        { label: 'Submitted', value: 'Submitted' },
    ]);

    const [sdsStatusList] = useState([
        { label: 'Supplier Pending', value: 'Supplier Pending' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Wait for JATH Approve', value: 'Wait for JATH Approve' },
    ]);

    const fetchReportHistory = async (qprNo: string, openHistory?: boolean) => {
        setPartNo(qprNo);
        // Mock history data based on the image
        const mockHistory = [
            {
                id: 1,
                qprNo: '2508001',
                documentType: 'Quick-Report',
                action: 'Submitted',
                actionRole: 'Supplier',
                actionBy: 'AutoMotive',
                actionDate: '15/08/2025 16:22:44',
                remark: ''
            },
            {
                id: 2,
                qprNo: '2508001',
                documentType: 'Quick-Report',
                action: 'Created',
                actionRole: 'Supervision / Assistant Manager',
                actionBy: 'JakkrapongK',
                actionDate: '15/08/2025 16:20:00',
                remark: ''
            },
            {
                id: 3,
                qprNo: 'QPR Test Issue No. 001',
                documentType: '8D-Report',
                action: 'Rejected',
                actionRole: 'Checker1',
                actionBy: 'นายทดสอบ ระบบ',
                actionDate: '20/06/2025 01:32:22',
                remark: 'ตรวจสอบ'
            },
            {
                id: 4,
                qprNo: 'QPR Test Issue No. 001',
                documentType: '8D-Report',
                action: 'Submitted',
                actionRole: 'Supplier',
                actionBy: 'AutoMotive',
                actionDate: '20/06/2025 01:31:00',
                remark: ''
            },
            {
                id: 5,
                qprNo: 'QPR Test Issue No. 001',
                documentType: '8D-Report',
                action: 'Rejected',
                actionRole: 'Checker1',
                actionBy: 'นายทดสอบ ระบบ',
                actionDate: '20/06/2025 01:23:17',
                remark: 'ตรวจสอบ'
            },
            {
                id: 6,
                qprNo: 'QPR Test Issue No. 001',
                documentType: '8D-Report',
                action: 'Submitted',
                actionRole: 'Supplier',
                actionBy: 'AutoMotive',
                actionDate: '20/06/2025 01:11:06',
                remark: ''
            }
        ];
        setSelectedReportHistory(mockHistory);
        setTotalRowsHistory(mockHistory.length);
        setVisibleHistory(openHistory || false);
    };

    const updateFilterCriteria = (value: string, field: string) => {
        setFilters({ ...filters, [field]: value });
    };

    const exportSummaryReportToExcel = async () => {
        // Mock export functionality
        toast.current?.show({ 
            severity: 'info', 
            summary: 'Export', 
            detail: 'Export functionality will be implemented', 
            life: 3000 
        });
    };

    const viewDocument = async (id: number) => {
        // Mock view functionality
        toast.current?.show({ 
            severity: 'info', 
            summary: 'View', 
            detail: 'View document functionality will be implemented', 
            life: 3000 
        });
    };

    const viewBodyTemplate = (rowData: any) => {
        return (
            <Button 
                label="VIEW" 
                className="p-button-link text-blue-500" 
                onClick={() => viewDocument(rowData.no)}
                style={{ padding: 0, textDecoration: 'underline' }}
            />
        );
    };

    const supplierStatusBodyTemplate = (rowData: any) => {
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'Pending':
                    return 'text-orange-500';
                case 'Submitted':
                    return 'text-blue-500';
                default:
                    return 'text-gray-500';
            }
        };

        return (
            <div className={`font-medium ${getStatusColor(rowData.supplierStatus)}`}>
                {rowData.supplierStatus}
                {rowData.submittedDate && (
                    <div className="text-xs text-gray-500">
                        {rowData.submittedDate}
                    </div>
                )}
            </div>
        );
    };

    const sdsStatusBodyTemplate = (rowData: any) => {
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'Completed':
                    return 'text-green-600';
                case 'Rejected':
                    return 'text-red-600';
                case 'Wait for JATH Approve':
                    return 'text-blue-600';
                case 'Supplier Pending':
                    return 'text-orange-500';
                default:
                    return 'text-gray-500';
            }
        };

        return (
            <div className={`font-medium ${getStatusColor(rowData.sdsStatus)}`}>
                {rowData.sdsStatus}
                {rowData.completedDate && (
                    <div className="text-xs text-gray-500">
                        {rowData.completedDate}
                    </div>
                )}
            </div>
        );
    };

    const dueDateBodyTemplate = (rowData: any) => {
        const isDelay = rowData.dueDate && moment().isAfter(moment(rowData.dueDate, 'DD-MM-YYYY'));
        return (
            <div className={isDelay ? 'text-red-600 font-medium' : ''}>
                {rowData.dueDate}
                {isDelay && <div className="text-xs">Delay</div>}
            </div>
        );
    };

    const sdsTypeBodyTemplate = (rowData: any) => {
        return (
            <div className={rowData.sdsType === 'Special' ? 'text-red-600 font-medium' : ''}>
                {rowData.sdsType}
            </div>
        );
    };

    const fetchSummaryReportData = async () => {
        // Mock data based on the image
        const mockData = [
            {
                no: 1,
                monthYear: '08-2025 Special',
                supplierName: 'AAA CO. LTD',
                partNo: '90151-06811',
                partName: 'SCREWFLATHEAD',
                model: 'XXX',
                sdsType: 'Special',
                supplierStatus: 'Pending',
                sdsStatus: 'Supplier Pending',
                dueDate: '17-08-2025',
                view: <></>,
            },
            {
                no: 2,
                monthYear: '08-2025 Special',
                supplierName: 'BBB CO. LTD',
                partNo: '90151-06811',
                partName: 'SCREWFLATHEAD',
                model: 'XXX',
                sdsType: 'Special',
                supplierStatus: 'Pending',
                sdsStatus: 'Rejected',
                dueDate: '21-08-2025',
                completedDate: '20-08-2025',
                view: <></>,
            },
            {
                no: 3,
                monthYear: '08-2025',
                supplierName: 'CCC CO. LTD',
                partNo: '90151-06811',
                partName: 'SCREWFLATHEAD',
                model: 'XXX',
                sdsType: 'Normal',
                supplierStatus: 'Pending',
                sdsStatus: 'Supplier Pending',
                dueDate: '25-08-2025',
                view: <></>,
            },
            {
                no: 4,
                monthYear: '08-2025',
                supplierName: 'DDD CO. LTD',
                partNo: '90151-06811',
                partName: 'SCREWFLATHEAD',
                model: 'XXX',
                sdsType: 'Normal',
                supplierStatus: 'Submitted',
                sdsStatus: 'Completed',
                dueDate: '25-08-2025',
                submittedDate: '20-08-2025',
                completedDate: '20-08-2025',
                view: <></>,
            },
            {
                no: 5,
                monthYear: '08-2025',
                supplierName: 'EEE CO. LTD',
                partNo: '90151-06811',
                partName: 'SCREWFLATHEAD',
                model: 'XXX',
                sdsType: 'Normal',
                supplierStatus: 'Submitted',
                sdsStatus: 'Wait for JATH Approve',
                dueDate: '25-08-2025',
                submittedDate: '17-08-2025',
                view: <></>,
            },
            {
                no: 6,
                monthYear: '08-2025',
                supplierName: 'FFF CO. LTD',
                partNo: '90151-06811',
                partName: 'SCREWFLATHEAD',
                model: 'XXX',
                sdsType: 'Normal',
                supplierStatus: 'Submitted',
                sdsStatus: 'Wait for JATH Approve',
                dueDate: '25-08-2025',
                submittedDate: '19-08-2025',
                view: <></>,
            },
            {
                no: 7,
                monthYear: '08-2025 Special',
                supplierName: 'GGG CO. LTD',
                partNo: '90151-06811',
                partName: 'SCREWFLATHEAD',
                model: 'XXX',
                sdsType: 'Special',
                supplierStatus: 'Submitted',
                sdsStatus: 'Completed',
                dueDate: '25-08-2025',
                submittedDate: '19-08-2025',
                completedDate: '20-08-2025',
                view: <></>,
            },
        ];

        setSampleDataList(mockData);
        setTotalRows(mockData.length);
    };

    const socketRef = useRef<Socket | null>(null);
    useEffect(() => {
        fetchSummaryReportData();
        
        if (!socketRef.current) {
            socketRef.current = getSocket();
        }

        const socket = socketRef.current;
        socket.on("sample-data-update", () => {
            fetchSummaryReportData();
        });

        return () => {
            socket.off("sample-data-update");
        };
    }, [first, rows]);

    return (
       <div className="flex justify-center pt-6 px-6">
            <Toast ref={toast} />
            <div className="container">
                <div className="mx-4 mb-4 text-2xl font-bold py-3 border-solid border-t-0 border-x-0 border-b-2 border-gray-600">
                    Summary Report
                </div>
                
                {/* Filter Section */}
                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 w-[calc(100%-100px)]">
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="monthYear">Month-Year</label>
                            <Dropdown
                                value={filters.monthYear}
                                onChange={(e: DropdownChangeEvent) => updateFilterCriteria(e.value, "monthYear")}
                                options={[
                                    { label: 'All', value: 'All' },
                                    { label: '08-2025', value: '08-2025' },
                                    { label: '09-2025', value: '09-2025' },
                                    { label: '10-2025', value: '10-2025' },
                                ]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="supplierName">Supplier Name</label>
                            <Dropdown
                                value={filters.supplierName}
                                onChange={(e: DropdownChangeEvent) => updateFilterCriteria(e.value, "supplierName")}
                                options={[{ label: 'All', value: 'All' }, ...supplierList]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="partNo">Part No.</label>
                            <Dropdown
                                value={filters.partNo}
                                onChange={(e: DropdownChangeEvent) => updateFilterCriteria(e.value, "partNo")}
                                options={[{ label: 'All', value: 'All' }, ...partNumberList]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="partName">Part Name</label>
                            <Dropdown
                                value={filters.partName}
                                onChange={(e: DropdownChangeEvent) => updateFilterCriteria(e.value, "partName")}
                                options={[
                                    { label: 'All', value: 'All' },
                                    { label: 'SCREWFLATHEAD', value: 'SCREWFLATHEAD' },
                                ]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="model">Model</label>
                            <Dropdown
                                value={filters.model}
                                onChange={(e: DropdownChangeEvent) => updateFilterCriteria(e.value, "model")}
                                options={[{ label: 'All', value: 'All' }, ...modelList]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="sdsType">SDS Type</label>
                            <Dropdown
                                value={filters.sdsType}
                                onChange={(e: DropdownChangeEvent) => updateFilterCriteria(e.value, "sdsType")}
                                options={[{ label: 'All', value: 'All' }, ...sdsTypeList]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="w-[100px]">
                        <div className="flex flex-col gap-2">
                            <label>&nbsp;</label>
                            <Button label="Search" icon="pi pi-search" onClick={() => fetchSummaryReportData()} />
                        </div>
                    </div>
                </div>

                {/* Second Row of Filters */}
                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2 w-[calc(100%-100px)]">
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="supplierStatus">Supplier Status</label>
                            <Dropdown
                                value={filters.supplierStatus}
                                onChange={(e: DropdownChangeEvent) => updateFilterCriteria(e.value, "supplierStatus")}
                                options={[{ label: 'All', value: 'All' }, ...supplierStatusList]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="sdsStatus">SDS Status</label>
                            <Dropdown
                                value={filters.sdsStatus}
                                onChange={(e: DropdownChangeEvent) => updateFilterCriteria(e.value, "sdsStatus")}
                                options={[{ label: 'All', value: 'All' }, ...sdsStatusList]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="delayNotDelay">Delay / Not Delay</label>
                            <Dropdown
                                value={filters.delayNotDelay}
                                onChange={(e: DropdownChangeEvent) => updateFilterCriteria(e.value, "delayNotDelay")}
                                options={[
                                    { label: 'All', value: 'All' },
                                    { label: 'Delay', value: 'Delay' },
                                    { label: 'Not Delay', value: 'Not Delay' },
                                ]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    value={sampleDataList}
                    showGridlines
                    className='table-header-center mt-4'
                    onRowClick={(e) => fetchReportHistory(`SDS-${e.data.no}`, true)}
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
                    <Column field="no" header="No." bodyStyle={{ width: '5%', textAlign: 'center' }}></Column>
                    <Column field="monthYear" header="Month-Year" bodyStyle={{ width: '10%' }}></Column>
                    <Column field="supplierName" header="Supplier Name" bodyStyle={{ width: '12%' }}></Column>
                    <Column field="partNo" header="Part No." bodyStyle={{ width: '10%' }}></Column>
                    <Column field="partName" header="Part Name" bodyStyle={{ width: '12%' }}></Column>
                    <Column field="model" header="Model" bodyStyle={{ width: '8%' }}></Column>
                    <Column field="sdsType" header="SDS Type" body={sdsTypeBodyTemplate} bodyStyle={{ width: '8%' }}></Column>
                    <Column field="supplierStatus" header="Supplier Status" body={supplierStatusBodyTemplate} bodyStyle={{ width: '10%' }}></Column>
                    <Column field="sdsStatus" header="SDS Status" body={sdsStatusBodyTemplate} bodyStyle={{ width: '12%' }}></Column>
                    <Column field="dueDate" header="Due Date" body={dueDateBodyTemplate} bodyStyle={{ width: '8%' }}></Column>
                    <Column field="view" header="View" body={viewBodyTemplate} bodyStyle={{ width: '5%', textAlign: 'center' }}></Column>
                </DataTable>

                {/* Export Button */}
                <Footer>
                    <div className='flex justify-end mt-2 w-full gap-2'>
                        <Button label="Export AS Excel" className="p-button-success min-w-[150px]" onClick={exportSummaryReportToExcel} />
                    </div>
                </Footer>

                {/* History Modal */}
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
                    }}
                />
            </div>
        </div>
    );
}