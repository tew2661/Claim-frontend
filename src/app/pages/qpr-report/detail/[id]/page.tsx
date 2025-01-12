'use client';
import React, { useState } from "react";
import { Button } from "primereact/button";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/footer";
import { v4 as uuidv4 } from "uuid";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";

export default function QPRUploadForm() {
    const param = useParams();
    const router = useRouter();
    const [actionDetail, setActionDetail] = useState("");
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState<Date | null>(null);
    const [quantity, setQuantity] = useState<number | null>(null);
    const [sketches, setSketches] = useState<{ key: string; name: string }[]>([
        { key: uuidv4(), name: "" }
    ]);

    const handleAddMore = () => {
        if (sketches.length < 3) {
            setSketches((prev) => [
                ...prev,
                { key: uuidv4(), name: "" },
            ]);
        }
        
    };

    const handleDeleteSketch = (id: string) => {
        setSketches((prev) => prev.filter((sketch) => sketch.key !== id));
    };

    return (
        <div className="flex justify-center bg-gray-100">
            <div className="container p-4 flex flex-col h-[calc(100vh-115px)]">
                {/* Header */}
                <div className="border border-black bg-white text-center mb-6 flex items-center justify-center h-full overflow-auto">
                    <h1 className="text-2xl font-bold">Display QPR Data from JATH</h1>
                </div>

                {/* First Lot Delivery Section */}
                <div className="border border-black bg-white p-4 h-full overflow-auto">
                    {/* Action Detail Section */}
                    <div className="border border-black bg-white py-4">
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
                    {sketches.map((sketch, index) => (
                        <div
                            key={sketch.key}
                            className="flex items-center gap-4 mb-4"
                        >
                            <Button
                                label="Upload Photo"
                                icon="pi pi-upload"
                                className="p-button-primary"
                            />
                            <Button
                                label="Delete"
                                icon="pi pi-trash"
                                className="p-button-danger"
                                onClick={() => handleDeleteSketch(sketch.key)}
                            />
                        </div>
                    ))}

                    <div className="flex gap-4 mt-4">
                        
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
                        />
                    </div>
                </div>
            </Footer>
        </div>
    );
}
