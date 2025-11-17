'use client';

import { Get } from "@/components/fetch";
import { useParams, useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";

export default function Page() {

    const router = useRouter();
    const params = useParams();
    const toast = useRef<Toast>(null);
    const inspectionId = params?.id;
    const [sheetId, setSheetId] = useState<number | null>(null);
    const [aisFileName, setAisFileName] = useState('');
    const [sdrFileName, setSdrFileName] = useState('');

    const [form, setForm] = useState({
        supplier: '',
        partNo: '',
        model: '',
        partName: '',
        aisDocument: null as File | null,
        sdrDocument: null as File | null,
    });

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
                model: detail.model || prev.model
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
                    setForm((prev) => ({
                        ...prev,
                        supplier: sheet.supplier || prev.supplier,
                        partNo: sheet.partNo || prev.partNo,
                        partName: sheet.partName || prev.partName,
                        model: sheet.model || prev.model,
                    }));
                    setAisFileName(sheet.aisFile || '');
                    setSdrFileName(sheet.sdrFile || '');
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
                </div>
            </div>
        </div>
    );
}