'use client';
import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/footer";
import { v4 as uuidv4 } from "uuid";
import { Get, Put, fetchFileAsFile } from "@/components/fetch";
import moment from "moment";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { fileToBase64 } from "@/components/picture_uploader/convertToBase64";

export default function QPRUploadForm() {
    const param = useParams();
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const [uploadSections, setUploadSections] = useState<{ key: string; name: string, extension: string, file: File | null, new?: boolean, edit?: boolean, delete?: boolean, remark?: string }[]>([
        { key: uuidv4(), name: "", extension: "", file: null, new: true, edit: false, delete: false },
    ]);

    const [upload8DReport, setUpload8DReport] = useState<File | null>(null)

    const handleAddMore = () => {
        setUploadSections((prev) => [
            ...prev,
            { key: uuidv4(), name: "", extension: "", file: null, new: true, edit: false, delete: false },
        ]);
    };

    const handleDelete = (id: string) => {
        setUploadSections((prev) => prev.map((sketch) => {
            if (sketch.key == id) {
                return {
                    ...sketch,
                    delete: true,
                }
            } else {
                return sketch;
            }

        }));
    };

    const handleInputChange = (id: string, value: string) => {
        setUploadSections((prev) =>
            prev.map((section) =>
                section.key === id ? { ...section, name: value } : section
            )
        );
    };

    const [uploadSectionsOld, setUploadSectionsOld] = useState<any[]>([]);
    const [dueDate, setdueDate] = useState<string>('');
    const [reqDocumentOther, setReqDocumentOther] = useState<string>('');
    const [remarkForReject, setRemarkForReject] = useState<string>('');
    const GetDatas = async () => {
        const res2 = await Get({ url: `/qpr/${param.id}` });
        if (res2?.ok) {
            const dataForID = await res2.json();
            const object8DReportDto = dataForID.object8DReportDto || [];
            const index0object8DReportDto = object8DReportDto.length ? object8DReportDto[object8DReportDto.length - 1] : undefined;
            const urlUpload8DReportFile = index0object8DReportDto?.object8D && index0object8DReportDto.object8D.upload8DReport && index0object8DReportDto.object8D.upload8DReport.file ? index0object8DReportDto.object8D.upload8DReport.file : undefined
            const urlUpload8DReportName = index0object8DReportDto?.object8D && index0object8DReportDto.object8D.upload8DReport && index0object8DReportDto.object8D.upload8DReport.file ? index0object8DReportDto.object8D.upload8DReport.name : undefined
            if (urlUpload8DReportFile) {
                const pdf8DReport = await fetchFileAsFile(`/${urlUpload8DReportFile}`)
                if (pdf8DReport.ok) {
                    const data = await pdf8DReport.blob();
                    const file = new File([data], (urlUpload8DReportName || "8d-report.pdf"), { type: data.type });
                    setUpload8DReport(file);
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await pdf8DReport!.json()).message)}`, life: 3000 });
                }
            }

            const uploadSections = index0object8DReportDto?.object8D && index0object8DReportDto?.object8D?.uploadSections || [];
            const checker = index0object8DReportDto?.checker3 ? index0object8DReportDto?.checker3 : (index0object8DReportDto?.checker2 ? index0object8DReportDto?.checker2 : (index0object8DReportDto?.checker1 ? index0object8DReportDto?.checker1 : undefined))
            setdueDate(checker?.dueDateReqDocumentOther ?? "")
            setReqDocumentOther(checker?.reqDocumentOther ?? "")
            setUploadSectionsOld(uploadSections);
            setRemarkForReject(checker?.approve == 'reject' && checker?.remark ? checker?.remark : "")

            const documentOther = checker?.documentOther || []

            setUploadSections(
                uploadSections.length ? await Promise.all(
                    uploadSections.map(async (arr: any, index_map: number) => {
                        const dataUriRegex = /^data:(.+);base64,(.*)$/;
                        const allowedMimeTypes = ['image/', 'application/pdf'];

                        let base64Data = arr.file;
                        let mimeType = '';

                        // ตรวจสอบว่าเป็น Base64 หรือไม่
                        const matches = arr.file.match(dataUriRegex);
                        if (matches) {
                            mimeType = matches[1];
                            base64Data = matches[2];
                        }

                        // ตรวจสอบว่า MimeType อยู่ในประเภทที่อนุญาตหรือไม่
                        if (allowedMimeTypes.some((type) => mimeType.startsWith(type))) {
                            // ถ้าเป็น Base64 ที่ถูกต้องและอนุญาต
                            const fileData = Buffer.from(base64Data, 'base64');
                            const file = new File([fileData], `${arr.name || 'file'}.${arr.extension || 'jpg'}`, { type: mimeType });
                            return {
                                ...arr,
                                edit: true,
                                new: false,
                                file,
                                remark: documentOther[index_map] && documentOther[index_map].remark ? documentOther[index_map].remark : ''
                            };
                        } else {
                            // ถ้าไม่ใช่ Base64 ที่อนุญาต → ดึงไฟล์จาก URL
                            const response = await fetchFileAsFile(`/${arr.file}`);
                            if (response.ok) {
                                const data = await response.blob();
                                return {
                                    ...arr,
                                    edit: false,
                                    new: false,
                                    file: new File([data], `${arr.name || 'err'}.${arr.extension || 'jpg'}`, { type: data.type }),
                                    remark: documentOther[index_map] && documentOther[index_map].remark ? documentOther[index_map].remark : ''
                                };
                            } else {
                                console.log('Failed to fetch file from URL:', arr.file);
                                return {
                                    ...arr,
                                    edit: false,
                                    new: false,
                                    file: null, // กำหนด null หากไม่สามารถดึงไฟล์ได้
                                    remark: documentOther[index_map] && documentOther[index_map].remark ? documentOther[index_map].remark : ''
                                };
                            }
                        }
                    })
                ) : [{ key: uuidv4(), name: "", extension: "", file: null, new: true, edit: false, delete: false }]
            );

        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res2!.json()).message)}`, life: 3000 });
        }
    }

    const onSave = async (saveType: 'completed' | 'draft' = 'draft') => {
        const object8D = {
            upload8DReport: upload8DReport ? {
                name: upload8DReport?.name || '',
                file: upload8DReport ? await fileToBase64(upload8DReport) : null,
            } : null,
            uploadSections: await Promise.all(
                (uploadSections || [])
                    .filter((arr) => arr && Object.keys(arr).length > 0) // กรองข้อมูลเปล่า
                    .map(async (arr) => {
                        const isEdited = uploadSectionsOld.some(
                            (old) => (old.key === arr.key && (arr.edit && !arr.delete))
                        );

                        if (isEdited || (arr.new && !arr.delete)) {
                            return {
                                ...arr,
                                file: arr.file ? await fileToBase64(arr.file) : null,
                            };
                        } else {
                            const oldData = uploadSectionsOld.find((x) => x.key === arr.key) || {};
                            return {
                                ...arr,
                                file: oldData.file || null,
                            };
                        }
                    })
            ),
        }

        console.log('object8D', object8D)

        if (param.id && parseInt(`${param.id}`) < 0) {
            console.log(param.id)
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `ไม่พบ id ที่ถูกต้องของ page`, life: 3000 });
            return;
        }

        confirmDialog({
            message: 'Are you sure you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'accept',
            accept: async () => {
                const res = await Put({ url: `/qpr/8d-report/${saveType}/${param.id}`, body: JSON.stringify([{ object8D }]), headers: { 'Content-Type': 'application/json' } });
                if (res.ok) {
                    toast.current?.show({ severity: 'success', summary: 'บันทึกสำเร็จ', detail: `บันทึกข้อมูลสำเร็จ`, life: 3000 });
                    router.push(`/pages/8d-report`);
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                }
            },
            reject: () => { },
        });
        return;
    }

    useEffect(() => {
        GetDatas()
    }, [])


    return (
        <div className="flex justify-center bg-gray-100">
            <Toast ref={toast} />
            <ConfirmDialog />
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
                            {/* <FileUpload
                                name="8d-report"
                                mode="basic"
                                accept="application/pdf"
                                maxFileSize={1000000}
                                chooseLabel="Upload 8D Report (PDF)"
                                className="p-button"
                            /> */}

                            <Button
                                label={upload8DReport && upload8DReport.name ? upload8DReport.name : "Upload 8D Report (PDF)"}
                                icon="pi pi-upload"
                                className="p-button-primary"
                                onClick={() => document.getElementById('upload-8d-report-id')?.click()}
                            />
                            <input
                                id={'upload-8d-report-id'}
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        console.log('file', file)
                                        setUpload8DReport(file);
                                    }
                                }}
                            />
                        </div>

                        <div className="mt-4">
                            <Button
                                label="Download 8D Report"
                                severity="danger"
                            />
                        </div>
                    </div>

                    {
                        dueDate || reqDocumentOther ? <div className="flex flex-col my-2 bg-red-200 p-2 gap-2">
                            <div>{remarkForReject ? <b>Reject: </b> : <></>} {remarkForReject}</div>
                            <div>{dueDate ? <b className="mr-4">Due Date :</b> : ''} {dueDate}</div>
                            <div>{reqDocumentOther ? <b className="mr-4">เอกสารที่ต้องการเพิ่มเติม :</b> : ''} {reqDocumentOther}</div>
                        </div> : <></>
                    }

                    {/* Dynamic Document Upload Sections */}
                    {uploadSections.filter((x) => !x.delete).map((section, index) => (
                        <div
                            key={section.key}
                            className={"flex items-center gap-4 mb-4 p-2 " + (section.remark ? "border border-solid rounded border-red-400" : "border border-solid rounded border-gray-300")}
                        >
                            <div className={"flex-1 m-0 "}>
                                <div className="flex justify-between">
                                    <div className="flex gap-2">
                                        <label className="block font-bold mb-2">Document Name</label>
                                    </div>

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
                                {
                                    section.remark ?
                                        <label className="block mt-2 bg-red-200 px-2 py-1">{section.remark}</label> :
                                        <label className="block mt-2 px-2 py-1">&nbsp;</label>
                                }

                            </div>
                            <div className="flex flex-col">
                                {/* <label className="block font-bold mb-2">&nbsp;</label> */}
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
                                            console.log('file', file)
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
                                                    return { ...arr, name: filename, extension: extension, file: file, edit: true }
                                                } else {
                                                    return arr
                                                }
                                            })));
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex flex-col">
                                {/* <label className="block font-bold mb-2">&nbsp;</label> */}
                                <Button
                                    label="Delete"
                                    icon="pi pi-trash"
                                    disabled={uploadSections.filter((x) => !x.delete).length < 2}
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
                        <Button
                            label="SAVE"
                            className="p-button-primary min-w-[150px]"
                            onClick={() => onSave()}
                            disabled={!upload8DReport}
                        />
                        <Button
                            disabled={!upload8DReport}
                            label="Confirm and send to JATH"
                            className="p-button-success min-w-[150px]"
                            onClick={() => onSave('completed')}
                        />
                    </div>
                </div>
            </Footer>
        </div>
    );
}
