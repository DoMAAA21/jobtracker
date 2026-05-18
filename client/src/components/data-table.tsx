import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterIcon, Plus, FileSpreadsheetIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiActions } from '@/components/multi-actions';
import { ExportImportDropdown } from '@/components/export-import-dropdown';
import { useDebounce } from '@/hooks/use-debounce';
import { Card } from '@/components/ui/card';

interface Column {
    key: string;
    header: string;
    sortTable?: boolean;
}

type DataTableProps<T> = {
    columns: Column[];
    data: T[];
    rowsPerPage: number;
    currentPage: number;
    totalPages: number;
    totalRows: number;
    buttonText?: string;
    isLoading?: boolean;
    /** When true, add button is shown but disabled/blurred (e.g. no permission) */
    addButtonDisabled?: boolean;
    defaultFilterOpen?: boolean;
    filter: React.ReactNode;
    onSearch: (query: string) => void;
    onPageChange: (page: number) => void;
    onWithDeletedChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSort: (colKey: string, sortOrder: string) => void;
    multiSelect?: boolean;
    onRowSelect?: (selectedRows: T[]) => void;
    onRowsPerPageChange: (rowsPerpage: number) => void;
    onButtonClick?: () => void;
    onMultiRestore?: () => void;
    onMultiDelete?: () => void;
    onMultiSendEmail?: () => void;
    onExportCSV?: () => void;
    onImportCSV?: () => void;
};

export interface DataTableRef {
    resetSelection: () => void;
}

