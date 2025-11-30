'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { useRouter, useParams } from 'next/navigation';
import Footer from '@/components/footer';
import { Get, Post, Put } from '@/components/fetch';
import { InputTextarea } from 'primereact/inputtextarea';
import moment from 'moment';
import { InputNumber } from 'primereact/inputnumber';

interface SdrSample {
    no: number;
    value: number | null;
}

interface SdrRow {
    no: number;
    measuringItem: string;
    specification: number;
    rank: string;
    inspectionInstrument: string;
    remark: string;
    sampleQty: number;
    toleranceMinus: number;
    tolerancePlus: number;
    samples: SdrSample[];
    judgement: string;
    xBar: string;
    r: string;
    cp: string;
    cpk: string;
}

const DEFAULT_SAMPLE_QTY = 5;

const createSampleArray = (qty: number, existingSamples: any[] = []): SdrSample[] => {
    const normalizedQty = Math.max(1, qty);
    return Array.from({ length: normalizedQty }, (_, index) => {
        const sample = existingSamples[index];
        return {
            no: Number(sample?.no ?? index + 1),
            value: sample?.value ? Number(sample.value) : null,
        };
    });
};

const mapInspectionItemsToSdrRows = (items: any[], specialRequest: any | undefined): SdrRow[] => (
    items.map((item, index) => {
        const sampleQty = Number(item.sampleQty) || DEFAULT_SAMPLE_QTY;

        return {
            no: Number(item.no ?? index + 1),
            measuringItem: item.measuringItem || '',
            specification: Number(item.specification) || 0,
            rank: item.rank || '',
            inspectionInstrument: item.inspectionInstrument || '',
            remark: item.remark || '',
            sampleQty: specialRequest && specialRequest.qty ? specialRequest.qty : sampleQty,
            toleranceMinus: item.toleranceMinus,
            tolerancePlus: item.tolerancePlus,
            samples: createSampleArray(sampleQty, item.samples),
            judgement: '',
            xBar: '',
            r: '',
            cp: specialRequest ? specialRequest.cpCpk : '',
            cpk: specialRequest ? specialRequest.cpCpk : '',
        };
    })
);

const normalizeSdrRows = (rows: any[]): SdrRow[] => (
    rows.map((row: any, index: number) => {
        const sampleQty = Number(row.sampleQty) || DEFAULT_SAMPLE_QTY;
        return {
            no: Number(row.no ?? index + 1),
            measuringItem: row.measuringItem || '',
            specification: Number(row.specification) || 0,
            rank: row.rank || '',
            inspectionInstrument: row.inspectionInstrument || '',
            remark: row.remark || '',
            sampleQty,
            toleranceMinus: row.toleranceMinus,
            tolerancePlus: row.tolerancePlus,
            samples: createSampleArray(sampleQty, row.samples),
            judgement: row.judgement || '',
            xBar: row.xBar || '',
            r: row.r || '',
            cp: row.cp || '',
            cpk: row.cpk || '',
        };
    })
);

