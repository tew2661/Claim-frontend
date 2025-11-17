'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
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
import * as XLSX from "xlsx";
import Footer from "@/components/footer";
import { Get, Post } from "@/components/fetch";

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

interface SupplierDropdownOption {
    label: string;
    value: string;
    supplierName?: string;
}

interface SpecialRequestRecord {
    id: number;
    inspectionDetailId: number;
    specialRequestItems: string[];
    qty: number | 'All';
    cpCpk: string;
    dueDate: string;
    status: string;
    comments?: string;
    createdAt: string;
}

const createDefaultSpecialRequestForm = () => ({
    selectedItems: ['Height', 'Thickness', 'Outer Diameter (OD)'] as string[],
    qty: 'All' as number | 'All',
    cpCpk: 'All',
    dueDate: new Date(),
});

type FilterState = {
    supplierCode: string;
    partNo: string;
    partName: string;
    model: string;
    partStatus: string;
    supplierEditStatus: string;
};

type TextFilterField = 'partNo' | 'partName' | 'model';
type DropdownFilterField = 'supplierCode' | 'partStatus' | 'supplierEditStatus';

const initialFilters: FilterState = {
    supplierCode: 'All',
    partNo: '',
    partName: '',
    model: '',
    partStatus: 'All',
    supplierEditStatus: 'All'
};