export const DataTable = forwardRef<DataTableRef, DataTableProps<any>>(<T,>({
    columns,
    data,
    currentPage,
    totalPages,
    buttonText,
    isLoading,
    addButtonDisabled = false,
    defaultFilterOpen = false,
    onSearch,
    onPageChange,
    onSort,
    onWithDeletedChange,
    totalRows,
    rowsPerPage = 15,
    filter,
    multiSelect = true,
    onRowSelect,
    onRowsPerPageChange,
    onButtonClick,
    onMultiDelete,
    onMultiRestore,
    onMultiSendEmail,
    onExportCSV,
    onImportCSV
}: DataTableProps<T>, ref: React.Ref<DataTableRef>) => {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilter, setShowFilter] = useState(defaultFilterOpen);

    useEffect(() => {
        if (defaultFilterOpen) {
            setShowFilter(true);
        }
    }, [defaultFilterOpen]);
    const [selectedRows, setSelectedRows] = useState<T[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isExportImportOpen, setIsExportImportOpen] = useState(false);
    const search = useDebounce(searchTerm, 1000);
    const previousPageRef = useRef(currentPage);
    const tableRef = useRef<HTMLTableElement>(null);
    const exportImportRef = useRef<HTMLDivElement | null>(null);
    const startItem = (currentPage - 1) * rowsPerPage + 1;
    const endItem = Math.min(startItem + rowsPerPage - 1, totalRows);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const renderCellContent = (value: any, colKey: string) => {
        if (value === null || value === undefined || value === 'null' || value === '') {
            return '';
        }
        if (colKey === 'img' && typeof value === 'string') {
            return <img src={value} alt="User" width="50" height="50" />;
        } else if (React.isValidElement(value)) {
            return value;
        }
        return String(value);
    };

    const renderSortIcon = (colKey: string) => {
        if (sortColumn !== colKey) return null;
        return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
    };

    const handleSort = (column: string) => {
        if (column) {
            if (sortColumn === column) {
                const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                setSortOrder(newSortOrder);
                onSort(column, newSortOrder);
            } else {
                setSortColumn(column);
                setSortOrder('asc');
                onSort(column, 'asc');
            }
            if (multiSelect) {
                setSelectAll(false);
                setSelectedRows([]);
                onRowSelect?.([]);
            }
        }
    };

    const handleRowSelect = (row: T) => {
        if (!multiSelect || !onRowSelect) return;
        const alreadySelected = selectedRows.find((selected) => selected === row);
        const newSelectedRows = alreadySelected
            ? selectedRows.filter((selected) => selected !== row)
            : [...selectedRows, row];
        setSelectedRows(newSelectedRows);
        onRowSelect(newSelectedRows);
    };


    useEffect(() => {
        if (onSearch) {
            onSearch(search);
        }
    }, [search]);

    useEffect(() => {
        if (multiSelect && currentPage !== previousPageRef.current) {
            setSelectAll(false);
            setSelectedRows([]);
            onRowSelect?.([]);
            previousPageRef.current = currentPage;
        }
    }, [currentPage, multiSelect, onRowSelect]);

    useImperativeHandle(ref, () => ({
        resetSelection: () => {
            if (multiSelect) {
                setSelectAll(false);
                setSelectedRows([]);
                onRowSelect?.([]);
            }
        }
    }));

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (exportImportRef.current && !exportImportRef.current.contains(event.target as Node)) {
                setIsExportImportOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [exportImportRef]);


    return (
        <div className="pb-4">
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    {filter && (
                        <Button
                            size="icon"
                            className="w-10 h-10 select-none bg-white text-black rounded-lg shadow-md hover:bg-white/100 hover:shadow-lg hover:scale-105 transform transition duration-200 ease-in-out flex items-center justify-center cursor-pointer"
                            onClick={() => setShowFilter(!showFilter)}
                        >
                            <FilterIcon className={`w-4 h-4 transform transition-transform duration-500 ${showFilter ? 'rotate-180' : 'rotate-0'}`} />
                        </Button>
                    )}
                    <input
                        placeholder="Search..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-1/5 bg-white border border-gray-300 rounded-lg p-2"
                    />
                    <div className="flex space-x-4">
                        {(onExportCSV || onImportCSV) && (
                            <>
                                <Button className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => setIsExportImportOpen(!isExportImportOpen)}
                                    title="Export/Import"
                                >
                                    Export/Import<FileSpreadsheetIcon />
                                </Button>
                                {isExportImportOpen && (
                                    <ExportImportDropdown
                                        dropdownRef={exportImportRef}
                                        {...(onExportCSV && { exportCSV: onExportCSV })}
                                        {...(onImportCSV && { importCSV: onImportCSV })}
                                    />
                                )}
                            </>
                        )}
                    </div>
                    <div className="ml-auto flex space-x-4">
                        {onWithDeletedChange && (<label className="flex items-center space-x-2">
                            <Input
                                type="checkbox"
                                className="w-4 h-4"
                                onChange={onWithDeletedChange}
                            />
                            <span>With Deleted</span>
                        </label>)}
                        {onButtonClick && (
                            <Button
                              onClick={addButtonDisabled ? undefined : onButtonClick}
                              disabled={addButtonDisabled}
                              className={addButtonDisabled ? "w-40 opacity-50 cursor-not-allowed pointer-events-none" : "w-40 cursor-pointer"}
                            >
                              {buttonText}
                              <Plus />
                            </Button>
                          )}
                    </div>
                </div>
                <div className={`transition-all duration-500  ease-in-out ${showFilter ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    {filter}
                </div>
                {multiSelect && selectedRows.length > 0 && onRowSelect && (onMultiDelete || onMultiRestore) && (
                    <MultiActions
                        {...(onMultiDelete && { onMultiDelete })}
                        {...(onMultiRestore && { onMultiRestore })}
                        {...(onMultiSendEmail && { onMultiSendEmail })}
                        selectedRows={selectedRows}
                        onClearSelection={() => {
                            setSelectedRows([]);
                            setSelectAll(false);
                            onRowSelect([]);
                        }}
                        variant="fixed"
                    />
                )}
                <Card className="px-4">
                    <Table ref={tableRef} className="rounded-t-md overflow-hidden">
                        <TableHeader className="select-none bg-slate-100">
                            <TableRow className="rounded-t-md">
                                {multiSelect && onRowSelect && (
                                    <TableCell className="p-2 bg-slate-200 rounded-tl-md">
                                        <Input
                                            type="checkbox"
                                            className="w-4 h-4 "
                                            checked={selectAll}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setSelectAll(checked);
                                                if (checked) {
                                                    setSelectedRows(data);
                                                    onRowSelect(data);
                                                } else {
                                                    setSelectedRows([]);
                                                    onRowSelect([]);
                                                }
                                            }}
                                        />
                                    </TableCell>
                                )}
                                {columns.map((col, index) => (
                                    <TableCell
                                        key={col.key}
                                        onClick={() => col.sortTable && handleSort(col.key)}
                                        className={`bg-slate-200 ${col.sortTable ? 'cursor-pointer hover:bg-slate-300' : ''} ${
                                            !multiSelect && index === 0 ? 'rounded-tl-md' : ''
                                        } ${
                                            index === columns.length - 1 ? 'rounded-tr-md' : ''
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                        {col.header} {col.sortTable && renderSortIcon(col.key)}
                                        </span>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + (multiSelect && onRowSelect ? 1 : 0)} className="text-center text-black py-8">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                            <span>Loading</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : data.length > 0 ? (
                                data.map((row, idx) => (
                                    <TableRow
                                        key={idx}
                                        className={`${idx % 2 === 0 ? 'bg-gray-100' : 'bg-white'} ${(row as { isDeleted?: boolean }).isDeleted ? 'bg-red-300 hover:bg-red-400 text-white' : ''}`}
                                    >
                                        {multiSelect && onRowSelect && (
                                            <TableCell className="p-2">
                                                <Input
                                                    type="checkbox"
                                                    className="w-4 h-4"
                                                    checked={selectedRows.includes(row)}
                                                    onChange={() => handleRowSelect(row)}
                                                />
                                            </TableCell>
                                        )}
                                        {columns.map((col) => (
                                            <TableCell key={col.key} className="text-black">
                                                {renderCellContent(row[col.key as keyof T], col.key)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length + (multiSelect && onRowSelect ? 1 : 0)} className="text-center text-black">
                                        No data available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                </Card>
                <div className="flex justify-between items-center">
                    <div>
                        <div className=" text-sm text-[#687182] p-2 font-medium">{startItem}-{endItem} of {totalRows}</div>
                    </div>
                    <div>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>

                    <div className="space-x-4 flex flex-row">
                        <div className="mr-10 flex flex-row items-center">
                            <span className="whitespace-nowrap">Rows per page</span>
                            <Select value={rowsPerPage.toString()} onValueChange={(value: string) => onRowsPerPageChange(Number(value))}>
                                <SelectTrigger className="ml-2 border border-gray-300 rounded px-2 py-1">
                                    <SelectValue placeholder={rowsPerPage} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="15">15</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            variant="outline"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
});