export default function CreateSDSForm({ page = 'create' }: { page: string }) {
    const router = useRouter();
    const params = useParams();
    const toast = useRef<Toast>(null);
    const inspectionId = params?.id;

    const [form, setForm] = useState({
        supplier: '',
        partNo: '',
        model: '',
        partName: '',
        aisDocument: null as File | null,
        sdrDocument: null as File | null,
        production08_2025: 'Yes',
        sdrDate: moment().endOf('month').toDate() as Date | null,
        remark: '',
        sdrData: [] as SdrRow[],
        inspectionDetailId: '' as string,
    });

    const [uploadSdrReport, setUploadSdrReport] = useState<File | null>(null);
    const [aisFileName, setAisFileName] = useState('');
    const [sdrFileName, setSdrFileName] = useState('');
    const [uploadSdrReportName, setUploadSdrReportName] = useState<string>('');
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [sheetId, setSheetId] = useState<number | null>(null);
    const [remarkJtekt, setRemarkJtekt] = useState('');
    const [statusJtekt, setStatusJtekt] = useState('');
    const isEditMode = Boolean(sheetId);

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

    useEffect(() => {
        if (!inspectionId) {
            return;
        }

        const fetchInspectionDetail = async () => {
            const response = await Get({ url: `/inspection-detail/detail/${inspectionId}` });
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(errorBody?.message || 'Failed to load inspection detail');
            }

            const payload = await response.json();
            const detail = payload?.data;
            if (!detail) {
                throw new Error('Inspection detail not found');
            }

            setSheetId(null);
            const specialRequest0 = detail.specialRequest && detail.specialRequest.length > 0 ? detail.specialRequest[detail.specialRequest.length - 1] : (
                detail.dueDate ? detail : undefined
            )
            setForm((prev) => ({
                ...prev,
                supplier: detail.supplierName || prev.supplier,
                partNo: detail.partNo || prev.partNo,
                partName: detail.partName || prev.partName,
                model: detail.model || prev.model,
                inspectionDetailId: detail.id?.toString() || prev.inspectionDetailId,
                sdrData: detail.inspectionItems && detail.inspectionItems.length
                    ? mapInspectionItemsToSdrRows(detail.inspectionItems, specialRequest0)
                    : prev.sdrData,
                sdrDate: specialRequest0 && specialRequest0.dueDate ? new Date(specialRequest0.dueDate) : prev.sdrDate,
            }));
            setAisFileName(detail.aisFile || '');
            setSdrFileName(detail.sdrFile || '');
            setUploadSdrReportName('');
        };

        const loadInspectionDetail = async () => {
            setIsLoadingDetail(true);
            setUploadSdrReport(null);
            setUploadSdrReportName('');
            try {
                let sheetResponse = undefined
                if (page == 'edit') {
                    sheetResponse = await Get({ url: `/sample-data-sheet/by-inspection/${inspectionId}` });
                    if (sheetResponse.status === 404) {
                        await fetchInspectionDetail();
                        return;
                    }
                }
                if (sheetResponse && sheetResponse?.ok) {
                    const sheetPayload = await sheetResponse.json();
                    const sheet = sheetPayload?.data;
                    if (sheet) {
                        setSheetId(sheet.id);
                        setForm((prev) => ({
                            ...prev,
                            supplier: sheet.supplier || prev.supplier,
                            partNo: sheet.partNo || prev.partNo,
                            partName: sheet.partName || prev.partName,
                            model: sheet.model || prev.model,
                            inspectionDetailId: sheet.inspectionDetailId?.toString() || prev.inspectionDetailId,
                            production08_2025: sheet.production08_2025 || prev.production08_2025,
                            sdrDate: sheet.sdrDate ? new Date(sheet.sdrDate) : prev.sdrDate,
                            sdrData: sheet.sdrData && sheet.sdrData.length
                                ? normalizeSdrRows(sheet.sdrData)
                                : prev.sdrData,
                            remark: sheet.remark || prev.remark,
                        }));

                        const remarkApproved = sheet.approvals && sheet.approvals.length > 0 ? sheet.approvals[sheet.approvals.length - 1] : undefined;
                        setRemarkJtekt(remarkApproved && remarkApproved?.remark || '');
                        setStatusJtekt(remarkApproved && remarkApproved?.action || '');
                        setAisFileName(sheet.aisFile || '');
                        setSdrFileName(sheet.sdrFile || '');
                        setUploadSdrReportName(sheet.sdrReportFile || '');
                        return;
                    }
                }

                await fetchInspectionDetail();
            } catch (error: any) {
                console.error('Load inspection detail for SDS create failed', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.message || 'Cannot load inspection detail data',
                });
            } finally {
                setIsLoadingDetail(false);
            }
        };

        loadInspectionDetail();
    }, [inspectionId]);

    const downloadServerFile = async (fileName?: string) => {
        if (!fileName) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Missing file',
                detail: 'No file name available to download',
            });
            return;
        }

        try {
            const res = await Get({ url: `/inspection-detail/files/${fileName}` });
            if (!res.ok) {
                const message = await res.text().catch(() => 'Failed to download file');
                throw new Error(message || 'Failed to download file');
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
            console.error('File download failed', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error?.message || 'Unable to download file',
            });
        }
    };

    const updateSdrData = (index: number, field: string, value: any) => {
        const newData = [...form.sdrData];
        const targetRow = newData[index];
        if (!targetRow) return;

        if (field === 'sampleQty') {
            const qty = Math.max(1, Number(value) || DEFAULT_SAMPLE_QTY);
            newData[index] = {
                ...targetRow,
                sampleQty: qty,
                samples: createSampleArray(qty, targetRow.samples),
            };
        } else {
            newData[index] = {
                ...targetRow,
                [field]: value,
            };
        }

        setForm(prev => ({ ...prev, sdrData: newData }));
    };

    const updateSampleValue = (rowIndex: number, sampleIndex: number, value: number | null) => {
        const newData = [...form.sdrData];
        newData[rowIndex].samples[sampleIndex].value = value;
        setForm(prev => ({ ...prev, sdrData: newData }));
    };

    // ฟังก์ชันตรวจสอบว่าค่าอยู่ในช่วง tolerance หรือไม่
    const isOutOfTolerance = (value: number | null, row: SdrRow): boolean => {
        if (value === null || !row.specification) return false;

        const numSpec = row.specification;
        const tolerancePlus = parseFloat(String(row.tolerancePlus || 0));
        const toleranceMinus = parseFloat(String(row.toleranceMinus || 0));

        if (isNaN(numSpec)) return false;

        const upperLimit = numSpec + tolerancePlus;
        const lowerLimit = numSpec - toleranceMinus;

        return value > upperLimit || value < lowerLimit;
    };

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSave = async () => {
        setIsSubmitted(true);
        if (!isEditMode && form.production08_2025 === 'Yes' && !uploadSdrReport) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Please upload SDR Report when production is Yes',
            });
            return;
        }

        if (form.production08_2025 === 'Yes') {
            const missingFields: string[] = [];
            const hasEmptyData = form.sdrData.some((row, index) => {
                const isMissing = !row.measuringItem ||
                    (row.specification === null || row.specification === undefined) ||
                    !row.rank ||
                    !row.inspectionInstrument ||
                    !row.sampleQty ||
                    !row.judgement ||
                    !row.xBar ||
                    !row.r ||
                    !row.cp ||
                    !row.cpk ||
                    row.samples.slice(0, row.sampleQty).some(s => s.value === null);

                if (isMissing) {
                    if (!row.measuringItem) missingFields.push(`Row ${index + 1}: Measuring Item`);
                    if (row.specification === null || row.specification === undefined) missingFields.push(`Row ${index + 1}: Specification`);
                    if (!row.rank) missingFields.push(`Row ${index + 1}: Rank`);
                    if (!row.inspectionInstrument) missingFields.push(`Row ${index + 1}: Inspection Instrument`);
                    if (!row.sampleQty) missingFields.push(`Row ${index + 1}: Sample Qty`);
                    if (!row.judgement) missingFields.push(`Row ${index + 1}: Judgement`);
                    if (!row.xBar) missingFields.push(`Row ${index + 1}: X-Bar`);
                    if (!row.r) missingFields.push(`Row ${index + 1}: R`);
                    if (!row.cp) missingFields.push(`Row ${index + 1}: Cp`);
                    if (!row.cpk) missingFields.push(`Row ${index + 1}: Cpk`);
                    if (row.samples.slice(0, row.sampleQty).some(s => s.value === null)) missingFields.push(`Row ${index + 1}: Samples`);
                }
                return isMissing;
            });

            if (hasEmptyData) {
                console.log('Missing fields:', missingFields);
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Warning',
                    detail: `Please complete all SDS data fields. Missing: ${missingFields[0]}`,
                });
                return;
            }
        }

        const payload = {
            supplier: form.supplier,
            partNo: form.partNo,
            partName: form.partName,
            model: form.model,
            remark: form.remark,
            production08_2025: form.production08_2025,
            sdrDate: form.sdrDate?.toISOString?.() ?? '',
            inspectionDetailId: form.inspectionDetailId,
            sdrData: form.sdrData.map((row) => ({
                ...row,
                samples: row.samples.map((sample: SdrSample) => ({ no: sample.no, value: sample.value })),
            })),
        };

        const payloadForm = new FormData();
        payloadForm.append('payload', JSON.stringify(payload));
        if (uploadSdrReport) {
            payloadForm.append('sdrReport', uploadSdrReport);
        }

        try {
            const requestUrl = isEditMode ? `/sample-data-sheet/${sheetId}` : '/sample-data-sheet';
            const requestFn = isEditMode ? Put : Post;
            const response = await requestFn({ url: requestUrl, body: payloadForm });
            const responseBody = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(responseBody?.message || 'Unable to create Sample Data Sheet');
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: isEditMode ? 'SDS data updated successfully' : 'SDS data submitted successfully',
            });

            setTimeout(() => {
                router.push('/pages-sample/create-sds');
            }, 1000);
        } catch (error) {
            const detail = error instanceof Error ? error.message : 'Something went wrong while submitting SDS data';
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail,
            });
        }
    };

    const sampleColumnCount = Math.max(
        DEFAULT_SAMPLE_QTY,
        form.sdrData.reduce((max, row) => Math.max(max, row.sampleQty), DEFAULT_SAMPLE_QTY),
    );
    const sampleColumns = Array.from({ length: sampleColumnCount }, (_, index) => index + 1);

    return (
        <div className="flex justify-center pt-6 px-6 pb-6">
            <Toast ref={toast} />
            <div className="container">
                <div className="mx-4 mb-4 text-2xl font-bold py-3 border-solid border-t-0 border-x-0 border-b-2 border-gray-600">
                    Sample Data Sheet{isEditMode ? ' (Edit)' : ''}
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
                                    value={aisFileName}
                                    className="flex-1"
                                    readOnly
                                    placeholder="No file selected"
                                />
                                <Button
                                    label="Download"
                                    className="p-button-primary"
                                    disabled={!aisFileName}
                                    onClick={() => downloadServerFile(aisFileName)}
                                />

                            </div>
                        </div>
                        <div>
                            <label className="font-semibold block mb-2">SDR : Cover Page</label>
                            <div className="flex gap-2 items-center">
                                <InputText
                                    value={sdrFileName}
                                    className="flex-1"
                                    readOnly
                                    placeholder="No file selected"
                                />
                                <Button
                                    label="Download"
                                    className="p-button-primary"
                                    disabled={!sdrFileName}
                                    onClick={() => downloadServerFile(sdrFileName)}
                                />

                            </div>
                        </div>
                    </div>

                    {/* Section 1: 08-2025 Production */}
                    <div className="mb-6 py-4 px-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-lg">1. {form.sdrDate ? moment(form.sdrDate).format('MM-YYYY') : '-'} Production :</span>
                            <div className="flex gap-4 text-lg">
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
                    <div className="mb-6 px-2">
                        <h3 className="font-semibold text-lg mb-3">2. SDR : Sample Data Report</h3>
                        <div className={`border rounded p-4 flex flex-col items-center justify-center ${form.production08_2025 === 'No' ? 'bg-gray-200' : 'bg-gray-50'}`} style={{ minHeight: '300px' }}>
                            <div className="text-center mb-4">
                                {form.production08_2025 === 'No' ? (
                                    <>
                                        <div className="text-6xl text-gray-400 mb-2">🚫</div>
                                        <div className="text-gray-500 font-semibold">Upload disabled (Production: No)</div>
                                    </>
                                ) : uploadSdrReportName || uploadSdrReport ? (
                                    <>
                                        <div className="text-6xl text-green-500 mb-2">✓</div>
                                        <div className="text-gray-700">{uploadSdrReportName || (uploadSdrReport?.name)}</div>
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
                                    disabled={(!uploadSdrReport || form.production08_2025 === 'No') && !uploadSdrReportName}
                                    onClick={() => {
                                        if (uploadSdrReportName) {
                                            downloadServerFile(uploadSdrReportName);
                                        }
                                        else if (uploadSdrReport) {
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
                                        {sampleColumns.map((columnIndex) => (
                                            <th
                                                key={`sample-header-${columnIndex}`}
                                                className="border p-2 text-center"
                                                style={{ minWidth: '80px' }}
                                            >
                                                {columnIndex}
                                            </th>
                                        ))}
                                        <th className="border p-2 text-center" style={{ minWidth: '100px' }}>JUDGEMENT<br />SUPP</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>X-BAR</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>R</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>Cp</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '80px' }}>Cpk</th>
                                        <th className="border p-2 text-center" style={{ minWidth: '120px' }}>X-JUDGEMENT<br />SUPP</th>
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
                                                    disabled
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <InputNumber
                                                    value={row.specification}
                                                    onChange={(e) => updateSdrData(rowIndex, 'specification', e.value)}
                                                    className="w-full"
                                                    inputStyle={{
                                                        width: '100px'
                                                    }}
                                                    disabled
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <Dropdown
                                                    value={row.rank}
                                                    options={rankOptions}
                                                    onChange={(e) => updateSdrData(rowIndex, 'rank', e.value)}
                                                    className="w-full"
                                                    disabled
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <InputText
                                                    value={row.inspectionInstrument}
                                                    onChange={(e) => updateSdrData(rowIndex, 'inspectionInstrument', e.target.value)}
                                                    className="w-full"
                                                    disabled
                                                />
                                            </td>
                                            <td className="border p-2 text-center">
                                                <Dropdown
                                                    value={row.sampleQty}
                                                    options={Array.from({ length: 30 }, (_, index) => ({
                                                        label: `${index + 1}`,
                                                        value: index + 1,
                                                    }))}
                                                    onChange={(e) => updateSdrData(rowIndex, 'sampleQty', e.value)}
                                                    className={`w-full ${isSubmitted && !row.sampleQty ? 'p-invalid' : ''}`}
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            {sampleColumns.map((columnIndex) => {
                                                const sampleIndex = columnIndex - 1;
                                                const sample = row.samples[sampleIndex];
                                                const showInput = columnIndex <= row.sampleQty;
                                                const sampleValue = sample?.value ?? null;
                                                const isRed = showInput && isOutOfTolerance(sampleValue, row);
                                                return (
                                                    <td key={`row-${rowIndex}-sample-${columnIndex}`} className="border p-2">
                                                        {showInput ? (
                                                            <InputNumber
                                                                value={sampleValue}
                                                                onChange={(e) => updateSampleValue(rowIndex, sampleIndex, e.value)}
                                                                className={`w-full ${isSubmitted && sampleValue === null ? 'p-invalid' : ''}`}
                                                                inputStyle={{
                                                                    ...isRed ? { backgroundColor: '#fee', color: 'red', fontWeight: 'bold' } : {},
                                                                    width: '100px'
                                                                }}
                                                                mode="decimal"
                                                                step={0.01}
                                                                minFractionDigits={0}
                                                                maxFractionDigits={3}
                                                                disabled={form.production08_2025 === 'No'}
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">-</div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="border p-2">
                                                <Dropdown
                                                    value={row.judgement}
                                                    options={judgementOptions}
                                                    onChange={(e) => updateSdrData(rowIndex, 'judgement', e.value)}
                                                    className={`w-full ${isSubmitted && !row.judgement ? 'p-invalid' : ''}`}
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <InputText
                                                    value={row.xBar}
                                                    onChange={(e) => updateSdrData(rowIndex, 'xBar', e.target.value)}
                                                    className={`w-full ${isSubmitted && !row.xBar ? 'p-invalid' : ''}`}
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <InputText
                                                    value={row.r}
                                                    onChange={(e) => updateSdrData(rowIndex, 'r', e.target.value)}
                                                    className={`w-full ${isSubmitted && !row.r ? 'p-invalid' : ''}`}
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <InputText
                                                    value={row.cp}
                                                    onChange={(e) => updateSdrData(rowIndex, 'cp', e.target.value)}
                                                    className={`w-full ${isSubmitted && !row.cp ? 'p-invalid' : ''}`}
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <InputText
                                                    value={row.cpk}
                                                    onChange={(e) => updateSdrData(rowIndex, 'cpk', e.target.value)}
                                                    className={`w-full ${isSubmitted && !row.cpk ? 'p-invalid' : ''}`}
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <Dropdown
                                                    value={row.remark}
                                                    options={remarkOptions}
                                                    onChange={(e) => updateSdrData(rowIndex, 'remark', e.value)}
                                                    className={`w-full ${isSubmitted && !row.remark ? 'p-invalid' : ''}`}
                                                    disabled={form.production08_2025 === 'No'}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {remarkJtekt && <div
                            className='flex flex-col items-left gap-2 mt-4'
                            style={{
                                backgroundColor: '#ffe1e1',
                                padding: '6px 10px',
                                borderRadius: '10px',
                                border: '1px solid #e24c4c'
                            }}>
                            <label className='font-bold'>Remark {statusJtekt}</label>
                            <InputTextarea
                                value={remarkJtekt}
                                disabled
                                rows={2}
                                cols={30}
                            />
                        </div>}

                        <div className='flex flex-col items-left gap-2 mt-4'>
                            <label className='font-bold'>Remark</label>
                            <InputTextarea
                                value={form.remark}
                                onChange={(e) => setForm(prev => ({ ...prev, remark: e.target.value }))}
                                rows={5} cols={30}
                            />
                        </div>
                        {/* <div className="mt-3">
                            <Button
                                label="Add Row"
                                icon="pi pi-plus"
                                className="p-button-secondary"
                                onClick={addRow}
                                disabled={form.production08_2025 === 'No'}
                            />
                        </div> */}
                    </div>

                    <Footer>
                        <div className='flex justify-end mt-4 w-full gap-2'>
                            <Button
                                label="Cancel"
                                className="p-button-danger min-w-[150px]"
                                onClick={() => router.back()}
                            />
                            <Button
                                label={isEditMode ? 'Update' : 'Submit'}
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
