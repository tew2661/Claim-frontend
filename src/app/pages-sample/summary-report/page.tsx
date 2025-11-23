'use client';
import { JSX, useCallback, useEffect, useRef, useState } from "react";
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
    id: number,
    no: number,
    monthYear: string,
    supplierCode: string,
    supplierName: string,
    partNo: string,
    partName: string,
    model: string,
    sdsType: string,
    supplierStatus: string,
    sdsStatus: string,
    dueDate: string,
    submittedDate?: string,
    completedDate?: string,
    hasDelay?: boolean,
    delayDays?: number,
}

interface FilterSummaryReport {
    monthYear: Date | null;
    supplierCode: string;
    partNo: string;
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
    const debounceTimerRef = useRef<number | null>(null);
    
    const [filters, setFilters] = useState<FilterSummaryReport>({
        monthYear: null,
        supplierCode: "All",
        partNo: "",
        sdsType: "All",
        supplierStatus: "All",
        sdsStatus: "All",
        delayNotDelay: "All",
    });

    const [appliedFilters, setAppliedFilters] = useState<FilterSummaryReport>({
        monthYear: null,
        supplierCode: "All",
        partNo: "",
        sdsType: "All",
        supplierStatus: "All",
        sdsStatus: "All",
        delayNotDelay: "All",
    });

    const [visibleHistory, setVisibleHistory] = useState<boolean>(false);
    const [selectedReportHistory, setSelectedReportHistory] = useState<any[]>([]);
    const [selectedSdsInspectionDetailId, setSelectedSdsInspectionDetailId] = useState<number | null>(null);

    const [supplierList, setSupplierList] = useState<{ label: string; value: string; }[]>([]);

