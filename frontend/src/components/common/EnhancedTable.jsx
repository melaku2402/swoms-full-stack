import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import Loading from "./Loading";

const EnhancedTable = ({
  columns,
  data,
  loading = false,
  onRowClick,
  pagination,
  onPageChange,
  onSearch,
  onSort,
  onExport,
  onRefresh,
  searchPlaceholder = "Search...",
  showSearch = true,
  showExport = false,
  showRefresh = true,
  emptyMessage = "No data available",
  rowActions,
  selection,
  onSelectionChange,
  stickyHeader = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedRows, setSelectedRows] = useState(new Set());

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) onSearch(value);
  };

  const handleSort = (columnKey) => {
    let direction = "asc";
    if (sortColumn === columnKey && sortDirection === "asc") {
      direction = "desc";
    }
    setSortColumn(columnKey);
    setSortDirection(direction);
    if (onSort) onSort(columnKey, direction);
  };

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;

    if (e.target.checked) {
      const allIds = new Set(data.map((item) => item.id));
      setSelectedRows(allIds);
      onSelectionChange(Array.from(allIds));
    } else {
      setSelectedRows(new Set());
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id) => {
    if (!onSelectionChange) return;

    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  if (loading) {
    return <Loading message="Loading data..." />;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Toolbar */}
      {(showSearch || showExport || showRefresh) && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {showSearch && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              {showRefresh && onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="Refresh"
                >
                  <RefreshCw size={18} />
                </button>
              )}

              {showExport && onExport && (
                <button
                  onClick={onExport}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="Export"
                >
                  <Download size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead
            className={`bg-gray-50 ${stickyHeader ? "sticky top-0 z-10" : ""}`}
          >
            <tr>
              {selection && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === data.length && data.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && <Filter className="h-3 w-3" />}
                  </div>
                </th>
              ))}

              {rowActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (selection ? 1 : 0) + (rowActions ? 1 : 0)
                  }
                  className="px-6 py-12 text-center"
                >
                  <div className="text-gray-500">
                    <div className="mb-2">{emptyMessage}</div>
                    {onRefresh && (
                      <button
                        onClick={onRefresh}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Refresh
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`hover:bg-gray-50 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {selection && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                  )}

                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 ${
                        column.nowrap ? "whitespace-nowrap" : ""
                      }`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] || "-"}
                    </td>
                  ))}

                  {rowActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div
                        className="flex items-center space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {rowActions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{pagination.from}</span> to{" "}
              <span className="font-medium">{pagination.to}</span> of{" "}
              <span className="font-medium">{pagination.total}</span> results
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {(() => {
                const pages = [];
                const maxVisible = 5;
                let start = Math.max(
                  1,
                  pagination.currentPage - Math.floor(maxVisible / 2)
                );
                let end = Math.min(
                  pagination.totalPages,
                  start + maxVisible - 1
                );

                if (end - start + 1 < maxVisible) {
                  start = Math.max(1, end - maxVisible + 1);
                }

                for (let i = start; i <= end; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => onPageChange(i)}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${
                        pagination.currentPage === i
                          ? "bg-primary-600 text-white border-primary-600"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}

              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTable;
