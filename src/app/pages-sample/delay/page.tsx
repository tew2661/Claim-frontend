'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { useRouter } from "next/navigation";
import { CreateQueryString, Get } from "@/components/fetch";
import moment from "moment";
import { Socket } from "socket.io-client";
import { getSocket } from "@/components/socket/socket";

interface DelayData {
    id: number;
    no: number;
    monthYear: string;
    supplierCode: string;
    supplierName: string;
    partNo: string;
    partName: string;
    model: string;
    sdsType: string;
    dueDate: string;
    delayDate: number;
    hasDelay: boolean;
}

interface FilterDelay {
    monthYear: Date | null;
    supplierCode: string;
    partNo: string;
    sdsType: string;
}

export default function Delay() {
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const debounceTimerRef = useRef<number | null>(null);

    const [filters, setFilters] = useState<FilterDelay>({
        monthYear: null,
        supplierCode: 'All',
        partNo: '',
        sdsType: 'All'
    });

    const [appliedFilters, setAppliedFilters] = useState<FilterDelay>(filters);
    const [data, setData] = useState<DelayData[]>([]);
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [supplier, setSupplier] = useState<{ label: string; value: string }[]>([]);

    const sdsTypeOptions = [
        { label: 'All', value: 'All' },
        { label: 'Normal', value: 'Normal' },
        { label: 'Special', value: 'Special' },
    ];

    const cancelPendingFilterApply = () => {
        if (debounceTimerRef.current) {
            window.clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
    };

    const applyFilters = (nextFilters: FilterDelay) => {
        cancelPendingFilterApply();
        setAppliedFilters(nextFilters);
        setFirst(0);
    };

    const scheduleFilterApply = (nextFilters: FilterDelay) => {
        cancelPendingFilterApply();
        debounceTimerRef.current = window.setTimeout(() => {
            applyFilters(nextFilters);
        }, 1000);
    };

    const updateFilterCriteria = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FilterDelay) => {
        const value = e.target.value;
        setFilters(old => {
            const next = { ...old, [field]: value };
            scheduleFilterApply(next);
            return next;
        });
    };

    const fetchDelayData = useCallback(async () => {
        try {
            const params: Record<string, any> = {
                skip: first,
                limit: rows,
            };

            if (appliedFilters.monthYear) {
                params.monthYear = moment(appliedFilters.monthYear).format('MM-YYYY');
            }
            if (appliedFilters.partNo && appliedFilters.partNo.trim()) {
                params.partNo = appliedFilters.partNo.trim();
            }
            if (appliedFilters.sdsType && appliedFilters.sdsType.toLowerCase() !== 'all') {
                params.sdsType = appliedFilters.sdsType;
            }
            if (appliedFilters.supplierCode && appliedFilters.supplierCode.toLowerCase() !== 'all') {
                params.supplierCode = appliedFilters.supplierCode;
            }

            const query = CreateQueryString(params);
            const path = `/sample-data-sheet/inspection-details-delay${query ? `?${query}` : ''}`;
            const response = await Get({ url: path });

            if (!response.ok) {
                throw new Error('Failed to load delay data');
            }

            const payload = await response.json();
            const body = payload?.data ?? {};
            const items = (body.items ?? []) as Array<any>;

            const mapped = items.map((item: any, index: number) => ({
                id: item.id,
                no: first + index + 1,
                monthYear: item.monthYear,
                supplierCode: item.supplierCode ?? '',
                supplierName: item.supplierName,
                partNo: item.partNo,
                partName: item.partName,
                model: item.model,
                sdsType: item.sdsType,
                dueDate: item.dueDate ? item.dueDate : '-',
                delayDate: item.delayDays || 0,
                hasDelay: item.hasDelay || false,
            }));

            setData(mapped);
            setTotalRows(body.total ?? mapped.length);
        } catch (error) {
            console.error('Failed to load delay data:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: (error as Error).message || 'Cannot load delay data',
            });
            setData([]);
            setTotalRows(0);
        }
    }, [appliedFilters, first, rows]);

    const loadSupplierOptions = async () => {
        try {
            const res = await Get({ url: '/inspection-detail/suppliers' });
            if (!res.ok) {
                throw new Error('Failed to load suppliers');
            }
            const payload = await res.json();
            const data: any[] = payload?.data || [];
            setSupplier(
                data.map((item) => ({
                    label: `${item.supplierCode} - ${item.supplierName}`,
                    value: item.supplierCode,
                }))
            );
        } catch (error: any) {
            console.error('Load supplier list failed', error);
        }
    };

    useEffect(() => {
        loadSupplierOptions();
    }, []);

    useEffect(() => {
        fetchDelayData();
    }, [fetchDelayData]);

    useEffect(() => {
        const socket: Socket = getSocket();
        socket.on("sds-update", fetchDelayData);
        return () => {
            socket.off("sds-update", fetchDelayData);
        };
    }, [fetchDelayData]);

    const monthYearBody = (row: DelayData) => {
        const isSpecial = row.sdsType === 'Special';
        return (
            <div>
                <div>{row.monthYear}</div>
                {isSpecial && <div className="text-red-500 font-semibold">Special</div>}
            </div>
        );
    };

    const sdsTypeBody = (row: DelayData) => {
        return (
            <span className={row.sdsType === 'Special' ? 'text-red-500 font-semibold' : ''}>
                {row.sdsType}
            </span>
        );
    };

    return (
        <div className="flex justify-center pt-6 px-6">
            <Toast ref={toast} />
            <div className="container">
                <div className="mx-4 mb-4 text-2xl font-bold py-3 border-solid border-t-0 border-x-0 border-b-2 border-gray-600">Delay</div>

                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-[calc(100%-100px)]">
                        <div className="flex flex-col gap-2 w-full">
                            <label>Month-Year</label>
                            <Calendar
                                id="monthYear"
                                value={filters.monthYear}
                                onChange={(e) => {
                                    const next = { ...filters, monthYear: e.value as Date | null };
                                    setFilters(next);
                                    applyFilters(next);
                                }}
                                view="month"
                                dateFormat="mm-yy"
                                placeholder="MM-YYYY"
                                showIcon
                                className="w-full"
                                style={{ padding: 0 }}
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Supplier</label>
                            <Dropdown 
                                value={filters.supplierCode} 
                                onChange={(e) => {
                                    const next = { ...filters, supplierCode: e.value };
                                    setFilters(next);
                                    applyFilters(next);
                                }}
                                options={[{ label: 'All', value: 'All' }, ...supplier]}
                                optionLabel="label"
                                className="w-full" 
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Part No</label>
                            <InputText
                                id="partNo"
                                value={filters.partNo}
                                onChange={(e) => updateFilterCriteria(e, "partNo")}
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>SDS Type</label>
                            <Dropdown 
                                value={filters.sdsType} 
                                onChange={(e) => {
                                    const next = { ...filters, sdsType: e.value };
                                    setFilters(next);
                                    applyFilters(next);
                                }}
                                options={sdsTypeOptions} 
                                optionLabel="label" 
                                className="w-full" 
                            />
                        </div>
                    </div>
                    <div className="w-[100px]">
                        <div className="flex flex-col gap-2">
                            <label>&nbsp;</label>
                            <Button label="Search" icon="pi pi-search" onClick={() => fetchDelayData()} />
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
                    <Column field="no" header="No." bodyStyle={{ width: '5%', textAlign: 'center' }}></Column>
                    <Column header="Month-Year" body={monthYearBody} bodyStyle={{ width: '10%', textAlign: 'center' }}></Column>
                    <Column field="supplierName" header="Supplier Name" bodyStyle={{ width: '15%' }}></Column>
                    <Column field="partNo" header="Part No." bodyStyle={{ width: '12%', textAlign: 'center' }}></Column>
                    <Column field="partName" header="Part Name" bodyStyle={{ width: '15%' }}></Column>
                    <Column field="model" header="Model" bodyStyle={{ width: '8%', textAlign: 'center' }}></Column>
                    <Column header="SDS Type" body={sdsTypeBody} bodyStyle={{ width: '10%', textAlign: 'center' }}></Column>
                    <Column field="dueDate" header="Due Date" bodyStyle={{ width: '12%', textAlign: 'center' }}></Column>
                    <Column field="delayDate" header="Delay(Date)" bodyStyle={{ width: '10%', textAlign: 'center' }}></Column>
                </DataTable>
            </div>
        </div>
    );
}