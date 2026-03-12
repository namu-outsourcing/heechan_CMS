import { useEffect, useState } from "react";
import { useServiceStore } from "../hooks/useServices";
import { ServiceCategory } from "../types";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

export default function Settings() {
  const {
    services,
    isLoading,
    fetchServices,
    addService,
    updateService,
    deleteService,
  } = useServiceStore();

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    const ok = await addService({ name: newName, price: parseInt(newPrice) });
    if (ok) {
      setNewName("");
      setNewPrice("");
      fetchServices();
    }
  };

  const startEdit = (s: ServiceCategory) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditPrice(s.price.toString());
  };

  const handleUpdate = async (id: string) => {
    await updateService(id, { name: editName, price: parseInt(editPrice) });
    setEditingId(null);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("이 시술 항목을 삭제하시겠습니까?")) return;
    await deleteService(id);
    fetchServices();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">시스템 설정</h2>
        <p className="text-sm text-gray-500 mt-1">
          방문 기록 시 선택할 시술 항목과 기본 금액을 관리합니다.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/60">
          <h3 className="font-semibold text-gray-800">시술 카테고리 관리</h3>
        </div>

        {/* 카테고리 목록 */}
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : services.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              등록된 시술 항목이 없습니다.
            </div>
          ) : (
            services.map((s) => (
              <div
                key={s.id}
                className="flex items-center px-5 py-3.5 hover:bg-gray-50 transition-colors group"
              >
                {editingId === s.id ? (
                  <>
                    <input
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none mr-2"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <input
                      type="number"
                      className="w-28 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none mr-2 text-right"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                    <span className="text-xs text-gray-400 mr-3">원</span>
                    <button
                      onClick={() => handleUpdate(s.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md mr-1"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-gray-800">
                      {s.name}
                    </span>
                    <span className="text-gray-500 text-sm mr-4">
                      {s.price.toLocaleString()}원
                    </span>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(s)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md mr-1"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* 새 항목 추가 폼 */}
        <form
          onSubmit={handleAdd}
          className="flex items-center gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/50"
        >
          <input
            type="text"
            placeholder="시술명 (예: 매직스트레이트)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="기본 금액"
            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-right"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            required
          />
          <span className="text-sm text-gray-400 shrink-0">원</span>
          <button
            type="submit"
            className="inline-flex items-center px-3.5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" /> 추가
          </button>
        </form>
      </div>
    </div>
  );
}
