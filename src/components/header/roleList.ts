import { RoleCategory } from "./interface";
import { menuList } from './menuList';

const roleList: RoleCategory[] = menuList.map((x) => {
        if (x.label == 'Report') {
            return {
                ...x,
                function: [
                    {
                        name: 'PR Daily Order',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Export',
                            }
                        ]
                    },
                    {
                        name: 'PR Weekly Order',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Export',
                            }
                        ]
                    },
                    {
                        name: 'PR Monthly Order',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Export',
                            }
                        ]
                    },
                    {
                        name: 'CKD Weekly Order for CVJ',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Export',
                            }
                        ]
                    },
                    {
                        name: 'CKD Weekly Order for STG',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Export',
                            }
                        ]
                    },
                    {
                        name: 'CKD Monthly Order for BRG',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Export',
                            }
                        ]
                    },
                    {
                        name: 'Amount Report',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Export',
                            }
                        ]
                    },
                    {
                        name: 'Comparison Monthly Order',
                        function: [
                            {
                                name: 'View',
                                
                            },
                            {
                                name: 'Export',
                                
                            }
                        ]
                    },
                    {
                        name: 'Comparison Order and Demand',
                        function: [
                            {
                                name: 'View',
                                
                            },
                            {
                                name: 'Export',
                                
                            }
                        ]
                    },
                    {
                        name: 'Original Demand',
                        function: [
                            {
                                name: 'View',
                                
                            },
                            {
                                name: 'Export',
                                
                            }
                        ]
                    },
                ]
            }
        }
        else if (x.label == '1-Day Stock') {
            return {
                ...x,
                function: [
                    {
                        name: 'Import Stock',
                        function: [
                            {
                                name: 'Import file',
                                
                            },
                        ]
                    },
                    {
                        name: 'Report 1-Day Stock',
                        function: [
                            {
                                name: 'View',
                                
                            },
                            {
                                name: 'Export',
                                
                            }
                        ]
                    },
                ]
                
            }
        }
        else if (x.label == 'Create New PR') {
           return {
            ...x,
            function: [
                {
                    name: 'Create PR',
                    function: [
                        {
                            name: 'Create New PR',
                        },
                    ]
                },
                {
                    name: 'PR issue Status List',
                    function: [
                        {
                            name: 'View',
                        },
                        {
                            name: 'Edit Demand',
                        }
                    ]
                },
            ]
        }
        }
        else if (x.label == 'PR Approval') {
            return  {
                ...x,
                function: [
                    {
                        name: 'PR Approval Status List',
                        function: [
                            {
                                name: 'View',
                            },
                        ]
                    },
                    {
                        name: 'Approval by Team Leader',
                        function: [
                            {
                                name: 'Edit / Approve / Reject',
                            },
                        ]
                    },
                    {
                        name: 'Approval by MGR / DGM',
                        function: [
                            {
                                name: 'Approve / Reject',
                            },
                        ]
                    },
                    {
                        name: 'Approval by GM',
                        function: [
                            {
                                name: 'Approve / Reject',
                            },
                        ]
                    },
                ]
            }
        }
        else if (x.label == 'PR Adjust') {
            return {
                label: 'PR Adjust',
                items: [],
                icon: undefined,
                url: "/pages/supplier-adjust",
                function: [
                    {
                        name: 'PR Adjust',
                        function: [
                            {
                                name: 'Revise PR',
                            },
                        ]
                    },
                ]
            }
        }
        else if (x.label == 'BOM') {
            return {
                ...x,
                function: [
                    {
                        name: 'ECA / ECI Status List',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Create BOM (ECA / ECI)',
                            },
                        ]
                    }
                ]
            }
        }
        else if (x.label == 'Approval BOM') {
            return {
                label: 'Approval BOM',
                items: [],
                icon: undefined,
                url: "/pages/approval-bom",
                function: [
                    {
                        title: 'ECA / ECI',
                    },
                    {
                        name: 'Confirm BOM by NPJ (Team Leader)',
                        group: 'ECA / ECI',
                        function: [
                            {
                                name: 'Edit / Approve / Reject',
                            },
                        ]
                    },
                    {
                        name: 'Confirm Delivery Condition by PC',
                        group: 'ECA / ECI',
                        function: [
                            {
                                name: 'Edit / Approve / Reject',
                            },
                        ]
                    },
                    {
                        name: 'Approve BOM by PC (MGR / DGM)',
                        group: 'ECA / ECI',
                        function: [
                            {
                                name: 'Approve / Reject',
                            },
                        ]
                    }
                ]
            }
        }
        else if (x.label == 'BOM History') {
            return {
                ...x,
                function: [
                    {
                        name: 'BOM History',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                ]
            }
        }
        else if (x.label == 'Master') {
            return {
                ...x,
                function: [
                    {
                        name: 'User Management',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    
                    {
                        name: 'Access Role',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        name: 'PR Approval',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        name: 'BOM Approval',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        name: 'PR Header Report',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        title: 'Supplier',
                    },
                    {
                        name: 'Local',
                        group: 'Supplier',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        name: 'Import',
                        group: 'Supplier',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        name: 'CKD',
                        group: 'Supplier',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        name: 'Material',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        name: 'Delivery Condition',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        name: 'BOM',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        title: 'Material Price List',
                    },
                    {
                        group: 'Material Price List',
                        name: 'Local',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        group: 'Material Price List',
                        name: 'Import',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        group: 'Material Price List',
                        name: 'CKD',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        name: 'Exchange Rate',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        name: 'FG Product',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                    {
                        name: 'Calendar',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Edit',
                            },
                            {
                                name: 'Add',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                ]
            }
        }
        else if (x.label == 'Log History') {
           return  {
                ...x,
                function: [
                    {
                        name: 'Log History',
                        function: [
                            {
                                name: 'View',
                            },
                            {
                                name: 'Export',
                            },
                        ]
                    },
                ]
            }
        } 
        else {
            return x
        }
})

export { roleList }