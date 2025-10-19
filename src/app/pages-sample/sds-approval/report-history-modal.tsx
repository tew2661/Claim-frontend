'use client';
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { TemplatePaginator } from "@/components/template-pagination";

interface DataHistoryTable {
    id: number,
    qprNo: string,
    documentType: string,
    action: string,
    actionRole: string,
    actionBy: string,
    actionDate: string,
    remark: string
}

interface ReportHistoryModalProps {
    visible: boolean;
    onHide: () => void;
    historyData: DataHistoryTable[];
    first: number;
    rows: number;
    totalRecords: number;
    onPageChange: (event: any) => void;
}

export default function ReportHistoryModal({
    visible,
    onHide,
    historyData,
    first,
    rows,
    totalRecords,
    onPageChange
}: ReportHistoryModalProps) {
    return (
        <Dialog 
            header="Report History" 
            visible={visible} 
            style={{ width: '90vw' }} 
            onHide={onHide}
        >
            <div>
                <DataTable
                    value={historyData}
                    showGridlines
                    className='table-header-center'
                    footer={
                        <Paginator
                            first={first}
                            rows={rows}
                            totalRecords={totalRecords}
                            template={TemplatePaginator}
                            rowsPerPageOptions={[10, 20, 50, 100]}
                            onPageChange={onPageChange}
                        />
                    }
                >
                    <Column field="qprNo" header="QPR No." bodyStyle={{ width: '18%' }}></Column>
                    <Column field="documentType" header="Document Type" bodyStyle={{ width: '12%' }}></Column>
                    <Column field="action" header="Action" bodyStyle={{ width: '10%' }}></Column>
                    <Column field="actionRole" header="Action Role" bodyStyle={{ width: '18%' }}></Column>
                    <Column field="actionBy" header="Action By" bodyStyle={{ width: '15%' }}></Column>
                    <Column field="actionDate" header="Action Date" bodyStyle={{ width: '15%' }}></Column>
                    <Column field="remark" header="Remark" bodyStyle={{ width: '12%' }}></Column>
                </DataTable>
            </div>
        </Dialog>
    );
}