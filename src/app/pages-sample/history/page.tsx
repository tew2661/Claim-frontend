'use client';

import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";
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

    const [filters, setFilters] = useState({
        menu: 'All',
        partNo: 'All',
        sdsMonthYear: 'All',
        action: 'All',
        actionRole: 'All',
        actionBy: 'All',
        actionDate: null as Date | null
    });

    const [data, setData] = useState<HistoryData[]>([]);
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRows, setTotalRows] = useState<number>(0);

    const menuOptions = [
        { label: 'All', value: 'All' },
        { label: 'Create SDS', value: 'Create SDS' },
        { label: 'Inspection Detail', value: 'Inspection Detail' },
        { label: 'SDS Approval', value: 'SDS Approval' },
    ];

    const partNoOptions = [
        { label: 'All', value: 'All' },
        { label: '90151-06811', value: '90151-06811' },
    ];

    const sdsMonthYearOptions = [
        { label: 'All', value: 'All' },
        { label: '06-2025', value: '06-2025' },
        { label: '08-2025', value: '08-2025' },
        { label: '08-2025 Special', value: '08-2025 Special' },
    ];

    const actionOptions = [
        { label: 'All', value: 'All' },
        { label: 'Submitted', value: 'Submitted' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Special Request', value: 'Special Request' },
        { label: 'Create / Edit', value: 'Create / Edit' },
    ];

    const actionRoleOptions = [
        { label: 'All', value: 'All' },
        { label: 'Supplier', value: 'Supplier' },
        { label: 'Checker 1', value: 'Checker 1' },
        { label: 'Checker 2', value: 'Checker 2' },
        { label: 'Approver', value: 'Approver' },
    ];

    const actionByOptions = [
        { label: 'All', value: 'All' },
        { label: 'Auto Valve Co., Ltd.', value: 'Auto Valve Co., Ltd.' },
        { label: 'Somdai A.', value: 'Somdai A.' },
        { label: 'Apiwat S.', value: 'Apiwat S.' },
        { label: 'Piyawat S.', value: 'Piyawat S.' },
        { label: 'Ekkachai V.', value: 'Ekkachai V.' },
        { label: 'ABC Co.,Ltd.', value: 'ABC Co.,Ltd.' },
    ];

    // mock dataset
    const allMockData: HistoryData[] = [
        { id: 1, no: 1, menu: 'Create SDS', partNo: '90151-06811', sdsMonthYear: '08-2025 Special', action: 'Submitted', actionRole: 'Supplier', actionBy: 'Auto Valve Co., Ltd.', actionDate: '15/08/2025 16:22:44', remark: '' },
        { id: 2, no: 2, menu: 'Inspection Detail', partNo: '90151-06811', sdsMonthYear: '08-2025 Special', action: 'Special Request', actionRole: 'Checker 1', actionBy: 'Somdai A.', actionDate: '15/08/2025 16:20:00', remark: '' },
        { id: 3, no: 3, menu: 'Inspection Detail', partNo: '90151-06811', sdsMonthYear: '', action: 'Create / Edit', actionRole: 'Supplier', actionBy: 'Auto Valve Co., Ltd.', actionDate: '20/06/2025 01:32:22', remark: 'แก้ไขข้อมูล' },
        { id: 4, no: 4, menu: 'SDS Approval', partNo: '90151-06811', sdsMonthYear: '06-2025', action: 'Approved', actionRole: 'Approver', actionBy: 'Apiwat S.', actionDate: '20/06/2025 01:31:00', remark: '' },
        { id: 5, no: 5, menu: 'SDS Approval', partNo: '90151-06811', sdsMonthYear: '06-2025', action: 'Approved', actionRole: 'Checker 2', actionBy: 'Piyawat S.', actionDate: '20/06/2025 01:23:17', remark: 'แก้ไขข้อมูล' },
        { id: 6, no: 6, menu: 'SDS Approval', partNo: '90151-06811', sdsMonthYear: '06-2025', action: 'Approved', actionRole: 'Checker 1', actionBy: 'Ekkachai V.', actionDate: '20/06/2025 01:11:06', remark: '' },
        { id: 7, no: 7, menu: 'Create SDS', partNo: '90151-06811', sdsMonthYear: '06-2025', action: 'Submitted', actionRole: 'Supplier', actionBy: 'Auto Valve Co., Ltd.', actionDate: '20/06/2025 01:06:14', remark: 'Approved by Approver' },
        { id: 8, no: 8, menu: 'Create SDS', partNo: '90151-06811', sdsMonthYear: '06-2025', action: 'Submitted', actionRole: 'Supplier', actionBy: 'ABC Co.,Ltd.', actionDate: '20/06/2025 01:04:30', remark: 'Approved by Checker 2' },
        { id: 9, no: 9, menu: 'Create SDS', partNo: '90151-06811', sdsMonthYear: '06-2025', action: 'Submitted', actionRole: 'Supplier', actionBy: 'ABC Co.,Ltd.', actionDate: '20/06/2025 01:02:33', remark: 'Approved by Checker 1' },
    ];

    const GetDatas = async () => {
        // simulate server-side filter and pagination
        let filtered = allMockData;
        if (filters.menu && filters.menu !== 'All') {
            filtered = filtered.filter(x => x.menu === filters.menu);
        }
        if (filters.partNo && filters.partNo !== 'All') {
            filtered = filtered.filter(x => x.partNo === filters.partNo);
        }
        if (filters.sdsMonthYear && filters.sdsMonthYear !== 'All') {
            filtered = filtered.filter(x => x.sdsMonthYear === filters.sdsMonthYear);
        }
        if (filters.action && filters.action !== 'All') {
            filtered = filtered.filter(x => x.action === filters.action);
        }
        if (filters.actionRole && filters.actionRole !== 'All') {
            filtered = filtered.filter(x => x.actionRole === filters.actionRole);
        }
        if (filters.actionBy && filters.actionBy !== 'All') {
            filtered = filtered.filter(x => x.actionBy === filters.actionBy);
        }
        if (filters.actionDate) {
            const filterDate = moment(filters.actionDate).format('DD/MM/YYYY');
            filtered = filtered.filter(x => x.actionDate.startsWith(filterDate));
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

    const handleDateChange = (value: Date | null) => {
        setFilters(old => ({ ...old, actionDate: value }));
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
                            <Dropdown
                                value={filters.partNo}
                                onChange={(e) => handleFilterChange(e.value, 'partNo')}
                                options={partNoOptions}
                                optionLabel="label"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>SDS Month-Year</label>
                            <Dropdown
                                value={filters.sdsMonthYear}
                                onChange={(e) => handleFilterChange(e.value, 'sdsMonthYear')}
                                options={sdsMonthYearOptions}
                                optionLabel="label"
                                className="w-full"
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
                        <div className="flex flex-col gap-2 w-full">
                            <label>Action Role</label>
                            <Dropdown
                                value={filters.actionRole}
                                onChange={(e) => handleFilterChange(e.value, 'actionRole')}
                                options={actionRoleOptions}
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
                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 w-[calc(100%-100px)]">

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