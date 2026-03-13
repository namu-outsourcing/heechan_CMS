import { useEffect, useState } from "react";
import { useCustomerStore } from "../hooks/useCustomers";
import { useVisitStore } from "../hooks/useVisits";
import { CustomerWithLastVisit } from "../types";
import CustomerTable from "../components/customers/CustomerTable";
import CustomerModal from "../components/customers/CustomerModal";
import CustomerHistoryModal from "../components/customers/CustomerHistoryModal";
import NaverImportModal from "../components/customers/NaverImportModal";
import { Search, Plus, FileSpreadsheet } from "lucide-react";

export default function Customers() {
  const {
    customers,
    isLoading,
    error,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomerStore();

  const { fetchVisits } = useVisitStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerWithLastVisit | null>(null);

  // 네이버 임포트 모달 상태
  const [isNaverImportModalOpen, setIsNaverImportModalOpen] = useState(false);

  // 히스토리 모달 관련 상태
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithLastVisit | null>(null);

  useEffect(() => {
    fetchCustomers();
    fetchVisits();
  }, [fetchCustomers, fetchVisits]);

  // 프론트엔드 단 검색 (단순 필터링)
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.includes(searchTerm) ||
      (c.phone || "").replace(/-/g, "").includes(searchTerm.replace(/-/g, "")),
  );

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: CustomerWithLastVisit) => {
    setEditingCustomer(c);
    setIsModalOpen(true);
  };

  const handleCustomerClick = (c: CustomerWithLastVisit) => {
    setSelectedCustomer(c);
    setIsHistoryModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingCustomer) {
      const success = await updateCustomer(editingCustomer.id, data);
      if (success) fetchCustomers();
      return success;
    } else {
      const success = await addCustomer(data);
      if (success) fetchCustomers();
      return success;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">고객 관리</h2>
          <p className="text-sm text-gray-500 mt-1">
            고객 명단을 클릭하여 상세 방문 내역을 확인하거나 정보를 수정하세요.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsNaverImportModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-5 h-5 mr-1 text-green-600" />
            네이버 임포트
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-1" />
            고객 등록
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          데이터를 불러오는데 실패했습니다: {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 w-full max-w-sm">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="이름 또는 연락처 검색..."
            className="w-full bg-transparent border-none outline-none text-gray-700 focus:ring-0 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <CustomerTable
              customers={filteredCustomers}
              onEdit={handleOpenEditModal}
              onDelete={deleteCustomer}
              onCustomerClick={handleCustomerClick}
            />
          )}
        </div>
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingCustomer}
      />

      <CustomerHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        customer={selectedCustomer}
      />

      <NaverImportModal
        isOpen={isNaverImportModalOpen}
        onClose={() => setIsNaverImportModalOpen(false)}
      />
    </div>
  );
}