export default function InspectionDetail() {
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const debounceTimerRef = useRef<number | null>(null);

    const IsSupplier = (process.env.NEXT_MODE == 'supplier');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : undefined
    const userSupplier = user?.supplier || undefined;
    const supplierCodeForFilter = IsSupplier && userSupplier ? userSupplier.supplierCode : 'All';

    const [filters, setFilters] = useState<FilterState>({
        ...initialFilters,
        supplierCode: supplierCodeForFilter,
    });
    const [appliedFilters, setAppliedFilters] = useState<FilterState>({
        ...initialFilters,
        supplierCode: supplierCodeForFilter,
    });

    const [data, setData] = useState<InspectionData[]>([]);
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRows, setTotalRows] = useState<number>(0);

    const [showSpecialRequestModal, setShowSpecialRequestModal] = useState(false);
    const [selectedPart, setSelectedPart] = useState<InspectionData | null>(null);
    const [specialRequestForm, setSpecialRequestForm] = useState(createDefaultSpecialRequestForm());
    const [specialRequests, setSpecialRequests] = useState<SpecialRequestRecord[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    const [supplierOptions, setSupplierOptions] = useState<SupplierDropdownOption[]>([]);

    const sanitizeFilters = (rawFilters: FilterState) => ({
        ...rawFilters,
        partNo: rawFilters.partNo.trim(),
        partName: rawFilters.partName.trim(),
        model: rawFilters.model.trim(),
    });

    const cancelPendingFilterApply = () => {
        if (debounceTimerRef.current) {
            window.clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
    };

    const applyFilters = (nextFilters: FilterState) => {
        cancelPendingFilterApply();
        setAppliedFilters(sanitizeFilters(nextFilters));
        setFirst(0);
    };

    const scheduleFilterApply = (nextFilters: FilterState) => {
        cancelPendingFilterApply();
        debounceTimerRef.current = window.setTimeout(() => {
            applyFilters(nextFilters);
        }, 1000);
    };

    const handleInputFilterChange = (value: string, field: TextFilterField) => {
        const nextFilters = { ...filters, [field]: value };
        setFilters(nextFilters);
        scheduleFilterApply(nextFilters);
    };

    const handleDropdownFilterChange = (value: string | null, field: DropdownFilterField) => {
        const nextFilters = { ...filters, [field]: value ?? 'All' };
        setFilters(nextFilters);
        applyFilters(nextFilters);
    };

    const handleSearchClick = () => {
        applyFilters({ ...filters });
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

    const GetDatas = useCallback(async () => {
        const params = new URLSearchParams();
        const page = Math.floor(first / rows) + 1;
        params.set('page', String(page));
        params.set('limit', String(rows));

        if (appliedFilters.supplierCode && appliedFilters.supplierCode !== 'All') {
            params.set('supplierCode', appliedFilters.supplierCode);
        }
        if (appliedFilters.partNo && appliedFilters.partNo !== 'All') {
            params.set('partNo', appliedFilters.partNo);
        }
        if (appliedFilters.partName && appliedFilters.partName !== 'All') {
            params.set('partName', appliedFilters.partName);
        }
        if (appliedFilters.model && appliedFilters.model !== 'All') {
            params.set('model', appliedFilters.model);
        }
        if (appliedFilters.partStatus && appliedFilters.partStatus !== 'All') {
            params.set('partStatus', appliedFilters.partStatus);
        }
        if (appliedFilters.supplierEditStatus && appliedFilters.supplierEditStatus !== 'All') {
            params.set('supplierEditStatus', appliedFilters.supplierEditStatus);
        }

        try {
            const res = await Get({ url: `/inspection-detail?${params.toString()}` });
            if (!res.ok) {
                const err: any = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to load inspection details');
            }
            const json: any = await res.json();
            const items: any[] = json.data || [];
            const total: number = json.total ?? items.length;

            const pageData: InspectionData[] = items.map((d, idx) => ({
                id: d.id,
                no: first + idx + 1,
                supplierName: d.supplierName,
                partNo: d.partNo,
                partName: d.partName,
                model: d.model,
                docAisUrl: d.docAisUrl,
                docSdrUrl: d.docSdrUrl,
                inspectionPoints: d.inspectionPoints,
                partStatus: d.partStatus,
                supplierEditStatus: d.supplierEditStatus,
                specialRequest: d.specialRequest,
            }));

            setTotalRows(total);
            setData(pageData);
        } catch (error: any) {
            console.error('Load inspection details error:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Cannot load inspection details',
            });
        }
    }, [appliedFilters, first, rows]);

    useEffect(() => {
        loadSupplierOptions();
    }, []);

    useEffect(() => {
        GetDatas();
    }, [GetDatas]);

    useEffect(() => {
        return () => cancelPendingFilterApply();
    }, []);

    const applyRecordToForm = (record: SpecialRequestRecord) => {
        setSpecialRequestForm({
            selectedItems: record.specialRequestItems || [],
            qty: record.qty ?? undefined,
            cpCpk: record.cpCpk,
            dueDate: new Date(record.dueDate),
        });
    };

    const fetchSpecialRequests = async (inspectionDetailId: number) => {
        setLoadingRequests(true);
        try {
            const res = await Get({ url: `/inspection-detail/special-request/${inspectionDetailId}` });
            if (!res.ok) {
                const err: any = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to load special requests');
            }
            const json: any = await res.json();
            const payload: any[] = json.data || [];
            const records = payload.map((item) => ({
                ...item,
                specialRequestItems: item.specialRequestItems || [],
                dueDate: item.dueDate,
                createdAt: item.createdAt,
            }));
            setSpecialRequests(records);
            if (records.length) {
                applyRecordToForm(records[0]);
            }
        } catch (error: any) {
            console.error('Fetch special requests failed', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Cannot load special requests',
            });
            setSpecialRequests([]);
        } finally {
            setLoadingRequests(false);
        }
    };

    const editBody = (row: InspectionData) => (
        <Button icon="pi pi-pen-to-square" outlined onClick={() => router.push(`/pages-sample/inspection-detail/edit/${row.id}`)} />
    );

    const downloadDocument = async (fileName?: string) => {
        if (!fileName) {
            toast.current?.show({ severity: 'warn', summary: 'Missing file', detail: 'No document available' });
            return;
        }
        try {
            const res = await Get({ url: `/inspection-detail/files/${fileName}` });
            if (!res.ok) {
                const errText = await res.text().catch(() => 'Failed to download file');
                throw new Error(errText || 'Failed to download file');
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Download error:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Cannot download document',
            });
        }
    };

    const docBody = (row: InspectionData, field: 'docAisUrl' | 'docSdrUrl') => (
        <Button
            label="Download"
            className="p-button-text text-blue-600"
            onClick={() => downloadDocument(row[field])}
            disabled={!row[field]}
        />
    );

    const openSpecialRequestModal = (row: InspectionData) => {
        setSelectedPart(row);
        setSpecialRequestForm(createDefaultSpecialRequestForm());
        fetchSpecialRequests(row.id);
        setShowSpecialRequestModal(true);
    };

    const specialRequestBody = (row: InspectionData) => (
        <Button 
            label="Special Request" 
            className="p-button-text p-button-sm text-blue-600"
            onClick={() => openSpecialRequestModal(row)}
        />
    );

    const handleSpecialRequest = async () => {

        if (!specialRequestForm.qty || specialRequestForm.qty === 'All') {
            toast.current?.show({ severity: 'warn', summary: 'Missing quantity', detail: 'Please select quantity' });
            return;
        }

        if (!specialRequestForm.cpCpk || specialRequestForm.cpCpk === 'All') {
            toast.current?.show({ severity: 'warn', summary: 'Missing CP/CPK', detail: 'Please select CP/CPK option' });
            return;
        }

        if (!selectedPart) {
            toast.current?.show({ severity: 'warn', summary: 'No selection', detail: 'Please choose a part first' });
            return;
        }

        if (!specialRequestForm.selectedItems.length) {
            toast.current?.show({ severity: 'warn', summary: 'No items', detail: 'Please select at least one measuring item' });
            return;
        }

        if (!specialRequestForm.dueDate) {
            toast.current?.show({ severity: 'warn', summary: 'Missing due date', detail: 'Please select a due date' });
        }

        const payload = {
            inspectionDetailId: selectedPart.id,
            specialRequestItems: specialRequestForm.selectedItems,
            qty: specialRequestForm.qty,
            cpCpk: specialRequestForm.cpCpk,
            dueDate: specialRequestForm.dueDate.toISOString(),
        };

        try {
            const res = await Post({
                url: '/inspection-detail/special-request',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err: any = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to record special request');
            }

            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Special request submitted successfully' });
            setShowSpecialRequestModal(false);
            setSpecialRequests([]);
            GetDatas();
        } catch (error: any) {
            console.error('Special request failed', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Cannot submit special request' });
        }
    };

    const measuringItems = [
        { label: 'Height', value: 'Height' },
        { label: 'Thickness', value: 'Thickness' },
        { label: 'Outer Diameter (OD)', value: 'Outer Diameter (OD)' },
        { label: 'Inner Diameter (ID)', value: 'Inner Diameter (ID)' }
    ];

    const qtyOptions = [
        { label: 'All', value: 'All' },
        ...Array.from({ length: 30 }, (_, idx) => ({
            label: `${idx + 1}`,
            value: idx + 1,
        }))
    ]

    const cpCpkOptions = [
        { label: 'All', value: 'All' },
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    const exportToExcel = async () => {
        const params = new URLSearchParams();
        if (filters.supplierCode && filters.supplierCode !== 'All') params.set('supplierCode', filters.supplierCode);
        if (filters.partNo && filters.partNo.trim()) params.set('partNo', filters.partNo.trim());
        if (filters.partName && filters.partName.trim()) params.set('partName', filters.partName.trim());
        if (filters.model && filters.model.trim()) params.set('model', filters.model.trim());
        if (filters.partStatus && filters.partStatus !== 'All') params.set('partStatus', filters.partStatus);
        if (filters.supplierEditStatus && filters.supplierEditStatus !== 'All') params.set('supplierEditStatus', filters.supplierEditStatus);

        try {
            const res = await Get({ url: `/inspection-detail/export?${params.toString()}` });
            if (!res.ok) {
                const errorText = await res.text().catch(() => 'Failed to export data');
                throw new Error(errorText || 'Failed to export data');
            }

            const json: any = await res.json();
            const rows = json.data || [];

            if (!rows.length) {
                toast.current?.show({ severity: 'warn', summary: 'No data', detail: 'No records to export' });
                return;
            }

            const excelData = rows.map((r: any, idx: number) => ({
                No: idx + 1,
                'Supplier Name': r.supplierName,
                'Part No.': r.partNo,
                'Part Name': r.partName,
                Model: r.model,
                'Inspection Points': r.inspectionPoints,
                'Part Status': r.partStatus,
                'Supplier Edit Status': r.supplierEditStatus,
            }));

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Inspection Detail');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inspection_detail_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Export error:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Cannot export data' });
        }
    };

    return (
        <div className="flex justify-center pt-6 px-6">
            <Toast ref={toast} />
            
            <Dialog
                header="Confirmation !!!!"
                visible={showSpecialRequestModal}
                onHide={() => {
                    setShowSpecialRequestModal(false);
                    setSpecialRequests([]);
                }}
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

                    {/* <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-blue-700">Previous Requests</h4>
                        {loadingRequests ? (
                            <p className="text-sm text-gray-500">Loading...</p>
                        ) : specialRequests.length ? (
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                                {specialRequests.map((request) => (
                                    <div key={request.id} className="border border-gray-200 rounded p-3 bg-white shadow-sm">
                                        <div className="text-sm font-semibold text-gray-700">Status: {request.status}</div>
                                        <div className="text-xs text-gray-500 mb-1">Requested on {moment(request.createdAt).format('DD-MM-YYYY HH:mm')}</div>
                                        <div className="text-sm text-gray-600">Items: {request.specialRequestItems.join(', ') || '—'}</div>
                                        <div className="text-sm text-gray-600">Qty: {request.qty}, Cp / Cpk: {request.cpCpk}</div>
                                        <div className="text-sm text-gray-600">Due Date: {moment(request.dueDate).format('DD-MM-YYYY')}</div>
                                        {request.comments && <div className="text-sm text-gray-500 mt-1">Note: {request.comments}</div>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No previous requests yet.</p>
                        )}
                    </div> */}

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
                            onClick={() => {
                                setShowSpecialRequestModal(false);
                                setSpecialRequests([]);
                            }}
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
                            <Dropdown value={filters.supplierCode} disabled={IsSupplier} onChange={(e) => handleDropdownFilterChange(e.value, 'supplierCode')} options={supplierOptions} optionLabel="label" className="w-full" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Part No.</label>
                            <InputText value={filters.partNo} onChange={(e) => handleInputFilterChange(e.target.value, 'partNo')} placeholder="Enter Part No." className="w-full" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Part Name</label>
                            <InputText value={filters.partName} onChange={(e) => handleInputFilterChange(e.target.value, 'partName')} placeholder="Enter Part Name" className="w-full" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Model</label>
                            <InputText value={filters.model} onChange={(e) => handleInputFilterChange(e.target.value, 'model')} placeholder="Enter Model" className="w-full" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Part Status</label>
                            <Dropdown value={filters.partStatus} onChange={(e) => handleDropdownFilterChange(e.value, 'partStatus')} options={[{ label: 'All', value: 'All' }, { label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }]} optionLabel="label" className="w-full" />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label>Supplier Edit Status</label>
                            <Dropdown value={filters.supplierEditStatus} onChange={(e) => handleDropdownFilterChange(e.value, 'supplierEditStatus')} options={[{ label: 'All', value: 'All' }, { label: 'Locked', value: 'Locked' }, { label: 'Unlocked', value: 'Unlocked' }]} optionLabel="label" className="w-full" />
                        </div>
                    </div>
                    <div className="w-[100px] flex flex-col gap-2 justify-end">
                        <div className="flex gap-2">
                            <Button label="Search" icon="pi pi-search" onClick={handleSearchClick} />
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
                        <Button label="Export" className="p-button-secondary min-w-[150px]" onClick={() => exportToExcel()} />
                        <Button label="Create" className="p-button-primary min-w-[150px]" onClick={() => router.push('/pages-sample/inspection-detail/create')} />
                    </div>
                </Footer>
            </div>
        </div>
    );
}