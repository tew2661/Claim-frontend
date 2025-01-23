'use client';
import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/footer";
import { v4 as uuidv4 } from "uuid";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Get } from "@/components/fetch";
import { Toast } from "primereact/toast";

export default function QPRUploadForm() {
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const [actionDetail, setActionDetail] = useState("");
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState<Date | null>(null);
    const [quantity, setQuantity] = useState<number | null>(null);
    const [contactPerson, setContactPerson] = useState("");
    const [sketches, setSketches] = useState<{ key: string; file: { name: string | null, file: File | null } }[]>([
        { key: uuidv4(), file: { name: null, file: null } }
    ]);

    const [contactPersonList, setContactPersonList] = useState<{ lable: string, value: string }[]>([])

    const handleAddMore = () => {
        if (sketches.length < 3) {
            setSketches((prev) => [
                ...prev,
                { key: uuidv4(), file: { name: null, file: null } },
            ]);
        }

    };

    const handleDeleteSketch = (id: string) => {
        setSketches((prev) => prev.filter((sketch) => sketch.key !== id));
    };

    const GetDatas = async () => {
        const localUser = localStorage.getItem('user') ?? ''
        const jsonUser = JSON.parse(localUser || '{}');
        const res = await Get({ url: `/supplier/${jsonUser.id}` });
        if (res?.ok) {
            const res_data = await res.json();
            setContactPersonList((res_data.contactPerson || []).map((x: string) => ({label : x , value: x})))
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
    }

    useEffect(() => {
        GetDatas()
    }, [])

    return (
        <div className="flex justify-center bg-gray-100">
            <Toast ref={toast} />
            <div className="container p-4 flex flex-col h-[calc(100vh-115px)]">
                {/* Header */}
                <div className="border border-black bg-white text-center mb-6 flex items-center justify-center h-full overflow-auto">
                    <h1 className="text-2xl font-bold">Display QPR Data from JATH</h1>
                </div>

                {/* First Lot Delivery Section */}
                <div className="border border-black bg-white p-4 h-full overflow-auto">
                    <div className="border border-black bg-white pt-2">
                        <label className="block font-bold mb-2">Remark</label>
                        <textarea
                            // value={actionDetail}
                            value={'ไม่ผ่าน'}
                            rows={2}
                            disabled
                            className="w-full border border-gray-300 rounded-md p-2"
                        ></textarea>
                    </div>

                    {/* Action Detail Section */}
                    <div className="border border-black bg-white py-4 pt-1">
                        <label className="block font-bold mb-2">Action Detail</label>
                        <textarea
                            value={actionDetail}
                            onChange={(e) => setActionDetail(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="Enter action details"
                        ></textarea>
                    </div>

                    <h2 className="font-bold mb-4 mt-2">First Lot Delivery to JATH</h2>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {/* Date Input */}
                        <div>
                            <label className="block font-bold mb-2">Date</label>
                            <Calendar
                                value={date}
                                onChange={(e) => setDate(e.value as Date)}
                                showIcon
                                className="w-full"
                                style={{ padding: 0 }}
                                showButtonBar
                            />
                        </div>

                        {/* Time Input */}
                        <div>
                            <label className="block font-bold mb-2">Time</label>
                            <Calendar
                                value={time}
                                onChange={(e) => setTime(e.value as Date)}
                                timeOnly
                                showIcon
                                className="w-full"
                                style={{ padding: 0 }}
                            />
                        </div>

                        {/* Quantity Input */}
                        <div>
                            <label className="block font-bold mb-2">Q'TY</label>
                            <InputNumber
                                value={quantity}
                                onChange={(e) => setQuantity(e.value)}
                                className="w-full"
                                placeholder="Enter quantity"
                                style={{ padding: 0 }}
                            />
                        </div>
                    </div>



                    {/* Sketch Upload Section */}

                    <div className="grid grid-cols-2 border border-solid border-gray-300 p-2">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="contactPerson">File Other</label>
                            {sketches.map((sketch, index) => (
                                <div key={sketch.key}
                                    className="flex items-center gap-4"
                                >
                                    <Button
                                        label={sketch.file?.name || "Upload Photo"}
                                        icon="pi pi-upload"
                                        className="p-button-primary"
                                        onClick={() => document.getElementById('keyElement-image-' + index)?.click()}
                                    />
                                    <input
                                        id={'keyElement-image-' + index}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const imageUrl = URL.createObjectURL(file);
                                                setSketches((old) => (old.map((arr) => {
                                                    if (arr.key == sketch.key) {
                                                        return { ...arr, file: { name: file.name, file: file } }
                                                    } else {
                                                        return arr
                                                    }
                                                })));
                                            } else {
                                                setSketches((old) => (old.map((arr) => {
                                                    if (arr.key == sketch.key) {
                                                        return { ...arr, file: { name: null, file: null } }
                                                    } else {
                                                        return arr
                                                    }
                                                })));
                                            }
                                        }}
                                    />
                                    <Button
                                        label="Delete"
                                        icon="pi pi-trash"
                                        className="p-button-danger"
                                        disabled={sketches.length == 1}
                                        onClick={() => handleDeleteSketch(sketch.key)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="contactPerson">Contact Person</label>
                                <Dropdown
                                    id="contactPerson"
                                    value={contactPerson}
                                    options={contactPersonList}
                                    onChange={(e) => setContactPerson(e.value)}
                                    optionLabel="label"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-2">
                        <Button
                            label="+Addmore"
                            disabled={sketches.length == 3}
                            className="p-button-secondary"
                            onClick={handleAddMore}
                        />
                    </div>
                </div>
            </div>

            <Footer>
                <div className="flex justify-between gap-3 w-full">
                    <Button label="BACK" className="p-button-danger min-w-[150px]" onClick={() => router.back()} />
                    <div className="flex gap-4">
                        <Button label="SAVE" className="p-button-primary min-w-[150px]" />
                        <Button
                            label="Confirm and send to JATH"
                            className="p-button-success min-w-[150px]"
                            disabled={sketches.filter((x) => x.file?.name || false).length == 0 || !(date) || !(time) || !(quantity) || !(contactPerson)}
                        />
                    </div>
                </div>
            </Footer>
        </div>
    );
}
