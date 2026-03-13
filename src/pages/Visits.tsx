import { useEffect, useState } from "react";
import { useVisitStore, VisitWithCustomer } from "../hooks/useVisits";
import { VisitSaveData } from "../types";
import VisitTable from "../components/visits/VisitTable";
import VisitModal from "../components/visits/VisitModal";
import NaverImportModal from "../components/customers/NaverImportModal";
import { Plus, FileSpreadsheet } from "lucide-react";

export default function Visits() {
  const {
    visits,
    isLoading,
    error,
    fetchVisits,
    addVisit,
    updateVisit,
    deleteVisit,
  } = useVisitStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitWithCustomer | null>(
    null,
  );

  const [isNaverModalOpen, setIsNaverModalOpen] = useState(false);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleOpenAddModal = () => {
    setEditingVisit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: VisitWithCustomer) => {
    setEditingVisit(v);
    setIsModalOpen(true);
  };

  const handleSave = async (data: VisitSaveData) => {
    if (editingVisit) {
      return await updateVisit(editingVisit.id, data);
    } else {
      return await addVisit(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">방문 기록</h2>
          <p className="text-sm text-gray-500 mt-1">
            고객의 방문, 결제 및 구체적인 시술 내역을 기록합니다.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsNaverModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-5 h-5 mr-1 text-green-600" />
            네이버 불러오기
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-1" />
            방문 기록 추가
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          데이터를 불러오는데 실패했습니다: {error}
        </div>
      )}

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <VisitTable
            visits={visits}
            onEdit={handleOpenEditModal}
            onDelete={deleteVisit}
          />
        )}
      </div>

      <VisitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingVisit}
      />

      <NaverImportModal
        isOpen={isNaverModalOpen}
        onClose={() => setIsNaverModalOpen(false)}
      />
    </div>
  );
}
