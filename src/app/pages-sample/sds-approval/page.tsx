'use client';
import { useCallback, useEffect, useRef, useState } from "react";
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
import { CreateQueryString, Get } from "@/components/fetch";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";

interface FilterSDSApprove {
    monthYear: Date | null;
    supplierCode: string;
    partNo: string;
    sdsType: string;
    status: string;
}

type CalendarValueChange = {
    value?: Date | null | undefined;
};

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
    action?: boolean,
    checker1Approved?: boolean,
    checker1Rejected?: boolean,
    checker2Approved?: boolean,
    checker2Rejected?: boolean,
    checker3Approved?: boolean,
    checker3Rejected?: boolean,
    hasAnyRejection?: boolean,
}

export function SDSApprovalTable(props: { checker: 1 | 2 | 3 }) {
    const toast = useRef<Toast>(null);
    const [sdsList, setSdsList] = useState<DataSDS[]>([])
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const debounceTimerRef = useRef<number | null>(null);
    const [totalRows, setTotalRows] = useState<number>(0);
    const router = useRouter()

    const role: string = localStorage.getItem('role')!
    const [currentChecker, setCurrentChecker] = useState<1 | 2 | 3>(props.checker);

    const [filters, setFilters] = useState<FilterSDSApprove>({
        monthYear: new Date(),
        supplierCode: "All",
        partNo: "",
        sdsType: "All",
        status: "All",
    });

    const [appliedFilters, setAppliedFilters] = useState<FilterSDSApprove>({
        monthYear: new Date(),
        supplierCode: "All",
        partNo: "",
        sdsType: "All",
        status: "All",
    });

    const sanitizeFilters = (rawFilters: FilterSDSApprove) => ({
        ...rawFilters,
        partNo: rawFilters.partNo.trim(),
    });

    const cancelPendingFilterApply = () => {
        if (debounceTimerRef.current) {
            window.clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
    };

    const applyFilters = (nextFilters: FilterSDSApprove) => {
        cancelPendingFilterApply();
        setAppliedFilters(sanitizeFilters(nextFilters));
        setFirst(0);
    };

    const scheduleFilterApply = (nextFilters: FilterSDSApprove) => {
        cancelPendingFilterApply();
        debounceTimerRef.current = window.setTimeout(() => {
            applyFilters(nextFilters);
        }, 1000);
    };

    const handleInputChange = (value: string | null, field: keyof FilterSDSApprove) => {
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

    const actionBodyTemplate = (rowData: DataSDS) => {
        // Determine if button should be disabled
        let isDisabled = false;
        let disableReason = '';

        if (!rowData.action) {
            // SDS not created yet
            return <div className="w-[100px]">&nbsp;</div>;
        }

        // ตรวจสอบว่ามีการ reject หรือไม่ - ต้องรอ supplier แก้ไขก่อน
        if (rowData.hasAnyRejection) {
            return (
                <Button
                    label="View"
                    className="p-button-warning"
                    disabled
                    outlined
                    tooltip="Waiting for supplier to fix rejected items"
                    tooltipOptions={{ position: 'top' }}
                />
            );
        }

        if (currentChecker === 1) {
            // Checker 1: Disable if already approved or rejected
            if (rowData.checker1Approved || rowData.checker1Rejected) {
                isDisabled = true;
                disableReason = 'Already processed';
            }
        } else if (currentChecker === 2) {
            // Checker 2: Disable if not yet approved by Checker 1, or already processed by Checker 2
            if (!rowData.checker1Approved || rowData.checker1Rejected) {
                isDisabled = true;
                disableReason = 'Waiting for Checker 1';
            } else if (rowData.checker2Approved || rowData.checker2Rejected) {
                isDisabled = true;
                disableReason = 'Already processed';
            }
        } else if (currentChecker === 3) {
            // Checker 3: Disable if not yet approved by Checker 2, or already processed by Checker 3
            if (!rowData.checker2Approved || rowData.checker2Rejected) {
                isDisabled = true;
                disableReason = 'Waiting for Checker 2';
            } else if (rowData.checker3Approved || rowData.checker3Rejected) {
                isDisabled = true;
                disableReason = 'Already processed';
            }
        }

        if (isDisabled) {
            return (
                <Button
                    label="View"
                    className="p-button-secondary"
                    disabled
                    outlined
                    tooltip={disableReason}
                    tooltipOptions={{ position: 'top' }}
                />
            );
        }

        return (
            <Button
                label="View"
                className="p-button-primary"
                outlined
                onClick={() => router.push(`/pages-sample/sds-approval/detail/checker${currentChecker}/${rowData.id}`)}
            />
        );
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
                case 'Processed':
                    return 'text-green-600';
                case 'Rejected':
                    return 'text-red-600';
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

    const filtersRef = useRef(filters);
    const skipAutoLoadRef = useRef(false);
    const filterDebounceRef = useRef<number | null>(null);

    const clearFilterDebounce = useCallback(() => {
        if (filterDebounceRef.current) {
            window.clearTimeout(filterDebounceRef.current);
            filterDebounceRef.current = null;
        }
    }, []);

    const loadInspectionDetails = useCallback(async () => {
        try {
            const params: Record<string, any> = {
                skip: first,
                limit: rows,
                checkerLevel: currentChecker,
            };

            if (filters.monthYear) {
                params.monthYear = filters.monthYear ? moment(filters.monthYear).format('MM-YYYY') : null;
            }
            if (filters.partNo && filters.partNo.toLowerCase() !== 'all') {
                params.partNo = filters.partNo;
            }
            if (filters.sdsType && filters.sdsType.toLowerCase() !== 'all') {
                params.sdsType = filters.sdsType;
            }
            if (filters.supplierCode && filters.supplierCode.toLowerCase() !== 'all') {
                params.supplierCode = filters.supplierCode;
            }
            if (filters.status && filters.status.toLowerCase() !== 'all') {
                params.status = filters.status;
            }

            const query = CreateQueryString(params);
            const path = `/sample-data-sheet/inspection-details${query ? `?${query}` : ''}`;
            const response = await Get({ url: path });

            if (!response.ok) {
                throw new Error('ไม่สามารถโหลดข้อมูล SDS Approval ได้ในขณะนี้');
            }

            const payload = await response.json();
            const body = payload?.data ?? {};
            const items = (body.items ?? []) as Array<{
                id: number;
                no: number;
                monthYear: string;
                supplierCode?: string;
                supplierName: string;
                partNo: string;
                partName: string;
                model: string;
                sdsType: 'Special' | 'Normal';
                supplierStatus: string;
                dueDate?: string | null;
                hasDelay: boolean;
                sdsCreated: boolean;
                checker1Approved?: boolean;
                checker1Rejected?: boolean;
                checker2Approved?: boolean;
                checker2Rejected?: boolean;
                checker3Approved?: boolean;
                checker3Rejected?: boolean;
            }>;

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
                status: item.supplierStatus,
                dueDate: item.dueDate ?? '-',
                action: item.sdsCreated,
                checker1Approved: item.checker1Approved ?? false,
                checker1Rejected: item.checker1Rejected ?? false,
                checker2Approved: item.checker2Approved ?? false,
                checker2Rejected: item.checker2Rejected ?? false,
                checker3Approved: item.checker3Approved ?? false,
                checker3Rejected: item.checker3Rejected ?? false,
            }));

            setSdsList(mapped);
            setTotalRows(body.total ?? mapped.length);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: (error as Error).message || 'ไม่สามารถโหลดข้อมูล SDS Approval ได้',
            });
        }
    }, [filters, first, rows, currentChecker]);

    const resetPaginationForFilters = () => {
        skipAutoLoadRef.current = true;
        setFirst(0);
    };

    const handleMonthYearChange = (value: Date | null) => {
        const nextFilters = { ...filters, monthYear: value };
        setFilters(nextFilters);
        setAppliedFilters(nextFilters);
        filtersRef.current = nextFilters;
        resetPaginationForFilters();
        // scheduleFilterLoad();
    };

    const socketRef = useRef<Socket | null>(null);

    const [supplierList, setSupplierOptions] = useState<{ label: string; value: string; }[]>([]);

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

    const loadSupplierOptions = async () => {
        try {
            const res = await Get({ url: '/inspection-detail/suppliers' });
            if (!res.ok) {
                const err: any = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to load suppliers');
            }

            const payload = await res.json();
            const data: any[] = payload?.data || [];
            setSupplierOptions([
                { label: 'All', value: 'All' },
                ...data.map((item) => ({
                    label: `${item.supplierCode} - ${item.supplierName}`,
                    value: item.supplierCode,
                    supplierName: item.supplierName,
                })),
            ]);
        } catch (error: any) {
            console.error('Load supplier list failed', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Cannot load supplier codes',
            });
        }
    };

    useEffect(() => {
        loadSupplierOptions();
    }, []);

    useEffect(() => {
        setCurrentChecker(props.checker);
    }, [props.checker]);

    useEffect(() => {
        loadInspectionDetails();
    }, [loadInspectionDetails]);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = getSocket();
        }

        const socket = socketRef.current;
        socket.on("sds-update", loadInspectionDetails);

        return () => {
            socket.off("sds-update", loadInspectionDetails);
        };
    }, [loadInspectionDetails]);

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
                            <Calendar
                                value={filters.monthYear}
                                onChange={(e: CalendarValueChange) => handleMonthYearChange(e.value ?? null)}
                                view="month"
                                dateFormat="mm-yy"
                                showIcon
                                monthNavigator
                                yearNavigator
                                yearRange="2020:2030"
                                showButtonBar
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="supplierName">Supplier</label>
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
                            <InputText value={filters.partNo} onChange={(e) => handleInputFilterChange(e.target.value, 'partNo')} placeholder="Enter Part No" className="w-full" />
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
                                    { label: 'Processed', value: 'Processed' },
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
                            <Button label="Search" icon="pi pi-search" onClick={() => loadInspectionDetails()} />
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