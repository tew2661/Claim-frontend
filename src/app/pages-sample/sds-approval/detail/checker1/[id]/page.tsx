'use client';

import { Get, Post } from "@/components/fetch";
import { useParams, useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { Calendar } from 'primereact/calendar';
import Footer from "@/components/footer";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";

interface SdrSample {
    no: number;
    value: number | null;
}

interface SdrRow {
    id?: number; // database row id
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
    saStatus?: string;
    dueToImplement?: Date | null;
}

interface OutOfToleranceRow extends SdrRow {
    outOfToleranceSamples: number[]; // indices of samples that are out of tolerance
}

export function Page({ page }: { page: number }) {

    const router = useRouter();
    const params = useParams();
    const toast = useRef<Toast>(null);
    const inspectionId = params?.id;
    const [sheetId, setSheetId] = useState<number | null>(null);
    const [aisFileName, setAisFileName] = useState('');
    const [sdrFileName, setSdrFileName] = useState('');
    const [remarkSupplier, setRemarkSupplier] = useState('');
    const [remarkSdr, setRemarkSdr] = useState('');
    const [outOfToleranceRows, setOutOfToleranceRows] = useState<OutOfToleranceRow[]>([]);

    const saStatusOptions = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Approval', value: 'Approval' },
        { label: 'Rejected', value: 'Rejected' },
    ];

    // Function to check if a sample value is out of tolerance
    const isOutOfTolerance = (value: number | null, specification: number, tolerancePlus: number, toleranceMinus: number): boolean => {
        if (value === null) return false;
        const upperLimit = specification + (tolerancePlus || 0);
        const lowerLimit = specification - (toleranceMinus || 0);
        return value > upperLimit || value < lowerLimit;
    };

    // Function to filter rows with out-of-tolerance samples
    const filterOutOfToleranceRows = (sdrData: SdrRow[]): OutOfToleranceRow[] => {
        return sdrData
            .map(row => {
                const outOfToleranceSamples: number[] = [];
                row.samples.slice(0, row.sampleQty).forEach((sample, idx) => {
                    if (isOutOfTolerance(sample.value, row.specification, row.tolerancePlus, row.toleranceMinus)) {
                        outOfToleranceSamples.push(idx);
                    }
                });
                return { ...row, outOfToleranceSamples };
            })
            .filter(row => row.outOfToleranceSamples.length > 0);
    };

    // Function to update saStatus for a row
    const updateRowSaStatus = (rowIndex: number, value: string) => {
        setOutOfToleranceRows(prev => {
            const newRows = [...prev];
            newRows[rowIndex] = { ...newRows[rowIndex], saStatus: value };
            return newRows;
        });
    };

    // Function to update dueToImplement for a row
    const updateRowDueToImplement = (rowIndex: number, value: Date | null) => {
        setOutOfToleranceRows(prev => {
            const newRows = [...prev];
            newRows[rowIndex] = { ...newRows[rowIndex], dueToImplement: value };
            return newRows;
        });
    };

    const [form, setForm] = useState({
        id: 0,
        supplier: '',
        partNo: '',
        model: '',
        partName: '',
        production08_2025: 'No',
        aisDocument: null as File | null,
        sdrDocument: null as File | null,
        sdrReportFile: null as string | null,
        sdsReportFile: null as string | null,
        actionSdrApproval: '', // 'approve' | 'reject' | ''
        actionSdsApproval: '', // 'approve' | 'reject' | ''
        approveAllAction: '', // 'approve' | 'reject' | ''
        remark: '',
        reSubmitDate: null as Date | null,
    });

    const downloadDocument = async (fileName?: string, load?: boolean) => {
        if (!load) {
            return;
        }

        if (!fileName) {
            toast.current?.show({ severity: 'warn', summary: 'Missing file', detail: 'No document available' });
            return;
        }
        try {
            const res = await Get({ url: `/inspection-detail/files/${fileName}` });
            // const res = await Get({ url: `/sample-data-sheet/by-inspection/1` });
            if (!res.ok) {
                const errText = await res.text().catch(() => 'Failed to download file');
                throw new Error(errText || 'Failed to download file');
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            return url;
        } catch (error: any) {
            console.error('Document download failed', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error?.message || 'Unable to download document',
            });
            return null;
        }
    };

    const downloadDocumentSDS = async (id?: number) => {
        try {
            const res = await Get({ url: `/sample-data-sheet/by-inspection/pdf/${id}` });
            // const res = await Get({ url: `/sample-data-sheet/by-inspection/1` });
            if (!res.ok) {
                const errText = await res.text().catch(() => 'Failed to download file');
                throw new Error(errText || 'Failed to download file');
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            return url;
        } catch (error: any) {
            console.error('Document download failed', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error?.message || 'Unable to download document',
            });
            return null;
        }
    };

    const appendPdfViewerParams = (url?: string | null) => {
        if (!url) {
            return null;
        }

        const params = 'toolbar=1&navpanes=0&scrollbar=0';
        const [baseUrl, anchor] = url.split('#');

        const mergedAnchor = anchor ? `${anchor}&${params}` : params;
        return `${baseUrl}#${mergedAnchor}`;
    };

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

            setForm((prev) => ({
                ...prev,
                supplier: detail.supplierName || prev.supplier,
                partNo: detail.partNo || prev.partNo,
                partName: detail.partName || prev.partName,
                production08_2025: detail.production08_2025 || prev.production08_2025,
                model: detail.model || prev.model,
            }));
            setAisFileName(detail.aisFile || '');
            setSdrFileName(detail.sdrFile || '');
        };

        const loadInspectionDetail = async () => {
            try {
                const sheetResponse = await Get({ url: `/sample-data-sheet/by-inspection/${inspectionId}` });
                if (sheetResponse.status === 404) {
                    await fetchInspectionDetail();
                    return;
                }
                if (!sheetResponse.ok) {
                    const errorBody = await sheetResponse.json().catch(() => ({}));
                    throw new Error(errorBody?.message || 'Failed to load Sample Data Sheet');
                }

                const sheetPayload = await sheetResponse.json();
                const sheet = sheetPayload?.data;
                if (sheet) {
                    setSheetId(sheet.id);
                    const linkFile = await downloadDocument(sheet.sdrReportFile, sheet.production08_2025 == 'Yes');
                    const sdsLinkFile = await downloadDocumentSDS(sheet.id);
                    const remarkLast = page > 1 && sheet.approvals?.length ? sheet.approvals[sheet.approvals.length - 1]?.remark : '';
                    setForm((prevForm) => ({
                        ...prevForm,
                        supplier: sheet.supplier || prevForm.supplier,
                        partNo: sheet.partNo || prevForm.partNo,
                        partName: sheet.partName || prevForm.partName,
                        model: sheet.model || prevForm.model,
                        sdrReportFile: sheet.sdrReportFile && linkFile ? linkFile : null,
                        sdsReportFile: sheet.sdrFile ? sdsLinkFile : null,
                        production08_2025: sheet.production08_2025 || prevForm.production08_2025,
                        remark: remarkLast ? remarkLast : '',
                    }));

                    setRemarkSdr(remarkLast || '');
                    setRemarkSupplier(sheet.remark || '');
                    setAisFileName(sheet.aisFile || '');
                    setSdrFileName(sheet.sdrFile || '');

                    // Process sdrData and filter out-of-tolerance rows
                    if (sheet.sdrData && sheet.sdrData.length > 0) {
                        const normalizedRows: SdrRow[] = sheet.sdrData.map((row: any, index: number) => ({
                            id: row.id, // database row id
                            no: Number(row.no ?? index + 1),
                            measuringItem: row.measuringItem || '',
                            specification: Number(row.specification) || 0,
                            rank: row.rank || '',
                            inspectionInstrument: row.inspectionInstrument || '',
                            remark: row.remark || '',
                            sampleQty: Number(row.sampleQty) || 5,
                            toleranceMinus: row.toleranceMinus ?? 0,
                            tolerancePlus: row.tolerancePlus ?? 0,
                            samples: (row.samples || []).map((s: any, i: number) => ({
                                no: Number(s.no ?? i + 1),
                                value: s.value !== null && s.value !== undefined ? Number(s.value) : null,
                            })),
                            judgement: row.judgement || '',
                            xBar: row.xBar || '',
                            r: row.r || '',
                            cp: row.cp || '',
                            cpk: row.cpk || '',
                            saStatus: row.saStatus || '',
                            dueToImplement: row.dueToImplement ? new Date(row.dueToImplement) : null,
                        }));
                        const outOfTolerance = filterOutOfToleranceRows(normalizedRows);
                        setOutOfToleranceRows(outOfTolerance);
                    }

                    return;
                }

                await fetchInspectionDetail();
            } catch (error: any) {
                console.error('Load inspection detail for SDS create failed', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.message || 'Cannot load inspection detail data',
                });
            } finally { }
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

    const sdrPdfUrl = appendPdfViewerParams(form.sdrReportFile);
    const sdsPdfUrl = appendPdfViewerParams(form.sdsReportFile);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const localUser = localStorage.getItem('user') ?? ''
        if (localUser) {
            const jsonUser = JSON.parse(localUser);
            setName(jsonUser.name);
            setEmail(jsonUser.email);
        } else {
            localStorage.clear();
            window.location.href = "/login"
        }
    }, []);

    const handleSave = async () => {
        try {
            // Validate SA Status and Due to Implement for out-of-tolerance rows (only if approving)
            if (outOfToleranceRows.length > 0 && form.actionSdsApproval !== 'reject') {
                const missingFields: string[] = [];
                outOfToleranceRows.forEach((row, index) => {
                    if (!row.saStatus || row.saStatus === '') {
                        missingFields.push(`Row ${row.no}: SA Status`);
                    }
                    if (!row.dueToImplement) {
                        missingFields.push(`Row ${row.no}: Due to Implement`);
                    }
                });

                if (missingFields.length > 0) {
                    toast.current?.show({
                        severity: 'warn',
                        summary: 'Required Fields',
                        detail: `Please complete: ${missingFields[0]}${missingFields.length > 1 ? ` and ${missingFields.length - 1} more` : ''}`,
                    });
                    return;
                }
            }

            const payload = {
                id: sheetId,
                actionSdrApproval: form.production08_2025 == 'Yes' ? form.actionSdrApproval : form.actionSdsApproval,
                actionSdsApproval: form.actionSdsApproval,
                remark: form.remark,
                reSubmitDate: form.reSubmitDate ? form.reSubmitDate.toISOString() : null,
                approveRole: page == 3 ? 'approver' : ('checker' + page),
                outOfToleranceRows: outOfToleranceRows
                    .filter(row => row.id !== undefined && row.id !== null)
                    .map(row => ({
                        rowId: row.id,
                        saStatus: row.saStatus || null,
                        dueToImplement: row.dueToImplement ? row.dueToImplement.toISOString() : null,
                    })),
            };

            console.log('outOfToleranceRows:', outOfToleranceRows);
            console.log('payload:', payload);

            const response = await Post({
                url: '/sample-data-sheet/sds-approval',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payload }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(errorBody?.message || 'Failed to submit approval');
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Approval submitted successfully',
            });

            router.push('/pages-sample/sds-approval/checker' + page);
        } catch (error: any) {
            console.error('Submit approval failed', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error?.message || 'Unable to submit approval',
            });
        }
    }

    return (
        <div className="flex justify-center pt-6 px-6 pb-6">
            <Toast ref={toast} />
            <div className="container">
                <div className="mx-4 mb-4 text-2xl font-bold py-3 border-solid border-t-0 border-x-0 border-b-2 border-gray-600">
                    Sample Data Sheet
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
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
                    <div className="w-full mt-2 border-solid border-gray-200 p-4"
                        style={{
                            display: form.production08_2025 == 'No' ? 'none' : 'block',
                            borderRadius: '5px',
                            backgroundColor: form.actionSdrApproval == 'approve' ? '#f0fff0' : form.actionSdrApproval == 'reject' ? '#fff0f0' : 'transparent',
                            borderColor: form.actionSdrApproval == 'approve' ? 'green' : form.actionSdrApproval == 'reject' ? 'red' : '#e5e7eb',
                        }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <label className="font-semibold block mb-2">SDR (Sample Data Report)</label>
                            <div className="flex items-center">
                                <label
                                    className="mr-2"
                                    style={{
                                        fontWeight: 'bold',
                                        color: form.actionSdrApproval == 'approve' ? 'green' : form.actionSdrApproval == 'reject' ? 'red' : '#e5e7eb',
                                    }}
                                >{form.actionSdrApproval == 'approve' ? 'Approve' : (form.actionSdrApproval == 'reject' ? 'Reject' : '')}</label>
                                <Button
                                    className="p-button-success ml-2"
                                    icon="pi pi-check"
                                    onClick={() => {
                                        setForm((prev) => ({ ...prev, actionSdrApproval: 'approve' }));
                                    }}
                                />
                                <Button
                                    icon="pi pi-times"
                                    className="p-button-danger ml-2"
                                    onClick={() => {
                                        setForm((prev) => ({ ...prev, actionSdrApproval: 'reject' }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className="w-full">
                            {
                                sdrPdfUrl ? (
                                    <iframe
                                        src={sdrPdfUrl}
                                        style={{ width: '100%', height: '600px', border: 'none' }}
                                        loading="lazy"
                                    ></iframe>
                                ) : (<p>No SDR document available.</p>)
                            }

                        </div>
                    </div>
                    <div className="w-full mt-2 border-solid border-gray-200 p-4"
                        style={{
                            borderRadius: '5px',
                            backgroundColor: form.actionSdsApproval == 'approve' ? '#f0fff0' : form.actionSdsApproval == 'reject' ? '#fff0f0' : 'transparent',
                            borderColor: form.actionSdsApproval == 'approve' ? 'green' : form.actionSdsApproval == 'reject' ? 'red' : '#e5e7eb',
                        }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <label className="font-semibold block mb-2">SDS (Sample Data Sheet)</label>
                            <div className="flex items-center">
                                <label
                                    className="mr-2"
                                    style={{
                                        fontWeight: 'bold',
                                        color: form.actionSdsApproval == 'approve' ? 'green' : form.actionSdsApproval == 'reject' ? 'red' : '#e5e7eb',
                                    }}
                                >{form.actionSdsApproval == 'approve' ? 'Approve' : (form.actionSdsApproval == 'reject' ? 'Reject' : '')}</label>
                                <Button
                                    className="p-button-success ml-2"
                                    icon="pi pi-check"
                                    onClick={() => {
                                        setForm((prev) => ({ ...prev, actionSdsApproval: 'approve' }));
                                    }}
                                />
                                <Button
                                    icon="pi pi-times"
                                    className="p-button-danger ml-2"
                                    onClick={() => {
                                        setForm((prev) => ({ ...prev, actionSdsApproval: 'reject' }));
                                    }}
                                />
                            </div>
                        </div>
                        {
                            sdsPdfUrl ? (
                                <iframe
                                    src={sdsPdfUrl}
                                    style={{ width: '100%', height: '600px', border: 'none' }}
                                    loading="lazy"
                                ></iframe>
                            ) : (
                                <p>No SDS document available.</p>
                            )
                        }
                    </div>

                    {/* Out-of-Tolerance Table Section */}
                    {outOfToleranceRows.length > 0 && (
                        <div className="w-full mt-4 border-solid border-gray-200 p-4" style={{ borderRadius: '5px' }}>
                            <div className="flex justify-between items-center mb-4">
                                <label className="font-semibold block mb-2 text-red-600">
                                    ⚠️ Out-of-Tolerance Items ({outOfToleranceRows.length} items)
                                </label>
                            </div>
                            <div className="overflow-x-auto border rounded">
                                <table className="w-full min-w-[1500px] border-collapse">
                                    <thead className="bg-gray-800 text-white">
                                        <tr>
                                            <th className="border p-2 text-center" style={{ minWidth: '50px' }}>No</th>
                                            <th className="border p-2 text-center" style={{ minWidth: '150px' }}>Measuring Item</th>
                                            <th className="border p-2 text-center" style={{ minWidth: '100px' }}>Specification</th>
                                            <th className="border p-2 text-center" style={{ minWidth: '80px' }}>Tol (+)</th>
                                            <th className="border p-2 text-center" style={{ minWidth: '80px' }}>Tol (-)</th>
                                            <th className="border p-2 text-center" style={{ minWidth: '80px' }}>Rank</th>
                                            <th className="border p-2 text-center" style={{ minWidth: '100px' }}>Sample Qty</th>
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <th key={`sample-h-${n}`} className="border p-2 text-center" style={{ minWidth: '80px' }}>{n}</th>
                                            ))}
                                            <th className="border p-2 text-center" style={{ minWidth: '120px' }}>SA Status <span className="text-red-500">*</span></th>
                                            <th className="border p-2 text-center" style={{ minWidth: '150px' }}>Due to Implement <span className="text-red-500">*</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {outOfToleranceRows.map((row, rowIndex) => (
                                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="border p-2 text-center">{row.no}</td>
                                                <td className="border p-2">
                                                    <InputText value={row.measuringItem} className="w-full" disabled />
                                                </td>
                                                <td className="border p-2 text-center">
                                                    <InputNumber value={row.specification} className="w-full" disabled inputStyle={{ width: '80px' }} />
                                                </td>
                                                <td className="border p-2 text-center">
                                                    <InputNumber value={row.tolerancePlus} className="w-full" disabled inputStyle={{ width: '60px' }} />
                                                </td>
                                                <td className="border p-2 text-center">
                                                    <InputNumber value={row.toleranceMinus} className="w-full" disabled inputStyle={{ width: '60px' }} />
                                                </td>
                                                <td className="border p-2 text-center">
                                                    <InputText value={row.rank} className="w-full" disabled />
                                                </td>
                                                <td className="border p-2 text-center">
                                                    <InputText value={String(row.sampleQty)} className="w-full" disabled />
                                                </td>
                                                {[0, 1, 2, 3, 4].map((sampleIndex) => {
                                                    const sample = row.samples[sampleIndex];
                                                    const sampleValue = sample?.value ?? null;
                                                    const isRed = row.outOfToleranceSamples.includes(sampleIndex);
                                                    const showValue = sampleIndex < row.sampleQty;
                                                    return (
                                                        <td key={`row-${rowIndex}-sample-${sampleIndex}`} className="border p-2 text-center">
                                                            {showValue ? (
                                                                <InputNumber
                                                                    value={sampleValue}
                                                                    className="w-full"
                                                                    disabled
                                                                    inputStyle={{
                                                                        width: '70px',
                                                                        ...(isRed ? { backgroundColor: '#fee', color: 'red', fontWeight: 'bold' } : {}),
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="border p-2">
                                                    <Dropdown
                                                        value={row.saStatus || ''}
                                                        options={saStatusOptions}
                                                        onChange={(e) => updateRowSaStatus(rowIndex, e.value)}
                                                        className={`w-full ${!row.saStatus ? 'p-invalid' : ''}`}
                                                        style={{ minWidth: '100px' }}
                                                        placeholder="Select Status"
                                                    />
                                                </td>
                                                <td className="border p-2">
                                                    <Calendar
                                                        value={row.dueToImplement}
                                                        onChange={(e) => updateRowDueToImplement(rowIndex, e.value as Date | null)}
                                                        dateFormat="dd/mm/yy"
                                                        showIcon
                                                        className={`w-full ${!row.dueToImplement ? 'p-invalid' : ''}`}
                                                        inputStyle={{ width: '120px' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    <div className="w-full mt-2 border-solid border-gray-200 p-4"
                        style={{
                            borderRadius: '5px',
                            backgroundColor: form.approveAllAction == 'approve' ? '#f0fff0' : form.approveAllAction == 'reject' ? '#fff0f0' : 'transparent',
                            borderColor: form.approveAllAction == 'approve' ? 'green' : form.approveAllAction == 'reject' ? 'red' : '#e5e7eb',
                        }}>
                        <span className="font-semibold">Remark {page > 1 ? ('Checker ' + (page - 1)) : 'Supplier'} :</span> {page > 1 ? remarkSdr : remarkSupplier}
                    </div>
                    <div className="w-full mt-2 border-solid border-gray-200 p-4"
                        style={{
                            borderRadius: '5px',
                            backgroundColor: form.approveAllAction == 'approve' ? '#f0fff0' : form.approveAllAction == 'reject' ? '#fff0f0' : 'transparent',
                            borderColor: form.approveAllAction == 'approve' ? 'green' : form.approveAllAction == 'reject' ? 'red' : '#e5e7eb',
                        }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <label className="font-semibold block mb-2">{name}</label>
                            <div className="flex items-center">
                                <label className="font-semibold block mb-2">{email}</label>
                                <Button
                                    label="Approve All"
                                    className="p-button-success ml-2"
                                    onClick={() => {
                                        setForm((prev) => ({
                                            ...prev,
                                            approveAllAction: 'approve',
                                            actionSdrApproval: 'approve',
                                            actionSdsApproval: 'approve'
                                        }));
                                    }}
                                />
                                <Button
                                    label="Reject All"
                                    className="p-button-danger ml-2"
                                    onClick={() => {
                                        setForm((prev) => ({
                                            ...prev,
                                            approveAllAction: 'reject',
                                            actionSdrApproval: 'reject',
                                            actionSdsApproval: 'reject'
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="font-semibold block mb-2">Remark</label>
                            <textarea
                                value={form.remark}
                                onChange={(e) => setForm((prev) => ({ ...prev, remark: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded"
                                rows={4}
                                placeholder="Enter remarks here..."
                            />
                        </div>
                        <div className="mb-4">
                            <label className="font-semibold block mb-2">Re-Submit Date</label>
                            <Calendar
                                value={form.reSubmitDate}
                                onChange={(e) => {
                                    const dateValue = e.target.value ? new Date(e.target.value) : null;
                                    setForm((prev) => ({ ...prev, reSubmitDate: dateValue }));
                                }}
                                className="w-full"
                                dateFormat="dd/mm/yy"
                                placeholder="dd/mm/yy"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer>
                <div className='flex justify-end mt-4 w-full gap-2'>
                    <Button
                        label="Cancel"
                        className="p-button-danger min-w-[150px]"
                        onClick={() => router.push('/pages-sample/sds-approval/checker' + page)}
                    />
                    <Button
                        label={'Submit'}
                        disabled={form.actionSdrApproval == 'reject' || form.actionSdsApproval == 'reject' ? !form.reSubmitDate : false || (form.actionSdrApproval == '' && form.actionSdsApproval == '')}
                        className="p-button-primary min-w-[150px]"
                        onClick={() => handleSave()}
                    />
                </div>
            </Footer>
        </div>
    );
}

export default function PageMaster() {
    return (<Page page={1} />);
}