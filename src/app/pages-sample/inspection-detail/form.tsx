'use client';

import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/navigation';
import Footer from '@/components/footer';
import { Get, Post, Put } from '@/components/fetch';

interface SupplierDropdownOption {
    label: string;
    value: string;
    supplierName: string;
}

interface Props {
    mode: 'create' | 'edit';
    data?: any;
}

export default function InspectionDetailForm({ mode, data }: Props) {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const IsSupplier = (process.env.NEXT_MODE == 'supplier');
    const userInStorage = localStorage.getItem('user');
    const user = userInStorage ? JSON.parse(userInStorage) : null;

    // Check if form is locked for supplier mode
    
    const isLocked = (IsSupplier && mode === 'edit' && data?.supplierEditStatus === 'Locked') || (!IsSupplier && user && user.accessMasterManagement !== 'Y');

    // Show confirmation dialog for supplier edit mode
    const [showEditConfirmation, setShowEditConfirmation] = useState(false);

    const [form, setForm] = useState<any>({
        supplierCode: (user.supplier && user.supplier.supplierCode ? user.supplier.supplierCode : '') || data?.supplierCode,
        supplierName: (user.supplier && user.supplier.supplierName ? user.supplier.supplierName : '') || data?.supplierName,
        partNo: data?.partNo || '',
        partName: data?.partName || '',
        model: data?.model || '',
        aisFileName: data?.aisFile || '',
        sdrFileName: data?.sdrFile || '',
        inspectionItems: data?.inspectionItems || [{
            no: 1,
            measuringItem: '',
            specification: '',
            tolerancePlus: '',
            toleranceMinus: '',
            inspectionInstrument: '',
            rank: ''
        }],
        partStatus: data?.partStatus || 'Inactive',
        supplierEditStatus: data?.supplierEditStatus || 'Unlocked'
    });

    const [uploadAisFile, setUploadAisFile] = useState<File | null>(null);
    const [uploadSdrFile, setUploadSdrFile] = useState<File | null>(null);

    const handleConfirmEdit = async () => {
        setShowEditConfirmation(false);

        // Actually save the data
        const payload = buildPayload();
        const formData = buildFormData(payload);
        const recordId = typeof data?.id === 'number' ? data.id : Number(data?.id ?? NaN);

        try {
            const res = await Put({
                url: `/inspection-detail/${recordId}`,
                body: formData,
            });

            if (!res.ok) {
                const err: any = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to save inspection detail');
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Data saved successfully',
            });

            setTimeout(() => {
                router.push('/pages-sample/inspection-detail');
            }, 1000);
        } catch (error: any) {
            console.error('Save error:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Cannot save inspection detail',
            });
        }
    };

    const handleCancelEdit = () => {
        setShowEditConfirmation(false);
    };

    const [supplierOptions, setSupplierOptions] = useState<SupplierDropdownOption[]>([]);

    const openServerFile = async (fileName?: string) => {
        if (!fileName) return;

        try {
            const response = await Get({ url: `/inspection-detail/files/${fileName}` });
            if (!response.ok) {
                const message = await response.text().catch(() => 'Failed to load file');
                throw new Error(message || 'Failed to load file');
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        } catch (error: any) {
            console.error('Open server file failed', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error?.message || 'Unable to download file',
            });
        }
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
            setSupplierOptions(
                data.map((item) => ({
                    label: `${item.supplierCode} - ${item.supplierName}`,
                    value: item.supplierCode,
                    supplierName: item.supplierName,
                })),
            );
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
        if (data) {
            setForm({
                supplierCode: (user.supplier && user.supplier.supplierCode ? user.supplier.supplierCode : '') || data?.supplierCode,
                supplierName: (user.supplier && user.supplier.supplierName ? user.supplier.supplierName : '') || data?.supplierName,
                partNo: data.partNo || '',
                partName: data.partName || '',
                model: data.model || '',
                aisFileName: data.aisFile || '',
                sdrFileName: data.sdrFile || '',
                inspectionItems: data.inspectionItems || [{
                    no: 1,
                    measuringItem: '',
                    specification: '',
                    tolerancePlus: '',
                    toleranceMinus: '',
                    inspectionInstrument: '',
                    rank: ''
                }],
                partStatus: data.partStatus || 'Inactive',
                supplierEditStatus: data?.supplierEditStatus || 'Unlocked'
            });
            setUploadAisFile(null);
            setUploadSdrFile(null);
        }
    }, [data]);

    const addInspectionItem = () => {
        setForm((old: any) => ({
            ...old,
            inspectionItems: [...old.inspectionItems, {
                no: old.inspectionItems.length + 1,
                measuringItem: '',
                specification: '',
                tolerancePlus: '',
                toleranceMinus: '',
                inspectionInstrument: '',
                rank: ''
            }]
        }));
    }

    const validateForm = () => {
        // ตรวจสอบข้อมูลพื้นฐาน
        if (!form.supplierCode || form.supplierCode === '') {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please select Supplier Code' });
            return false;
        }
        if (!form.supplierName || form.supplierName.trim() === '') {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please enter Supplier Name' });
            return false;
        }
        if (!form.partNo || form.partNo.trim() === '') {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please enter Part No.' });
            return false;
        }
        if (!form.partName || form.partName.trim() === '') {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please enter Part Name' });
            return false;
        }
        if (!form.model || form.model.trim() === '') {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please enter Model' });
            return false;
        }

        // ตรวจสอบไฟล์
        const needsAisFile = mode === 'create'
            ? !uploadAisFile
            : !uploadAisFile && !form.aisFileName;
        if (needsAisFile) {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please upload AIS file' });
            return false;
        }
        const needsSdrFile = mode === 'create'
            ? !uploadSdrFile
            : !uploadSdrFile && !form.sdrFileName;
        if (needsSdrFile) {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please upload SDR file' });
            return false;
        }

        // ตรวจสอบ Inspection Items
        for (let i = 0; i < form.inspectionItems.length; i++) {
            const item = form.inspectionItems[i];
            if (!item.measuringItem || item.measuringItem.trim() === '') {
                toast.current?.show({ severity: 'warn', summary: 'Warning', detail: `Please enter Measuring Item for row ${i + 1}` });
                return false;
            }
            if (!item.specification || item.specification.trim() === '') {
                toast.current?.show({ severity: 'warn', summary: 'Warning', detail: `Please enter Specification/Standard for row ${i + 1}` });
                return false;
            }
            if (!item.tolerancePlus || item.tolerancePlus.trim() === '') {
                toast.current?.show({ severity: 'warn', summary: 'Warning', detail: `Please enter Tolerance (+) for row ${i + 1}` });
                return false;
            }
            if (!item.toleranceMinus || item.toleranceMinus.trim() === '') {
                toast.current?.show({ severity: 'warn', summary: 'Warning', detail: `Please enter Tolerance (-) for row ${i + 1}` });
                return false;
            }
            if (!item.inspectionInstrument || item.inspectionInstrument.trim() === '') {
                toast.current?.show({ severity: 'warn', summary: 'Warning', detail: `Please enter Inspection Instrument for row ${i + 1}` });
                return false;
            }
            if (!item.rank || item.rank === '') {
                toast.current?.show({ severity: 'warn', summary: 'Warning', detail: `Please select Rank for row ${i + 1}` });
                return false;
            }
        }

        // ตรวจสอบ Status
        if (!form.partStatus || form.partStatus === '') {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please select Part Status' });
            return false;
        }
        if (!form.supplierEditStatus || form.supplierEditStatus === '') {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please select Supplier Edit Status' });
            return false;
        }

        return true;
    };

    const buildPayload = () => {
        return {
            supplierCode: form.supplierCode,
            supplierName: form.supplierName,
            partNo: form.partNo,
            partName: form.partName,
            model: form.model,
            inspectionItems: form.inspectionItems.map((it: any, idx: number) => ({
                no: it.no ?? idx + 1,
                measuringItem: it.measuringItem,
                specification: it.specification,
                tolerancePlus: it.tolerancePlus,
                toleranceMinus: it.toleranceMinus,
                inspectionInstrument: it.inspectionInstrument,
                rank: it.rank,
            })),
            partStatus: form.partStatus,
            supplierEditStatus: form.supplierEditStatus,
        };
    };

    const buildFormData = (payload: any) => {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));
        if (uploadAisFile) {
            formData.append('aisFile', uploadAisFile);
        }
        if (uploadSdrFile) {
            formData.append('sdrFile', uploadSdrFile);
        }
        return formData;
    };

    const handleSave = async () => {
        // ถ้า form ถูก lock ให้ return ทันที
        if (isLocked) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Cannot save. This Part No. is locked.',
            });
            return;
        }

        // ตรวจสอบความถูกต้องของข้อมูล
        if (!validateForm()) {
            return;
        }

        if (IsSupplier && mode === 'edit') {
            setShowEditConfirmation(true);
            return;
        }

        const payload = buildPayload();
        const formData = buildFormData(payload);
        const recordId = typeof data?.id === 'number' ? data.id : Number(data?.id ?? NaN);
        const isUpdate = mode === 'edit' && !Number.isNaN(recordId) && recordId > 0;
        const requestUrl = isUpdate ? `/inspection-detail/${recordId}` : '/inspection-detail';
        const requestFn = isUpdate ? Put : Post;

        try {
            const res = await requestFn({
                url: requestUrl,
                body: formData,
            });

            if (!res.ok) {
                const err: any = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to save inspection detail');
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Data saved successfully',
            });

            setTimeout(() => {
                router.push('/pages-sample/inspection-detail');
            }, 1000);
        } catch (error: any) {
            console.error('Save error:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Cannot save inspection detail',
            });
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 h-[calc(100vh-250px)] overflow-auto">
            <Toast ref={toast} />

            {/* Edit Confirmation Dialog for Supplier */}
            <Dialog
                header={
                    <></>
                }
                visible={showEditConfirmation}
                onHide={() => setShowEditConfirmation(false)}
                style={{ width: '650px' }}
                className="p-fluid"
                closable={false}
            >
                <div className="space-y-6 p-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            Request to Edit Inspection Details?
                        </h3>
                        <p className="text-gray-500 mt-2 text-sm">Please confirm the following part information</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-3 border border-blue-100 shadow-sm">
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-40">Supplier Name</span>
                            <span className="text-gray-400 mr-3">:</span>
                            <span className="text-gray-900 font-medium">{form.supplierName}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-40">Part No.</span>
                            <span className="text-gray-400 mr-3">:</span>
                            <span className="text-gray-900 font-medium">{form.partNo}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-40">Part Name</span>
                            <span className="text-gray-400 mr-3">:</span>
                            <span className="text-gray-900 font-medium">{form.partName}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-40">Model</span>
                            <span className="text-gray-400 mr-3">:</span>
                            <span className="text-gray-900 font-medium">{form.model}</span>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center pt-4">
                        <Button
                            label="Cancel"
                            className="min-w-[160px] transition-all duration-200 hover:shadow-lg"
                            onClick={handleCancelEdit}
                            style={{
                                backgroundColor: 'white',
                                color: '#6b7280',
                                border: '2px solid #e5e7eb',
                                borderRadius: '10px',
                                padding: '12px 24px',
                                fontWeight: '600',
                                fontSize: '15px'
                            }}
                        />
                        <Button
                            label="Confirm"
                            className="min-w-[160px] transition-all duration-200 hover:shadow-xl"
                            onClick={handleConfirmEdit}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '12px 24px',
                                fontWeight: '600',
                                fontSize: '15px',
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2)'
                            }}
                        />
                    </div>
                </div>
            </Dialog>

            <div className="grid grid-cols-1 gap-2">
                <h2 className="text-xl font-semibold">Inspection Details</h2>
                {isLocked && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 mb-2" role="alert">
                        <p className="font-bold">🔒 Edit Locked</p>
                        <p>This Part No. is locked and cannot be edited.</p>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label>Supplier Code <span className="text-red-500">*</span></label>
                        <Dropdown
                            value={form.supplierCode}
                            onChange={(e) => {
                                const selected = supplierOptions.find((option) => option.value === e.value);
                                setForm((old: any) => ({
                                    ...old,
                                    supplierCode: e.value,
                                    supplierName: selected?.supplierName ?? old.supplierName,
                                }));
                            }}
                            options={supplierOptions}
                            className="w-full"
                            placeholder="Select Supplier Code"
                            disabled={isLocked || IsSupplier}
                        />
                    </div>
                    <div>
                        <label>Supplier Name <span className="text-red-500">*</span></label>
                        <InputText
                            value={form.supplierName}
                            onChange={(e) => setForm((old: any) => ({ ...old, supplierName: e.target.value }))}
                            className="w-full"
                            placeholder="Enter Supplier Name"
                            disabled={isLocked || IsSupplier}
                        />
                    </div>
                    <div>
                        <label>Part No. <span className="text-red-500">*</span></label>
                        <InputText
                            value={form.partNo}
                            onChange={(e) => setForm((old: any) => ({ ...old, partNo: e.target.value }))}
                            className="w-full"
                            placeholder="Enter Part No."
                            disabled={isLocked}
                        />
                    </div>
                    <div>
                        <label>Part Name <span className="text-red-500">*</span></label>
                        <InputText
                            value={form.partName}
                            onChange={(e) => setForm((old: any) => ({ ...old, partName: e.target.value }))}
                            className="w-full"
                            placeholder="Enter Part Name"
                            disabled={isLocked}
                        />
                    </div>
                    <div>
                        <label>Model <span className="text-red-500">*</span></label>
                        <InputText
                            value={form.model}
                            onChange={(e) => setForm((old: any) => ({ ...old, model: e.target.value }))}
                            className="w-full"
                            placeholder="Enter Model"
                            disabled={isLocked}
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="font-medium">Upload File <span className="text-red-500">*</span></h3>
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div>
                            <div className="mb-2">AIS <span className="text-red-500">*</span></div>
                            <div className="flex flex-col gap-1">
                                <div className="flex gap-2 items-center">
                                    <InputText
                                        placeholder="File Name"
                                        value={uploadAisFile?.name || form.aisFileName}
                                        readOnly
                                        className="w-2/3"
                                    />
                                    <Button
                                        label="Download"
                                        className="p-button-primary"
                                        disabled={!uploadAisFile && !form.aisFileName}
                                        onClick={() => {
                                            if (uploadAisFile) {
                                                const fileUrl = URL.createObjectURL(uploadAisFile);
                                                window.open(fileUrl, '_blank');
                                            } else {
                                                void openServerFile(form.aisFileName);
                                            }
                                        }}
                                    />
                                    <Button
                                        label="Upload PDF File"
                                        className="p-button-secondary"
                                        onClick={() => document.getElementById('upload-ais-file-id')?.click()}
                                        disabled={isLocked}
                                    />
                                    <input
                                        id="upload-ais-file-id"
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        disabled={isLocked}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                console.log('AIS file selected:', file);
                                                setUploadAisFile(file);
                                            }
                                        }}
                                    />
                                </div>

                            </div>
                        </div>
                        <div>
                            <div className="mb-2">SDR : Cover Page <span className="text-red-500">*</span></div>
                            <div className="flex flex-col gap-1">
                                <div className="flex gap-2 items-center">
                                    <InputText
                                        placeholder="File Name"
                                        value={uploadSdrFile?.name || form.sdrFileName}
                                        readOnly
                                        className="w-2/3"
                                    />
                                    <Button
                                        label="Download"
                                        className="p-button-primary"
                                        disabled={!uploadSdrFile && !form.sdrFileName}
                                        onClick={() => {
                                            if (uploadSdrFile) {
                                                const fileUrl = URL.createObjectURL(uploadSdrFile);
                                                window.open(fileUrl, '_blank');
                                            } else {
                                                void openServerFile(form.sdrFileName);
                                            }
                                        }}
                                    />
                                    <Button
                                        label="Upload PDF File"
                                        className="p-button-secondary"
                                        onClick={() => document.getElementById('upload-sdr-file-id')?.click()}
                                        disabled={isLocked}
                                    />
                                    <input
                                        id="upload-sdr-file-id"
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        disabled={isLocked}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                console.log('SDR file selected:', file);
                                                setUploadSdrFile(file);
                                            }
                                        }}
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="font-medium">Inspection Details <span className="text-red-500">*</span></h3>
                    {form.inspectionItems.map((it: any, idx: number) => (
                        <div key={idx} className="border border-gray-300 rounded p-3 mb-3">
                            <div className="grid grid-cols-12 gap-3 mb-2">
                                <div className="col-span-1">
                                    <label className="block mb-1">No.</label>
                                    <InputText value={it.no} readOnly className="w-full" />
                                </div>
                                <div className="col-span-11">
                                    <label className="block mb-1">Measuring Item <span className="text-red-500">*</span></label>
                                    <InputText
                                        value={it.measuringItem}
                                        onChange={(e) => {
                                            const arr = [...form.inspectionItems];
                                            arr[idx].measuringItem = e.target.value;
                                            setForm((old: any) => ({ ...old, inspectionItems: arr }));
                                        }}
                                        placeholder="Enter Measuring Item"
                                        className="w-full"
                                        disabled={isLocked}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-12 gap-3 mb-2">
                                <div className="col-span-3">
                                    <label className="block mb-1">Specification / Standard <span className="text-red-500">*</span></label>
                                    <InputText
                                        value={it.specification}
                                        onChange={(e) => {
                                            const arr = [...form.inspectionItems];
                                            // Allow only numbers with up to 4 decimal places
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
                                                arr[idx].specification = value;
                                                setForm((old: any) => ({ ...old, inspectionItems: arr }));
                                            }
                                        }}
                                        placeholder="0.0000"
                                        className="w-full"
                                        disabled={isLocked}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block mb-1">Tolerance (+) <span className="text-red-500">*</span></label>
                                    <InputText
                                        value={it.tolerancePlus}
                                        onChange={(e) => {
                                            const arr = [...form.inspectionItems];
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
                                                arr[idx].tolerancePlus = value;
                                                setForm((old: any) => ({ ...old, inspectionItems: arr }));
                                            }
                                        }}
                                        placeholder="0.0000"
                                        className="w-full"
                                        disabled={isLocked}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block mb-1">Tolerance (-) <span className="text-red-500">*</span></label>
                                    <InputText
                                        value={it.toleranceMinus}
                                        onChange={(e) => {
                                            const arr = [...form.inspectionItems];
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
                                                arr[idx].toleranceMinus = value;
                                                setForm((old: any) => ({ ...old, inspectionItems: arr }));
                                            }
                                        }}
                                        placeholder="0.0000"
                                        className="w-full"
                                        disabled={isLocked}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="block mb-1">Inspection Instrument <span className="text-red-500">*</span></label>
                                    <InputText
                                        value={it.inspectionInstrument}
                                        onChange={(e) => {
                                            const arr = [...form.inspectionItems];
                                            arr[idx].inspectionInstrument = e.target.value;
                                            setForm((old: any) => ({ ...old, inspectionItems: arr }));
                                        }}
                                        placeholder="Enter Instrument"
                                        className="w-full"
                                        disabled={isLocked}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block mb-1">Rank <span className="text-red-500">*</span></label>
                                    <Dropdown
                                        value={it.rank}
                                        onChange={(e) => {
                                            const arr = [...form.inspectionItems];
                                            arr[idx].rank = e.value;
                                            setForm((old: any) => ({ ...old, inspectionItems: arr }));
                                        }}
                                        options={[
                                            { label: 'A', value: 'A' },
                                            { label: 'B', value: 'B' },
                                            { label: 'C', value: 'C' },
                                            { label: 'S', value: 'S' },
                                            { label: 'R', value: 'R' }
                                        ]}
                                        className="w-full"
                                        placeholder="Select"
                                        disabled={isLocked}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <div>
                        <Button
                            label="Add New"
                            className="p-button-danger"
                            onClick={addInspectionItem}
                            disabled={isLocked}
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="font-medium">Status <span className="text-red-500">*</span></h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            {
                                IsSupplier ? <label>Status (Active / Inactive) <span className="text-red-500">*</span></label> :
                                    <label>Part Status (Active / Inactive) <span className="text-red-500">*</span></label>
                            }
                            <Dropdown
                                value={form.partStatus}
                                onChange={(e) => setForm((old: any) => ({
                                    ...old,
                                    partStatus: e.value,
                                    ...e.value === 'Active' ? { supplierEditStatus: 'Locked' } : {}
                                }))}
                                options={[
                                    { label: 'Active', value: 'Active' },
                                    { label: 'Inactive', value: 'Inactive' }
                                ]}
                                className="w-full"
                                placeholder="Select Status"
                                disabled={isLocked || IsSupplier}
                            />
                        </div>
                        <div>
                            {
                                IsSupplier ? <label>Edit (Locked / Unlock)<span className="text-red-500">*</span></label> :
                                    <label>Supplier Edit Status (Locked / Unlock) <span className="text-red-500">*</span></label>
                            }

                            <Dropdown
                                value={form.supplierEditStatus}
                                onChange={(e) => setForm((old: any) => ({ ...old, supplierEditStatus: e.value }))}
                                options={[
                                    { label: 'Locked', value: 'Locked' },
                                    { label: 'Unlocked', value: 'Unlocked' }
                                ]}
                                className="w-full"
                                placeholder="Select Status"
                                disabled={isLocked || form.partStatus === 'Active'}
                            />
                        </div>
                    </div>
                </div>

                <Footer>
                    <div className='flex justify-end mt-2 w-full gap-2'>
                        <Button label="Cancel" className="p-button-danger min-w-[150px]" onClick={() => router.back()} />
                        <Button
                            label="SAVE"
                            className="p-button-primary min-w-[150px]"
                            onClick={handleSave}
                            disabled={isLocked}
                        />
                    </div>
                </Footer>
            </div>
        </div>
    )
}