    // Fetch history data using sdsInspectionDetailId
    const GetHistoryDatas = async (sdsInspectionDetailId: number) => {
        try {
            const response = await Get({ 
                url: `/sds-log/by-inspection-detail?sdsInspectionDetailId=${sdsInspectionDetailId}` 
            });

            if (!response.ok) {
                throw new Error('Failed to load history');
            }

            const payload = await response.json();
            const logs = payload?.data ?? [];

            // Map to match the interface
            const mappedLogs = logs.map((log: any) => ({
                id: log.id,
                menu: log.menu,
                action: log.action,
                actionRole: log.actionRole || '-',
                actionBy: log.actionBy || '-',
                actionDate: log.actionDate ? moment(log.actionDate).format('YYYY-MM-DD HH:mm:ss') : '-',
                remark: log.remark || '-',
            }));

            setSelectedReportHistory(mappedLogs);
            setTotalRowsHistory(mappedLogs.length);
        } catch (error) {
            console.error('Failed to load history:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Cannot load history data',
            });
            setSelectedReportHistory([]);
            setTotalRowsHistory(0);
        }
    };

    const openHistory = async (row: DataSummaryReportTable) => {
        setSelectedSdsInspectionDetailId(row.id);
        await GetHistoryDatas(row.id);
        setFirstHistory(0);
        setVisibleHistory(true);
    };

    const cancelPendingFilterApply = () => {
        if (debounceTimerRef.current) {
            window.clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
    };

    const applyFilters = (nextFilters: FilterSummaryReport) => {
        cancelPendingFilterApply();
        setAppliedFilters(nextFilters);
        setFirst(0);
    };

    const scheduleFilterApply = (nextFilters: FilterSummaryReport) => {
        cancelPendingFilterApply();
        debounceTimerRef.current = window.setTimeout(() => {
            applyFilters(nextFilters);
        }, 1000);
    };

    const handleInputChange = (value: string | null, field: keyof FilterSummaryReport) => {
        const normalized = value ?? 'All';
        setFilters((prev) => ({ ...prev, [field]: normalized }));
        setAppliedFilters((prev) => ({ ...prev, [field]: normalized }));
        setFirst(0);
    };

    const handleInputFilterChange = (value: string, field: string) => {
        const nextFilters = { ...filters, [field]: value };
        setFilters(nextFilters);
        scheduleFilterApply(nextFilters);
    };

    const handleMonthYearChange = (value: Date | null) => {
        const nextFilters = { ...filters, monthYear: value };
        setFilters(nextFilters);
        setAppliedFilters(nextFilters);
        setFirst(0);
    };

    const exportSummaryReportToExcel = async () => {
        // TODO: Implement export functionality
        toast.current?.show({ 
            severity: 'info', 
            summary: 'Export', 
            detail: 'Export functionality will be implemented', 
            life: 3000 
        });
    };

    const viewDocument = async (id: number) => {
        // TODO: Navigate to view page
        toast.current?.show({ 
            severity: 'info', 
            summary: 'View', 
            detail: `View document ID: ${id}`, 
            life: 3000 
        });
    };

    const viewBodyTemplate = (rowData: DataSummaryReportTable) => {
        return (
            <Button 
                label="VIEW" 
                className="p-button-link text-blue-500" 
                onClick={(e) => {
                    e.stopPropagation();
                    viewDocument(rowData.id);
                }}
                style={{ padding: 0, textDecoration: 'underline' }}
            />
        );
    };

    const supplierStatusBodyTemplate = (rowData: DataSummaryReportTable) => {
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

    const sdsStatusBodyTemplate = (rowData: DataSummaryReportTable) => {
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

    const dueDateBodyTemplate = (rowData: DataSummaryReportTable) => {
        const isDelay = rowData.hasDelay;
        return (
            <div className={rowData.hasDelay ? 'text-red-600 font-medium' : ''}>
                {rowData.dueDate}
                {isDelay ? ` (Delay: ${rowData.delayDays} days)` : ''}
            </div>
        );
    };

    const sdsTypeBodyTemplate = (rowData: DataSummaryReportTable) => {
        return (
            <div className={rowData.sdsType === 'Special' ? 'text-red-600 font-medium' : ''}>
                {rowData.sdsType}
            </div>
        );
    };

    const fetchSummaryReportData = useCallback(async () => {
        try {
            const params: Record<string, any> = {
                skip: first,
                limit: rows,
            };

            if (filters.monthYear) {
                params.monthYear = moment(filters.monthYear).format('MM-YYYY');
            }
            if (filters.partNo && filters.partNo.toLowerCase() !== 'all' && filters.partNo.trim()) {
                params.partNo = filters.partNo.trim();
            }
            if (filters.sdsType && filters.sdsType.toLowerCase() !== 'all') {
                params.sdsType = filters.sdsType;
            }
            if (filters.supplierCode && filters.supplierCode.toLowerCase() !== 'all') {
                params.supplierCode = filters.supplierCode;
            }
            if (filters.supplierStatus && filters.supplierStatus.toLowerCase() !== 'all') {
                params.supplierStatus = filters.supplierStatus;
            }
            if (filters.sdsStatus && filters.sdsStatus.toLowerCase() !== 'all') {
                params.sdsStatus = filters.sdsStatus;
            }
            if (filters.delayNotDelay && filters.delayNotDelay.toLowerCase() !== 'all') {
                params.hasDelay = filters.delayNotDelay === 'Delay';
            }

            const query = CreateQueryString(params);
            const path = `/sample-data-sheet/inspection-details${query ? `?${query}` : ''}`;
            const response = await Get({ url: path });

            if (!response.ok) {
                throw new Error('Failed to load summary report data');
            }

            const payload = await response.json();
            const body = payload?.data ?? {};
            const items = (body.items ?? []) as Array<any>;

            const mapped = items.map((item: any) => ({
                id: item.id,
                no: item.no,
                monthYear: item.monthYear,
                supplierCode: item.supplierCode ?? '',
                supplierName: item.supplierName,
                partNo: item.partNo,
                partName: item.partName,
                model: item.model,
                sdsType: item.sdsType,
                supplierStatus: item.supplierStatus || 'Pending',
                sdsStatus: item.adsStatus || 'Supplier Pending',
                dueDate: item.dueDate ? item.dueDate : '-',
                submittedDate: item.submittedDate ? moment(item.submittedDate).format('DD-MM-YYYY') : undefined,
                completedDate: item.completedDate ? moment(item.completedDate).format('DD-MM-YYYY') : undefined,
                hasDelay: item.hasDelay || false,
                delayDays: item.delayDays || 0,
            }));

            setSampleDataList(mapped);
            setTotalRows(body.total ?? mapped.length);
        } catch (error) {
            console.error('Failed to load summary report:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: (error as Error).message || 'Cannot load summary report data',
            });
            setSampleDataList([]);
            setTotalRows(0);
        }
    }, [filters, first, rows]);

    const loadSupplierOptions = async () => {
        try {
            const res = await Get({ url: '/inspection-detail/suppliers' });
            if (!res.ok) {
                const err: any = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to load suppliers');
            }

            const payload = await res.json();
            const data: any[] = payload?.data || [];
            setSupplierList([
                { label: 'All', value: 'All' },
                ...data.map((item) => ({
                    label: `${item.supplierCode} - ${item.supplierName}`,
                    value: item.supplierCode,
                })),
            ]);
        } catch (error: any) {
            console.error('Load supplier list failed', error);
        }
    };
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        loadSupplierOptions();
    }, []);

    useEffect(() => {
        fetchSummaryReportData();
    }, [fetchSummaryReportData]);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = getSocket();
        }

        const socket = socketRef.current;
        socket.on("sds-update", fetchSummaryReportData);

        return () => {
            socket.off("sds-update", fetchSummaryReportData);
        };
    }, [fetchSummaryReportData]);

    return (
       <div className="flex justify-center pt-6 px-6">
            <Toast ref={toast} />
            <div className="container">
                <div className="mx-4 mb-4 text-2xl font-bold py-3 border-solid border-t-0 border-x-0 border-b-2 border-gray-600">
                    Summary Report
                </div>
                
                {/* Filter Section */}
                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 w-[calc(100%-100px)]">
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="monthYear">Month-Year</label>
                            <Calendar
                                value={filters.monthYear}
                                onChange={(e) => handleMonthYearChange(e.value ?? null)}
                                view="month"
                                dateFormat="mm-yy"
                                placeholder="MM-YYYY"
                                showIcon
                                monthNavigator
                                yearNavigator
                                yearRange="2020:2030"
                                showButtonBar
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="supplierCode">Supplier</label>
                            <Dropdown
                                value={filters.supplierCode}
                                onChange={(e: DropdownChangeEvent) => handleInputChange(e.value, "supplierCode")}
                                options={supplierList}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Part No</label>
                            <InputText 
                                value={filters.partNo} 
                                onChange={(e) => handleInputFilterChange(e.target.value, 'partNo')} 
                                placeholder="Enter Part No" 
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
                            <label htmlFor="supplierStatus">Supplier Status</label>
                            <Dropdown
                                value={filters.supplierStatus}
                                onChange={(e: DropdownChangeEvent) => handleInputChange(e.value, "supplierStatus")}
                                options={[
                                    { label: 'All', value: 'All' },
                                    { label: 'Pending', value: 'Pending' },
                                    { label: 'Submitted', value: 'Submitted' },
                                ]}
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
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 w-[calc(100%-100px)]">
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="sdsStatus">SDS Status</label>
                            <Dropdown
                                value={filters.sdsStatus}
                                onChange={(e: DropdownChangeEvent) => handleInputChange(e.value, "sdsStatus")}
                                options={[
                                    { label: 'All', value: 'All' },
                                    { label: 'Supplier Pending', value: 'Supplier Pending' },
                                    { label: 'Rejected', value: 'Rejected' },
                                    { label: 'Completed', value: 'Completed' },
                                    { label: 'Wait for JATH Approve', value: 'Wait for JATH Approve' },
                                ]}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="delayNotDelay">Delay / Not Delay</label>
                            <Dropdown
                                value={filters.delayNotDelay}
                                onChange={(e: DropdownChangeEvent) => handleInputChange(e.value, "delayNotDelay")}
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
                    onRowClick={(e) => openHistory(e.data as DataSummaryReportTable)}
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
                    historyData={selectedReportHistory.slice(firstHistory, firstHistory + rowsHistory)}
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