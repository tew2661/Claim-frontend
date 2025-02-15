'use client';
import { CreateQueryString, Get, Post } from "@/components/fetch";
import Footer from "@/components/footer";
import { fileToBase64 } from "@/components/picture_uploader/convertToBase64";
import PictureUploader from "@/components/picture_uploader/uploader";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { DataSupplierTable } from "../master-supplier/page";
import { Checkbox } from "primereact/checkbox";
import { RadioButton, RadioButtonChangeEvent } from "primereact/radiobutton";

interface WhereFound {
    receiving: boolean;
    receivingDetails: string;
    inprocess: boolean;
    inprocessDetails: string;
    fg: boolean;
    fgDetails: string;
    wh: boolean;
    whDetails: string;
    customerClaim: boolean;
    customerClaimDetails: string;
    warrantyClaim: boolean;
    warrantyClaimDetails: string;
    other: boolean;
    otherDetails: string;
}

export interface Defect {
    dimension: boolean;
    material: boolean;
    appearance: boolean;
    characteristics: boolean;
    other: boolean;
    otherDetails: string;
}

interface Frequency {
    firstDefective: boolean;
    reoccurrence: boolean;
    reoccurrenceDetails: number | undefined;
    chronicDisease: boolean;
}

interface DefectiveContents {
    problemCase: string;
    specification: string;
    action: string;
    ngEffective: string;
    lot: string;
}

export interface FormDataQpr {
    id?: number,
    qprIssueNo: string;
    occurrenceDate: Date | undefined;
    dateReported: Date | undefined;
    replyQuickAction: Date | undefined;
    replyReport: Date | undefined;
    supplierCode: string;
    supplier?: DataSupplierTable,
    partName: string;
    partNo: string;
    model: string;
    when: string;
    who: string;
    whereFound: WhereFound;
    defect: Defect;
    state: string;
    importanceLevel: string;
    urgent: boolean;
    frequency: Frequency;
    defectiveContents: DefectiveContents;
    issue: string;
    figures: {
        img1: { imageUrl: string | null, file: File | null };
        img2: { imageUrl: string | null, file: File | null };
        img3: { imageUrl: string | null, file: File | null };
        img4: { imageUrl: string | null, file: File | null };
    };
    delayDocument?: "8D Report" | "Quick Report",
    quickReportStatus?: "Pending" |"Approved" | "Wait for Supplier" | "Rejected",
    quickReportSupplierStatus?: "Pending" | "Approved" | "Wait for Supplier" | "Rejected" | "Save",
    quickReportDate?: Date | null,
    quickReportSupplierDate?: Date | null,
    eightDReportStatus?: "Pending" | "Approved" | "Wait for supplier" | "Completed" | "Save" | "Rejected",
    eightDReportSupplierStatus?: "Pending" | "Approved" | "Wait for Supplier" | "Rejected" | "Save",
    eightDReportDate?: Date | null,
    eightDReportSupplierDate?: Date | null,
    status?: "Pending" | "Approved" | "Wait for supplier" | "Completed" | "Rejected" | "In Process",
    objectQPRSupplier?: any[],
    quickReportStatusChecker1?: "Pending" | "Approved" | "Rejected",
    quickReportDateChecker1?: string,
    quickReportStatusChecker2?: "Pending" | "Approved" | "Rejected",
    quickReportDateChecker2?: string,
    quickReportStatusChecker3?: "Pending" | "Approved" | "Rejected",
    quickReportDateChecker3?: string,
    eightDStatusChecker1?: "Pending" | "Approved" | "Rejected",
    eightDDateChecker1?: string,
    eightDStatusChecker2?: "Pending" | "Approved" | "Rejected",
    eightDDateChecker2?: string,
    eightDStatusChecker3?: "Pending" | "Approved" | "Rejected",
    eightDDateChecker3?: string,
    approve8dAndRejectDocOther?: 'Y' | 'N'
}


