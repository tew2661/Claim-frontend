'use client';
import { Get, Put } from "@/components/fetch";
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
    dueDateReqDocumentOther?: Date,
}

export default function PDFApproval() {
    const param = useParams();
    const router = useRouter()
    const toast = useRef<Toast>(null);
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

    const GetDatas = async () => {
        const res = await Get({ url: `/qpr/${param.id}` });
        if (res?.ok) {
            const dataForID = await res.json();
            const objectQPRSupplier = dataForID?.objectQPRSupplier && dataForID?.objectQPRSupplier.length ? dataForID?.objectQPRSupplier[dataForID?.objectQPRSupplier.length - 1] : undefined
            setReportType(dataForID.delayDocument ?? 'Quick Report')
            setSupplierName(objectQPRSupplier && objectQPRSupplier?.objectQPR && objectQPRSupplier?.objectQPR.contactPerson ? objectQPRSupplier?.objectQPR.contactPerson : '')
            setEmail(objectQPRSupplier && objectQPRSupplier?.objectQPR && objectQPRSupplier?.objectQPR.email ? (objectQPRSupplier?.objectQPR.email || '') : '')
            setProblemCase(dataForID.defectiveContents && dataForID.defectiveContents.problemCase ? dataForID.defectiveContents.problemCase : '');
            setImportanceLevel(dataForID.importanceLevel ?? '');

            const checkerBefore = param.pagekey == 'checker2' ? objectQPRSupplier.checker1 : (param.pagekey == 'checker3' ? objectQPRSupplier.checker2 :  undefined)
            console.log('checkerBefore' , checkerBefore)
            setFormData({
                approve: checkerBefore?.approve || undefined,
                remark: objectQPRSupplier && objectQPRSupplier?.objectQPR ? (objectQPRSupplier?.objectQPR.remark || '') : '',
                claim: checkerBefore?.claim|| false,
                complain: checkerBefore?.complain|| false,
                resummit: checkerBefore?.resummit ? moment(checkerBefore.resummit).toDate() : undefined,
                replay: checkerBefore?.replay ? moment(checkerBefore.replay).toDate() : undefined,
                duedate8d: undefined,
                documentOther: [{
                    key: "xxxx",
                    num: 1,
                    path: "",
                    approve: undefined,
                    remark: ""
                }],
                eightDReportApprover: checkerBefore?.eightDReportApprover || undefined,
                reqDocumentOther: "",
                dueDateReqDocumentOther: undefined,
            })

        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
        }
    }

    useEffect(() => {
        GetDatas();
    }, [])

    const ConfirmData = async () => {

        console.log({
            approve: formData.approve,
            remark: formData.remark,
            claim: formData.claim,
            complain: formData.complain,
            resummit: formData.resummit ? moment(formData.resummit).format('YYYY-MM-DD HH:mm:ss') : undefined,
            replay: formData.replay ? moment(formData.replay).format('YYYY-MM-DD HH:mm:ss') : undefined,
            eightDReportApprover: formData.eightDReportApprover
        })
        
        confirmDialog({
            message: 'Are you sure you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'accept',
            accept: async () => {
                if (param.pagekey == 'checker1') {
                    const data = {
                        approve: formData.approve,
                        remark: formData.remark,
                        claim: formData.claim,
                        complain: formData.complain,
                        resummit: formData.resummit ? moment(formData.resummit).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        replay: formData.replay ? moment(formData.replay).format('YYYY-MM-DD HH:mm:ss') : undefined,
                    }
            
                    const res = await Put({ url: `/qpr/qpr-report/checker1/${param.id}` , body: JSON.stringify(data) });
                    if (res?.ok) {
                        router.push('/pages/approve/checker1')
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                    }
                } else if (param.pagekey == 'checker2') {
                    const data = {
                        approve: formData.approve,
                        remark: formData.remark,
                        claim: formData.claim,
                        complain: formData.complain,
                        resummit: formData.resummit ? moment(formData.resummit).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        replay: formData.replay ? moment(formData.replay).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        eightDReportApprover: formData.eightDReportApprover
                    }
            
                    const res = await Put({ url: `/qpr/qpr-report/checker2/${param.id}` , body: JSON.stringify(data) });
                    if (res?.ok) {
                        router.push('/pages/approve/checker2')
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                    }
                } else if (param.pagekey == 'checker3') {
                    const data = {
                        approve: formData.approve,
                        remark: formData.remark,
                        claim: formData.claim,
                        complain: formData.complain,
                        resummit: formData.resummit ? moment(formData.resummit).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        replay: formData.replay ? moment(formData.replay).format('YYYY-MM-DD HH:mm:ss') : undefined,
                        eightDReportApprover: formData.eightDReportApprover
                    }
            
                    const res = await Put({ url: `/qpr/qpr-report/checker3/${param.id}` , body: JSON.stringify(data) });
                    if (res?.ok) {
                        router.push('/pages/approve/checker3')
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: `${JSON.stringify((await res!.json()).message)}`, life: 3000 });
                    }
                } else {
        
                }
            },
            reject: () => {},
        });

        return ;
    }

    return (
        <div className="flex justify-center bg-gray-100">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="container p-4 flex flex-col h-[calc(100vh-115px)] overflow-auto">
                {/* PDF Display Section */}
                <div className="flex-1 border border-black bg-white flex items-center justify-center min-h-[500px]">
                    <span className="text-xl font-bold">PDF Display {reportType}</span>
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
                            <p className="font-bold">ปัญหา {problemCase}</p>
                            <p>ความรุนแรงของปัญหา {importanceLevel}</p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between items-center mt-2">
                        <div className="flex gap-4">
                            <Button
                                label="Approve"
                                onClick={() => {
                                    setFormData((old: FormData) => {
                                        return {
                                            ...old,
                                            approve: 'approve',
                                            resummit: undefined
                                        }
                                    })
                                }}
                                style={{ opacity: (!!formData.approve && formData.approve == 'reject') ? .6 : 1 }}
                                className="bg-blue-800 text-white border-blue-700"
                            />
                            <Button
                                label="Reject"
                                onClick={() => {
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
                                style={{ opacity: (!!formData.approve && formData.approve == 'approve') ? .6 : 1 }}
                                className="bg-red-800 text-white border-red-700"
                            />
                            {
                                reportType == 'Quick Report' ? <>
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
                                            onChange={(e) =>
                                                setFormData((old: FormData) => {
                                                    return {
                                                        ...old,
                                                        complain: e.target.checked || false,
                                                        claim: false
                                                    }
                                                })
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
                                    />
                                    {/* <Button
                                        label="Download other evident document"
                                        className="bg-blue-800 text-white border-blue-700"
                                    /> */}
                                </div>
                        }

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
                                        placeholder="dd/mm/yy hh:mm"
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
                                            return <>Doc{arr.num}</>
                                        }}></Column>
                                        <Column field="download" header="Download" bodyClassName="w-[200px]" body={(arr: DocumentOther) => {
                                            return <Button label="Download" />
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
                                    placeholder="dd/mm/yy hh:mm"
                                    showTime
                                    onChange={(e) => setFormData((old) => { return { ...old, duedadueDateReqDocumentOtherte8d: e.value || undefined } })}
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
                                    <label className="block font-bold mb-1">Resummit date</label>
                                    <Calendar
                                        value={formData.resummit}
                                        dateFormat="dd/mm/yy"
                                        placeholder="dd/mm/yy hh:mm:ss"
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
                                    <label className="block font-bold mb-1">Reply Report date</label>
                                    <Calendar
                                        value={formData.replay}
                                        dateFormat="dd/mm/yy"
                                        placeholder="dd/mm/yy hh:mm:ss"
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
                                                style={{ paddingLeft: 0, paddingRight: 0 , marginTop: '10px' }}
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
                        label="Confirm"
                        severity="success"
                        disabled={
                            (
                                (reportType == '8D Report' &&
                                    (!!(formData.approve == undefined) || 
                                    !!(formData.documentOther.filter((x) => x.approve == undefined).length))
                                ) || 
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
                        reportType == '8D Report' ? <Button
                            label="Confirm and complete"
                            className="bg-blue-800 text-white min-w-[150px]"
                            disabled={
                                !(reportType == '8D Report' && param.id == '2' && param.pagekey == 'checker3') || 
                                (
                                    !!(formData.approve == 'reject') || 
                                    !!(formData.approve == undefined) || 
                                    !!(formData.documentOther.filter((x) => x.approve == 'reject').length) ||
                                    !!(formData.documentOther.filter((x) => x.approve == undefined).length)
                                )
                            }
                        /> : <></>
                    }

                </div>
            </Footer>
        </div>
    );
}
