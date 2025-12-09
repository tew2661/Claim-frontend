'use client';
import { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS } from 'chart.js';
import './dashboard.css';
import { Get } from '@/components/fetch';
import moment from 'moment';

// Register the datalabels plugin
ChartJS.register(ChartDataLabels);

interface DelayData {
    no: number;
    id: number;
    sheetId: number;
    supplier: string;
    partName: string;
    partNumber: string;
    delay: boolean;
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

interface DashboardStats {
    monthly: {
        delayPercentage: number;
        delayCount: number;
        onProcessCompletePercentage: number;
        onProcessCompleteCount: number;
        delayData: DelayData[];
    };
    yearly: {
        delayPercentage: number;
        delayCount: number;
        onProcessCompletePercentage: number;
        onProcessCompleteCount: number;
        delayData: DelayData[];
    };
    inspection: {
        okPercentage: number;
        ngPercentage: number;
        ngCount: number;
        okCount: number;
        inspectionData: InspectionData[];
    };
}

export function Dashboard() {
    const [monthlyChartData, setMonthlyChartData] = useState({});
    const [yearlyChartData, setYearlyChartData] = useState({});
    const [inspectionChartData, setInspectionChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [monthlySkip, setMonthlySkip] = useState(0);
    const [yearlySkip, setYearlySkip] = useState(0);
    const [inspectionSkip, setInspectionSkip] = useState(0);
    const [hasMoreMonthly, setHasMoreMonthly] = useState(true);
    const [hasMoreYearly, setHasMoreYearly] = useState(true);
    const [hasMoreInspection, setHasMoreInspection] = useState(true);
    const LIMIT = 30;

    const [lastUpdated, setLastUpdated] = useState<string>('');

    const fetchDashboardData = async (skip = 0, append = false) => {
        try {
            if (!append) setLoading(true);
            else setLoadingMore(true);

            console.log('Fetching dashboard data...', new Date().toLocaleTimeString());

            const params = new URLSearchParams();
            params.append('limit', LIMIT.toString());
            params.append('skip', skip.toString());
            params.append('monthYear', moment().format('MM-YYYY'));
            const queryString = params.toString();
            const url = `/sample-data-sheet/dashboard-stats${queryString ? `?${queryString}` : ''}`;

            const response = await Get({ url });

            if (response.ok) {
                const responseJson = await response.json();
                setLastUpdated(moment().format('DD/MM/YYYY HH:mm:ss'));

                if (append && dashboardData) {
                    // Append new data to existing data
                    setDashboardData({
                        monthly: {
                            ...responseJson.data.monthly,
                            delayData: [...dashboardData.monthly.delayData, ...responseJson.data.monthly.delayData]
                        },
                        yearly: {
                            ...responseJson.data.yearly,
                            delayData: [...dashboardData.yearly.delayData, ...responseJson.data.yearly.delayData]
                        },
                        inspection: {
                            ...responseJson.data.inspection,
                            inspectionData: [...dashboardData.inspection.inspectionData, ...responseJson.data.inspection.inspectionData]
                        }
                    });

                    // Check if there's more data
                    if (responseJson.data.monthly.delayData.length < LIMIT) setHasMoreMonthly(false);
                    if (responseJson.data.yearly.delayData.length < LIMIT) setHasMoreYearly(false);
                    if (responseJson.data.inspection.inspectionData.length < LIMIT) setHasMoreInspection(false);
                } else {
                    // Initial load
                    setDashboardData(responseJson.data);

                    // Monthly Status Chart
                    const monthlyData = {
                        labels: ['Delay', 'Onprocess/Complete'],
                        datasets: [
                            {
                                data: [
                                    responseJson.data.monthly.delayPercentage,
                                    responseJson.data.monthly.onProcessCompletePercentage
                                ],
                                backgroundColor: ['#EF4444', '#22C55E'],
                                hoverBackgroundColor: ['#DC2626', '#16A34A']
                            }
                        ]
                    };

                    // Yearly Status Chart
                    const yearlyData = {
                        labels: ['Delay', 'Onprocess/Complete'],
                        datasets: [
                            {
                                data: [
                                    responseJson.data.yearly.delayPercentage,
                                    responseJson.data.yearly.onProcessCompletePercentage
                                ],
                                backgroundColor: ['#EF4444', '#22C55E'],
                                hoverBackgroundColor: ['#DC2626', '#16A34A']
                            }
                        ]
                    };

                    // Inspection Result Chart
                    const inspectionData = {
                        labels: ['OK', 'NG'],
                        datasets: [
                            {
                                data: [
                                    responseJson.data.inspection.okPercentage,
                                    responseJson.data.inspection.ngPercentage
                                ],
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
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'monthly' | 'yearly' | 'inspection') => {
        const target = e.currentTarget;
        const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight;

        // Load more when scrolled 80% down
        if (scrollPercentage > 0.8 && !loadingMore) {
            if (type === 'monthly' && hasMoreMonthly) {
                const newSkip = monthlySkip + LIMIT;
                setMonthlySkip(newSkip);
                fetchDashboardData(newSkip, true);
            } else if (type === 'yearly' && hasMoreYearly) {
                const newSkip = yearlySkip + LIMIT;
                setYearlySkip(newSkip);
                fetchDashboardData(newSkip, true);
            } else if (type === 'inspection' && hasMoreInspection) {
                const newSkip = inspectionSkip + LIMIT;
                setInspectionSkip(newSkip);
                fetchDashboardData(newSkip, true);
            }
        }
    };

    useEffect(() => {
        fetchDashboardData();

        const intervalId = setInterval(() => {
            fetchDashboardData();
        }, 60000); // 1 minute

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="p-2 sm:p-4 md:p-6 w-full h-full overflow-auto relative">
            {loading && !loadingMore && (
                <div className="absolute top-0 right-0 m-4 z-50 bg-blue-500 text-white px-3 py-1 rounded-full text-xs shadow-md animate-pulse">
                    Refreshing...
                </div>
            )}
            <div className="absolute top-0 right-0 m-4 z-40 text-xs text-gray-500">
                Last updated: {lastUpdated}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 pt-8">
                {/* Left Side - Monthly and Yearly Status */}
                <div className="space-y-4 md:space-y-6">
                    {/* Monthly Status */}
                    <Card className="shadow-lg dashboard-card-half">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center gap-5 mb-2 md:mb-4">
                                <div className='flex items-center gap-2'>
                                    <h2 className="text-lg md:text-2xl font-bold my-2">Monthly Status [{moment().format('MMMYY')}]</h2>
                                    <span className="bg-yellow-200 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">Submit</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <div className='flex items-center gap-2 border border-green-500 px-3 py-1 rounded-xl bg-green-500 text-white'>
                                        <label>On Process Complete</label>
                                        <label>{dashboardData?.monthly?.onProcessCompleteCount || 0}</label>
                                    </div>
                                    <div className='flex items-center gap-2 border border-red-500 px-3 py-1 rounded-xl bg-red-500 text-white'>
                                        <label>Delay</label>
                                        <label>{dashboardData?.monthly?.delayCount || 0}</label>
                                    </div>

                                </div>
                            </div>
                            <div className='flex flex-col lg:flex-row gap-4 flex-1 min-h-0'>
                                <div className="flex justify-center flex-shrink-0">
                                    <Chart type="pie" data={monthlyChartData} options={chartOptions} className="w-48 h-48 md:w-64 md:h-64" />
                                </div>
                                <div className="min-h-0 table-height overflow-auto" onScroll={(e) => handleScroll(e, 'monthly')}>
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
                                            {dashboardData?.monthly?.delayData?.map((row, idx) => (
                                                <tr key={`${row.partNumber}-${idx}`} className="hover:bg-gray-50">
                                                    <td className="border border-gray-300 px-2 py-1">{idx + 1}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.supplier}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.partName}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.partNumber}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {loadingMore && hasMoreMonthly && (
                                        <div className="text-center py-2 text-sm text-gray-500">Loading more...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Yearly Status */}
                    <Card className="shadow-lg dashboard-card-half">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center gap-5 mb-2 md:mb-4">
                                <div className='flex items-center gap-2'>
                                    <h2 className="text-lg md:text-2xl font-bold my-2">Yearly Status [{moment().format('YY')}]</h2>
                                    <span className="bg-yellow-200 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">Submit</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <div className='flex items-center gap-2 border border-green-500 px-3 py-1 rounded-xl bg-green-500 text-white'>
                                        <label>On Process Complete</label>
                                        <label>{dashboardData?.yearly?.onProcessCompleteCount || 0}</label>
                                    </div>
                                    <div className='flex items-center gap-2 border border-red-500 px-3 py-1 rounded-xl bg-red-500 text-white'>
                                        <label>Delay</label>
                                        <label>{dashboardData?.yearly?.delayCount || 0}</label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                                <div className="flex justify-center flex-shrink-0">
                                    <Chart type="pie" data={yearlyChartData} options={chartOptions} className="w-48 h-48 md:w-64 md:h-64" />
                                </div>
                                <div className="min-h-0 table-height overflow-auto" onScroll={(e) => handleScroll(e, 'yearly')}>
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
                                            {dashboardData?.yearly?.delayData?.map((row, idx) => (
                                                <tr key={`${row.partNumber}-${idx}`} className="hover:bg-gray-50">
                                                    <td className="border border-gray-300 px-2 py-1">{idx + 1}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.supplier}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.partName}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{row.partNumber}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {loadingMore && hasMoreYearly && (
                                        <div className="text-center py-2 text-sm text-gray-500">Loading more...</div>
                                    )}
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
                                <div className="min-h-0 table-height-inspection overflow-auto" onScroll={(e) => handleScroll(e, 'inspection')}>
                                    <table className="w-full text-xs md:text-sm border-collapse">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '40px' }}>No</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '100px' }}>Supplier</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '100px' }}>Part name</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '80px' }}>Part No</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '100px' }}>NG Count</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '180px' }}>SDS Status</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left" style={{ minWidth: '120px' }}>Due To Inspection Dept.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData?.inspection?.inspectionData?.map((row, idx) => (
                                                <tr key={`${row.partNo}-${idx}`} className="hover:bg-gray-50">
                                                    <td className="border border-gray-300 px-2 py-1">{idx + 1}</td>
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
                                    {loadingMore && hasMoreInspection && (
                                        <div className="text-center py-2 text-sm text-gray-500">Loading more...</div>
                                    )}
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