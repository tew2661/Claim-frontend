'use client';

import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";
import { Get } from "@/components/fetch";
import moment from "moment";

interface HistoryData {
    id: number;
    no: number;
    menu: string;
    partNo: string;
    sdsMonthYear: string;
    action: string;
    actionRole: string;
    actionBy: string;
    actionDate: string;
    remark: string;
}

export default function History() {
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const storeRole: string = localStorage.getItem('role')!
    const [filters, setFilters] = useState({
        menu: 'All',
        partNo: '',
        sdsMonthYear: null as Date | null,
        action: 'All',
        actionRole: 'All',
        actionBy: 'All',
        actionDate: null as Date | null
    });

    const [searchFilters, setSearchFilters] = useState({
        menu: 'All',
        partNo: '',
        sdsMonthYear: null as Date | null,
        action: 'All',
        actionRole: 'All',
        actionBy: 'All',
        actionDate: null as Date | null
    });

    const [data, setData] = useState<HistoryData[]>([]);
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const menuOptions = [
        { label: 'All', value: 'All' },
        { label: 'Create SDS', value: 'Create SDS' },
        { label: 'Inspection Detail', value: 'Inspection Detail' },
        { label: 'SDS Approval', value: 'SDS Approval' },
    ];

    const actionOptions = [
        { label: 'All', value: 'All' },
        { label: 'Submitted', value: 'Submitted' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Special Request', value: 'Special Request' },
        { label: 'Create / Edit', value: 'Create / Edit' },
    ];

    const actionRoleOptions = [
        { label: 'All', value: 'All' },
        { label: 'Supplier', value: 'Supplier' },
        { label: 'Checker1', value: 'Checker 1' },
        { label: 'Checker2', value: 'Checker 2' },
        { label: 'Approver', value: 'Approver' },
    ];

    const [actionByOptions, setActionByOptions] = useState<{ label: string; value: string }[]>([
        { label: 'All', value: 'All' },
    ]);

    const loadActionByOptions = async (actionRole?: string) => {
        try {
            const params = new URLSearchParams();
            if (actionRole && actionRole !== 'All') {
                params.append('actionRole', actionRole);
            }
            const url = `/sds-log/action-by-options${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await Get({ url });
            if (response.ok) {
                const result = await response.json();
                const options = (result.data || []).map((name: string) => ({
                    label: name,
                    value: name,
                }));
                setActionByOptions([{ label: 'All', value: 'All' }, ...options]);
            }
        } catch (error) {
            console.error('Failed to load action by options:', error);
        }
    };

    const GetDatas = async () => {
        setLoading(true);
        try {
            // Build query parameters
            const params = new URLSearchParams();

            if (searchFilters.menu && searchFilters.menu !== 'All') {
                params.append('menu', searchFilters.menu);
            }
            if (searchFilters.partNo && searchFilters.partNo.trim() !== '') {
                params.append('partNo', searchFilters.partNo.trim());
            }
            if (searchFilters.sdsMonthYear) {
                params.append('sdsMonthYear', moment(searchFilters.sdsMonthYear).format('MM-YYYY'));
            }
            if (searchFilters.action && searchFilters.action !== 'All') {
                params.append('action', searchFilters.action);
            }
            if (searchFilters.actionRole && searchFilters.actionRole !== 'All') {
                params.append('actionRole', searchFilters.actionRole);
            }
            if (searchFilters.actionBy && searchFilters.actionBy !== 'All') {
                params.append('actionBy', searchFilters.actionBy);
            }
            if (searchFilters.actionDate) {
                params.append('actionDateFrom', moment(searchFilters.actionDate).startOf('day').toISOString());
                params.append('actionDateTo', moment(searchFilters.actionDate).endOf('day').toISOString());
            }

            // Add pagination parameters
            params.append('limit', rows.toString());
            params.append('offset', first.toString());

            const queryString = params.toString();
            const url = `/sds-log${queryString ? `?${queryString}` : ''}`;

            const response = await Get({ url });

            if (!response.ok) {
                throw new Error('Failed to fetch history data');
            }

            const result = await response.json();
            const logs = result.data || [];

            // Use total from server-side pagination
            setTotalRows(result.total || 0);

            // Direct mapping (server already handles pagination)
            setData(logs.map((log: any, i: number) => ({
                id: log.id,
                no: first + i + 1,
                menu: log.menu,
                partNo: log.partNo || '',
                sdsMonthYear: log.sdsMonthYear || '',
                action: log.action,
                actionRole: log.actionRole || '',
                actionBy: log.actionBy || '',
                actionDate: moment(log.actionDate).format('DD/MM/YYYY HH:mm:ss'),
                remark: log.remark || '',
            })));
        } catch (error: any) {
            console.error('Failed to fetch history:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to load history data',
            });
            setData([]);
            setTotalRows(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetDatas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [first, rows, searchFilters]);

    useEffect(() => {
        loadActionByOptions(filters.actionRole);
        // Reset actionBy when actionRole changes
        if (filters.actionBy !== 'All') {
            setFilters(old => ({ ...old, actionBy: 'All' }));
            setSearchFilters(old => ({ ...old, actionBy: 'All' }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.actionRole]);

    const handleFilterChange = (value: string | null, field: string) => {
        const newFilters = { ...filters, [field]: value || 'All' };
        setFilters(newFilters);
        setSearchFilters(newFilters);
    };

    const handlePartNoChange = (value: string) => {
        setFilters(old => ({ ...old, partNo: value }));

        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer to update search after 1 second
        debounceTimer.current = setTimeout(() => {
            setSearchFilters(old => ({ ...old, partNo: value }));
        }, 1000);
    };

    const handleSdsMonthYearChange = (value: Date | null) => {
        const newFilters = { ...filters, sdsMonthYear: value };
        setFilters(newFilters);
        setSearchFilters(newFilters);
    };

    const handleDateChange = (value: Date | null) => {
        const newFilters = { ...filters, actionDate: value };
        setFilters(newFilters);
        setSearchFilters(newFilters);
    };

    const sdsMonthYearBody = (row: HistoryData) => {
        const isSpecial = row.sdsMonthYear.includes('Special');
        return (
            <div>
                <div>{row.sdsMonthYear.replace(' Special', '')}</div>
                {isSpecial && <div className="text-red-500 font-semibold">Special</div>}
            </div>
        );
    };

    return (
        <div className="flex justify-center pt-6 px-6">
            <Toast ref={toast} />
            <div className="container">
                <div className="mx-4 mb-4 text-2xl font-bold py-3 border-solid border-t-0 border-x-0 border-b-2 border-gray-600">History</div>
                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 w-[calc(100%-100px)]">
                        <div className="flex flex-col gap-2 w-full">
                            <label>Menu</label>
                            <Dropdown
                                value={filters.menu}
                                onChange={(e) => handleFilterChange(e.value, 'menu')}
                                options={menuOptions}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Part No.</label>
                            <InputText
                                value={filters.partNo}
                                onChange={(e) => handlePartNoChange(e.target.value)}
                                placeholder="Enter Part No."
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>SDS Month-Year</label>
                            <Calendar
                                value={filters.sdsMonthYear}
                                onChange={(e) => handleSdsMonthYearChange(e.value as Date | null)}
                                view="month"
                                dateFormat="mm-yy"
                                showIcon
                                className="w-full"
                                placeholder="Select Month-Year"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Action</label>
                            <Dropdown
                                value={filters.action}
                                onChange={(e) => handleFilterChange(e.value, 'action')}
                                options={actionOptions}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        {
                            storeRole !== 'Supplier' ? <div className="flex flex-col gap-2 w-full">
                                <label>Action Role</label>
                                <Dropdown
                                    value={filters.actionRole}
                                    onChange={(e) => handleFilterChange(e.value, 'actionRole')}
                                    options={actionRoleOptions}
                                    optionLabel="label"
                                    className="w-full"
                                />
                            </div> : <div className="flex flex-col gap-2 w-full">
                                <label>Action Date</label>
                                <div className="flex gap-2">
                                    <Calendar
                                        value={filters.actionDate}
                                        onChange={(e) => handleDateChange(e.value as Date | null)}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        className="w-full"
                                        placeholder="Select Date"
                                    />

                                </div>
                            </div>
                        }

                    </div>
                    <div className="w-[100px]">
                        <div className="flex flex-col gap-2">
                            <label>&nbsp;</label>
                            <Button label="Search" icon="pi pi-search" onClick={() => GetDatas()} />
                        </div>
                    </div>

                </div>
                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 w-[calc(100%-100px)]">

                        {
                            storeRole !== 'Supplier' ? <>
                                <div className="flex flex-col gap-2 w-full">
                                    <label>Action By</label>
                                    <Dropdown
                                        value={filters.actionBy}
                                        onChange={(e) => handleFilterChange(e.value, 'actionBy')}
                                        options={actionByOptions}
                                        optionLabel="label"
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <label>Action Date</label>
                                    <div className="flex gap-2">
                                        <Calendar
                                            value={filters.actionDate}
                                            onChange={(e) => handleDateChange(e.value as Date | null)}
                                            dateFormat="dd/mm/yy"
                                            showIcon
                                            className="w-full"
                                            placeholder="Select Date"
                                        />

                                    </div>
                                </div>
                            </> : undefined
                        }

                    </div>
                </div>

                <DataTable
                    value={data}
                    loading={loading}
                    showGridlines
                    className='table-header-center mt-4'
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
                    <Column field="menu" header="Menu" bodyStyle={{ width: '12%' }}></Column>
                    <Column field="partNo" header="Part No." bodyStyle={{ width: '10%', textAlign: 'center' }}></Column>
                    <Column header="SDS Month-Year" body={sdsMonthYearBody} bodyStyle={{ width: '10%', textAlign: 'center' }}></Column>
                    <Column field="action" header="Action" bodyStyle={{ width: '10%', textAlign: 'center' }}></Column>
                    <Column field="actionRole" header="Action Role" bodyStyle={{ width: '10%', textAlign: 'center' }}></Column>
                    <Column field="actionBy" header="Action By" bodyStyle={{ width: '13%' }}></Column>
                    <Column field="actionDate" header="Action Date" bodyStyle={{ width: '12%', textAlign: 'center' }}></Column>
                    <Column field="remark" header="Remark" bodyStyle={{ width: '18%' }}></Column>
                </DataTable>
            </div>
        </div>
    );
}