'use client';
import { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS } from 'chart.js';
import './dashboard.css';

// Register the datalabels plugin
ChartJS.register(ChartDataLabels);

interface DelayData {
    no: number;
    supplier: string;
    partName: string;
    partNumber: string;
}

interface InspectionData {
    no: number;
    supplier: string;
    partName: string;
    partNo: string;
    ngType: string;
    sdsStatus: string;
    dueToInspectionDept: string;
}

export function Dashboard() {
    const [monthlyChartData, setMonthlyChartData] = useState({});
    const [yearlyChartData, setYearlyChartData] = useState({});
    const [inspectionChartData, setInspectionChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    const monthlyDelayData: DelayData[] = [
        { no: 1, supplier: 'Supplier A', partName: 'Part 1', partNumber: 'PN-001' },
        { no: 2, supplier: 'Supplier B', partName: 'Part 2', partNumber: 'PN-002' },
        { no: 3, supplier: 'Supplier C', partName: 'Part 3', partNumber: 'PN-003' },
        { no: 4, supplier: 'Supplier D', partName: 'Part 4', partNumber: 'PN-004' },
        { no: 5, supplier: 'Supplier E', partName: 'Part 5', partNumber: 'PN-005' },
        { no: 6, supplier: 'Supplier F', partName: 'Part 6', partNumber: 'PN-006' },
        { no: 7, supplier: 'Supplier G', partName: 'Part 7', partNumber: 'PN-007' },
        { no: 8, supplier: 'Supplier H', partName: 'Part 8', partNumber: 'PN-008' },
        { no: 9, supplier: 'Supplier I', partName: 'Part 9', partNumber: 'PN-009' },
        { no: 10, supplier: 'Supplier J', partName: 'Part 10', partNumber: 'PN-010' },
        { no: 11, supplier: 'Supplier K', partName: 'Part 11', partNumber: 'PN-011' },
        { no: 12, supplier: 'Supplier L', partName: 'Part 12', partNumber: 'PN-012' },
        { no: 13, supplier: 'Supplier M', partName: 'Part 13', partNumber: 'PN-013' },
        { no: 14, supplier: 'Supplier N', partName: 'Part 14', partNumber: 'PN-014' },
        { no: 15, supplier: 'Supplier O', partName: 'Part 15', partNumber: 'PN-015' },
        { no: 16, supplier: 'Supplier P', partName: 'Part 16', partNumber: 'PN-016' },
        { no: 17, supplier: 'Supplier Q', partName: 'Part 17', partNumber: 'PN-017' },
        { no: 18, supplier: 'Supplier R', partName: 'Part 18', partNumber: 'PN-018' },
        { no: 19, supplier: 'Supplier S', partName: 'Part 19', partNumber: 'PN-019' },
        { no: 20, supplier: 'Supplier T', partName: 'Part 20', partNumber: 'PN-020' },
        { no: 21, supplier: 'Supplier U', partName: 'Part 21', partNumber: 'PN-021' },
        { no: 22, supplier: 'Supplier V', partName: 'Part 22', partNumber: 'PN-022' },
        { no: 23, supplier: 'Supplier W', partName: 'Part 23', partNumber: 'PN-023' },
        { no: 24, supplier: 'Supplier X', partName: 'Part 24', partNumber: 'PN-024' },
        { no: 25, supplier: 'Supplier Y', partName: 'Part 25', partNumber: 'PN-025' },
        { no: 26, supplier: 'Supplier Z', partName: 'Part 26', partNumber: 'PN-026' },
        { no: 27, supplier: 'Supplier AA', partName: 'Part 27', partNumber: 'PN-027' },
        { no: 28, supplier: 'Supplier AB', partName: 'Part 28', partNumber: 'PN-028' },
        { no: 29, supplier: 'Supplier AC', partName: 'Part 29', partNumber: 'PN-029' },
        { no: 30, supplier: 'Supplier AD', partName: 'Part 30', partNumber: 'PN-030' },
    ];

    const yearlyDelayData: DelayData[] = [
        { no: 1, supplier: 'Supplier AE', partName: 'Part 31', partNumber: 'PN-031' },
        { no: 2, supplier: 'Supplier AF', partName: 'Part 32', partNumber: 'PN-032' },
        { no: 3, supplier: 'Supplier AG', partName: 'Part 33', partNumber: 'PN-033' },
        { no: 4, supplier: 'Supplier AH', partName: 'Part 34', partNumber: 'PN-034' },
        { no: 5, supplier: 'Supplier AI', partName: 'Part 35', partNumber: 'PN-035' },
        { no: 6, supplier: 'Supplier AJ', partName: 'Part 36', partNumber: 'PN-036' },
        { no: 7, supplier: 'Supplier AK', partName: 'Part 37', partNumber: 'PN-037' },
        { no: 8, supplier: 'Supplier AL', partName: 'Part 38', partNumber: 'PN-038' },
        { no: 9, supplier: 'Supplier AM', partName: 'Part 39', partNumber: 'PN-039' },
        { no: 10, supplier: 'Supplier AN', partName: 'Part 40', partNumber: 'PN-040' },
        { no: 11, supplier: 'Supplier AO', partName: 'Part 41', partNumber: 'PN-041' },
        { no: 12, supplier: 'Supplier AP', partName: 'Part 42', partNumber: 'PN-042' },
        { no: 13, supplier: 'Supplier AQ', partName: 'Part 43', partNumber: 'PN-043' },
        { no: 14, supplier: 'Supplier AR', partName: 'Part 44', partNumber: 'PN-044' },
        { no: 15, supplier: 'Supplier AS', partName: 'Part 45', partNumber: 'PN-045' },
        { no: 16, supplier: 'Supplier AT', partName: 'Part 46', partNumber: 'PN-046' },
        { no: 17, supplier: 'Supplier AU', partName: 'Part 47', partNumber: 'PN-047' },
        { no: 18, supplier: 'Supplier AV', partName: 'Part 48', partNumber: 'PN-048' },
        { no: 19, supplier: 'Supplier AW', partName: 'Part 49', partNumber: 'PN-049' },
        { no: 20, supplier: 'Supplier AX', partName: 'Part 50', partNumber: 'PN-050' },
        { no: 21, supplier: 'Supplier AY', partName: 'Part 51', partNumber: 'PN-051' },
        { no: 22, supplier: 'Supplier AZ', partName: 'Part 52', partNumber: 'PN-052' },
        { no: 23, supplier: 'Supplier BA', partName: 'Part 53', partNumber: 'PN-053' },
        { no: 24, supplier: 'Supplier BB', partName: 'Part 54', partNumber: 'PN-054' },
        { no: 25, supplier: 'Supplier BC', partName: 'Part 55', partNumber: 'PN-055' },
        { no: 26, supplier: 'Supplier BD', partName: 'Part 56', partNumber: 'PN-056' },
        { no: 27, supplier: 'Supplier BE', partName: 'Part 57', partNumber: 'PN-057' },
        { no: 28, supplier: 'Supplier BF', partName: 'Part 58', partNumber: 'PN-058' },
        { no: 29, supplier: 'Supplier BG', partName: 'Part 59', partNumber: 'PN-059' },
        { no: 30, supplier: 'Supplier BH', partName: 'Part 60', partNumber: 'PN-060' },
    ];

    const inspectionData: InspectionData[] = [
        { no: 1, supplier: 'Supplier X', partName: 'Part X', partNo: 'PN-X01', ngType: 'Dimension', sdsStatus: 'Supplier Rejected Report', dueToInspectionDept: '01-12-2025' },
        { no: 2, supplier: 'Supplier Y', partName: 'Part Y', partNo: 'PN-Y01', ngType: 'Surface', sdsStatus: 'Supplier Rejected Report', dueToInspectionDept: '05-12-2025' },
        { no: 3, supplier: 'Supplier Z', partName: 'Part Z', partNo: 'PN-Z01', ngType: 'Material', sdsStatus: 'Supplier Rejected Report', dueToInspectionDept: '10-12-2025' },
        { no: 4, supplier: 'Supplier AA', partName: 'Part AA', partNo: 'PN-AA01', ngType: 'Coating', sdsStatus: 'Supplier Rejected Report', dueToInspectionDept: '12-12-2025' },
        { no: 5, supplier: 'Supplier BB', partName: 'Part BB', partNo: 'PN-BB01', ngType: 'Assembly', sdsStatus: 'Supplier Rejected Report', dueToInspectionDept: '15-12-2025' },
        { no: 6, supplier: 'Supplier CC', partName: 'Part CC', partNo: 'PN-CC01', ngType: 'Welding', sdsStatus: 'Supplier Rejected Report', dueToInspectionDept: '18-12-2025' },
        { no: 7, supplier: 'Supplier DD', partName: 'Part DD', partNo: 'PN-DD01', ngType: 'Painting', sdsStatus: 'Supplier Rejected Report', dueToInspectionDept: '20-12-2025' },
        { no: 8, supplier: 'Supplier EE', partName: 'Part EE', partNo: 'PN-EE01', ngType: 'Packaging', sdsStatus: 'Supplier Rejected Report', dueToInspectionDept: '22-12-2025' },
        { no: 9, supplier: 'Supplier FF', partName: 'Part FF', partNo: 'PN-FF01', ngType: 'Testing', sdsStatus: 'Supplier Rejected Report', dueToInspectionDept: '25-12-2025' },
        { no: 10, supplier: 'Supplier GG', partName: 'Part GG', partNo: 'PN-GG01', ngType: 'Quality', sdsStatus: 'Supplier Rejected Report', dueToInspectionDept: '28-12-2025' },
        { no: 11, supplier: 'Supplier HH', partName: 'Part HH', partNo: 'PN-HH01', ngType: 'Dimension', sdsStatus: 'Pending Review', dueToInspectionDept: '02-01-2026' },
        { no: 12, supplier: 'Supplier II', partName: 'Part II', partNo: 'PN-II01', ngType: 'Surface', sdsStatus: 'Pending Review', dueToInspectionDept: '05-01-2026' },
        { no: 13, supplier: 'Supplier JJ', partName: 'Part JJ', partNo: 'PN-JJ01', ngType: 'Material', sdsStatus: 'Pending Review', dueToInspectionDept: '08-01-2026' },
        { no: 14, supplier: 'Supplier KK', partName: 'Part KK', partNo: 'PN-KK01', ngType: 'Coating', sdsStatus: 'Pending Review', dueToInspectionDept: '10-01-2026' },
        { no: 15, supplier: 'Supplier LL', partName: 'Part LL', partNo: 'PN-LL01', ngType: 'Assembly', sdsStatus: 'Pending Review', dueToInspectionDept: '12-01-2026' },
        { no: 16, supplier: 'Supplier MM', partName: 'Part MM', partNo: 'PN-MM01', ngType: 'Welding', sdsStatus: 'Approved', dueToInspectionDept: '15-01-2026' },
        { no: 17, supplier: 'Supplier NN', partName: 'Part NN', partNo: 'PN-NN01', ngType: 'Painting', sdsStatus: 'Approved', dueToInspectionDept: '18-01-2026' },
        { no: 18, supplier: 'Supplier OO', partName: 'Part OO', partNo: 'PN-OO01', ngType: 'Packaging', sdsStatus: 'Approved', dueToInspectionDept: '20-01-2026' },
        { no: 19, supplier: 'Supplier PP', partName: 'Part PP', partNo: 'PN-PP01', ngType: 'Testing', sdsStatus: 'Approved', dueToInspectionDept: '22-01-2026' },
        { no: 20, supplier: 'Supplier QQ', partName: 'Part QQ', partNo: 'PN-QQ01', ngType: 'Quality', sdsStatus: 'Approved', dueToInspectionDept: '25-01-2026' },
        { no: 21, supplier: 'Supplier RR', partName: 'Part RR', partNo: 'PN-RR01', ngType: 'Dimension', sdsStatus: 'In Progress', dueToInspectionDept: '28-01-2026' },
        { no: 22, supplier: 'Supplier SS', partName: 'Part SS', partNo: 'PN-SS01', ngType: 'Surface', sdsStatus: 'In Progress', dueToInspectionDept: '30-01-2026' },
        { no: 23, supplier: 'Supplier TT', partName: 'Part TT', partNo: 'PN-TT01', ngType: 'Material', sdsStatus: 'In Progress', dueToInspectionDept: '02-02-2026' },
        { no: 24, supplier: 'Supplier UU', partName: 'Part UU', partNo: 'PN-UU01', ngType: 'Coating', sdsStatus: 'In Progress', dueToInspectionDept: '05-02-2026' },
        { no: 25, supplier: 'Supplier VV', partName: 'Part VV', partNo: 'PN-VV01', ngType: 'Assembly', sdsStatus: 'In Progress', dueToInspectionDept: '08-02-2026' },
        { no: 26, supplier: 'Supplier WW', partName: 'Part WW', partNo: 'PN-WW01', ngType: 'Welding', sdsStatus: 'Rejected', dueToInspectionDept: '10-02-2026' },
        { no: 27, supplier: 'Supplier XX', partName: 'Part XX', partNo: 'PN-XX01', ngType: 'Painting', sdsStatus: 'Rejected', dueToInspectionDept: '12-02-2026' },
        { no: 28, supplier: 'Supplier YY', partName: 'Part YY', partNo: 'PN-YY01', ngType: 'Packaging', sdsStatus: 'Rejected', dueToInspectionDept: '15-02-2026' },
        { no: 29, supplier: 'Supplier ZZ', partName: 'Part ZZ', partNo: 'PN-ZZ01', ngType: 'Testing', sdsStatus: 'Rejected', dueToInspectionDept: '18-02-2026' },
        { no: 30, supplier: 'Supplier AAA', partName: 'Part AAA', partNo: 'PN-AAA01', ngType: 'Quality', sdsStatus: 'Supplier Rejected Report', dueToInspectionDept: '20-02-2026' },
    ];

    useEffect(() => {
        // Monthly Status Chart (30% Delay, 70% Onprocess/Complete)
        const monthlyData = {
            labels: ['Delay', 'Onprocess/Complete'],
            datasets: [
                {
                    data: [30, 70],
                    backgroundColor: ['#EF4444', '#22C55E'],
                    hoverBackgroundColor: ['#DC2626', '#16A34A']
                }
            ]
        };

        // Yearly Status Chart (15% Delay, 85% Onprocess/Complete)
        const yearlyData = {
            labels: ['Delay', 'Onprocess/Complete'],
            datasets: [
                {
                    data: [15, 85],
                    backgroundColor: ['#EF4444', '#22C55E'],
                    hoverBackgroundColor: ['#DC2626', '#16A34A']
                }
            ]
        };

        // Inspection Result Chart (95% OK, 5% NG)
        const inspectionData = {
            labels: ['OK', 'NG'],
            datasets: [
                {
                    data: [95, 5],
                    backgroundColor: ['#22C55E', '#EF4444'],
                    hoverBackgroundColor: ['#16A34A', '#DC2626']
                }
            ]
        };

        const options = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return label + ': ' + value + '%';
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold' as const,
                        size: 16
                    },
                    formatter: (value: number) => {
                        return value + '%';
                    }
                }
            }
        };

        setMonthlyChartData(monthlyData);
        setYearlyChartData(yearlyData);
        setInspectionChartData(inspectionData);
        setChartOptions(options);
    }, []);

    return (
        <div className="p-2 sm:p-4 md:p-6 w-full h-full overflow-auto">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                {/* Left Side - Monthly and Yearly Status */}
                <div className="space-y-4 md:space-y-6">
                    {/* Monthly Status */}
                    <Card className="shadow-lg dashboard-card-half">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-2 md:mb-4">
                                <h2 className="text-lg md:text-2xl font-bold my-2">Monthly Status</h2>
                                <span className="bg-yellow-200 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">Submit</span>
                            </div>
                            <div className='flex flex-col lg:flex-row gap-4 flex-1 min-h-0'>
                                <div className="flex justify-center flex-shrink-0">
                                    <Chart type="pie" data={monthlyChartData} options={chartOptions} className="w-48 h-48 md:w-64 md:h-64" />
                                </div>
                                <div className="min-h-0 table-height overflow-auto">
                                    <table className="w-full text-xs md:text-sm border-collapse">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="border border-gray-300 px-2 py-1 text-left">No</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left">Supplier</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left">Part name</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left">Part number</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlyDelayData.map((row) => (
                                                <tr key={row.no} className="hover:bg-gray-50">
                                                    <td className="border border-gray-300 px-2 py-1">{row.no}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.supplier}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.partName}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.partNumber}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Yearly Status */}
                    <Card className="shadow-lg dashboard-card-half">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-2 md:mb-4">
                                <h2 className="text-lg md:text-2xl font-bold my-2">Yearly Status [FY25]</h2>
                                <span className="bg-yellow-200 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">Submit</span>
                            </div>
                            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                                <div className="flex justify-center flex-shrink-0">
                                    <Chart type="pie" data={yearlyChartData} options={chartOptions} className="w-48 h-48 md:w-64 md:h-64" />
                                </div>
                                <div className="min-h-0 table-height overflow-auto">
                                    <table className="w-full text-xs md:text-sm border-collapse">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="border border-gray-300 px-2 py-1 text-left">No</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left">Supplier</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left">Part name</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left">Part number</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {yearlyDelayData.map((row) => (
                                                <tr key={row.no} className="hover:bg-gray-50">
                                                    <td className="border border-gray-300 px-2 py-1">{row.no}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.supplier}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.partName}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.partNumber}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Side - Inspection Result */}
                <div>
                    <Card className="shadow-lg h-full" style={{ height: 'calc(100vh - 95px)' }}>
                        <div className="h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-2 md:mb-4">
                                <h2 className="text-lg md:text-2xl font-bold my-2">Inspection Result</h2>
                            </div>
                            <div className="flex justify-center mb-2 md:mb-4 flex-shrink-0">
                                <Chart type="pie" data={inspectionChartData} options={chartOptions} className="w-64 h-64 md:w-80 md:h-80" />
                            </div>
                            <div className="flex-1 min-h-0 flex flex-col">
                                <div className="flex gap-4 mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded"></div>
                                        <span className="font-semibold text-xs md:text-sm">OK</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded"></div>
                                        <span className="font-semibold text-xs md:text-sm">NG</span>
                                    </div>
                                </div>
                                <div className="min-h-0 table-height-inspection overflow-auto">
                                    <table className="w-full text-xs md:text-sm border-collapse">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '40px' }}>No</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '100px' }}>Supplier</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '100px' }}>Part name</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '80px' }}>Part No</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '100px' }}>NG Type</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '180px' }}>SDS Status</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '120px' }}>Due To Inspection Dept.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inspectionData.map((row) => (
                                                <tr key={row.no} className="hover:bg-gray-50">
                                                    <td className="border border-gray-300 px-2 py-1">{row.no}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.supplier}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.partName}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.partNo}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.ngType}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.sdsStatus}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.dueToInspectionDept}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;