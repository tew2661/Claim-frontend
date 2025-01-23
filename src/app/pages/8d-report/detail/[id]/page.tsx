'use client';
import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/footer";
import { v4 as uuidv4 } from "uuid";

export default function QPRUploadForm() {
    const param = useParams();
    const router = useRouter();
    const [uploadSections, setUploadSections] = useState<{ key: string; name: string , extension: string, file: File | null  }[]>([
        { key: uuidv4(), name: "" , extension: "", file: null },
    ]);

    const handleAddMore = () => {
        setUploadSections((prev) => [
            ...prev,
            { key: uuidv4(), name: "" , extension: "", file: null },
        ]);
    };

    const handleDelete = (id: string) => {
        setUploadSections((prev) => prev.filter((section) => section.key !== id));
    };

    const handleInputChange = (id: string, value: string) => {
        setUploadSections((prev) =>
            prev.map((section) =>
                section.key === id ? { ...section, name: value } : section
            )
        );
    };

    return (
        <div className="flex justify-center bg-gray-100">
            <div className="container p-4 flex flex-col h-[calc(100vh-115px)]">
                {/* Header */}
                <div className="border border-black bg-white text-center mb-6 flex items-center justify-center h-full overflow-auto">
                    <h1 className="text-2xl font-bold">Display QPR Data from JATH</h1>
                </div>

                {/* Upload Section */}
                <div className="border border-black bg-white p-4 h-full overflow-auto">
                    {/* Upload 8D Report */}
                    <div className="flex justify-between mb-4">
                        <div>
                            <h2 className="font-bold mb-2">Upload 8D Report Document</h2>
                            <FileUpload
                                name="8d-report"
                                mode="basic"
                                accept="application/pdf"
                                maxFileSize={1000000}
                                chooseLabel="Upload 8D Report (PDF)"
                                className="p-button"
                            />
                        </div>
                        <div className="mt-4">
                            <Button
                                label="Download 8D Report"
                                severity="danger"
                            />
                        </div>
                    </div>

                    {/* Dynamic Document Upload Sections */}
                    {uploadSections.map((section, index) => (
                        <div
                            key={section.key}
                            className="flex items-center gap-4 mb-4"
                        >
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <label className="block font-bold mb-2">Document Name</label>
                                    <label className="block font-bold mb-2 text-red-400">"Max 10mb / Document"</label>
                                </div>
                                <div className="p-inputgroup flex-1" style={{ height: '33px' }}>
                                    <InputText
                                        value={section.name}
                                        onChange={(e) =>
                                            handleInputChange(section.key, e.target.value)
                                        }
                                        placeholder={`Enter document name for section ${index + 1}`}
                                        className="w-full"
                                    />
                                    <span className="p-inputgroup-addon">
                                        .{section.extension}
                                    </span>
                                </div>
                                
                            </div>
                            <div className="flex flex-col">
                                <label className="block font-bold mb-2">&nbsp;</label>
                                <Button
                                    label={"Upload Document"}
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
                                            console.log('file' , file)
                                            setUploadSections((old) => (old.map((arr) => {
                                                if (arr.key == section.key) {
                                                    let extension = '';
                                                    let filename = '';
                                                    if (file.name.includes('.')) {
                                                        extension = file.name.substring(file.name.lastIndexOf('.') + 1);
                                                        filename = file.name.replace(`.${extension}`, '');
                                                      } else {
                                                        extension = "";
                                                        filename = file.name
                                                      }
                                                    return { ...arr, name: filename, extension: extension, file: file }
                                                } else {
                                                    return arr
                                                }
                                            })));
                                        } else {
                                            setUploadSections((old) => (old.map((arr) => {
                                                if (arr.key == section.key) {
                                                    return { ...arr, name: "", extension: "", file: null }
                                                } else {
                                                    return arr
                                                }
                                            })));
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="block font-bold mb-2">&nbsp;</label>
                                <Button
                                    label="Delete"
                                    icon="pi pi-trash"
                                    disabled={uploadSections.length < 2}
                                    className="p-button-danger"
                                    onClick={() => handleDelete(section.key)}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Add More Button */}
                    <div className="flex justify-end">
                        <Button
                            label="+Addmore"
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