export default function QPRForm() {
    const router = useRouter()
    const toast = useRef<Toast>(null);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [formData, setFormData] = useState<FormDataQpr>({
        qprIssueNo: "",
        occurrenceDate: undefined,
        dateReported: new Date(),
        replyQuickAction: undefined,
        replyReport: undefined,
        supplierCode: "",
        partName: "",
        partNo: "",
        model: "",
        when: "",
        who: "",
        whereFound: {
            receiving: false,
            receivingDetails: "",
            inprocess: false,
            inprocessDetails: "",
            fg: false,
            fgDetails: "",
            wh: false,
            whDetails: "",
            customerClaim: false,
            customerClaimDetails: "",
            warrantyClaim: false,
            warrantyClaimDetails: "",
            other: false,
            otherDetails: "",
        },
        defect: {
            dimension: false,
            material: false,
            appearance: false,
            characteristics: false,
            other: false,
            otherDetails: "",
        },
        state: "",
        importanceLevel: "",
        urgent: false,
        frequency: {
            firstDefective: false,
            reoccurrence: false,
            reoccurrenceDetails: undefined,
            chronicDisease: false,
        },
        defectiveContents: {
            problemCase: "",
            specification: "",
            action: "",
            ngEffective: "",
            lot: "",
        },
        issue: "",
        figures: {
            img1: { imageUrl: null as string | null, file: null as File | null },
            img2: { imageUrl: null as string | null, file: null as File | null },
            img3: { imageUrl: null as string | null, file: null as File | null },
            img4: { imageUrl: null as string | null, file: null as File | null },
        },
    });

    // Handle Input Changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        field: string,
        section?: keyof FormDataQpr,
        fieldMaster?: keyof WhereFound | keyof Defect | keyof Frequency
    ) => {
        const target = e.target;
        const newValue =
            target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;

        if (section === "defect" && fieldMaster === "other") {
            setFormData((prevData) => ({
                ...prevData,
                [section]: {
                    ...prevData[section],
                    ...(fieldMaster
                        ? { [fieldMaster]: (prevData[section] as Defect)[fieldMaster] || true }
                        : {}),
                    [field]: newValue,
                },
            }));
        } else if (section === "frequency") {
            setFormData((prevData) => ({
                ...prevData,
                "frequency": {
                    firstDefective: false,
                    reoccurrence: false,
                    chronicDisease: false,
                    reoccurrenceDetails: undefined,
                    ...(fieldMaster
                        ? { [fieldMaster]: true, [field]: newValue }
                        : { [field]: newValue }),
                } as Frequency,
            }));
        } else if (section === "whereFound") {
            setFormData((prevData) => ({
                ...prevData,
                whereFound: {
                    receiving: false,
                    receivingDetails: "",
                    inprocess: false,
                    inprocessDetails: "",
                    fg: false,
                    fgDetails: "",
                    wh: false,
                    whDetails: "",
                    customerClaim: false,
                    customerClaimDetails: "",
                    warrantyClaim: false,
                    warrantyClaimDetails: "",
                    other: false,
                    otherDetails: "",
                    ...(fieldMaster
                        ? {
                            [fieldMaster as keyof WhereFound]:
                                (prevData.whereFound as WhereFound)[fieldMaster as keyof WhereFound] || true,
                        }
                        : {}),
                    [field]: newValue,
                },
            }));
        } else if (section) {
            setFormData((prevData) => ({
                ...prevData,
                [section]: {
                    ...(prevData[section] as Record<string, any>), // Use type assertion
                    [field]: newValue,
                },
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [field]: newValue,
            }));
        }
    };

    const handleImageChange = (props: { key: keyof FormDataQpr['figures'], data: { imageUrl: string | null, file: File | null } }) => {
        setFormData((prevData: FormDataQpr) => ({
            ...prevData,
            figures: {
                ...prevData.figures,
                [props.key]: props.data
            }
        }));
    };


    const [supplier, setSupplier] = useState<{ label: string, value: string }[]>([]);
    const GetDatas = async () => {
        const res = await Get({ url: `/supplier/dropdown` });
        if (res.ok) {
            const res_data = await res.json();
            setSupplier((res_data || []))
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
    }

    useEffect(() => {
        GetDatas()
    }, [])

    const validateForm = (): boolean => {
        let newErrors: Record<string, boolean> = {};

        // ตรวจสอบฟิลด์หลัก
        if (!formData.partName.trim()) newErrors.partName = true;
        if (!formData.supplierCode.trim()) newErrors.supplierCode = true;
        if (!formData.partNo.trim()) newErrors.partNo = true;
        if (!formData.model.trim()) newErrors.model = true;
        if (!formData.when.trim()) newErrors.when = true;
        if (!formData.who.trim()) newErrors.who = true;

        if ((Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0) {
            newErrors.whereFound = true;
        }

        if (!formData.qprIssueNo.trim()) newErrors.qprIssueNo = true;
        if (!formData.occurrenceDate) newErrors.occurrenceDate = true;
        if (!formData.replyQuickAction) newErrors.replyQuickAction = true;
        if (!formData.dateReported) newErrors.dateReported = true;
        if (!formData.replyReport) newErrors.replyReport = true;

        // ตรวจสอบ whereFound: ถ้าเลือกแล้วให้กรอกรายละเอียด
        if (formData.whereFound.receiving && !formData.whereFound.receivingDetails.trim()) {
            newErrors.receivingDetails = true;
        }
        if (formData.whereFound.inprocess && !formData.whereFound.inprocessDetails.trim()) {
            newErrors.inprocessDetails = true;
        }
        if (formData.whereFound.fg && !formData.whereFound.fgDetails.trim()) {
            newErrors.fgDetails = true;
        }
        if (formData.whereFound.wh && !formData.whereFound.whDetails.trim()) {
            newErrors.whDetails = true;
        }
        if (formData.whereFound.customerClaim && !formData.whereFound.customerClaimDetails.trim()) {
            newErrors.customerClaimDetails = true;
        }
        if (formData.whereFound.warrantyClaim && !formData.whereFound.warrantyClaimDetails.trim()) {
            newErrors.warrantyClaimDetails = true;
        }
        if (formData.whereFound.other && !formData.whereFound.otherDetails.trim()) {
            newErrors.otherDetails = true;
        }

        if ((Object.keys(formData.defect) as Array<keyof Defect>).filter((key) => formData.defect[key] === true).length == 0) {
            newErrors.defect = true;
        }

        if (!formData.state) newErrors.state = true;
        if (!formData.importanceLevel) newErrors.importanceLevel = true;

        // ตรวจสอบ defect: ถ้าเลือก other แล้วต้องกรอก otherDetails
        if (formData.defect.other && !formData.defect.otherDetails.trim()) {
            newErrors.defectOtherDetails = true;
        }

        if ((Object.keys(formData.frequency) as Array<keyof Frequency>).filter((key) => formData.frequency[key] === true).length == 0) {
            newErrors.frequency = true;
            console.log(formData.frequency)
        }

        // ตรวจสอบ frequency: ถ้าเลือก reoccurrence แล้วต้องกรอก reoccurrenceDetails
        if (formData.frequency.reoccurrence && !formData.frequency.reoccurrenceDetails) {
            newErrors.reoccurrenceDetails = true;
        }

        if (!formData.defectiveContents.problemCase) {
            newErrors.problemCase = true;
        }

        if ((!formData.figures.img1.imageUrl && !formData.figures.img2.imageUrl && !formData.figures.img3.imageUrl && !formData.figures.img4.imageUrl)) {
            newErrors.figures = true;
        }

        // if ((Object.keys(formData.defectiveContents) as Array<keyof DefectiveContents>).filter((key) => `${formData.defectiveContents[key] || ''}`.trim()).length == 0) {
        //     newErrors.defectiveContents = true;
        //     console.log(formData.defectiveContents)
        // }

        console.log('newErrors', newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        const payload = { ...formData };
        if (payload.figures) {
            if (payload.figures.img1?.file) {
                payload.figures.img1.imageUrl = await fileToBase64(payload.figures.img1.file);
                // หากไม่ต้องการส่ง file object ก็สามารถลบ key นี้ออก
                payload.figures.img1.file = null;
            }
            if (payload.figures.img2?.file) {
                payload.figures.img2.imageUrl = await fileToBase64(payload.figures.img2.file);
                payload.figures.img2.file = null;
            }
            if (payload.figures.img3?.file) {
                payload.figures.img3.imageUrl = await fileToBase64(payload.figures.img3.file);
                payload.figures.img3.file = null;
            }
            if (payload.figures.img4?.file) {
                payload.figures.img4.imageUrl = await fileToBase64(payload.figures.img4.file);
                payload.figures.img4.file = null;
            }
        }

        const res = await Post({ url: `/qpr`, body: JSON.stringify(formData), headers: { 'Content-Type': 'application/json' } });
        if (res.ok) {
            toast.current?.show({ severity: 'success', summary: 'บันทึกสำเร็จ', detail: `สร้าง QPR สำเร็จ`, life: 3000 });
            router.push('/pages/summary-report')
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }

    };


    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="bg-white p-6 shadow-md rounded-md border">
                <h1 className="text-2xl font-bold text-center mb-3 border border-solid p-3 border-gray-300 rounded-md">
                    Quality Problem Rejection (QPR)
                </h1>
                {/* QPR Details */}
                <div className="flex grid-cols-2 gap-4">
                    <div className="w-[70%] border border-solid p-3 border-gray-300 rounded-md">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                                <label className="block text-sm font-bold">Part Name</label>
                                <input
                                    type="text"
                                    value={formData.partName}
                                    onChange={(e) => handleInputChange(e, "partName")}
                                    className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 "}
                                    style={!formData.partName && errors.partName ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">Supplier Name</label>
                                {/* <input
                                    type="text"
                                    value={formData.supplierCode}
                                    onChange={(e) => handleInputChange(e, "supplierCode")}
                                    className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                /> */}
                                <Dropdown
                                    value={formData.supplierCode || ""}
                                    onChange={(e: DropdownChangeEvent) => handleInputChange({ target: { value: e.value } } as React.ChangeEvent<HTMLInputElement>, "supplierCode")}
                                    options={supplier}
                                    optionLabel="label"
                                    // placeholder="Select Supplier" 
                                    style={!formData.supplierCode && errors.supplierCode ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                    className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 border-t-black border-l-black "}
                                />

                            </div>
                            <div>
                                <label className="block text-sm font-bold">Part No</label>
                                <input
                                    type="text"
                                    value={formData.partNo}
                                    onChange={(e) => handleInputChange(e, "partNo")}
                                    style={!formData.partNo && errors.partNo ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                    className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 "}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">Model</label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => handleInputChange(e, "model")}
                                    style={!formData.model && errors.model ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                    className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 "}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">When</label>
                                <input
                                    type="text"
                                    value={formData.when}
                                    onChange={(e) => handleInputChange(e, "when")}
                                    style={!formData.when && errors.when ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                    className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 "}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">Who</label>
                                <input
                                    type="text"
                                    value={formData.who}
                                    onChange={(e) => handleInputChange(e, "who")}
                                    style={!formData.who && errors.who ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                    className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 "}
                                />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="font-semibold">WHERE FOUND</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {/* Receiving */}
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        {/* <input
                                            type="checkbox"
                                            checked={formData.whereFound.receiving}
                                            onChange={(e) =>
                                                handleInputChange(e, "receiving", "whereFound")
                                            }
                                            className={"mr-2 "}
                                            style={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        /> */}
                                        <Checkbox
                                            onChange={(e) => {
                                                handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "receiving", "whereFound")
                                            }}
                                            className={"mr-2 "}
                                            style={{ padding: 0 }}
                                            checked={formData.whereFound.receiving}
                                            invalid={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0}
                                        ></Checkbox>
                                        Receiving
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter additional info"
                                        value={formData.whereFound.receivingDetails}
                                        onChange={(e) =>
                                            handleInputChange(e, "receivingDetails", "whereFound", "receiving")
                                        }
                                        style={!formData.whereFound.receivingDetails && errors.receivingDetails ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 "}
                                    />
                                </div>
                                {/* Inprocess */}
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        {/* <input
                                            type="checkbox"
                                            checked={formData.whereFound.inprocess}
                                            onChange={(e) =>
                                                handleInputChange(e, "inprocess", "whereFound")
                                            }
                                            className="mr-2"
                                            style={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        /> */}
                                        <Checkbox
                                            onChange={(e) => {
                                                handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "inprocess", "whereFound")
                                            }}
                                            className={"mr-2 "}
                                            style={{ padding: 0 }}
                                            checked={formData.whereFound.inprocess}
                                            invalid={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0}
                                        ></Checkbox>
                                        Inprocess
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter additional info"
                                        value={formData.whereFound.inprocessDetails}
                                        onChange={(e) =>
                                            handleInputChange(e, "inprocessDetails", "whereFound", "inprocess")
                                        }
                                        style={!formData.whereFound.inprocessDetails && errors.inprocessDetails ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 "}
                                    />
                                </div>
                                {/* F/G */}
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        {/* <input
                                            type="checkbox"
                                            checked={formData.whereFound.fg}
                                            onChange={(e) =>
                                                handleInputChange(e, "fg", "whereFound")
                                            }
                                            className="mr-2"
                                            style={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        /> */}
                                        <Checkbox
                                            onChange={(e) => {
                                                handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "fg", "whereFound")
                                            }}
                                            className={"mr-2 "}
                                            style={{ padding: 0 }}
                                            checked={formData.whereFound.fg}
                                            invalid={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0}
                                        ></Checkbox>
                                        F/G
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter additional info"
                                        value={formData.whereFound.fgDetails}
                                        onChange={(e) =>
                                            handleInputChange(e, "fgDetails", "whereFound", "fg")
                                        }
                                        style={!formData.whereFound.fgDetails && errors.fgDetails ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 "}
                                    />
                                </div>

                                {/* W/H */}
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        {/* <input
                                            type="checkbox"
                                            checked={formData.whereFound.wh}
                                            onChange={(e) =>
                                                handleInputChange(e, "wh", "whereFound")
                                            }
                                            className="mr-2"
                                            style={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        /> */}
                                        <Checkbox
                                            onChange={(e) => {
                                                handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "wh", "whereFound")
                                            }}
                                            className={"mr-2 "}
                                            style={{ padding: 0 }}
                                            checked={formData.whereFound.wh}
                                            invalid={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0}
                                        ></Checkbox>
                                        W/H
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter additional info"
                                        value={formData.whereFound.whDetails}
                                        onChange={(e) =>
                                            handleInputChange(e, "whDetails", "whereFound", "wh")
                                        }
                                        style={!formData.whereFound.whDetails && errors.whDetails ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 "}
                                    />
                                </div>

                                {/* Customer Claim */}
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        {/* <input
                                            type="checkbox"
                                            checked={formData.whereFound.customerClaim}
                                            onChange={(e) =>
                                                handleInputChange(e, "customerClaim", "whereFound")
                                            }
                                            className="mr-2"
                                            style={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        /> */}
                                        <Checkbox
                                            onChange={(e) => {
                                                handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "customerClaim", "whereFound")
                                            }}
                                            className={"mr-2 "}
                                            style={{ padding: 0 }}
                                            checked={formData.whereFound.customerClaim}
                                            invalid={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0}
                                        ></Checkbox>
                                        Customer Claim (Line Claim)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter additional info"
                                        value={formData.whereFound.customerClaimDetails}
                                        onChange={(e) =>
                                            handleInputChange(e, "customerClaimDetails", "whereFound", "customerClaim")
                                        }
                                        style={!formData.whereFound.customerClaimDetails && errors.customerClaimDetails ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 "}
                                    />
                                </div>

                                {/* Warranty Claim */}
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        {/* <input
                                            type="checkbox"
                                            checked={formData.whereFound.warrantyClaim}
                                            onChange={(e) =>
                                                handleInputChange(e, "warrantyClaim", "whereFound")
                                            }
                                            className="mr-2"
                                            style={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        /> */}
                                        <Checkbox
                                            onChange={(e) => {
                                                handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "warrantyClaim", "whereFound")
                                            }}
                                            className={"mr-2 "}
                                            style={{ padding: 0 }}
                                            checked={formData.whereFound.warrantyClaim}
                                            invalid={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0}
                                        ></Checkbox>
                                        Warranty Claim
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter additional info"
                                        value={formData.whereFound.warrantyClaimDetails}
                                        onChange={(e) =>
                                            handleInputChange(
                                                e,
                                                "warrantyClaimDetails",
                                                "whereFound",
                                                "warrantyClaim"
                                            )
                                        }
                                        style={!formData.whereFound.warrantyClaimDetails && errors.warrantyClaimDetails ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 "}
                                    />
                                </div>
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        {/* <input
                                            type="checkbox"
                                            checked={formData.whereFound.other}
                                            onChange={(e) =>
                                                handleInputChange(e, "other", "whereFound")
                                            }
                                            className="mr-2"
                                            style={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        /> */}
                                        <Checkbox
                                            onChange={(e) => {
                                                handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "other", "whereFound")
                                            }}
                                            className={"mr-2 "}
                                            style={{ padding: 0 }}
                                            checked={formData.whereFound.other}
                                            invalid={errors.whereFound && (Object.keys(formData.whereFound) as Array<keyof WhereFound>).filter((key) => formData.whereFound[key] === true).length == 0}
                                        ></Checkbox>
                                        Other
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter additional info"
                                        value={formData.whereFound.otherDetails}
                                        onChange={(e) =>
                                            handleInputChange(
                                                e,
                                                "otherDetails",
                                                "whereFound",
                                                "other"
                                            )
                                        }
                                        style={!formData.whereFound.otherDetails && errors.otherDetails ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                        className={"w-full bg-blue-100 border border-gray-300 rounded-md p-2 "}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-[30%] border border-solid p-3 border-gray-300 rounded-md">
                        <div className="grid grid-cols-1 gap-2 mb-4">
                            <div>
                                <label className="block text-sm font-bold">QPR Issue No.</label>
                                <input
                                    type="text"
                                    value={formData.qprIssueNo}
                                    onChange={(e) => handleInputChange(e, "qprIssueNo")}
                                    className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                    style={!formData.qprIssueNo && errors.qprIssueNo ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">Occurrence Date</label>
                                <Calendar
                                    value={formData.occurrenceDate}
                                    dateFormat="dd/mm/yy"
                                    placeholder="dd/mm/yy"
                                    onChange={(e) => handleInputChange({ target: { value: e.value || undefined } } as any as React.ChangeEvent<HTMLInputElement>, "occurrenceDate")}
                                    className={`w-full ${!formData.occurrenceDate && errors.occurrenceDate ? 'input-number-bg-red-100' : 'input-number-bg-blue-100'}`}
                                    showButtonBar
                                    style={{ paddingLeft: 0, paddingRight: 0 }}
                                />

                            </div>
                            <div>
                                <label className="block text-sm font-bold">Date Reported</label>
                                <Calendar
                                    value={formData.dateReported}
                                    dateFormat="dd/mm/yy"
                                    placeholder="dd/mm/yy"
                                    showTime
                                    hourFormat="24"
                                    onChange={(e) => handleInputChange({ target: { value: e.value || undefined } } as any as React.ChangeEvent<HTMLInputElement>, "dateReported")}
                                    className="w-full input-number-bg-blue-100"
                                    showButtonBar
                                    style={!formData.dateReported && errors.dateReported ? { borderColor: 'red', outlineColor: 'red', paddingLeft: 0, paddingRight: 0 } : { paddingLeft: 0, paddingRight: 0 }}
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">Reply Quick Action</label>
                                <Calendar
                                    value={formData.replyQuickAction}
                                    dateFormat="dd/mm/yy"
                                    placeholder="dd/mm/yy"
                                    showTime
                                    hourFormat="24"
                                    onChange={(e) => handleInputChange({ target: { value: e.value || undefined } } as any as React.ChangeEvent<HTMLInputElement>, "replyQuickAction")}
                                    className={`w-full ${!formData.replyQuickAction && errors.replyQuickAction ? 'input-number-bg-red-100' : 'input-number-bg-blue-100'}`}
                                    showButtonBar
                                    style={{ paddingLeft: 0, paddingRight: 0 }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">REPLY REPORT</label>
                                <Calendar
                                    value={formData.replyReport}
                                    dateFormat="dd/mm/yy"
                                    placeholder="dd/mm/yy"
                                    onChange={(e) => handleInputChange({ target: { value: e.value || undefined } } as any as React.ChangeEvent<HTMLInputElement>, "replyReport")}
                                    className={`w-full ${!formData.replyReport && errors.replyReport ? 'input-number-bg-red-100' : 'input-number-bg-blue-100'}`}
                                    showButtonBar
                                    style={{ paddingLeft: 0, paddingRight: 0 }}
                                />
                            </div>
                        </div>
                    </div>

                </div>
                {/* DEFECT */}
                <div className="flex flex-col gap-1 mt-3 border border-solid p-3 border-gray-300 rounded-md">
                    <label className="font-semibold">DEFECT</label>
                    <div className="flex flex-wrap gap-4 mt-2">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center">
                                {/* <input
                                    type="checkbox"
                                    checked={formData.defect.dimension}
                                    onChange={(e) =>
                                        handleInputChange(e, "dimension", "defect")
                                    }
                                    style={errors.defect && (Object.keys(formData.defect) as Array<keyof Defect>).filter((key) => formData.defect[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                    className="mr-2"
                                /> */}
                                <Checkbox
                                    onChange={(e) => {
                                        handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "dimension", "defect")
                                    }}
                                    className={"mr-2 "}
                                    style={{ padding: 0 }}
                                    checked={formData.defect.dimension}
                                    invalid={errors.defect && (Object.keys(formData.defect) as Array<keyof Defect>).filter((key) => formData.defect[key] === true).length == 0}
                                ></Checkbox>
                                Dimension
                            </label>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center">
                                {/* <input
                                    type="checkbox"
                                    checked={formData.defect.material}
                                    onChange={(e) =>
                                        handleInputChange(e, "material", "defect")
                                    }
                                    style={errors.defect && (Object.keys(formData.defect) as Array<keyof Defect>).filter((key) => formData.defect[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                    className="mr-2"
                                /> */}
                                <Checkbox
                                    onChange={(e) => {
                                        handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "material", "defect")
                                    }}
                                    className={"mr-2 "}
                                    style={{ padding: 0 }}
                                    checked={formData.defect.material}
                                    invalid={errors.defect && (Object.keys(formData.defect) as Array<keyof Defect>).filter((key) => formData.defect[key] === true).length == 0}
                                ></Checkbox>
                                Material
                            </label>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center">
                                {/* <input
                                    type="checkbox"
                                    checked={formData.defect.appearance}
                                    onChange={(e) =>
                                        handleInputChange(e, "appearance", "defect")
                                    }
                                    style={errors.defect && (Object.keys(formData.defect) as Array<keyof Defect>).filter((key) => formData.defect[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                    className="mr-2"
                                /> */}
                                <Checkbox
                                    onChange={(e) => {
                                        handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "appearance", "defect")
                                    }}
                                    className={"mr-2 "}
                                    style={{ padding: 0 }}
                                    checked={formData.defect.appearance}
                                    invalid={errors.defect && (Object.keys(formData.defect) as Array<keyof Defect>).filter((key) => formData.defect[key] === true).length == 0}
                                ></Checkbox>
                                Appearance
                            </label>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center">
                                {/* <input
                                    type="checkbox"
                                    checked={formData.defect.characteristics}
                                    onChange={(e) =>
                                        handleInputChange(e, "characteristics", "defect")
                                    }
                                    style={errors.defect && (Object.keys(formData.defect) as Array<keyof Defect>).filter((key) => formData.defect[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                    className="mr-2"
                                /> */}
                                <Checkbox
                                    onChange={(e) => {
                                        handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "characteristics", "defect")
                                    }}
                                    className={"mr-2 "}
                                    style={{ padding: 0 }}
                                    checked={formData.defect.characteristics}
                                    invalid={errors.defect && (Object.keys(formData.defect) as Array<keyof Defect>).filter((key) => formData.defect[key] === true).length == 0}
                                ></Checkbox>
                                Characteristics
                            </label>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center">
                                {/* <input
                                    type="checkbox"
                                    checked={!!formData.defect.other}
                                    onChange={(e) =>
                                        handleInputChange(
                                            { target: { value: e.target.checked } } as any as React.ChangeEvent<HTMLInputElement>,
                                            "other",
                                            "defect"
                                        )
                                    }
                                    style={errors.defect && (Object.keys(formData.defect) as Array<keyof Defect>).filter((key) => formData.defect[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                    className="mr-2"
                                /> */}
                                <Checkbox
                                    onChange={(e) => {
                                        handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "other", "defect")
                                    }}
                                    className={"mr-2 "}
                                    style={{ padding: 0 }}
                                    checked={formData.defect.other}
                                    invalid={errors.defect && (Object.keys(formData.defect) as Array<keyof Defect>).filter((key) => formData.defect[key] === true).length == 0}
                                ></Checkbox>
                                Other
                            </label>
                            <input
                                type="text"
                                placeholder="Specify Other defect"
                                value={formData.defect.otherDetails}
                                onChange={(e) => handleInputChange(e, "otherDetails", "defect", "other")}
                                style={!formData.defect.otherDetails && errors.defectOtherDetails ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                className={`w-full bg-blue-100 border border-gray-300 rounded-md p-2`}
                            />
                        </div>
                    </div>
                </div>

                {/* STATE */}
                <div className="mt-3 border border-solid p-3 border-gray-300 rounded-md">
                    <label className="font-semibold">STATE</label>
                    <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center">
                            <RadioButton
                                name="state"
                                value="New Model"
                                onChange={(e: RadioButtonChangeEvent) => handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "state")}
                                checked={formData.state === "New Model"}
                                invalid={errors.state}
                                style={{ padding: 0, marginRight: '10px' }}
                            />
                            New Model
                        </label>
                        <label className="flex items-center">
                            <RadioButton
                                name="state"
                                value="Mass Production"
                                onChange={(e: RadioButtonChangeEvent) => handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "state")}
                                checked={formData.state === "Mass Production"}
                                invalid={errors.state}
                                style={{ padding: 0, marginRight: '10px' }}
                            />
                            Mass Production
                        </label>
                        <label className="flex items-center">
                            <RadioButton
                                name="state"
                                value="Service"
                                onChange={(e: RadioButtonChangeEvent) => handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "state")}
                                checked={formData.state === "Service"}
                                invalid={errors.state}
                                style={{ padding: 0, marginRight: '10px' }}
                            />
                            Service
                        </label>
                    </div>
                </div>

                {/* IMPORTANCE LEVEL */}
                <div className="mt-3 border border-solid p-3 border-gray-300 rounded-md">
                    <label className="font-semibold">IMPORTANCE LEVEL</label>
                    <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center">
                            {/* <input
                                type="radio"
                                name="importanceLevel"
                                value="SP"
                                checked={formData.importanceLevel === "SP"}
                                onChange={(e) => handleInputChange(e, "importanceLevel")}
                                style={!errors.importanceLevel ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                className="mr-2"
                            /> */}
                            <RadioButton
                                name="importanceLevel"
                                value="SP"
                                onChange={(e: RadioButtonChangeEvent) => handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "importanceLevel")}
                                checked={formData.importanceLevel === "SP"}
                                invalid={errors.importanceLevel}
                                style={{ padding: 0, marginRight: '10px' }}
                            />
                            SP
                        </label>
                        <label className="flex items-center">
                            {/* <input
                                type="radio"
                                name="importanceLevel"
                                value="A"
                                checked={formData.importanceLevel === "A"}
                                onChange={(e) => handleInputChange(e, "importanceLevel")}
                                style={!errors.importanceLevel ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                className="mr-2"
                            /> */}
                            <RadioButton
                                name="importanceLevel"
                                value="A"
                                onChange={(e: RadioButtonChangeEvent) => handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "importanceLevel")}
                                checked={formData.importanceLevel === "A"}
                                invalid={errors.importanceLevel}
                                style={{ padding: 0, marginRight: '10px' }}
                            />
                            A
                        </label>
                        <label className="flex items-center">
                            {/* <input
                                type="radio"
                                name="importanceLevel"
                                value="B"
                                checked={formData.importanceLevel === "B"}
                                onChange={(e) => handleInputChange(e, "importanceLevel")}
                                style={!errors.importanceLevel ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                className="mr-2"
                            /> */}
                            <RadioButton
                                name="importanceLevel"
                                value="B"
                                onChange={(e: RadioButtonChangeEvent) => handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "importanceLevel")}
                                checked={formData.importanceLevel === "B"}
                                invalid={errors.importanceLevel}
                                style={{ padding: 0, marginRight: '10px' }}
                            />
                            B
                        </label>
                        <label className="flex items-center">
                            {/* <input
                                type="radio"
                                name="importanceLevel"
                                value="C"
                                checked={formData.importanceLevel === "C"}
                                onChange={(e) => handleInputChange(e, "importanceLevel")}
                                style={!errors.importanceLevel ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                className="mr-2"
                            /> */}
                            <RadioButton
                                name="importanceLevel"
                                value="C"
                                onChange={(e: RadioButtonChangeEvent) => handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "importanceLevel")}
                                checked={formData.importanceLevel === "C"}
                                invalid={errors.importanceLevel}
                                style={{ padding: 0, marginRight: '10px' }}
                            />
                            C
                        </label>
                        <label className="flex items-center">
                            {/* <input
                                type="checkbox"
                                name="urgent"
                                value="Urgent"
                                checked={formData.urgent}
                                onChange={(e) => handleInputChange(e, "urgent")}
                                className="mr-2"
                            /> */}
                            <Checkbox
                                onChange={(e) => {
                                    handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "urgent")
                                }}
                                className={"mr-2 "}
                                style={{ padding: 0 }}
                                checked={formData.urgent}
                            ></Checkbox>
                            Urgent
                        </label>
                    </div>
                </div>

                {/* FREQUENCY */}
                <div className="mt-3 border border-solid p-3 border-gray-300 rounded-md">
                    <label className="font-semibold">FREQUENCY</label>
                    <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center">
                            <Checkbox
                                onChange={(e) => {
                                    handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "firstDefective", "frequency")
                                }}
                                className={"mr-2 "}
                                style={{ padding: 0 }}
                                invalid={errors.frequency && (Object.keys(formData.frequency) as Array<keyof Frequency>).filter((key) => formData.frequency[key] === true).length == 0}
                                checked={formData.frequency.firstDefective}
                            ></Checkbox>
                            1'st DEFECTIVE
                        </label>
                        <label className="flex items-center">
                            {/* <input
                                type="checkbox"
                                checked={formData.frequency.reoccurrence}
                                onChange={(e) =>
                                    handleInputChange(
                                        e,
                                        "reoccurrence",
                                        "frequency"
                                    )
                                }
                                className="mr-2"
                                style={errors.frequency && (Object.keys(formData.frequency) as Array<keyof Frequency>).filter((key) => formData.frequency[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                            /> */}
                            <Checkbox
                                checked={formData.frequency.reoccurrence}
                                onChange={(e) => {
                                    handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "reoccurrence", "frequency")
                                }}
                                className={"mr-2 "}
                                style={{ padding: 0 }}
                                invalid={errors.frequency && (Object.keys(formData.frequency) as Array<keyof Frequency>).filter((key) => formData.frequency[key] === true).length == 0}
                            ></Checkbox>
                            Reoccurrence
                            <InputNumber
                                value={formData.frequency.reoccurrenceDetails}
                                onChange={(e) => handleInputChange({
                                    target: { value: e.value, type: 'text' }
                                } as any as React.ChangeEvent<HTMLInputElement>,
                                    "reoccurrenceDetails",
                                    "frequency",
                                    "reoccurrence"
                                )}
                                min={1}
                                max={99}
                                placeholder="No."
                                className={"w-full bg-blue-100 border border-gray-300 rounded-md ml-2 " + ((((formData.frequency.reoccurrenceDetails || 0) <= 0) && errors.reoccurrenceDetails) ? "input-number-bg-red-100" : "input-number-bg-blue-100")}
                                style={{ padding: 0 }}
                            />
                        </label>
                        <label className="flex items-center">
                            {/* <input
                                type="checkbox"
                                checked={formData.frequency.chronicDisease}
                                onChange={(e) =>
                                    handleInputChange(
                                        e,
                                        "chronicDisease",
                                        "frequency",
                                    )
                                }
                                className="mr-2"
                                style={errors.frequency && (Object.keys(formData.frequency) as Array<keyof Frequency>).filter((key) => formData.frequency[key] === true).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                            /> */}
                            <Checkbox
                                checked={formData.frequency.chronicDisease}
                                onChange={(e) => {
                                    handleInputChange(e as any as ChangeEvent<HTMLInputElement>, "chronicDisease", "frequency")
                                }}
                                className={"mr-2 "}
                                style={{ padding: 0 }}
                                invalid={errors.frequency && (Object.keys(formData.frequency) as Array<keyof Frequency>).filter((key) => formData.frequency[key] === true).length == 0}
                            ></Checkbox>
                            Chronic Disease
                        </label>
                    </div>
                </div>
                {/* DEFECTIVE CONTENTS */}
                <div className="mt-3 border border-solid p-3 border-gray-300 rounded-md">
                    <h2 className="text-lg font-semibold">
                        DEFECTIVE CONTENTS (Entry of contents, Illustration, Selection results, etc.)
                    </h2>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                            <label className="block text-sm font-bold">Problem Case</label>
                            <input
                                type="text"
                                placeholder="Enter problem case"
                                value={formData.defectiveContents.problemCase}
                                onChange={(e) =>
                                    handleInputChange(e, "problemCase", "defectiveContents")
                                }
                                style={errors.problemCase ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold">Specification</label>
                            <input
                                type="text"
                                placeholder="Enter specification"
                                value={formData.defectiveContents.specification}
                                onChange={(e) =>
                                    handleInputChange(e, "specification", "defectiveContents")
                                }
                                // style={errors.defectiveContents && (Object.keys(formData.defectiveContents) as Array<keyof DefectiveContents>).filter((key) => `${formData.defectiveContents[key] || ''}`.trim()).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold">Actual</label>
                            <input
                                type="text"
                                placeholder="Enter actual result"
                                value={formData.defectiveContents.action}
                                onChange={(e) =>
                                    handleInputChange(e, "action", "defectiveContents")
                                }
                                // style={errors.defectiveContents && (Object.keys(formData.defectiveContents) as Array<keyof DefectiveContents>).filter((key) => `${formData.defectiveContents[key] || ''}`.trim()).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold">NG Effective</label>
                            <input
                                type="text"
                                placeholder="Enter NG effective result"
                                value={formData.defectiveContents.ngEffective}
                                onChange={(e) =>
                                    handleInputChange(e, "ngEffective", "defectiveContents")
                                }
                                // style={errors.defectiveContents && (Object.keys(formData.defectiveContents) as Array<keyof DefectiveContents>).filter((key) => `${formData.defectiveContents[key] || ''}`.trim()).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold">Lot</label>
                            <input
                                type="text"
                                placeholder="Enter lot details"
                                value={formData.defectiveContents.lot}
                                onChange={(e) =>
                                    handleInputChange(e, "lot", "defectiveContents")
                                }
                                // style={errors.defectiveContents && (Object.keys(formData.defectiveContents) as Array<keyof DefectiveContents>).filter((key) => `${formData.defectiveContents[key] || ''}`.trim()).length == 0 ? { borderColor: 'red', outlineColor: 'red' } : {}}
                                className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>
                </div>

                {/* FIGURES */}
                <div className="mt-3 border border-solid p-3 border-gray-300 rounded-md" style={
                    (!formData.figures.img1.imageUrl && !formData.figures.img2.imageUrl && !formData.figures.img3.imageUrl && !formData.figures.img4.imageUrl) && errors.figures ? { borderColor: 'red' } : {}
                }>
                    <label className="font-semibold">FIGURE</label>
                    <div className="grid grid-cols-2 gap-4">
                        <PictureUploader
                            title={"Picture #1"}
                            onImageChange={(imageUrl: string | null, file: File | null) => { handleImageChange({ key: 'img1', data: { imageUrl, file } }) }}
                            defualt={{
                                imageUrl: formData.figures.img1.imageUrl,
                                file: formData.figures.img1.file,
                            }}
                        />
                        <PictureUploader
                            title={"Picture #2"}
                            onImageChange={(imageUrl: string | null, file: File | null) => { handleImageChange({ key: 'img2', data: { imageUrl, file } }) }}
                            defualt={{
                                imageUrl: formData.figures.img2.imageUrl,
                                file: formData.figures.img2.file,
                            }}
                        />
                        <PictureUploader
                            title={"Picture #3"}
                            onImageChange={(imageUrl: string | null, file: File | null) => { handleImageChange({ key: 'img3', data: { imageUrl, file } }) }}
                            defualt={{
                                imageUrl: formData.figures.img3.imageUrl,
                                file: formData.figures.img3.file,
                            }}
                        />
                        <PictureUploader
                            title={"Picture #4"}
                            onImageChange={(imageUrl: string | null, file: File | null) => { handleImageChange({ key: 'img4', data: { imageUrl, file } }) }}
                            defualt={{
                                imageUrl: formData.figures.img4.imageUrl,
                                file: formData.figures.img4.file,
                            }}
                        />
                    </div>
                </div>
            </div>
            <Footer>
                <div className="flex justify-end mt-2 w-full gap-2">
                    <Button
                        label="Cancel"
                        severity="secondary"
                        className="min-w-[150px]"
                        onClick={() => router.back()}
                    />
                    <Button
                        label="Submit"
                        className="min-w-[150px]"
                        onClick={(e) => {
                            if (validateForm()) {
                                console.log("Submitted Data:", formData);
                                handleSubmit();
                                // ทำการส่งข้อมูล หรือดำเนินการต่อ
                            } else {
                                toast.current?.show({
                                    severity: 'error',
                                    summary: 'Validation Error',
                                    detail: 'กรุณากรอกข้อมูลในฟิลด์ที่จำเป็นให้ครบถ้วน',
                                    life: 3000
                                });
                            }
                        }}
                    />
                </div>
            </Footer>
        </div>
    );
}
