'use client';
import { Get, Put, fetchFileAsFile } from "@/components/fetch";
import Footer from "@/components/footer";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";

interface DocumentOther {
    key: string,
    num: number,
    name: string,
    path?: string,
    approve?: 'approve' | 'reject',
    remark: ""
}

interface FormData {
    approve?: 'approve' | 'reject',
    remark: string,
    claim?: boolean,
    complain?: boolean,
    resummit?: Date,
    replay?: Date,
    duedate8d?: Date,
    documentOther: DocumentOther[],
    eightDReportApprover?: string,

    reqDocumentOther: string,
    approve8dAndRejectDocOther?: 'Y' | 'N',
    dueDateReqDocumentOther?: Date,
}

export default function PDFApproval() {
    const param = useParams();
    const router = useRouter()
    const toast = useRef<Toast>(null);
    const [urlFileView, setUrlFileView] = useState<string | undefined>(undefined);
    const [formData, setFormData] = useState<FormData>({
        approve: undefined,
        remark: "",
        claim: false,
        complain: false,
        resummit: undefined,
        replay: undefined,
        duedate8d: undefined,
        documentOther: [{
            key: "xxxx",
            num: 1,
            name: "",
            path: "",
            approve: undefined,
            remark: ""
        }],
        eightDReportApprover: undefined,
        reqDocumentOther: "",
        dueDateReqDocumentOther: undefined,
    });

    const [reportType, setReportType] = useState<"Quick Report" | "8D Report">("Quick Report");
    const [supplierName, setSupplierName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [problemCase, setProblemCase] = useState<string>("");
    const [importanceLevel, setImportanceLevel] = useState<string>("");
    const [file8D, setFile8D] = useState<{ file: string, name: string }>({ file: '', name: '' });
    const GetDatas = async () => {
        const res = await Get({ url: `/qpr/${param.id}` });
        if (res?.ok) {
            const dataForID = await res.json();

            let object8DReportDto = undefined;
            let remark = '';
            let objectQPRSupplier = dataForID?.objectQPRSupplier && dataForID?.objectQPRSupplier.length ? dataForID?.objectQPRSupplier[dataForID?.objectQPRSupplier.length - 1] : undefined
            if (dataForID.delayDocument == 'Quick Report') {
                remark = objectQPRSupplier && objectQPRSupplier?.objectQPR ? (objectQPRSupplier?.objectQPR.remark || '') : '';
            } else if (dataForID.delayDocument == '8D Report') {
                object8DReportDto = dataForID?.object8DReportDto && dataForID?.object8DReportDto.length ? dataForID?.object8DReportDto[dataForID?.object8DReportDto.length - 1] : undefined
                remark = object8DReportDto && object8DReportDto?.object8D ? (object8DReportDto?.object8D.remark || '') : '';
            }

            if (dataForID.delayDocument == 'Quick Report') {
                const response = await fetchFileAsFile(`/qpr/pdf/view/${param.id}`)
                if (response.ok) {
                    const data = await response.blob();
                    const urlfile = new Blob([data], { type: 'application/pdf' });
                    const fileURL = URL.createObjectURL(urlfile);
                    setUrlFileView(fileURL + '#toolbar=0')
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await response!.json()).message)}`, life: 3000 });
                }
            } else if (dataForID.delayDocument == '8D Report') {
                if (object8DReportDto && object8DReportDto.object8D && object8DReportDto.object8D.upload8DReport && object8DReportDto.object8D.upload8DReport.file) {
                    const file8D = object8DReportDto.object8D.upload8DReport;
                    setFile8D(file8D);
                    if (file8D.file) {
                        const response = await fetchFileAsFile(`/qpr/pdf/view-8d/${param.id}`)
                        if (response.ok) {
                            const data = await response.blob();
                            const urlfile = new Blob([data], { type: 'application/pdf' });
                            const fileURL = URL.createObjectURL(urlfile);
                            setUrlFileView(fileURL + '#toolbar=0')
                        } else {
                            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await response!.json()).message)}`, life: 3000 });
                        }
                    }
                }
            }


            setReportType(dataForID.delayDocument ?? 'Quick Report')
            setSupplierName(objectQPRSupplier && objectQPRSupplier?.objectQPR && objectQPRSupplier?.objectQPR.contactPerson ? objectQPRSupplier?.objectQPR.contactPerson : '')
            setEmail(objectQPRSupplier && objectQPRSupplier?.objectQPR && objectQPRSupplier?.objectQPR.email ? (objectQPRSupplier?.objectQPR.email || '') : '')
            setProblemCase(dataForID.defectiveContents && dataForID.defectiveContents.problemCase ? dataForID.defectiveContents.problemCase : '');
            setImportanceLevel(dataForID.importanceLevel ? `${dataForID.importanceLevel} ${dataForID.urgent ? '(Urgent)' : ''}` : '');

            let checkerBefore = undefined
            if (dataForID.delayDocument == 'Quick Report') {
                checkerBefore = param.pagekey == 'checker2' ? objectQPRSupplier.checker1 : (param.pagekey == 'checker3' ? objectQPRSupplier.checker2 : undefined)
            } else if (dataForID.delayDocument == '8D Report') {
                checkerBefore = param.pagekey == 'checker2' ? object8DReportDto.checker1 : (param.pagekey == 'checker3' ? object8DReportDto.checker2 : undefined)
            }
            console.log('checkerBefore', checkerBefore)
            setFormData({
                approve: checkerBefore?.approve ? checkerBefore?.approve : (dataForID.approve8dAndRejectDocOther == 'Y' ? "approve" : undefined),
                remark,
                claim: checkerBefore?.claim || false,
                complain: checkerBefore?.complain || false,
                resummit: checkerBefore?.resummit ? moment(checkerBefore.resummit).toDate() : undefined,
                replay: checkerBefore?.replay ? moment(checkerBefore.replay).toDate() : undefined,
                duedate8d: checkerBefore?.duedate8d ? moment(checkerBefore.duedate8d).toDate() : undefined,
                documentOther: param.pagekey == 'checker1' && object8DReportDto && object8DReportDto.object8D && object8DReportDto.object8D.uploadSections && object8DReportDto.object8D.uploadSections.length ?
                    object8DReportDto.object8D.uploadSections.map((arr: any, index: number) => {
                        return {
                            key: arr.key || '-',
                            num: index + 1,
                            name: `${arr.name || '-'}.${arr.extension || 'bin'}`,
                            path: arr.file || undefined,
                            approve: undefined,
                            remark: ""
                        }
                    }) : (checkerBefore?.documentOther || []),
                eightDReportApprover: checkerBefore?.eightDReportApprover || undefined,
                reqDocumentOther: checkerBefore?.reqDocumentOther || "",
                approve8dAndRejectDocOther: dataForID.approve8dAndRejectDocOther ?? 'N',
                dueDateReqDocumentOther: checkerBefore?.dueDateReqDocumentOther ? moment(checkerBefore.dueDateReqDocumentOther).toDate() : undefined,
            })

        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
    }

    useEffect(() => {
        GetDatas();
    }, [])

    const ConfirmData = async (saveType: 'completed' | 'confirm' = 'confirm') => {
        const data = {
            approve: formData.approve,
            remark: formData.remark,
            duedate8d: formData?.duedate8d ? moment(formData.duedate8d).format('YYYY-MM-DD HH:mm:ss') : undefined,
            documentOther: formData.documentOther || [],
            reqDocumentOther: formData.reqDocumentOther || "",
            dueDateReqDocumentOther: formData.dueDateReqDocumentOther ? moment(formData.dueDateReqDocumentOther).format('YYYY-MM-DD HH:mm:ss') : undefined,
        }

        console.log(data)
        confirmDialog({
            message: 'Are you sure you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'accept',
            accept: async () => {
                if (reportType == 'Quick Report' && param.pagekey == 'checker1') {
                    const data = {
                        approve: formData.approve,
                        remark: formData.remark,
                        claim: formData.claim,
                        complain: formData.complain,
                        resummit: formData.resummit ? moment(formData.resummit).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        replay: formData.replay ? moment(formData.replay).format('YYYY-MM-DD HH:mm:ss') : undefined,
                    }

                    const res = await Put({ url: `/qpr/qpr-report/checker1/${param.id}`, body: JSON.stringify(data) });
                    if (res?.ok) {
                        router.push('/pages/approve/checker1')
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                    }
                } else if (reportType == 'Quick Report' && param.pagekey == 'checker2') {
                    const data = {
                        approve: formData.approve,
                        remark: formData.remark,
                        claim: formData.claim,
                        complain: formData.complain,
                        resummit: formData.resummit ? moment(formData.resummit).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        replay: formData.replay ? moment(formData.replay).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        eightDReportApprover: formData.eightDReportApprover
                    }

                    const res = await Put({ url: `/qpr/qpr-report/checker2/${param.id}`, body: JSON.stringify(data) });
                    if (res?.ok) {
                        router.push('/pages/approve/checker2')
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                    }
                } else if (reportType == 'Quick Report' && param.pagekey == 'checker3') {
                    const data = {
                        approve: formData.approve,
                        remark: formData.remark,
                        claim: formData.claim,
                        complain: formData.complain,
                        resummit: formData.resummit ? moment(formData.resummit).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        replay: formData.replay ? moment(formData.replay).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        eightDReportApprover: formData.eightDReportApprover
                    }

                    const res = await Put({ url: `/qpr/qpr-report/checker3/${param.id}`, body: JSON.stringify(data) });
                    if (res?.ok) {
                        router.push('/pages/approve/checker3')
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                    }
                } else if (reportType == '8D Report' && param.pagekey == 'checker1') {
                    const data = {
                        approve: formData.approve,
                        remark: formData.remark,
                        duedate8d: formData?.duedate8d ? moment(formData.duedate8d).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        documentOther: formData.documentOther || [],
                        reqDocumentOther: formData.reqDocumentOther || "",
                        dueDateReqDocumentOther: formData.dueDateReqDocumentOther ? moment(formData.dueDateReqDocumentOther).format('YYYY-MM-DD HH:mm:ss') : undefined,
                    }

                    const res = await Put({ url: `/qpr/8d-report/checker1/${param.id}`, body: JSON.stringify(data) });
                    if (res?.ok) {
                        router.push('/pages/approve/checker1')
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                    }
                } else if (reportType == '8D Report' && param.pagekey == 'checker2') {
                    const data = {
                        approve: formData.approve,
                        remark: formData.remark,
                        duedate8d: formData?.duedate8d ? moment(formData.duedate8d).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        documentOther: formData.documentOther || [],
                        reqDocumentOther: formData.reqDocumentOther || "",
                        dueDateReqDocumentOther: formData.dueDateReqDocumentOther ? moment(formData.dueDateReqDocumentOther).format('YYYY-MM-DD HH:mm:ss') : undefined,
                    }

                    const res = await Put({ url: `/qpr/8d-report/checker2/${param.id}`, body: JSON.stringify(data) });
                    if (res?.ok) {
                        router.push('/pages/approve/checker2')
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                    }
                } else if (reportType == '8D Report' && param.pagekey == 'checker3' && saveType == 'confirm') {
                    const data = {
                        approve: formData.approve,
                        remark: formData.remark,
                        duedate8d: formData?.duedate8d ? moment(formData.duedate8d).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        documentOther: formData.documentOther || [],
                        reqDocumentOther: formData.reqDocumentOther || "",
                        dueDateReqDocumentOther: formData.dueDateReqDocumentOther ? moment(formData.dueDateReqDocumentOther).format('YYYY-MM-DD HH:mm:ss') : undefined,
                    }

                    const res = await Put({ url: `/qpr/8d-report/checker3/${param.id}`, body: JSON.stringify(data) });
                    if (res?.ok) {
                        router.push('/pages/approve/checker3')
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                    }
                } else if (reportType == '8D Report' && param.pagekey == 'checker3' && saveType == 'completed') {
                    const data = {
                        approve: formData.approve,
                        remark: formData.remark,
                        duedate8d: formData?.duedate8d ? moment(formData.duedate8d).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        documentOther: formData.documentOther || [],
                        reqDocumentOther: formData.reqDocumentOther || "",
                        dueDateReqDocumentOther: formData.dueDateReqDocumentOther ? moment(formData.dueDateReqDocumentOther).format('YYYY-MM-DD HH:mm:ss') : undefined,
                    }

                    const res = await Put({ url: `/qpr/8d-report/checker3-completed/${param.id}`, body: JSON.stringify(data) });
                    if (res?.ok) {
                        router.push('/pages/approve/checker3')
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                    }
                }
            },
            reject: () => { },
        });

        return;
    }

    return (
        <div className="flex justify-center bg-gray-100">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="container p-4 flex flex-col h-[calc(100vh-115px)] overflow-auto">
                {/* PDF Display Section */}
                <div className="flex-1 border border-black bg-white flex items-center justify-center min-h-[500px]">
                    {/* <span className="text-xl font-bold">PDF Display {reportType}</span> */}
                    {
                        urlFileView ? <iframe
                            src={urlFileView}
                            style={{ width: '100%', height: '100%' }}
                            title="PDF Viewer"
                            frameBorder="0"
                        /> : <span className="text-xl font-bold">PDF Display {reportType}</span>
                    }
                </div>
                {
                    `${param.id}` == "8D Report" ? <>
                        <div className="w-full flex justify-end bg-white pb-4 pr-4">
                            <Button
                                label="Download Quick Report"
                                className="bg-red-600 text-white border-red-600"
                            />
                        </div>
                    </> : <></>
                }

                {/* Information and Actions Section */}
                <div className="mt-4 border border-black bg-white p-4">
                    {/* Supplier Info and Problem Details */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Supplier Info */}
                        <div>
                            <p className="font-bold">{supplierName}</p>
                            <p>{email}</p>
                        </div>

                        {/* Problem Details */}
                        <div className="text-right">
                            <p className="font-bold">ปัญหา : {problemCase}</p>
                            <p>ความรุนแรงของปัญหา : {importanceLevel}</p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className={formData.approve8dAndRejectDocOther == 'Y' ? "border border-solid border-green-600 bg-green-100 p-2 rounded" : ""}>
                        {
                            formData.approve8dAndRejectDocOther == 'Y' ? <>
                                <span className="text-green-800">*8D Report successfully completed</span>
                            </> : <></>
                        }
                        <div className="flex justify-between items-center mt-2">
                            <div className="flex gap-4">
                                <Button
                                    label="Approve"
                                    onClick={() => {
                                        if (formData.approve8dAndRejectDocOther == 'Y') {
                                            return;
                                        }
                                        setFormData((old: FormData) => {
                                            return {
                                                ...old,
                                                approve: 'approve',
                                                resummit: undefined,
                                                duedate8d: undefined
                                            }
                                        })
                                    }}
                                    // outlined={(!!formData.approve && formData.approve == 'reject')}
                                    style={{
                                        opacity: (!!formData.approve && formData.approve == 'reject') ? .6 : 1,
                                        cursor: formData.approve8dAndRejectDocOther == 'Y' ? "no-drop" : "pointer"
                                    }}
                                    className="bg-blue-800 text-white border-blue-700"
                                // severity="info"
                                />
                                <Button
                                    label="Reject"
                                    onClick={() => {
                                        if (formData.approve8dAndRejectDocOther == 'Y') {
                                            return;
                                        }
                                        setFormData((old: FormData) => {
                                            return {
                                                ...old,
                                                approve: 'reject',
                                                claim: false,
                                                complain: false,
                                                replay: undefined,
                                                eightDReportApprover: ""
                                            }
                                        })
                                    }}
                                    // severity="danger"
                                    // outlined={(!!formData.approve && formData.approve == 'approve')}
                                    style={{
                                        opacity: (!!formData.approve && formData.approve == 'approve') ? .6 : 1,
                                        cursor: formData.approve8dAndRejectDocOther == 'Y' ? "no-drop" : "pointer"
                                    }}
                                    className="bg-red-800 text-white border-red-700"
                                />
                                {
                                    reportType == 'Quick Report' && formData.approve == 'approve' ? <>
                                        <label className="flex items-center font-bold">
                                            <input
                                                type="checkbox"
                                                checked={formData.claim}
                                                disabled={formData.approve == 'reject'}
                                                onChange={(e) =>
                                                    setFormData((old: FormData) => {
                                                        return {
                                                            ...old,
                                                            claim: e.target.checked || false,
                                                            complain: false
                                                        }
                                                    })
                                                }
                                                className="mr-2"
                                            />
                                            Claim
                                        </label>
                                        <label className="flex items-center font-bold">
                                            <input
                                                type="checkbox"
                                                checked={formData.complain}
                                                disabled={formData.approve == 'reject'}
                                                onChange={(e) => {
                                                    
                                                    setFormData((old: FormData) => {
                                                        return {
                                                            ...old,
                                                            complain: e.target.checked || false,
                                                            claim: false
                                                        }
                                                    })
                                                }

                                                }
                                                className="mr-2"
                                            />
                                            Complain
                                        </label>
                                    </> : <></>
                                }

                            </div>
                            {
                                reportType == 'Quick Report' ? <></> :
                                    <div className="flex gap-3">
                                        <Button
                                            label="Download 8D Report"
                                            className="bg-red-600 text-white border-red-600"
                                            onClick={async () => {
                                                if (file8D && file8D.file) {
                                                    const response = await fetchFileAsFile(`/${file8D.file}`)
                                                    if (response.ok) {
                                                        const data = await response.blob();
                                                        const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
                                                        const link = document.createElement("a");
                                                        link.href = url;
                                                        link.download = `${file8D.name || '8D_Report.pdf'}`; // กำหนดชื่อไฟล์ที่ดาวน์โหลด
                                                        document.body.appendChild(link);
                                                        link.click(); // คลิกเพื่อดาวน์โหลด
                                                        document.body.removeChild(link);
                                                    } else {
                                                        toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await response!.json()).message)}`, life: 3000 });
                                                    }
                                                }

                                            }}
                                        />
                                        {/* <Button
                                        label="Download other evident document"
                                        className="bg-blue-800 text-white border-blue-700"
                                    /> */}
                                    </div>
                            }

                        </div>
                    </div>

                    {/* Remark Section */}
                    <div className="mt-4">
                        <label className="block font-bold mb-2">Remark</label>
                        <textarea
                            className="border border-gray-300 rounded-md p-2 w-[50%] min-w-[700px]"
                            value={formData.remark}
                            onChange={(e) => setFormData((old) => { return { ...old, remark: e.target.value } })}
                            rows={3}
                        ></textarea>
                    </div>

                    {
                        reportType == '8D Report' ? <>
                            <div className="flex">
                                <div className="w-[50%] mt-2">
                                    <label className="block font-bold mb-0">Duedate 8D</label>
                                    <Calendar
                                        value={formData.duedate8d}
                                        dateFormat="dd/mm/yy"
                                        placeholder="dd/mm/yy"
                                        showTime
                                        disabled={!(formData.approve == 'reject')}
                                        onChange={(e) => setFormData((old) => { return { ...old, duedate8d: e.value || undefined } })}
                                        className="w-full"
                                        showButtonBar
                                        style={{ paddingLeft: 0, paddingRight: 0 }}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="white-table w-[66%]">
                                    <DataTable
                                        value={formData.documentOther}
                                        showGridlines
                                        style={{ padding: 0, paddingTop: "5px" }}
                                    >
                                        <Column field="name" header="Document name" bodyClassName="w-[200px]" body={(arr: DocumentOther) => {
                                            return <>{arr.name}</>
                                        }}></Column>
                                        <Column field="download" header="Download" bodyClassName="w-[200px]" body={(arr: DocumentOther) => {
                                            return <Button label="Download" tooltip="New tab open view file" tooltipOptions={{ position: 'top' }} onClick={async () => {
                                                if (arr.path) {
                                                    const res = await fetchFileAsFile(`/${arr.path}`);
                                                    if (res.ok) {
                                                        const blobData = await res.blob();
                                                        const newFileName = arr.name || 'null.bin';
                                                        const renamedFile = new File([blobData], newFileName, { type: blobData.type });
                                                        const fileUrl = URL.createObjectURL(renamedFile);

                                                        // ตรวจสอบประเภทไฟล์ (PDF หรือ Image) เพื่อเปิดในแท็บใหม่
                                                        const isViewableInTab = blobData.type.startsWith('image/') || blobData.type === 'application/pdf';

                                                        if (isViewableInTab) {
                                                            // เปิดไฟล์ในแท็บใหม่
                                                            window.open(fileUrl, '_blank');
                                                        } else {
                                                            // ดาวน์โหลดไฟล์ประเภทอื่น
                                                            const a = document.createElement('a');
                                                            a.href = fileUrl;
                                                            a.download = newFileName;
                                                            document.body.appendChild(a);
                                                            a.click();
                                                            document.body.removeChild(a);
                                                        }
                                                    } else {
                                                        toast.current?.show({
                                                            severity: 'error',
                                                            summary: 'Error',
                                                            detail: `${JSON.stringify((await res.json()).message)}`,
                                                            life: 3000
                                                        });
                                                    }

                                                }
                                            }} />
                                        }}></Column>
                                        <Column field="approve" header="Approve/Reject" bodyClassName="w-[200px]" body={(arr: DocumentOther) => {
                                            return <div className="flex gap-2">
                                                <Button
                                                    label="Approve"
                                                    className="bg-blue-800 text-white border-blue-700"
                                                    style={{ opacity: (!!arr.approve && arr.approve == 'reject') ? .6 : 1 }}
                                                    onClick={() => setFormData((old: FormData) => {
                                                        return {
                                                            ...old,
                                                            documentOther: old.documentOther.map((arr_remark: DocumentOther) => {
                                                                if (arr.key == arr_remark.key) {
                                                                    return {
                                                                        ...arr_remark,
                                                                        approve: 'approve'
                                                                    }
                                                                }
                                                                return arr_remark
                                                            })
                                                        } as FormData
                                                    })}
                                                />
                                                <Button
                                                    label="Reject"
                                                    severity="danger"
                                                    style={{ opacity: (!!arr.approve && arr.approve == 'approve') ? .6 : 1 }}
                                                    onClick={() => setFormData((old: FormData) => {
                                                        return {
                                                            ...old,
                                                            documentOther: old.documentOther.map((arr_remark: DocumentOther) => {
                                                                if (arr.key == arr_remark.key) {
                                                                    return {
                                                                        ...arr_remark,
                                                                        approve: 'reject'
                                                                    }
                                                                }
                                                                return arr_remark
                                                            })
                                                        } as FormData
                                                    })}
                                                />
                                            </div>
                                        }}></Column>
                                        <Column field="remark" header="Remark" body={(arr: DocumentOther) => {
                                            return <InputText
                                                value={arr.remark}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((old: FormData) => {
                                                    return {
                                                        ...old,
                                                        documentOther: old.documentOther.map((arr_remark: DocumentOther) => {
                                                            if (arr.key == arr_remark.key) {
                                                                return {
                                                                    ...arr_remark,
                                                                    remark: e.target.value
                                                                }
                                                            }
                                                            return arr_remark
                                                        })
                                                    } as FormData
                                                })}
                                                className="w-full"
                                            />
                                        }}></Column>
                                    </DataTable>
                                </div>
                                <div className="mt-1">
                                    <Button
                                        label="Download All"
                                        onClick={async () => {
                                            const doc = formData.documentOther;
                                            if (doc && doc.length) {
                                                try {
                                                    // 🔹 ใช้ Promise.all เพื่อโหลดไฟล์ทั้งหมดพร้อมกัน
                                                    const filePromises = doc.map(async (item) => {
                                                        if (item.path) {
                                                            const res = await fetchFileAsFile(`/${item.path}`);
                                                            if (res.ok) {
                                                                const data = await res.blob();
                                                                const url = URL.createObjectURL(new Blob([data])); // แปลง Blob เป็น URL
                                                                return { name: item.name || 'file', url }; // คืนค่า {name, url}
                                                            } else {
                                                                throw new Error(`Error downloading: ${item.name}`);
                                                            }
                                                        }
                                                        return null;
                                                    });

                                                    const files = await Promise.all(filePromises); // รอให้โหลดทุกไฟล์เสร็จ

                                                    // 🔹 ดาวน์โหลดทุกไฟล์
                                                    files.forEach((file) => {
                                                        if (file) {
                                                            const link = document.createElement("a");
                                                            link.href = file.url;
                                                            link.download = `${file.name}.png`; // เปลี่ยนนามสกุลตามไฟล์จริง
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                            URL.revokeObjectURL(file.url); // ล้าง URL
                                                        }
                                                    });

                                                } catch (error: any) {
                                                    toast.current?.show({ severity: 'error', summary: 'Error', detail: (error && error?.message ? error?.message : ''), life: 3000 });
                                                }
                                            }
                                        }}
                                    />

                                </div>
                            </div>

                            <div className="w-[50%] mt-2">
                                <label className="block font-bold mb-2">เอกสารที่ต้องการเพิ่มเติม</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md p-2 min-w-[700px]"
                                    value={formData.reqDocumentOther}
                                    rows={3}
                                    onChange={(e) => setFormData((old) => { return { ...old, reqDocumentOther: e.target.value } })}
                                ></textarea>
                            </div>

                            <div className="w-[50%] min-w-[700px] mt-2">
                                <label className="block font-bold mb-0">Duedate Other Document</label>
                                <Calendar
                                    value={formData.dueDateReqDocumentOther}
                                    dateFormat="dd/mm/yy"
                                    placeholder="dd/mm/yy"
                                    showTime
                                    onChange={(e) => setFormData((old) => { return { ...old, dueDateReqDocumentOther: e.value || undefined } })}
                                    className="w-full"
                                    showButtonBar
                                    style={{ paddingLeft: 0, paddingRight: 0 }}
                                />
                            </div>

                        </> : <></>
                    }

                    {/* Dates Section */}
                    {
                        reportType == 'Quick Report' ? <>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="block font-bold mb-1">Re-Summit Date</label>
                                    <Calendar
                                        value={formData.resummit}
                                        dateFormat="dd/mm/yy"
                                        placeholder="dd/mm/yy"
                                        showTime
                                        hourFormat="24"
                                        disabled={!(formData.approve == 'reject')}
                                        onChange={(e) => setFormData((old) => { return { ...old, resummit: e.value || undefined } })}
                                        className="w-full"
                                        showButtonBar
                                        style={{ paddingLeft: 0, paddingRight: 0 }}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Reply Report Date</label>
                                    <Calendar
                                        value={formData.replay}
                                        dateFormat="dd/mm/yy"
                                        placeholder="dd/mm/yy"
                                        showTime
                                        hourFormat="24"
                                        disabled={!(formData.approve == 'approve')}
                                        onChange={(e) => setFormData((old) => { return { ...old, replay: e.value || undefined } })}
                                        className="w-full"
                                        showButtonBar
                                        style={{ paddingLeft: 0, paddingRight: 0 }}
                                    />
                                </div>
                                {
                                    param.pagekey == 'checker2' || param.pagekey == 'checker3' ? <>
                                        <div>
                                            <label className="block font-bold mb-1">8D Report Approver</label>
                                            <Dropdown
                                                value={formData.eightDReportApprover}
                                                disabled={!(formData.approve == 'approve')}
                                                onChange={(e: DropdownChangeEvent) => setFormData((old) => { return { ...old, eightDReportApprover: e.value || undefined } })}
                                                options={[
                                                    { value: "Manager", label: "Manager" },
                                                    { value: "GM / DGM", label: "GM / DGM" },
                                                    { value: "Plant Manager", label: "Plant Manager" },
                                                ]}
                                                optionLabel="label"
                                                className="w-full"
                                                style={{ paddingLeft: 0, paddingRight: 0, marginTop: '10px' }}
                                            />
                                        </div>
                                    </> : <></>
                                }
                            </div>
                        </> : <></>
                    }
                </div>

            </div>
            <Footer>
                <div className="flex justify-end w-full gap-2">
                    <Button
                        label="BACK"
                        className="p-button-danger min-w-[150px]"
                        onClick={() => router.back()}
                    />
                    <Button
                        label="Confirm"
                        severity="success"
                        className="min-w-[150px]"
                        disabled={
                            (
                                (reportType == '8D Report' &&
                                    (
                                        (
                                            !!(formData.approve == undefined) ||
                                            !!(formData.documentOther.filter((x) => x.approve == undefined).length)
                                        )
                                        ||
                                        (
                                            (formData.approve == 'reject') &&
                                            (!(formData.remark) || !(formData.duedate8d))
                                        )
                                        ||
                                        ((
                                            (formData.documentOther.filter((x) => x.approve == 'reject' && !x.remark).length > 0) ||
                                            (formData.documentOther.filter((x) => x.approve == 'reject' && x.remark).length > 0 && !(formData.dueDateReqDocumentOther))
                                        ))
                                        ||
                                        (
                                            (formData.reqDocumentOther) &&
                                            !(formData.dueDateReqDocumentOther)
                                        )
                                        ||
                                        (
                                            (formData.dueDateReqDocumentOther) &&
                                            (!formData.reqDocumentOther && (formData.documentOther.filter((x) => x.approve == 'reject').length == 0))

                                        )
                                    )
                                )
                                ||
                                (
                                    reportType == 'Quick Report' && (
                                        !!(formData.approve == undefined) ||
                                        !!(formData.approve == 'approve' && param.pagekey == 'checker1' && (formData.claim == false && formData.complain == false || formData.replay == undefined)) ||
                                        !!(formData.approve == 'approve' && (param.pagekey == 'checker2' || param.pagekey == 'checker3') && (formData.claim == false && formData.complain == false || formData.replay == undefined || !formData.eightDReportApprover))
                                    )
                                ) ||
                                (
                                    reportType == 'Quick Report' && (
                                        !!(formData.approve == undefined) ||
                                        !!(formData.approve == 'reject' && (formData.resummit == undefined || !formData.remark))
                                    )
                                )
                            )
                        }
                        onClick={() => ConfirmData()}
                    />
                    {
                        reportType == '8D Report' ? <>
                            <Button
                                label="Confirm and complete"
                                className="bg-blue-800 text-white min-w-[150px]"
                                disabled={
                                    !(reportType == '8D Report' && (param.pagekey == 'checker3' || (formData.approve8dAndRejectDocOther == 'Y' && param.pagekey == 'checker2'))) ||
                                    (
                                        !!(formData.approve == 'reject') ||
                                        !!(formData.approve == undefined) ||
                                        !!(formData.documentOther.filter((x) => x.approve == 'reject').length) ||
                                        !!(formData.documentOther.filter((x) => x.approve == undefined).length) ||
                                        !!formData.reqDocumentOther ||
                                        !!formData.dueDateReqDocumentOther
                                    )
                                }
                                onClick={() => ConfirmData('completed')}
                            />
                        </> : <></>
                    }

                </div>
            </Footer>
        </div>
    );
}
