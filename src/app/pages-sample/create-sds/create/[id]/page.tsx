'use client';

import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { useRouter, useParams } from 'next/navigation';
import Footer from '@/components/footer';

export default function CreateSDSForm() {
    const router = useRouter();
    const params = useParams();
    const toast = useRef<Toast>(null);

    const [form, setForm] = useState({
        supplier: 'AAA Co., Ltd.',
        partNo: '90151-06811',
        model: 'IMV',
        partName: 'SCREW,FLATHEAD',
        aisDocument: null as File | null,
        sdrDocument: null as File | null,
        production08_2025: 'Yes',
        sdrDate: new Date('2025-08-08'),
        sdrData: [
            { 
                no: 1, 
                measuringItem: 'Height', 
                specification: '15.7', 
                rank: 'A', 
                inspectionInstrument: 'Vania', 
                remark: 'Edit', 
                sampleQty: 3,
                samples: [
                    { no: 1, value: '15.60' },
                    { no: 2, value: '15.67' },
                    { no: 3, value: '15.48' },
                    { no: 4, value: '' },
                    { no: 5, value: '' }
                ],
                judgement: 'X',
                xBar: '',
                r: '',
                cp: '',
                cpk: ''
            },
            { 
                no: 2, 
                measuringItem: 'THICKNESS', 
                specification: '1.25', 
                rank: 'B', 
                inspectionInstrument: 'CMM', 
                remark: 'So let', 
                sampleQty: 5,
                samples: [
                    { no: 1, value: '1.24' },
                    { no: 2, value: '1.23' },
                    { no: 3, value: '1.26' },
                    { no: 4, value: '1.25' },
                    { no: 5, value: '' }
                ],
                judgement: '',
                xBar: '',
                r: '',
                cp: '',
                cpk: ''
            },
        ]
    });

    const [uploadAisFile, setUploadAisFile] = useState<File | null>(null);
    const [uploadSdrFile, setUploadSdrFile] = useState<File | null>(null);
    const [uploadSdrReport, setUploadSdrReport] = useState<File | null>(null);

    const productionOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
    ];

    const rankOptions = [
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' },
        { label: 'S', value: 'S' },
        { label: 'R', value: 'R' },
    ];

    const remarkOptions = [
        { label: 'Edit', value: 'Edit' },
        { label: 'So let', value: 'So let' },
        { label: 'Other', value: 'Other' },
    ];

    const judgementOptions = [
        { label: 'X', value: 'X' },
        { label: 'O', value: 'O' },
    ];

    const addRow = () => {
        const newRow = {
            no: form.sdrData.length + 1,
            measuringItem: '',
            specification: '',
            rank: '',
            inspectionInstrument: '',
            remark: '',
            sampleQty: 3,
            samples: [
                { no: 1, value: '' },
                { no: 2, value: '' },
                { no: 3, value: '' },
                { no: 4, value: '' },
                { no: 5, value: '' }
            ],
            judgement: '',
            xBar: '',
            r: '',
            cp: '',
            cpk: ''
        };
        setForm(prev => ({ ...prev, sdrData: [...prev.sdrData, newRow] }));
    };

    const updateSdrData = (index: number, field: string, value: any) => {
        const newData = [...form.sdrData];
        (newData[index] as any)[field] = value;
        setForm(prev => ({ ...prev, sdrData: newData }));
    };

    const updateSampleValue = (rowIndex: number, sampleIndex: number, value: string) => {
        const newData = [...form.sdrData];
        newData[rowIndex].samples[sampleIndex].value = value;
        setForm(prev => ({ ...prev, sdrData: newData }));
    };

    // ฟังก์ชันตรวจสอบว่าค่าอยู่ในช่วง tolerance หรือไม่
    const isOutOfTolerance = (value: string, specification: string): boolean => {
        if (!value || !specification) return false;
        
        const numValue = parseFloat(value);
        const numSpec = parseFloat(specification);
        
        if (isNaN(numValue) || isNaN(numSpec)) return false;
        
        // สมมติว่า tolerance ±0.05 (5%)
        const tolerance = 0.05;
        const upperLimit = numSpec + tolerance;
        const lowerLimit = numSpec - tolerance;
        
        return numValue > upperLimit || numValue < lowerLimit;
    };

    const handleSave = () => {
        // ตรวจสอบเงื่อนไขตาม Operation Process
        if (form.production08_2025 === 'Yes') {
            // ถ้าเลือก Yes ต้อง upload SDR Report
            if (!uploadSdrReport) {
                toast.current?.show({ 
                    severity: 'warn', 
                    summary: 'Warning', 
                    detail: 'Please upload SDR Report when production is Yes' 
                });
                return;
            }
            
            // ตรวจสอบว่ามีการกรอกข้อมูล SDS หรือไม่
            const hasEmptyData = form.sdrData.some(row => 
                !row.measuringItem || !row.specification || !row.rank || !row.inspectionInstrument
            );
            
            if (hasEmptyData) {
                toast.current?.show({ 
                    severity: 'warn', 
                    summary: 'Warning', 
                    detail: 'Please complete all SDS data fields' 
                });
                return;
            }
        }
        
        console.log('Saving SDS data:', form);
        console.log('AIS File:', uploadAisFile);
        console.log('SDR File:', uploadSdrFile);
        console.log('SDR Report:', uploadSdrReport);
        
        toast.current?.show({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'SDS data submitted successfully' 
        });

        setTimeout(() => {
            router.push('/pages-sample/create-sds');
        }, 1000);
    };

    return (
        <div className="flex justify-center pt-6 px-6 pb-6">
            <Toast ref={toast} />
            <div className="container">
                <div className="mx-4 mb-4 text-2xl font-bold py-3 border-solid border-t-0 border-x-0 border-b-2 border-gray-600">
                    Sample Data Sheet
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Section 1: Basic Information */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <div className="mb-4">
                                <label className="font-semibold block mb-2">Supplier</label>
                                <InputText value={form.supplier} className="w-full" readOnly />
                            </div>
                            <div className="mb-4">
                                <label className="font-semibold block mb-2">Part No.</label>
                                <InputText value={form.partNo} className="w-full" readOnly />
                            </div>
                        </div>
                        <div>
                            <div className="mb-4">
                                <label className="font-semibold block mb-2">Model</label>
                                <InputText value={form.model} className="w-full" readOnly />
                            </div>
                            <div className="mb-4">
                                <label className="font-semibold block mb-2">Part Name</label>
                                <InputText value={form.partName} className="w-full" readOnly />
                            </div>
                        </div>
                    </div>

                    {/* Document Section */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="font-semibold block mb-2">Document : AIS</label>
                            <div className="flex gap-2 items-center">
                                <InputText 
                                    value={uploadAisFile?.name || ''} 
                                    className="flex-1" 
                                    readOnly 
                                    placeholder="No file selected"
                                />
                                <Button label="Download" className="p-button-primary" disabled={!uploadAisFile} />
                                <input
                                    id="upload-ais"
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setUploadAisFile(file);
                                    }}
                                />
                                <Button 
                                    label="Upload" 
                                    className="p-button-secondary"
                                    onClick={() => document.getElementById('upload-ais')?.click()}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold block mb-2">SDR : Cover Page</label>
                            <div className="flex gap-2 items-center">
                                <InputText 
                                    value={uploadSdrFile?.name || ''} 
                                    className="flex-1" 
                                    readOnly 
                                    placeholder="No file selected"
                                />
                                <Button label="Download" className="p-button-primary" disabled={!uploadSdrFile} />
                                <input
                                    id="upload-sdr"
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setUploadSdrFile(file);
                                    }}
                                />
                                <Button 
                                    label="Upload" 
                                    className="p-button-secondary"
                                    onClick={() => document.getElementById('upload-sdr')?.click()}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 1: 08-2025 Production */}
                    <div className="mb-6 p-4 bg-gray-50 rounded">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold">1. 08-2025 Production :</span>
                            <div className="flex gap-4">
                                {productionOptions.map((option) => (
                                    <div key={option.value} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id={`production-${option.value}`}
                                            name="production"
                                            value={option.value}
                                            checked={form.production08_2025 === option.value}
                                            onChange={(e) => setForm(prev => ({ ...prev, production08_2025: e.target.value }))}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor={`production-${option.value}`}>{option.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: SDR Sample Data Report */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-3">2. SDR : Sample Data Report</h3>
                        <div className={`border rounded p-4 flex flex-col items-center justify-center ${form.production08_2025 === 'No' ? 'bg-gray-200' : 'bg-gray-50'}`} style={{ minHeight: '300px' }}>
                            <div className="text-center mb-4">
                                {form.production08_2025 === 'No' ? (
                                    <>
                                        <div className="text-6xl text-gray-400 mb-2">🚫</div>
                                        <div className="text-gray-500 font-semibold">Upload disabled (Production: No)</div>
                                    </>
                                ) : uploadSdrReport ? (
                                    <>
                                        <div className="text-6xl text-green-500 mb-2">✓</div>
                                        <div className="text-gray-700">{uploadSdrReport.name}</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-6xl text-red-500 mb-2">✕</div>
                                        <div className="text-gray-600">No file uploaded</div>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    label="Download" 
                                    className="p-button-primary" 
                                    disabled={!uploadSdrReport || form.production08_2025 === 'No'} 
                                    onClick={() => {
                                        if (uploadSdrReport) {
                                            const fileUrl = URL.createObjectURL(uploadSdrReport);
                                            window.open(fileUrl, '_blank');
                                        }
                                    }}
                                />
                                <input
                                    id="upload-sdr-report"
                                    type="file"
                                    accept="application/pdf,image/*"
                                    className="hidden"
                                    disabled={form.production08_2025 === 'No'}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setUploadSdrReport(file);
                                    }}
                                />
                                <Button 
                                    label="Upload" 
                                    className="p-button-success"
                                    disabled={form.production08_2025 === 'No'}
                                    onClick={() => document.getElementById('upload-sdr-report')?.click()}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: SDS(2) Sample Data Sheet (2) */}
                    <div className={`mb-6 ${form.production08_2025 === 'No' ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg">
                                3. SDS (2) : Sample Data Sheet (2)
                                {form.production08_2025 === 'No' && <span className="text-red-500 ml-2">(Disabled - Production: No)</span>}
                            </h3>
                            <div className="flex items-center gap-2">
                                <label className="font-semibold">Date</label>
                                <Calendar
                                    value={form.sdrDate}
                                    onChange={(e) => setForm(prev => ({ ...prev, sdrDate: e.value as Date }))}
                                    dateFormat="dd-mm-yy"
                                    showIcon
                                    disabled={form.production08_2025 === 'No'}
                                />
                            </div>
                        </div>

                        {/* Scrollable Table */}
                        <div className="overflow-x-auto border rounded">
                            <table className="w-full min-w-[2000px] border-collapse">
                                <thead className="bg-gray-800 text-white">
                                    <tr>
                                        <th className="border p-2 text-center" style={{ minWidth: '50px' }}>No</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '150px' }}>Measuring Item</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '120px' }}>Specification/ Standard</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>Rank</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '120px' }}>Inspection Instrument</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '100px' }}>Sample Qty</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>1</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>2</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>Sample Data No.<br/>3</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>4</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>5</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '100px' }}>JUDGEMENT<br/>SUPP</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>X-BAR</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>R</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>Cp</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>Cpk</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '120px' }}>X-JUDGEMENT<br/>SUPP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.sdrData.map((row, rowIndex) => (
                                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="border p-2 text-center">{row.no}</td>
                                            <td className="border p-2">
                                                <InputText 
                                                    value={row.measuringItem}
                                                    onChange={(e) => updateSdrData(rowIndex, 'measuringItem', e.target.value)}
                                                    className="w-full"
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <InputText 
                                                    value={row.specification}
                                                    onChange={(e) => updateSdrData(rowIndex, 'specification', e.target.value)}
                                                    className="w-full"
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <Dropdown
                                                    value={row.rank}
                                                    options={rankOptions}
                                                    onChange={(e) => updateSdrData(rowIndex, 'rank', e.value)}
                                                    className="w-full"
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <InputText 
                                                    value={row.inspectionInstrument}
                                                    onChange={(e) => updateSdrData(rowIndex, 'inspectionInstrument', e.target.value)}
                                                    className="w-full"
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2 text-center">
                                                <Dropdown
                                                    value={row.sampleQty}
                                                    options={[
                                                        { label: '3', value: 3 },
                                                        { label: '5', value: 5 },
                                                        { label: '10', value: 10 }
                                                    ]}
                                                    onChange={(e) => updateSdrData(rowIndex, 'sampleQty', e.value)}
                                                    className="w-full"
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            {row.samples.map((sample, sampleIndex) => {
                                                const isRed = isOutOfTolerance(sample.value, row.specification);
                                                return (
                                                    <td key={sampleIndex} className="border p-2">
                                                        <InputText 
                                                            value={sample.value}
                                                            onChange={(e) => updateSampleValue(rowIndex, sampleIndex, e.target.value)}
                                                            className="w-full"
                                                            style={isRed ? { backgroundColor: '#fee', color: 'red', fontWeight: 'bold' } : {}}
                                                            disabled={form.production08_2025 === 'No'}
                                                        />
                                                    </td>
                                                );
                                            })}
                                            <td className="border p-2">
                                                <Dropdown
                                                    value={row.judgement}
                                                    options={judgementOptions}
                                                    onChange={(e) => updateSdrData(rowIndex, 'judgement', e.value)}
                                                    className="w-full"
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <InputText 
                                                    value={row.xBar}
                                                    onChange={(e) => updateSdrData(rowIndex, 'xBar', e.target.value)}
                                                    className="w-full"
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <InputText 
                                                    value={row.r}
                                                    onChange={(e) => updateSdrData(rowIndex, 'r', e.target.value)}
                                                    className="w-full"
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <InputText 
                                                    value={row.cp}
                                                    onChange={(e) => updateSdrData(rowIndex, 'cp', e.target.value)}
                                                    className="w-full"
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <InputText 
                                                    value={row.cpk}
                                                    onChange={(e) => updateSdrData(rowIndex, 'cpk', e.target.value)}
                                                    className="w-full"
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <Dropdown
                                                    value={row.remark}
                                                    options={remarkOptions}
                                                    onChange={(e) => updateSdrData(rowIndex, 'remark', e.value)}
                                                    className="w-full"
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-3">
                            <Button 
                                label="Add Row" 
                                icon="pi pi-plus"
                                className="p-button-secondary"
                                onClick={addRow}
                                disabled={form.production08_2025 === 'No'}
                            />
                        </div>
                    </div>

                    <Footer>
                        <div className='flex justify-end mt-4 w-full gap-2'>
                            <Button 
                                label="Cancel" 
                                className="p-button-danger min-w-[150px]" 
                                onClick={() => router.back()} 
                            />
                            <Button 
                                label="Submit" 
                                className="p-button-primary min-w-[150px]" 
                                onClick={handleSave} 
                            />
                        </div>
                    </Footer>
                </div>
            </div>
        </div>
    );
}
