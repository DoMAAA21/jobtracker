
interface ExportImportDropdownProps {
    exportCSV?: () => void;
    importCSV?: () => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export const ExportImportDropdown = ({ exportCSV, importCSV, dropdownRef }: ExportImportDropdownProps) => {

    return (
        <div ref={dropdownRef} className="absolute left-0 top-28 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
            <ul className="py-1">
                {exportCSV && (
                    <li
                        onClick={exportCSV}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                        Export CSV Template
                    </li>
                )}
                {importCSV && (
                    <li
                        onClick={importCSV}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                        Import CSV
                    </li>
                )}
            </ul>
        </div>
    );
};