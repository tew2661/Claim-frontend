'use client';
import Footer from "@/components/footer";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { useState } from "react";

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
}

interface Defect {
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

interface FormData {
    qprIssueNo: string;
    occurrenceDate: Date | undefined;
    dateReported: string;
    replyQuickAction: string;
    replyReport: Date | undefined;
    supplierName: string;
    partName: string;
    partNo: string;
    model: string;
    when: string;
    who: string;
    whereFound: WhereFound;
    defect: Defect;
    state: string;
    importanceLevel: string;
    frequency: Frequency;
    defectiveContents: DefectiveContents;
    issue: string;
    figures: any[]; // Specify a more specific type if you know the structure of figures
}


export default function QPRForm() {
    const [formData, setFormData] = useState<FormData>({
        qprIssueNo: "",
        occurrenceDate: undefined,
        dateReported: "",
        replyQuickAction: "",
        replyReport: undefined,
        supplierName: "",
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
        figures: [],
    });

    // Handle Input Changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        field: string,
        section?: keyof FormData,
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
                [section]: {
                    firstDefective: false,
                    reoccurrence: false,
                    chronicDisease: false,
                    ...(fieldMaster
                        ? { [fieldMaster]: newValue }
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

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 shadow-md rounded-md border">
                <h1 className="text-2xl font-bold text-center mb-3 border border-solid p-3 border-gray-300 rounded-md">
                    Quality Problem Rejection (QPR)
                </h1>
                {/* QPR Details */}
                <div className="flex grid-cols-2 gap-4">
                    <div className="w-[70%] border border-solid p-3 border-gray-300 rounded-md">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                                <label className="block text-sm font-bold">Parts Name</label>
                                <input
                                    type="text"
                                    value={formData.partName}
                                    onChange={(e) => handleInputChange(e, "partName")}
                                    className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">Supplier Name</label>
                                {/* <input
                                    type="text"
                                    value={formData.supplierName}
                                    onChange={(e) => handleInputChange(e, "supplierName")}
                                    className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                /> */}
                                <Dropdown 
                                    value={formData.supplierName || ""} 
                                    onChange={(e: DropdownChangeEvent) => handleInputChange({ target: { value: e.value }} as React.ChangeEvent<HTMLInputElement>, "supplierName")} 
                                    options={[
                                        { label: 'Supplier A', value: 'Supplier A' },
                                        { label: 'Supplier B', value: 'Supplier B' }
                                    ]} 
                                    optionLabel="label" 
                                    // placeholder="Select Supplier" 
                                    className="w-full bg-blue-100 border border-gray-300 rounded-md p-2 border-t-black border-l-black" 
                                />
                                
                            </div>
                            <div>
                                <label className="block text-sm font-bold">Parts No</label>
                                <input
                                    type="text"
                                    value={formData.partNo}
                                    onChange={(e) => handleInputChange(e, "partNo")}
                                    className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">Model</label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => handleInputChange(e, "model")}
                                    className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">When</label>
                                <input
                                    type="text"
                                    value={formData.when}
                                    onChange={(e) => handleInputChange(e, "when")}
                                    className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">Who</label>
                                <input
                                    type="text"
                                    value={formData.who}
                                    onChange={(e) => handleInputChange(e, "who")}
                                    className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="font-semibold">WHERE FOUND</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {/* Receiving */}
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.whereFound.receiving}
                                            onChange={(e) =>
                                                handleInputChange(e, "receiving", "whereFound")
                                            }
                                            className="mr-2"
                                        />
                                        Receiving
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter additional info"
                                        value={formData.whereFound.receivingDetails}
                                        onChange={(e) =>
                                            handleInputChange(e, "receivingDetails", "whereFound", "receiving")
                                        }
                                        className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                    />
                                </div>
                                {/* Inprocess */}
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.whereFound.inprocess}
                                            onChange={(e) =>
                                                handleInputChange(e, "inprocess", "whereFound")
                                            }
                                            className="mr-2"
                                        />
                                        Inprocess
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter additional info"
                                        value={formData.whereFound.inprocessDetails}
                                        onChange={(e) =>
                                            handleInputChange(e, "inprocessDetails", "whereFound", "inprocess")
                                        }
                                        className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                    />
                                </div>
                                {/* F/G */}
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.whereFound.fg}
                                            onChange={(e) =>
                                                handleInputChange(e, "fg", "whereFound")
                                            }
                                            className="mr-2"
                                        />
                                        F/G
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter additional info"
                                        value={formData.whereFound.fgDetails}
                                        onChange={(e) =>
                                            handleInputChange(e, "fgDetails", "whereFound", "fg")
                                        }
                                        className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                    />
                                </div>

