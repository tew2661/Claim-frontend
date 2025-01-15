'use client';
import Footer from "@/components/footer";
import { useParams } from "next/navigation";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import React, { useEffect, useState } from "react";

interface FormData {
    evidence?: Date,
    date?: Date,
    approve?: 'approve' | 'reject',
    remark: string,
    claim?: boolean,
    complain?: boolean,
    resummit?: Date,
    replay?: Date
}

export default function PDFApproval() {
    const param = useParams();
    const [formData, setFormData] = useState<FormData>({
        evidence: undefined,
        date: undefined,
        approve: undefined,
        remark: "",
        claim: false,
        complain: false,
        resummit: undefined,
        replay: undefined,
    });

    const [reportType, setReportType] = useState<"Quick Report" | "8D Report">("Quick Report");

    useEffect(() => {
        setReportType(`${param.id}` == `1` ? "Quick Report" : "8D Report");
    }, [])
    return (
        <div className="flex justify-center bg-gray-100">
            <div className="container p-4 flex flex-col h-[calc(100vh-115px)]">
                {/* PDF Display Section */}
                <div className="flex-1 border border-black bg-white flex items-center justify-center">
                    <span className="text-xl font-bold">PDF Display {reportType}</span>
                </div>

                {/* Information and Actions Section */}
                <div className="mt-4 border border-black bg-white p-4">
                    {/* Supplier Info and Problem Details */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Supplier Info */}
                        <div>
                            <p className="font-bold">Supplier A</p>
                            <p>Email: supplier@a.co.th</p>
                        </div>

                        {/* Problem Details */}
                        <div className="text-right">
                            <p className="font-bold">ปัญหา สีหลุดลอกไม่สม่ำเสมอ</p>
                            <p>ความรุนแรงของปัญหา สีหลุดลอกไม่สม่ำเสมอ</p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-4">
                            <Button
                                label="Approve"
                                onClick={()=> {
                                    setFormData((old: FormData) => {
                                        return {
                                            ...old,
                                            approve: 'approve'
                                        }
                                    })
                                }}
                                style={{ opacity: (!!formData.approve && formData.approve == 'reject') ? .6 : 1 }}
                                className="bg-blue-800 text-white border-blue-700"
                            />
                            <Button
                                label="Reject"
                                onClick={()=> {
                                    setFormData((old: FormData) => {
                                        return {
                                            ...old,
                                            approve: 'reject'
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
                                <Button
                                    label="Download other evident document"
                                    className="bg-blue-800 text-white border-blue-700"
                                />
                            </div>
                        }

                    </div>

                    {/* Remark Section */}
                    <div className="mt-4">
                        <label className="block font-bold mb-2">Remark</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2"
                            rows={3}
                        ></textarea>
                    </div>

                    {/* Dates Section */}
                    {
                        reportType == 'Quick Report' ? <>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="block font-bold mb-1">Resummit date</label>

                                    <Calendar
                                        value={formData.resummit}
                                        dateFormat="dd/mm/yy"
                                        placeholder="dd/mm/yy"
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
                                        placeholder="dd/mm/yy"
                                        disabled={!(formData.approve == 'approve')}
                                        onChange={(e) => setFormData((old) => { return { ...old, replay: e.value || undefined } })}
                                        className="w-full"
                                        showButtonBar
                                        style={{ paddingLeft: 0, paddingRight: 0 }}
                                    />
                                </div>
                            </div>
                        </> : <>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="block font-bold mb-1">All Evidence submit date</label>
                                    <Calendar
                                        value={formData.evidence}
                                        dateFormat="dd/mm/yy"
                                        placeholder="dd/mm/yy"
                                        disabled={!(formData.approve == 'approve')}
                                        onChange={(e) => setFormData((old) => { return { ...old, evidence: e.value || undefined } })}
                                        className="w-full"
                                        showButtonBar
                                        style={{ paddingLeft: 0, paddingRight: 0 }}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Due date</label>

                                    <Calendar
                                        value={formData.date}
                                        dateFormat="dd/mm/yy"
                                        placeholder="dd/mm/yy"
                                        disabled={!(formData.approve == 'reject')}
                                        onChange={(e) => setFormData((old) => { return { ...old, date: e.value || undefined } })}
                                        className="w-full"
                                        showButtonBar
                                        style={{ paddingLeft: 0, paddingRight: 0 }}
                                    />
                                </div>
                            </div>
                        </>
                    }

                </div>

            </div>
            <Footer>
                <div className="flex justify-end w-full gap-2">
                    <Button
                        label="Confirm"
                        className="bg-green-600 text-white border-green-700 min-w-[150px]"
                    />
                    {
                        reportType == '8D Report' ? <Button
                            label="Confirm and complete"
                            className="bg-blue-800 text-white min-w-[150px]"
                        /> : <></>
                    }

                </div>
            </Footer>
        </div>
    );
}
