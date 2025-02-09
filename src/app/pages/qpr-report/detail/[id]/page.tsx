'use client';
import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/footer";
import { v4 as uuidv4 } from "uuid";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Get, Put } from "@/components/fetch";
import { Toast } from "primereact/toast";
import moment from "moment";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { fileToBase64 } from "@/components/picture_uploader/convertToBase64";

export default function QPRUploadForm() {
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const param = useParams();
    const [actionDetail, setActionDetail] = useState("");
    const [supplierName, setSupplierName] = useState("");
    const [remark, setRemark] = useState("");
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState<Date | null>(null);
    const [quantity, setQuantity] = useState<number | null>(null);
    const [contactPerson, setContactPerson] = useState("");
    const [email, setEmail] = useState("");
    const [sketches, setSketches] = useState<{ key: string; file: { name: string | null, file: File | null , new?: boolean , delete?: boolean } }[]>([
        { key: uuidv4(), file: { name: null, file: null } }
    ]);

    const [contactPersonList, setContactPersonList] = useState<{ lable: string, value: string , email : string }[]>([])

    const handleAddMore = () => {
        if (sketches.filter((x) => !x.file.delete).length < 3) {
            setSketches((prev) => [
                ...prev,
                { key: uuidv4(), file: { name: null, file: null , new: true, delete: false } },
            ]);
        }

    };

    const handleDeleteSketch = (id: string) => {
        setSketches((prev) => prev.map((sketch) => {
            console.log(sketches, id , sketch.key == id)
            if (sketch.key == id) {
                return {
                    ...sketch,
                    file: {
                        ...sketch.file,
                        delete: true,
                    }
                }
            } else {
                return sketch;
            }
            
        } ));

        setTimeout(() => {
            console.log("Updated Sketches:", sketches);
        }, 100);
    };

    const GetDatas = async () => {
        const localUser = localStorage.getItem('user') ?? ''
        const jsonUser = JSON.parse(localUser || '{}');
        const res = await Get({ url: `/supplier/${jsonUser.id}` });
        if (res?.ok) {
            const res_data = await res.json();
            setSupplierName(res_data?.supplierName || '')
            setContactPersonList((res_data.contactPerson || []).map((x: string , index: number) => ({ label : x , value: x , email: res_data.email[index] || '' })))
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }

        const res2 = await Get({ url: `/qpr/${param.id}` });
        if (res2?.ok) {
            const dataForID = await res2.json();
            const objectQPRSupplier = (dataForID)?.objectQPRSupplier && (dataForID).objectQPRSupplier.length ? (dataForID).objectQPRSupplier[(dataForID).objectQPRSupplier.length - 1] : undefined
            const res_data = objectQPRSupplier && objectQPRSupplier?.objectQPR || null;
            const checkerRemark = objectQPRSupplier && objectQPRSupplier?.checker3 ?objectQPRSupplier?.checker3 : (objectQPRSupplier?.checker2 ? objectQPRSupplier?.checker2 : (objectQPRSupplier?.checker1 ? objectQPRSupplier?.checker1 : undefined))
            setRemark(checkerRemark?.remark || '');
            setActionDetail(res_data?.actionDetail || '');
            setDate(res_data?.date ? moment(res_data.date).toDate(): null)
            setTime(res_data?.time ? moment(res_data.time, 'HH:mm:ss').toDate(): null)
            setQuantity(res_data?.quantity || null)
            setSketches(res_data?.sketches || [{ key: uuidv4(), file: { name: null, file: null, new: true }}]);
            setContactPerson(res_data?.contactPerson || '')
            setEmail(res_data?.email || '')
            // setSupplierName(res_data?.supplierName ? res_data.supplierName : (supplierName || ''))
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res2!.json()).message)}`, life: 3000 });
        }
    }

    const onSave = async () => {
        const objectQPR = {
            remark,
            actionDetail,
            date: date ? moment(date).format('YYYY-MM-DD') : '',
            time: time ? moment(time).format('HH:mm:ss') : '',
            quantity,
            sketches: await Promise.all(sketches.map( async(x) => {
                if (x.file.delete) {
                    return {
                        ...x,
                        file: {
                            ...x.file,
                            file: null,
                            name: x.file.name
                        }
                    }
                } else if (x.file.new) {
                    return {
                        ...x,
                        file: {
                            ...x.file,
                            file: x.file.file ? await fileToBase64(x.file.file) : null,
                            name: x.file.name,    
                        }
                    }
                } else {
                    return x
                }
                
            })),
            contactPerson,
            supplierName,
            email
        }

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
                const res = await Put({ url: `/qpr/qpr-report/draft/${param.id}`, body: JSON.stringify([{objectQPR}]) , headers: { 'Content-Type': 'application/json' }  });
                if (res.ok) {
                    toast.current?.show({ severity: 'success', summary: 'บันทึกสำเร็จ', detail: `บันทึกข้อมูลสำเร็จ`, life: 3000 });
                    router.push(`/pages/qpr-report`);
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                }
            },
            reject: () => {},
        });
        return;
    }

    const onConfirm = async () => {
        const objectQPR = {
            remark,
            actionDetail,
            date: date ? moment(date).format('YYYY-MM-DD') : '',
            time: time ? moment(time).format('HH:mm:ss') : '',
            quantity,
            sketches: await Promise.all(sketches.map( async(x) => {
                if (x.file.delete) {
                    return {
                        ...x,
                        file: {
                            ...x.file,
                            file: null,
                            name: x.file.name
                        }
                    }
                } else if (x.file.new) {
                    return {
                        ...x,
                        file: {
                            ...x.file,
                            file: x.file.file ? await fileToBase64(x.file.file) : null,
                            name: x.file.name
                        }
                    }
                } else {
                    return x
                }
                
            })),
            contactPerson,
            supplierName,
            email
        }

        if (param.id && parseInt(`${param.id}`) < 0) {
            console.log(param.id)
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `ไม่พบ id ที่ถูกต้องของ page`, life: 3000 });
            return;
        }

        console.log('objectQPR' , objectQPR)
        confirmDialog({
            message: 'Are you sure you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'accept',
            accept: async () => {
                const res = await Put({ url: `/qpr/qpr-report/completed/${param.id}`, body: JSON.stringify([{objectQPR}]) , headers: { 'Content-Type': 'application/json' }  });
                if (res.ok) {
                    toast.current?.show({ severity: 'success', summary: 'บันทึกสำเร็จ', detail: `บันทึกข้อมูลสำเร็จ`, life: 3000 });
                    router.push(`/pages/qpr-report`);
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                }
            },
            reject: () => {},
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

                {/* First Lot Delivery Section */}
                <div className="border border-black bg-white p-4 h-full overflow-auto">
                    <div className="border border-black bg-white pt-2">
                        <label className="block font-bold mb-2">Remark</label>
                        <textarea
                            // value={actionDetail}
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
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
                                dateFormat="dd/mm/yy"
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
                                dateFormat="dd/mm/yy"
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
                            {sketches.filter((x) => !x.file.delete).map((sketch, index) => (
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
                                                        return { ...arr, file: { ...arr.file, name: file.name, file: file } }
                                                    } else {
                                                        return arr
                                                    }
                                                })));
                                            } else {
                                                setSketches((old) => (old.map((arr) => {
                                                    if (arr.key == sketch.key) {
                                                        return { ...arr, file: { ...arr.file, name: null, file: null } }
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
                                        disabled={sketches.filter((x) => !x.file.delete).length == 1}
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
                                    onChange={(e) => {
                                        const searchEmail = contactPersonList.filter((x) => x.value == e.value);
                                        setEmail(searchEmail.length ? searchEmail[0].email : '')
                                        setContactPerson(e.value)
                                    }}
                                    optionLabel="label"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-2">
                        <Button
                            label={"+Addmore[" + sketches.filter((x) => !x.file.delete).length + "]"}
                            disabled={sketches.filter((x) => !x.file.delete).length == 3}
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
                            disabled={sketches.filter((x) => !x.file.delete).filter((x) => !x.file.file).length > 0}
                        />
                        <Button
                            label="Confirm and send to JATH"
                            className="p-button-success min-w-[150px]"
                            disabled={sketches.filter((x) => !x.file.delete).filter((x) => x.file?.name || false).length == 0 ||
                                sketches.filter((x) => !x.file.delete).filter((x) => !x.file.file).length > 0 || 
                                !(date) || 
                                !(time) || 
                                !(quantity) || 
                                !(contactPerson)
                            }
                            onClick={() => onConfirm()}
                        />
                    </div>
                </div>
            </Footer>
        </div>
    );
}

