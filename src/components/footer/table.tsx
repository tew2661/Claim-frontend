import { Dropdown } from "primereact/dropdown";
import { Paginator, PaginatorCurrentPageReportOptions, PaginatorPageChangeEvent, PaginatorRowsPerPageDropdownOptions } from "primereact/paginator"
import React from "react";

const FooterTable = (props: { setFirst: (value : number)=> void, setRows: (value : number)=> void, first: number, rows: number , totalRecords: number }) => {
    const template2 = {
        layout: 'RowsPerPageDropdown CurrentPageReport',
        RowsPerPageDropdown: (options: PaginatorRowsPerPageDropdownOptions) => {
            const dropdownOptions = [
                { label: 5, value: 5 },
                { label: 10, value: 10 },
                { label: 20, value: 20 },
                { label: 120, value: 120 }
            ];

            return (
                <React.Fragment>
                    <span className="mx-1 flex items-center text-blue-800 text-[12px]" style={{ userSelect: 'none' }}>
                        Items per page:{' '}
                    </span>
                    <Dropdown value={options.value} options={dropdownOptions} onChange={options.onChange} />
                </React.Fragment>
            );
        },
        CurrentPageReport: (options: PaginatorCurrentPageReportOptions) => {
            return (
                <span className="ml-4 flex items-center text-blue-800 text-[12px]" style={{ userSelect: 'none', width: '120px', textAlign: 'center' }}>
                    {options.first} - {options.last} of {options.totalRecords}
                </span>
            );
        }
    };
    
    const onPageChange = (e: PaginatorPageChangeEvent) => {
        props.setFirst(e.first);
        props.setRows(e.rows);
    };

    return <Paginator 
        template={template2} 
        first={props.first} 
        rows={props.rows} 
        totalRecords={props.totalRecords ?? 0} 
        onPageChange={(e) => onPageChange(e)} 
        className="justify-content-start" 
    />
}

export default FooterTable;