'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";
import { Get, CreateQueryString } from "@/components/fetch";
import { Calendar } from "primereact/calendar";

interface CreateSDSData {
    id: number;
    no: number;
    monthYear: string;
    supplierName: string;
    partNo: string;
    partName: string;
    model: string;
    sdsType: 'Special' | 'Normal';
    supplierStatus: string;
    dueDate?: string | null;
    hasDelay: boolean;
    sdsCreated: boolean;
}

interface FilterState {
    monthYear: Date | null;
    partNo: string;
    partName: string;
    model: string;
    sdsType: string;
}

type CalendarValueChange = {
    value?: Date | null | undefined;
};

const formatFilterMonthYear = (value: Date | null): string | undefined => {
    if (!value) return undefined;
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();
    return `${month}-${year}`;
};

export default function CreateSDS() {
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const [data, setData] = useState<CreateSDSData[]>([]);
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRows, setTotalRows] = useState<number>(0);

    const [filters, setFilters] = useState<FilterState>({
        monthYear: new Date(),
        partNo: '',
        partName: '',
        model: '',
        sdsType: 'All'
    });

    const filtersRef = useRef(filters);
    const filterDebounceRef = useRef<number | null>(null);
    const skipAutoLoadRef = useRef(false);

    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    const sdsTypeOptions = [
        { label: 'All', value: 'All' },
        { label: 'Normal', value: 'Normal' },
        { label: 'Special', value: 'Special' },
    ];

    const loadInspectionList = useCallback(async () => {
        try {
            const currentFilters = filtersRef.current;
            const monthYearString = formatFilterMonthYear(currentFilters.monthYear);
            const params: Record<string, any> = {
                skip: first,
                limit: rows,
            };
            const trimmedPartNo = currentFilters.partNo?.trim();
            if (trimmedPartNo) {
                params.partNo = trimmedPartNo;
            }
            const trimmedPartName = currentFilters.partName?.trim();
            if (trimmedPartName) {
                params.partName = trimmedPartName;
            }
            const trimmedModel = currentFilters.model?.trim();
            if (trimmedModel) {
                params.model = trimmedModel;
            }
            if (currentFilters.sdsType && currentFilters.sdsType !== 'All') {
                params.sdsType = currentFilters.sdsType;
            }
            if (monthYearString) {
                params.monthYear = monthYearString;
            }
            const query = CreateQueryString(params);
            const path = `/sample-data-sheet/inspection-details${query ? `?${query}` : ''}`;
            const response = await Get({ url: path });
            if (!response.ok) {
                throw new Error('ไม่สามารถโหลดข้อมูล Create SDS ได้ในขณะนี้');
            }
            const payload = await response.json();
            const body = payload?.data ?? {};
            const list = (body.items ?? []) as CreateSDSData[];
            setData(list);
            setTotalRows(body.total ?? list.length);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: (error as Error).message || 'ไม่สามารถโหลดข้อมูล Create SDS ได้',
            });
        }
    }, [first, rows]);

    useEffect(() => {
        if (skipAutoLoadRef.current) {
            skipAutoLoadRef.current = false;
            return;
        }
        loadInspectionList();
    }, [first, rows, loadInspectionList]);

    const clearFilterDebounce = useCallback(() => {
        if (filterDebounceRef.current) {
            window.clearTimeout(filterDebounceRef.current);
            filterDebounceRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            clearFilterDebounce();
        };
    }, [clearFilterDebounce]);

    const scheduleFilterLoad = useCallback(() => {
        clearFilterDebounce();
        filterDebounceRef.current = window.setTimeout(() => {
            loadInspectionList();
        }, 1000);
    }, [clearFilterDebounce, loadInspectionList]);

    const resetPaginationForFilters = () => {
        skipAutoLoadRef.current = true;
        setFirst(0);
    };

    const handleDropdownFilterChange = (value: string | null, field: Exclude<keyof FilterState, 'monthYear' | 'partNo' | 'partName' | 'model'>) => {
        const nextFilters = { ...filters, [field]: value || 'All' };
        setFilters(nextFilters);
        filtersRef.current = nextFilters;
        resetPaginationForFilters();
        scheduleFilterLoad();
    };

    const handleTextFilterChange = (value: string, field: 'partNo' | 'partName' | 'model') => {
        const nextFilters = { ...filters, [field]: value };
        setFilters(nextFilters);
        filtersRef.current = nextFilters;
        resetPaginationForFilters();
        scheduleFilterLoad();
    };

    const handleMonthYearChange = (value: Date | null) => {
        const nextFilters = { ...filters, monthYear: value };
        setFilters(nextFilters);
        filtersRef.current = nextFilters;
        resetPaginationForFilters();
        scheduleFilterLoad();
    };

    const monthYearBody = (row: CreateSDSData) => {
        return (
            <div>
                <div>{row.monthYear}</div>
                {row.sdsType === 'Special' && <div className="text-red-500 font-semibold">Special</div>}
            </div>
        );
    };

    const sdsTypeBody = (row: CreateSDSData) => {
        return (
            <span className={row.sdsType === 'Special' ? 'text-red-500 font-semibold' : ''}>
                {row.sdsType}
            </span>
        );
    };

    const dueDateBody = (row: CreateSDSData) => {
        return (
            <div>
                <div>{row.dueDate || '-'}</div>
                {row.hasDelay && <div className="text-red-500 font-semibold">Delay</div>}
            </div>
        );
    };

    const createSDSBody = (row: CreateSDSData) => {
        const isEdit = row.sdsCreated;
        return (
            <Button 
                label={isEdit ? "Edit" : "Create"} 
                className="p-button-text p-button-sm text-blue-600"
                onClick={() => {
                    if (isEdit) {
                        router.push(`/pages-sample/create-sds/edit/${row.id}`);
                    } else {
                        router.push(`/pages-sample/create-sds/create/${row.id}`);
                    }
                }}
            />
        );
    };

    return (
        <div className="flex justify-center pt-6 px-6">
            <Toast ref={toast} />
            <div className="container">
                <div className="mx-4 mb-4 text-2xl font-bold py-3 border-solid border-t-0 border-x-0 border-b-2 border-gray-600">Create SDS</div>

                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <label>Month-Year</label>
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
                            <label>Part No.</label>
                            <InputText
                                value={filters.partNo}
                                onChange={(e) => handleTextFilterChange(e.target.value, 'partNo')}
                                placeholder="Search Part No."
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Part Name</label>
                            <InputText
                                value={filters.partName}
                                onChange={(e) => handleTextFilterChange(e.target.value, 'partName')}
                                placeholder="Search Part Name"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Model</label>
                            <InputText
                                value={filters.model}
                                onChange={(e) => handleTextFilterChange(e.target.value, 'model')}
                                placeholder="Search Model"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>SDS Type</label>
                            <Dropdown 
                                value={filters.sdsType} 
                                onChange={(e) => handleDropdownFilterChange(e.value, 'sdsType')} 
                                options={sdsTypeOptions} 
                                optionLabel="label" 
                                className="w-full" 
                            />
                        </div>
                    </div>
                </div>

                <DataTable 
                    value={data} 
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
                    <Column field="no" header="No" bodyStyle={{ width: '4%', textAlign: 'center' }}></Column>
                    <Column header="Month-Year" body={monthYearBody} bodyStyle={{ width: '8%', textAlign: 'center' }}></Column>
                    <Column field="supplierName" header="Supplier Name" bodyStyle={{ width: '15%' }}></Column>
                    <Column field="partNo" header="Part No." bodyStyle={{ width: '10%', textAlign: 'center' }}></Column>
                    <Column field="partName" header="Part Name" bodyStyle={{ width: '15%' }}></Column>
                    <Column field="model" header="Model" bodyStyle={{ width: '8%', textAlign: 'center' }}></Column>
                    <Column header="SDS Type" body={sdsTypeBody} bodyStyle={{ width: '8%', textAlign: 'center' }}></Column>
                    <Column field="supplierStatus" header="Supplier Status" bodyStyle={{ width: '10%', textAlign: 'center' }}></Column>
                    <Column header="Due Date" body={dueDateBody} bodyStyle={{ width: '10%', textAlign: 'center' }}></Column>
                    <Column header="Create SDS" body={createSDSBody} bodyStyle={{ width: '8%', textAlign: 'center' }}></Column>
                </DataTable>
            </div>
        </div>
    );
}