                                {/* W/H */}
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.whereFound.wh}
                                            onChange={(e) =>
                                                handleInputChange(e, "wh", "whereFound")
                                            }
                                            className="mr-2"
                                        />
                                        W/H
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter additional info"
                                        value={formData.whereFound.whDetails}
                                        onChange={(e) =>
                                            handleInputChange(e, "whDetails", "whereFound", "wh")
                                        }
                                        className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                    />
                                </div>

                                {/* Customer Claim */}
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.whereFound.customerClaim}
                                            onChange={(e) =>
                                                handleInputChange(e, "customerClaim", "whereFound")
                                            }
                                            className="mr-2"
                                        />
                                        Customer Claim (Line Claim)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter additional info"
                                        value={formData.whereFound.customerClaimDetails}
                                        onChange={(e) =>
                                            handleInputChange(e, "customerClaimDetails", "whereFound", "customerClaim")
                                        }
                                        className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                    />
                                </div>

                                {/* Warranty Claim */}
                                <div className="flex items-start gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.whereFound.warrantyClaim}
                                            onChange={(e) =>
                                                handleInputChange(e, "warrantyClaim", "whereFound")
                                            }
                                            className="mr-2"
                                        />
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
                                        className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
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
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">Occurrence Date</label>
                                <Calendar 
                                    value={formData.occurrenceDate} 
                                    dateFormat="dd/mm/yy"
                                    placeholder="dd/mm/yy"
                                    onChange={(e) => handleInputChange({ target: { value: e.value || undefined }} as any as React.ChangeEvent<HTMLInputElement> , "occurrenceDate")} 
                                    className="w-full input-number-bg-blue-100"
                                    showButtonBar
                                    style={{ paddingLeft: 0 , paddingRight: 0 }}
                                />
                                
                            </div>
                            <div>
                                <label className="block text-sm font-bold">Date Reported</label>
                                <input
                                    type="text"
                                    value={formData.dateReported}
                                    onChange={(e) => handleInputChange(e, "dateReported")}
                                    placeholder="Auto-generated"
                                    disabled
                                    className="w-full bg-gray-200 border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">Reply Quick Action</label>
                                <input
                                    type="text"
                                    value={formData.replyQuickAction}
                                    onChange={(e) => handleInputChange(e, "replyQuickAction")}
                                    className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold">REPLY REPORT</label>
                                <Calendar 
                                    value={formData.replyReport} 
                                    dateFormat="dd/mm/yy"
                                    placeholder="dd/mm/yy"
                                    onChange={(e) => handleInputChange({ target: { value: e.value || undefined }} as any as React.ChangeEvent<HTMLInputElement>, "replyReport")} 
                                    className="w-full input-number-bg-blue-100"
                                    showButtonBar
                                    style={{ paddingLeft: 0 , paddingRight: 0 }}
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
                                <input
                                    type="checkbox"
                                    checked={formData.defect.dimension}
                                    onChange={(e) =>
                                        handleInputChange(e, "dimension", "defect")
                                    }
                                    className="mr-2"
                                />
                                Dimension
                            </label>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.defect.material}
                                    onChange={(e) =>
                                        handleInputChange(e, "material", "defect")
                                    }
                                    className="mr-2"
                                />
                                Material
                            </label>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.defect.appearance}
                                    onChange={(e) =>
                                        handleInputChange(e, "appearance", "defect")
                                    }
                                    className="mr-2"
                                />
                                Appearance
                            </label>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.defect.characteristics}
                                    onChange={(e) =>
                                        handleInputChange(e, "characteristics", "defect")
                                    }
                                    className="mr-2"
                                />
                                Characteristics
                            </label>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={!!formData.defect.other}
                                    onChange={(e) =>
                                        handleInputChange(
                                            { target: { value: e.target.checked } } as any as React.ChangeEvent<HTMLInputElement>,
                                            "other",
                                            "defect"
                                        )
                                    }
                                    className="mr-2"
                                />
                                Other
                            </label>
                            <input
                                type="text"
                                placeholder="Specify Other defect"
                                value={formData.defect.otherDetails}
                                onChange={(e) => handleInputChange(e, "otherDetails", "defect", "other")}
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
                            <input
                                type="radio"
                                name="state"
                                value="New Model"
                                checked={formData.state === "New Model"}
                                onChange={(e) => handleInputChange(e, "state")}
                                className="mr-2"
                            />
                            New Model
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="state"
                                value="Mass Production"
                                checked={formData.state === "Mass Production"}
                                onChange={(e) => handleInputChange(e, "state")}
                                className="mr-2"
                            />
                            Mass Production
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="state"
                                value="Service"
                                checked={formData.state === "Service"}
                                onChange={(e) => handleInputChange(e, "state")}
                                className="mr-2"
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
                            <input
                                type="radio"
                                name="importanceLevel"
                                value="SP"
                                checked={formData.importanceLevel === "SP"}
                                onChange={(e) => handleInputChange(e, "importanceLevel")}
                                className="mr-2"
                            />
                            SP
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="importanceLevel"
                                value="A"
                                checked={formData.importanceLevel === "A"}
                                onChange={(e) => handleInputChange(e, "importanceLevel")}
                                className="mr-2"
                            />
                            A
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="importanceLevel"
                                value="B"
                                checked={formData.importanceLevel === "B"}
                                onChange={(e) => handleInputChange(e, "importanceLevel")}
                                className="mr-2"
                            />
                            B
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="importanceLevel"
                                value="C"
                                checked={formData.importanceLevel === "C"}
                                onChange={(e) => handleInputChange(e, "importanceLevel")}
                                className="mr-2"
                            />
                            C
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="importanceLevel"
                                value="Urgent"
                                checked={formData.importanceLevel === "Urgent"}
                                onChange={(e) => handleInputChange(e, "importanceLevel")}
                                className="mr-2"
                            />
                            Urgent
                        </label>
                    </div>
                </div>

                {/* FREQUENCY */}
                <div className="mt-3 border border-solid p-3 border-gray-300 rounded-md">
                    <label className="font-semibold">FREQUENCY</label>
                    <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.frequency.firstDefective}
                                onChange={(e) =>
                                    handleInputChange(
                                        e,
                                        "firstDefective",
                                        "frequency"
                                    )
                                }
                                className="mr-2"
                            />
                            1'st DEFECTIVE
                        </label>
                        <label className="flex items-center">
                            <input
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
                            />
                            Reoccurrence

                            <InputNumber 
                                value={formData.frequency.reoccurrenceDetails} 
                                onChange={(e) => handleInputChange({ target: { value: e.value , type: 'text' }} as any as React.ChangeEvent<HTMLInputElement> , "reoccurrenceDetails", "frequency" , "reoccurrence")} 
                                min={1}
                                max={99}
                                placeholder="No."
                                className="w-full bg-blue-100 border border-gray-300 rounded-md ml-2 input-number-bg-blue-100 "
                                style={{ padding: 0 }}
                            />
                        </label>
                        <label className="flex items-center">
                            <input
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
                            />
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
                                className="w-full bg-blue-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>
                </div>

                {/* FIGURES */}
                <div className="mt-3 border border-solid p-3 border-gray-300 rounded-md">
                    <label className="font-semibold">FIGURE</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-100 border border-gray-300 p-6 text-center">
                            <span className="text-gray-500">Picture #1</span>
                        </div>
                        <div className="bg-blue-100 border border-gray-300 p-6 text-center">
                            <span className="text-gray-500">Picture #2</span>
                        </div>
                        <div className="bg-blue-100 border border-gray-300 p-6 text-center">
                            <span className="text-gray-500">Picture #3</span>
                        </div>
                        <div className="bg-blue-100 border border-gray-300 p-6 text-center">
                            <span className="text-gray-500">Picture #4</span>
                        </div>
                    </div>
                </div>
            </div>
            <Footer>
                <div className="flex justify-end mt-2 w-full gap-2">
                    <Button
                        label="Cancel"
                        severity="secondary"
                        onClick={() => console.log("Cancelled")}
                    />
                    <Button
                        label="Submit"
                        onClick={() => console.log("Submitted Data:", formData)}
                    />
                </div>
            </Footer>
        </div>
    );
}
