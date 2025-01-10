'use client';
import Footer from "@/components/footer";
import { useState } from "react";

export default function QPRForm() {
    const [formData, setFormData] = useState<any>({
        qprIssueNo: "",
        occurrenceDate: "",
        dateReported: "",
        replyQuickAction: "",
        replyReport: "",
        supplierName: "",
        partName: "",
        partNo: "",
        model: "",
        when: "",
        who: "",
        whereFound: {
            receiving: "",
            inprocess: "",
            fg: "",
            wh: "",
            customerClaim: "",
            warrantyClaim: "",
        },
        defect: {
            dimension: "",
            material: "",
            appearance: "",
            characteristics: "",
            other: "",
        },
        importanceLevel: "",
        frequency: {
            firstDefective: false,
            reoccurrence: "",
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
    const handleInputChange = (e: any, field: string, section:any = null) => {
        if (section) {
            setFormData({
                ...formData,
                [section]: {
                    ...formData[section],
                    [field]: e.target.value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [field]: e.target.value,
            });
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 shadow-md rounded-md border">
                <h1 className="text-2xl font-bold text-center mb-6">Quality Problem Rejection (QPR)</h1>
                {/* QPR Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-bold">QPR Issue No.</label>
                        <input
                            type="text"
                            value={formData.qprIssueNo}
                            onChange={(e) => handleInputChange(e, "qprIssueNo")}
                            className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold">Occurrence Date</label>
                        <input
                            type="date"
                            value={formData.occurrenceDate}
                            onChange={(e) => handleInputChange(e, "occurrenceDate")}
                            className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                            className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold">REPLY REPORT</label>
                        <input
                            type="text"
                            value={formData.replyReport}
                            onChange={(e) => handleInputChange(e, "replyReport")}
                            className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-bold">Parts Name</label>
                        <input
                            type="text"
                            value={formData.partName}
                            onChange={(e) => handleInputChange(e, "partName")}
                            className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold">Supplier Name</label>
                        <input
                            type="text"
                            value={formData.supplierName}
                            onChange={(e) => handleInputChange(e, "supplierName")}
                            className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-bold">Parts No</label>
                        <input
                            type="text"
                            value={formData.partNo}
                            onChange={(e) => handleInputChange(e, "partNo")}
                            className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold">Model</label>
                        <input
                            type="text"
                            value={formData.model}
                            onChange={(e) => handleInputChange(e, "model")}
                            className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                        />
                    </div>
                </div>

                {/* Middle Section */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-bold">When</label>
                        <input
                            type="text"
                            value={formData.when}
                            onChange={(e) => handleInputChange(e, "when")}
                            className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold">WHO</label>
                        <input
                            type="text"
                            value={formData.who}
                            onChange={(e) => handleInputChange(e, "who")}
                            className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                        />
                    </div>
                </div>

                {/* WHERE FOUND */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">WHERE FOUND</h2>
                    <div className="flex flex-col gap-4 mt-2">
                        {/* Receiving */}
                        <div className="flex items-start gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={!!formData.whereFound.receiving}
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
                                value={formData.whereFound.receiving}
                                onChange={(e) =>
                                    handleInputChange(e, "receiving", "whereFound")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        {/* Inprocess */}
                        <div className="flex items-start gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={!!formData.whereFound.inprocess}
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
                                value={formData.whereFound.inprocess}
                                onChange={(e) =>
                                    handleInputChange(e, "inprocess", "whereFound")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        {/* F/G */}
                        <div className="flex items-start gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={!!formData.whereFound.fg}
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
                                value={formData.whereFound.fg}
                                onChange={(e) =>
                                    handleInputChange(e, "fg", "whereFound")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        {/* W/H */}
                        <div className="flex items-start gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={!!formData.whereFound.wh}
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
                                value={formData.whereFound.wh}
                                onChange={(e) =>
                                    handleInputChange(e, "wh", "whereFound")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        {/* Customer Claim */}
                        <div className="flex items-start gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={!!formData.whereFound.customerClaim}
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
                                value={formData.whereFound.customerClaim}
                                onChange={(e) =>
                                    handleInputChange(e, "customerClaim", "whereFound")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        {/* Warranty Claim */}
                        <div className="flex items-start gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={!!formData.whereFound.warrantyClaim}
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
                                value={formData.whereFound.warrantyClaim}
                                onChange={(e) =>
                                    handleInputChange(e, "warrantyClaim", "whereFound")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        </div>
                </div>

                {/* DEFECT */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">DEFECT</h2>
                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex items-start gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={!!formData.defect.dimension}
                                    onChange={(e) =>
                                        handleInputChange(e, "dimension", "defect")
                                    }
                                    className="mr-2"
                                />
                                Dimension
                            </label>
                            <input
                                type="text"
                                placeholder="Enter additional info"
                                value={formData.defect.dimension}
                                onChange={(e) =>
                                    handleInputChange(e, "dimension", "defect")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        {/* Material */}
                        <div className="flex items-start gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={!!formData.defect.material}
                                    onChange={(e) =>
                                        handleInputChange(e, "material", "defect")
                                    }
                                    className="mr-2"
                                />
                                Material
                            </label>
                            <input
                                type="text"
                                placeholder="Enter additional info"
                                value={formData.defect.material}
                                onChange={(e) =>
                                    handleInputChange(e, "material", "defect")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        <div className="flex items-start gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={!!formData.defect.appearance}
                                    onChange={(e) =>
                                        handleInputChange(e, "appearance", "defect")
                                    }
                                    className="mr-2"
                                />
                                Appearance
                            </label>
                            <input
                                type="text"
                                placeholder="Enter additional info"
                                value={formData.defect.appearance}
                                onChange={(e) =>
                                    handleInputChange(e, "appearance", "defect")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        {/* Characteristics */}
                        <div className="flex items-start gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={!!formData.defect.characteristics}
                                    onChange={(e) =>
                                        handleInputChange(e, "characteristics", "defect")
                                    }
                                    className="mr-2"
                                />
                                Characteristics
                            </label>
                            <input
                                type="text"
                                placeholder="Enter additional info"
                                value={formData.defect.characteristics}
                                onChange={(e) =>
                                    handleInputChange(e, "characteristics", "defect")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        {/* Other */}
                        <div className="flex items-start gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={!!formData.defect.other}
                                    onChange={(e) =>
                                        handleInputChange(e, "other", "defect")
                                    }
                                    className="mr-2"
                                />
                                Other
                            </label>
                            <input
                                type="text"
                                placeholder="Specify Other defect"
                                value={formData.defect.other}
                                onChange={(e) =>
                                    handleInputChange(e, "other", "defect")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>
                </div>
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">STATE</h2>
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
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">IMPORTANCE LEVEL</h2>
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
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">FREQUENCY</h2>
                    <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.frequency.firstDefective}
                                onChange={(e) =>
                                    handleInputChange(
                                        { target: { value: e.target.checked } },
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
                                type="text"
                                placeholder="Reoccurrence"
                                value={formData.frequency.reoccurrence}
                                onChange={(e) =>
                                    handleInputChange(e, "reoccurrence", "frequency")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.frequency.chronicDisease}
                                onChange={(e) =>
                                    handleInputChange(
                                        { target: { value: e.target.checked } },
                                        "chronicDisease",
                                        "frequency"
                                    )
                                }
                                className="mr-2"
                            />
                            Chronic Disease
                        </label>
                    </div>
                </div>

                {/* DEFECTIVE CONTENTS */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">DEFECTIVE CONTENTS ( Entry of contents, Illustration, Selection results, …. Etc.)</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold">Problem Case</label>
                            <input
                                type="text"
                                placeholder="Enter problem case"
                                value={formData.defectiveContents.problemCase}
                                onChange={(e) =>
                                    handleInputChange(e, "problemCase", "defectiveContents")
                                }
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
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
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
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
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
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
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
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
                                className="w-full bg-yellow-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>
                </div>

                {/* FIGURES */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">FIGURE</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-yellow-100 border border-gray-300 p-6 text-center">
                            <span className="text-gray-500">Picture #1</span>
                        </div>
                        <div className="bg-yellow-100 border border-gray-300 p-6 text-center">
                            <span className="text-gray-500">Picture #2</span>
                        </div>
                        <div className="bg-yellow-100 border border-gray-300 p-6 text-center">
                            <span className="text-gray-500">Picture #3</span>
                        </div>
                        <div className="bg-yellow-100 border border-gray-300 p-6 text-center">
                            <span className="text-gray-500">Picture #4</span>
                        </div>
                    </div>
                </div>
            </div>
            <Footer>
                <div className="flex justify-end gap-4">
                    <button
                        className="bg-gray-200 px-4 py-2 rounded-md"
                        onClick={() => console.log("Cancelled")}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        onClick={() => console.log("Submitted Data:", formData)}
                    >
                        Submit
                    </button>
                </div>
            </Footer>
        </div>
    );
}
