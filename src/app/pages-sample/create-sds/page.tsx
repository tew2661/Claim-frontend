'use client';

import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";
import moment from "moment";

interface CreateSDSData {
    id: number;
    no: number;
    monthYear: string;
    supplierName: string;
    partNo: string;
    partName: string;
    model: string;
    sdsType: string;
    supplierStatus: string;
    dueDate: string;
    hasDelay: boolean;
}

export default function CreateSDS() {
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const [filters, setFilters] = useState({
        monthYear: '08-2025',
        partNo: 'All',
        partName: 'All',
        model: 'All',
        sdsType: 'All'
    });

    const [data, setData] = useState<CreateSDSData[]>([]);
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRows, setTotalRows] = useState<number>(0);

    const monthYearOptions = [
        { label: '08-2025', value: '08-2025' },
        { label: '07-2025', value: '07-2025' },
        { label: '06-2025', value: '06-2025' },
    ];

    const partNoOptions = [
        { label: 'All', value: 'All' },
        { label: '90151-06811', value: '90151-06811' },
        { label: '90151-06812', value: '90151-06812' },
        { label: '90151-06813', value: '90151-06813' },
    ];

    const partNameOptions = [
        { label: 'All', value: 'All' },
        { label: 'SCREW,FLATHEAD', value: 'SCREW,FLATHEAD' },
    ];

    const modelOptions = [
        { label: 'All', value: 'All' },
        { label: 'XXX', value: 'XXX' },
    ];

    const sdsTypeOptions = [
        { label: 'All', value: 'All' },
        { label: 'Normal', value: 'Normal' },
        { label: 'Special', value: 'Special' },
    ];

    // mock dataset
    const allMockData: CreateSDSData[] = [
        { id: 1, no: 1, monthYear: '08-2025 Special', supplierName: 'AAA CO., LTD.', partNo: '90151-06811', partName: 'SCREW,FLATHEAD', model: 'XXX', sdsType: 'Special', supplierStatus: 'Pending', dueDate: '17-08-2025', hasDelay: true },
        { id: 2, no: 2, monthYear: '08-2025 Special', supplierName: 'AAA CO., LTD.', partNo: '90151-06812', partName: 'SCREW,FLATHEAD', model: 'XXX', sdsType: 'Special', supplierStatus: 'Pending', dueDate: '21-08-2025', hasDelay: false },
        { id: 3, no: 3, monthYear: '08-2025', supplierName: 'AAA CO., LTD.', partNo: '90151-06813', partName: 'SCREW,FLATHEAD', model: 'XXX', sdsType: 'Normal', supplierStatus: 'Pending', dueDate: '31-08-2025', hasDelay: false },
        { id: 4, no: 4, monthYear: '08-2025', supplierName: 'AAA CO., LTD.', partNo: '90151-06814', partName: 'SCREW,FLATHEAD', model: 'XXX', sdsType: 'Normal', supplierStatus: 'Pending', dueDate: '31-08-2025', hasDelay: false },
        { id: 5, no: 5, monthYear: '08-2025', supplierName: 'AAA CO., LTD.', partNo: '90151-06815', partName: 'SCREW,FLATHEAD', model: 'XXX', sdsType: 'Normal', supplierStatus: 'Pending', dueDate: '31-08-2025', hasDelay: false },
        { id: 6, no: 6, monthYear: '08-2025', supplierName: 'AAA CO., LTD.', partNo: '90151-06816', partName: 'SCREW,FLATHEAD', model: 'XXX', sdsType: 'Normal', supplierStatus: 'Pending', dueDate: '31-08-2025', hasDelay: false },
        { id: 7, no: 7, monthYear: '08-2025', supplierName: 'AAA CO., LTD.', partNo: '90151-06817', partName: 'SCREW,FLATHEAD', model: 'XXX', sdsType: 'Normal', supplierStatus: 'Pending', dueDate: '31-08-2025', hasDelay: false },
        { id: 8, no: 8, monthYear: '08-2025', supplierName: 'AAA CO., LTD.', partNo: '90151-06818', partName: 'SCREW,FLATHEAD', model: 'XXX', sdsType: 'Normal', supplierStatus: 'Pending', dueDate: '31-08-2025', hasDelay: false },
        { id: 9, no: 9, monthYear: '08-2025', supplierName: 'AAA CO., LTD.', partNo: '90151-06819', partName: 'SCREW,FLATHEAD', model: 'XXX', sdsType: 'Normal', supplierStatus: 'Pending', dueDate: '31-08-2025', hasDelay: false },
        { id: 10, no: 10, monthYear: '08-2025', supplierName: 'AAA CO., LTD.', partNo: '90151-06820', partName: 'SCREW,FLATHEAD', model: 'XXX', sdsType: 'Normal', supplierStatus: 'Pending', dueDate: '31-08-2025', hasDelay: false },
    ];

    const GetDatas = async () => {
        // simulate server-side filter and pagination
        let filtered = allMockData;
        if (filters.monthYear && filters.monthYear !== 'All') {
            filtered = filtered.filter(x => x.monthYear.includes(filters.monthYear));
        }
        if (filters.partNo && filters.partNo !== 'All') {
            filtered = filtered.filter(x => x.partNo === filters.partNo);
        }
        if (filters.partName && filters.partName !== 'All') {
            filtered = filtered.filter(x => x.partName === filters.partName);
        }
        if (filters.model && filters.model !== 'All') {
            filtered = filtered.filter(x => x.model === filters.model);
        }
        if (filters.sdsType && filters.sdsType !== 'All') {
            filtered = filtered.filter(x => x.sdsType === filters.sdsType);
        }

        setTotalRows(filtered.length);
        const pageData = filtered.slice(first, first + rows);
        setData(pageData.map((d, i) => ({ ...d, no: first + i + 1 })));
    };

    useEffect(() => {
        GetDatas();
    }, [first, rows, filters]);

    const handleFilterChange = (value: string | null, field: string) => {
        setFilters(old => ({ ...old, [field]: value || 'All' }));
    };

    const monthYearBody = (row: CreateSDSData) => {
        const isSpecial = row.monthYear.includes('Special');
        return (
            <div>
                <div>{row.monthYear.replace(' Special', '')}</div>
                {isSpecial && <div className="text-red-500 font-semibold">Special</div>}
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
                <div>{row.dueDate}</div>
                {row.hasDelay && <div className="text-red-500 font-semibold">Delay</div>}
            </div>
        );
    };

    const createSDSBody = (row: CreateSDSData) => {
        // ถ้า row มี id 3 หรือ 4 จะแสดงเป็น Edit, อื่นๆแสดง Create
        const isEdit = row.id === 3 || row.id === 4;
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
                            <label>Month-Year : 08-2025</label>
                            <Dropdown 
                                value={filters.monthYear} 
                                onChange={(e) => handleFilterChange(e.value, 'monthYear')} 
                                options={monthYearOptions} 
                                optionLabel="label" 
                                className="w-full" 
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Part No : All</label>
                            <Dropdown 
                                value={filters.partNo} 
                                onChange={(e) => handleFilterChange(e.value, 'partNo')} 
                                options={partNoOptions} 
                                optionLabel="label" 
                                className="w-full" 
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Part Name</label>
                            <Dropdown 
                                value={filters.partName} 
                                onChange={(e) => handleFilterChange(e.value, 'partName')} 
                                options={partNameOptions} 
                                optionLabel="label" 
                                className="w-full" 
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Model</label>
                            <Dropdown 
                                value={filters.model} 
                                onChange={(e) => handleFilterChange(e.value, 'model')} 
                                options={modelOptions} 
                                optionLabel="label" 
                                className="w-full" 
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>SDS Type : All</label>
                            <Dropdown 
                                value={filters.sdsType} 
                                onChange={(e) => handleFilterChange(e.value, 'sdsType')} 
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