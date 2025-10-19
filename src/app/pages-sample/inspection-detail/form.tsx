'use client';

import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import Footer from '@/components/footer';

interface Props {
    mode: 'create' | 'edit';
    data?: any;
}

export default function InspectionDetailForm({ mode, data }: Props) {
    const router = useRouter();
    const [form, setForm] = useState<any>({
        supplierCode: data?.supplierCode || '',
        supplierName: data?.supplierName || '',
        partNo: data?.partNo || '',
        partName: data?.partName || '',
        model: data?.model || '',
        aisFile: data?.aisFile || null,
        sdrFile: data?.sdrFile || null,
        inspectionItems: data?.inspectionItems || [{ no: 1, measuringItem: '', spec: '', tolerancePlus: '', toleranceMinus: '', instrument: '', rank: '' }],
        partStatus: data?.partStatus || 'Inactive',
        supplierEditStatus: data?.supplierEditStatus || 'Unlocked'
    });

    const supplierOptions = [
        { label: 'AAA', value: 'AAA' },
        { label: 'BBB', value: 'BBB' },
    ];

    const addInspectionItem = () => {
        setForm((old: any) => ({ ...old, inspectionItems: [...old.inspectionItems, { no: old.inspectionItems.length + 1, measuringItem: '', spec: '', tolerancePlus: '', toleranceMinus: '', instrument: '', rank: '' }] }));
    }

    const handleSave = () => {
        // mock save
        console.log('Saving', form);
        router.push('/pages-sample/inspection-detail');
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 h-[calc(100vh-250px)] overflow-auto">
            <div className="grid grid-cols-1 gap-2">
                <h2 className="text-xl font-semibold">Inspection Details</h2>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label>Supplier Code</label>
                        <Dropdown value={form.supplierCode} onChange={(e) => setForm((old: any) => ({ ...old, supplierCode: e.value }))} options={supplierOptions} className="w-full" />
                    </div>
                    <div>
                        <label>Supplier Name</label>
                        <InputText value={form.supplierName} onChange={(e) => setForm((old: any) => ({ ...old, supplierName: e.target.value }))} className="w-full" />
                    </div>
                    <div>
                        <label>Part No.</label>
                        <InputText value={form.partNo} onChange={(e) => setForm((old: any) => ({ ...old, partNo: e.target.value }))} className="w-full" />
                    </div>
                    <div>
                        <label>Part Name</label>
                        <InputText value={form.partName} onChange={(e) => setForm((old: any) => ({ ...old, partName: e.target.value }))} className="w-full" />
                    </div>
                    <div>
                        <label>Model</label>
                        <InputText value={form.model} onChange={(e) => setForm((old: any) => ({ ...old, model: e.target.value }))} className="w-full" />
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="font-medium">Upload File</h3>
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div>
                            <div className="mb-2">AIS</div>
                            <div className="flex gap-2 items-center">
                                <InputText placeholder="File Name" value={form.aisFile?.name || ''} readOnly className="w-2/3" />
                                <Button label="Download" className="p-button-primary" />
                                <Button label="Upload PDF File" className="p-button-secondary" />
                            </div>
                        </div>
                        <div>
                            <div className="mb-2">SDR : Cover Page</div>
                            <div className="flex gap-2 items-center">
                                <InputText placeholder="File Name" value={form.sdrFile?.name || ''} readOnly className="w-2/3" />
                                <Button label="Download" className="p-button-primary" />
                                <Button label="Upload PDF File" className="p-button-secondary" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="font-medium">Inspection Details</h3>
                    {form.inspectionItems.map((it: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-6 gap-2 items-center mb-2">
                            <div className="col-span-1">
                                <label>No.</label>
                                <InputText value={it.no} readOnly />
                            </div>
                            <div className="col-span-2">
                                <label>Measuring Item</label>
                                <InputText value={it.measuringItem} onChange={(e) => {
                                    const arr = [...form.inspectionItems]; arr[idx].measuringItem = e.target.value; setForm((old: any) => ({ ...old, inspectionItems: arr }));
                                }} />
                            </div>
                            <div className="col-span-1">
                                <label>Tolerance (+)</label>
                                <InputText value={it.tolerancePlus} onChange={(e) => {
                                    const arr = [...form.inspectionItems]; arr[idx].tolerancePlus = e.target.value; setForm((old: any) => ({ ...old, inspectionItems: arr }));
                                }} />
                            </div>
                            <div className="col-span-1">
                                <label>Tolerance (-)</label>
                                <InputText value={it.toleranceMinus} onChange={(e) => {
                                    const arr = [...form.inspectionItems]; arr[idx].toleranceMinus = e.target.value; setForm((old: any) => ({ ...old, inspectionItems: arr }));
                                }} />
                            </div>
                            <div className="col-span-1">
                                <label>Rank</label>
                                <Dropdown value={it.rank} onChange={(e) => { const arr = [...form.inspectionItems]; arr[idx].rank = e.value; setForm((old: any) => ({ ...old, inspectionItems: arr })); }} options={[{ label: 'A', value: 'A' }, { label: 'B', value: 'B' }, { label: 'C', value: 'C' }, { label: 'S', value: 'S' }, { label: 'R', value: 'R' }]} className="w-full" />
                            </div>
                        </div>
                    ))}
                    <div>
                        <Button label="Add New" className="p-button-danger" onClick={addInspectionItem} />
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="font-medium">Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label>Part Status (Active / Inactive)</label>
                            <Dropdown value={form.partStatus} onChange={(e) => setForm((old: any) => ({ ...old, partStatus: e.value }))} options={[{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }]} className="w-full" />
                        </div>
                        <div>
                            <label>Supplier Edit Status (Locked / Unlock)</label>
                            <Dropdown value={form.supplierEditStatus} onChange={(e) => setForm((old: any) => ({ ...old, supplierEditStatus: e.value }))} options={[{ label: 'Locked', value: 'Locked' }, { label: 'Unlocked', value: 'Unlocked' }]} className="w-full" />
                        </div>
                    </div>
                </div>

                <Footer>
                    <div className='flex justify-end mt-2 w-full gap-2'>
                        <Button label="Cancel" className="p-button-danger min-w-[150px]" onClick={() => router.back()} />
                        <Button label="SAVE" className="p-button-primary min-w-[150px]" onClick={handleSave} />
                    </div>
                </Footer>
            </div>
        </div>
    )
}
