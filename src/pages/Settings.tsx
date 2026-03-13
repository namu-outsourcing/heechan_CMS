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
    <div className="space-y-8 transition-colors">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 transition-colors">시스템 설정</h2>
        <p className="text-sm text-gray-500 dark:text-slate-500 mt-1 transition-colors">
          방문 기록 시 선택할 시술 항목과 기본 금액을 관리합니다.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 transition-colors">
          <h3 className="font-semibold text-gray-800 dark:text-slate-200">시술 카테고리 관리</h3>
        </div>

        {/* 카테고리 목록 */}
        <div className="divide-y divide-gray-100 dark:divide-slate-800 transition-colors">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400" />
            </div>
          ) : services.length === 0 ? (
            <div className="py-10 text-center text-gray-400 dark:text-slate-600 text-sm">
              등록된 시술 항목이 없습니다.
            </div>
          ) : (
            services.map((s) => (
              <div
                key={s.id}
                className="flex items-center px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {editingId === s.id ? (
                  <>
                    <input
                      className="flex-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none mr-2 text-gray-900 dark:text-slate-100 transition-colors"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <input
                      type="number"
                      className="w-28 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none mr-2 text-right text-gray-900 dark:text-slate-100 transition-colors"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                    <span className="text-xs text-gray-400 dark:text-slate-500 mr-3">원</span>
                    <button
                      onClick={() => handleUpdate(s.id)}
                      className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md mr-1 transition-all"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-bold text-gray-800 dark:text-slate-200 transition-colors">
                      {s.name}
                    </span>
                    <span className="text-gray-500 dark:text-slate-400 text-sm mr-4 transition-colors">
                      {s.price.toLocaleString()}원
                    </span>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => startEdit(s)}
                        className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md mr-1 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-rose-900/20 rounded-md transition-all"
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
          className="flex items-center gap-2 px-5 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 transition-colors"
        >
          <input
            type="text"
            placeholder="시술명 (예: 매직스트레이트)"
            className="flex-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-slate-100 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-600"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="기본 금액"
            className="w-32 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-right text-gray-900 dark:text-slate-100 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-600"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            required
          />
          <span className="text-sm text-gray-400 dark:text-slate-500 shrink-0">원</span>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-1" /> 추가
          </button>
        </form>
      </div>
    </div>
  );
}
