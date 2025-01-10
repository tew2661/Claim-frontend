const TemplatePaginator = {
    layout: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport',
    CurrentPageReport: (options: any) => {
        return (
            <span style={{ color: 'var(--text-color)', userSelect: 'none', width: '120px', textAlign: 'center' }}>
                {options.first} - {options.last} of {options.totalRecords} 
            </span>
        );
    }
};

export { TemplatePaginator }