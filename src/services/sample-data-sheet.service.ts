import { Get } from "@/components/fetch";


export interface DashboardStatsQuery {
    limit?: number;
    monthYear?: string;
}

export interface DashboardStatsResponse {
    success: boolean;
    data: {
        monthly: {
            delayPercentage: number;
            onProcessCompletePercentage: number;
            delayData: Array<{
                no: number;
                supplier: string;
                partName: string;
                partNumber: string;
            }>;
        };
        yearly: {
            delayPercentage: number;
            onProcessCompletePercentage: number;
            delayData: Array<{
                no: number;
                supplier: string;
                partName: string;
                partNumber: string;
            }>;
        };
        inspection: {
            okPercentage: number;
            ngPercentage: number;
            inspectionData: Array<{
                no: number;
                supplier: string;
                partName: string;
                partNo: string;
                ngType: string;
                sdsStatus: string;
                dueToInspectionDept: string;
            }>;
        };
    };
}
