'use client';

import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { useRouter } from "next/navigation";
import moment from "moment";
import Footer from "@/components/footer";

interface InspectionData {
    id: number;
    no: number;
    supplierName: string;
    partNo: string;
    partName: string;
    model: string;
    docAisUrl?: string;
    docSdrUrl?: string;
    inspectionPoints: number;
    partStatus: string;
    supplierEditStatus: string;
    specialRequest?: string;
}

export default function InspectionDetail() {
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const [filters, setFilters] = useState({
        supplierName: 'All',
        partNo: 'All',
        partName: 'All',
        model: 'All',
        partStatus: 'All',
        supplierEditStatus: 'All'
    });

    const [data, setData] = useState<InspectionData[]>([]);
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRows, setTotalRows] = useState<number>(0);

    const [showSpecialRequestModal, setShowSpecialRequestModal] = useState(false);
    const [selectedPart, setSelectedPart] = useState<InspectionData | null>(null);
    const [specialRequestForm, setSpecialRequestForm] = useState({
        selectedItems: [] as string[],
        qty: 30,
        cpCpk: 'Yes',
        dueDate: new Date('2025-09-13')
    });

    const supplierOptions = [
        { label: 'All', value: 'All' },
        { label: 'AAA CO., LTD.', value: 'AAA CO., LTD.' },
        { label: 'BBB CO., LTD.', value: 'BBB CO., LTD.' },
        { label: 'CCC CO., LTD.', value: 'CCC CO., LTD.' },
    ];

    // mock dataset
    const allMockData: InspectionData[] = Array.from({ length: 20 }).map((_, idx) => ({
        id: idx + 1,
        no: idx + 1,
        supplierName: ['AAA CO., LTD.', 'BBB CO., LTD.', 'CCC CO., LTD.', 'DDD CO., LTD.'][idx % 4],
        partNo: '90151-06811',
        partName: 'SCREW,FLATHEAD',
        model: 'XXX',
        docAisUrl: '#',
        docSdrUrl: '#',
        inspectionPoints: 20,
        partStatus: 'Active',
        supplierEditStatus: 'Locked',
        specialRequest: 'Special Request'
    }));

    const GetDatas = async () => {
        // simulate server-side filter and pagination
        let filtered = allMockData;
        if (filters.supplierName && filters.supplierName !== 'All') {
            filtered = filtered.filter(x => x.supplierName === filters.supplierName);
        }
        if (filters.partNo && filters.partNo !== 'All') {
            filtered = filtered.filter(x => x.partNo === filters.partNo);
        }
        // other filters can be applied similarly

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

    const editBody = (row: InspectionData) => (
        <Button icon="pi pi-pen-to-square" outlined onClick={() => router.push(`/pages-sample/inspection-detail/edit/${row.id}`)} />
    );

    const docBody = (row: InspectionData, field: 'docAisUrl' | 'docSdrUrl') => (
        <a href={row[field] || '#'} target="_blank" rel="noreferrer" className="text-blue-600">DOWNLOAD</a>
    );

    const specialRequestBody = (row: InspectionData) => (
        <Button 
            label="Special Request" 
            className="p-button-text p-button-sm text-blue-600"
            onClick={() => {
                setSelectedPart(row);
                setSpecialRequestForm({
                    selectedItems: ['Height', 'Thickness', 'Outer Diameter (OD)'],
                    qty: 30,
                    cpCpk: 'Yes',
                    dueDate: new Date('2025-09-13')
                });
                setShowSpecialRequestModal(true);
            }}
        />
    );

    const handleSpecialRequest = () => {
        console.log('Special Request Data:', {
            part: selectedPart,
            form: specialRequestForm
        });
        toast.current?.show({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Special request submitted successfully' 
        });
        setShowSpecialRequestModal(false);
    };

    const measuringItems = [
        { label: 'Height', value: 'Height' },
        { label: 'Thickness', value: 'Thickness' },
        { label: 'Outer Diameter (OD)', value: 'Outer Diameter (OD)' },
        { label: 'Inner Diameter (ID)', value: 'Inner Diameter (ID)' }
    ];

    const qtyOptions = [
        { label: '30', value: 30 },
        { label: '50', value: 50 },
        { label: '100', value: 100 }
    ];

    const cpCpkOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    const exportToCSV = () => {
        if (!data || data.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'No data', detail: 'No records to export' });
            return;
        }
        const headers = ['No', 'Supplier Name', 'Part No', 'Part Name', 'Model', 'Inspection Points', 'Part Status', 'Supplier Edit Status'];
        const rowsCsv = data.map(r => [r.no, r.supplierName, r.partNo, r.partName, r.model, r.inspectionPoints, r.partStatus, r.supplierEditStatus]);

        const escapeCsv = (value: any) => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const csvContent = [headers.map(escapeCsv).join(',')].concat(rowsCsv.map(row => row.map(escapeCsv).join(','))).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inspection_detail_${moment().format('YYYYMMDD_HHmmss')}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex justify-center pt-6 px-6">
            <Toast ref={toast} />
            
            <Dialog
                header="Confirmation !!!!"
                visible={showSpecialRequestModal}
                onHide={() => setShowSpecialRequestModal(false)}
                style={{ width: '600px' }}
                className="p-fluid"
            >
                <div className="space-y-4">
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-blue-700 mb-4">Sample Data Sheet Special Request</h3>
                        <div className="text-left space-y-1 bg-gray-50 p-4 rounded">
                            <div className="flex">
                                <span className="font-semibold w-32">Supplier Name</span>
                                <span className="mr-2">:</span>
                                <span>{selectedPart?.supplierName}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold w-32">Part No.</span>
                                <span className="mr-2">:</span>
                                <span>{selectedPart?.partNo}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold w-32">Part Name</span>
                                <span className="mr-2">:</span>
                                <span>{selectedPart?.partName}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold w-32">Model</span>
                                <span className="mr-2">:</span>
                                <span>{selectedPart?.model}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="font-semibold text-blue-700 mb-3 block">Select Item Measuring</label>
                        <div className="space-y-3">
                            {measuringItems.map((item) => (
                                <div key={item.value} className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id={item.value}
                                        name={item.value}
                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            if (isChecked) {
                                                setSpecialRequestForm(prev => ({
                                                    ...prev,
                                                    selectedItems: [...prev.selectedItems, item.value]
                                                }));
                                            } else {
                                                setSpecialRequestForm(prev => ({
                                                    ...prev,
                                                    selectedItems: prev.selectedItems.filter(i => i !== item.value)
                                                }));
                                            }
                                        }}
                                        checked={specialRequestForm.selectedItems.includes(item.value)}
                                    />
                                    <label htmlFor={item.value} className="cursor-pointer text-gray-700">{item.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="font-semibold block mb-2">Qty</label>
                            <Dropdown
                                value={specialRequestForm.qty}
                                options={qtyOptions}
                                onChange={(e) => setSpecialRequestForm(prev => ({ ...prev, qty: e.value }))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="font-semibold block mb-2">Cp / Cpk</label>
                            <Dropdown
                                value={specialRequestForm.cpCpk}
                                options={cpCpkOptions}
                                onChange={(e) => setSpecialRequestForm(prev => ({ ...prev, cpCpk: e.value }))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="font-semibold block mb-2">Due Date</label>
                            <Calendar
                                value={specialRequestForm.dueDate}
                                onChange={(e) => setSpecialRequestForm(prev => ({ ...prev, dueDate: e.value as Date }))}
                                dateFormat="dd-mm-yy"
                                showIcon
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-center pt-4">
                        <Button
                            label="Cancel"
                            className="p-button-outlined p-button-secondary min-w-[120px]"
                            onClick={() => setShowSpecialRequestModal(false)}
                        />
                        <Button
                            label="Request"
                            className="p-button-primary min-w-[120px]"
                            onClick={handleSpecialRequest}
                        />
                    </div>
                </div>
            </Dialog>

            <div className="container">
                <div className="mx-4 mb-4 text-2xl font-bold py-3 border-solid border-t-0 border-x-0 border-b-2 border-gray-600">Master : Inspection Details</div>

                <div className="flex gap-2 mx-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 w-[calc(100%-100px)]">
                        <div className="flex flex-col gap-2 w-full">
                            <label>Supplier Name</label>
                            <Dropdown value={filters.supplierName} onChange={(e) => handleFilterChange(e.value, 'supplierName')} options={supplierOptions} optionLabel="label" className="w-full" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Part No.</label>
                            <Dropdown value={filters.partNo} onChange={(e) => handleFilterChange(e.value, 'partNo')} options={[{ label: 'All', value: 'All' }, { label: '90151-06811', value: '90151-06811' }]} optionLabel="label" className="w-full" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Part Name</label>
                            <Dropdown value={filters.partName} onChange={(e) => handleFilterChange(e.value, 'partName')} options={[{ label: 'All', value: 'All' }, { label: 'SCREW,FLATHEAD', value: 'SCREW,FLATHEAD' }]} optionLabel="label" className="w-full" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Model</label>
                            <Dropdown value={filters.model} onChange={(e) => handleFilterChange(e.value, 'model')} options={[{ label: 'All', value: 'All' }, { label: 'XXX', value: 'XXX' }]} optionLabel="label" className="w-full" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Part Status</label>
                            <Dropdown value={filters.partStatus} onChange={(e) => handleFilterChange(e.value, 'partStatus')} options={[{ label: 'All', value: 'All' }, { label: 'Active', value: 'Active' }]} optionLabel="label" className="w-full" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Supplier Edit Status</label>
                            <Dropdown value={filters.supplierEditStatus} onChange={(e) => handleFilterChange(e.value, 'supplierEditStatus')} options={[{ label: 'All', value: 'All' }, { label: 'Locked', value: 'Locked' }]} optionLabel="label" className="w-full" />
                        </div>
                    </div>
                    <div className="w-[100px] flex flex-col gap-2 justify-end">
                        <div className="flex gap-2">
                            <Button label="Search" icon="pi pi-search" onClick={() => { setFirst(0); GetDatas(); }} />
                        </div>
                    </div>
                </div>

                <DataTable value={data} showGridlines className='table-header-center mt-4' footer={<Paginator first={first} rows={rows} totalRecords={totalRows} template={TemplatePaginator} rowsPerPageOptions={[10, 20, 50, 100]} onPageChange={(event) => { setFirst(event.first); setRows(event.rows); }} />}>

                    <Column field="no" header="No." bodyStyle={{ width: '5%', textAlign: 'center' }}></Column>
                    <Column field="supplierName" header="Supplier Name" bodyStyle={{ width: '18%' }}></Column>
                    <Column field="partNo" header="Part No." bodyStyle={{ width: '10%' }}></Column>
                    <Column field="partName" header="Part Name" bodyStyle={{ width: '15%' }}></Column>
                    <Column field="model" header="Model" bodyStyle={{ width: '7%' }}></Column>
                    <Column header={() => {
                        return <div className="w-full text-center">
                            <div>Document</div>
                            <div>AIS</div>
                        </div>
                    }} body={(row: InspectionData) => docBody(row, 'docAisUrl')} bodyStyle={{ width: '8%', textAlign: 'center' }}></Column>
                    <Column header={() => {
                        return <div className="w-full text-center">
                            <div>Document</div>
                            <div>SDR Covered Page</div>
                        </div>
                    }} body={(row: InspectionData) => docBody(row, 'docSdrUrl')} bodyStyle={{ width: '12%', textAlign: 'center' }}></Column>
                    <Column field="inspectionPoints" header={() => {
                        return <div className="w-full text-center">
                            <div>Inspection</div>
                            <div>Points</div>
                        </div>
                    }} bodyStyle={{ width: '7%', textAlign: 'center' }}></Column>
                    <Column field="partStatus" header="Part Status" bodyStyle={{ width: '12%', textAlign: 'center' }}></Column>
                    <Column field="supplierEditStatus" header={() => {
                        return <div className="w-full text-center">
                            <div>Supplier</div>
                            <div>Edit Status</div>
                        </div>
                    }} bodyStyle={{ width: '15%', textAlign: 'center' }}></Column>
                    <Column header="Special Request" body={specialRequestBody} bodyStyle={{ width: '7%', textAlign: 'center' }}></Column>
                    <Column header="Action" body={editBody} bodyStyle={{ width: '3%', textAlign: 'center' }}></Column>
                </DataTable>

                <Footer>
                    <div className='flex justify-end mt-2 w-full gap-2'>
                        {/* <Button label="Back" className="p-button-danger min-w-[150px]" onClick={() => router.back()} /> */}
                        <Button label="Export" className="p-button-secondary min-w-[150px]" onClick={() => exportToCSV()} />
                        <Button label="Create" className="p-button-primary min-w-[150px]" onClick={() => router.push('/pages-sample/inspection-detail/create')} />
                    </div>
                </Footer>
            </div>
        </div>
    );
}