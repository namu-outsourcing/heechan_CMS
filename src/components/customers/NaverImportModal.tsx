import React, { useState } from "react";
import * as XLSX from "xlsx";
import { X, FileSpreadsheet, Key, AlertCircle, CheckCircle2, UserPlus, RefreshCw } from "lucide-react";
import { useCustomerStore } from "../../hooks/useCustomers";
import { useVisitStore } from "../../hooks/useVisits";
import { Customer } from "../../types";

interface NaverRecord {
  name: string;
  phone: string;
  serviceName: string;
  visitedAt: string;
  amount: number;
}

interface MappingResult {
  record: NaverRecord;
  matchedCustomer: Customer | null;
  status: "match" | "new" | "ambiguous" | "duplicate";
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NaverImportModal({ isOpen, onClose }: Props) {
  const { customers, fetchCustomers } = useCustomerStore();
  const { addVisit, visits, fetchVisits } = useVisitStore();

  const [file, setFile] = useState<File | null>(null);
  const [naverId, setNaverId] = useState("");
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [mappings, setMappings] = useState<MappingResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processExcel = async () => {
    if (!file || !naverId) return alert("파일과 네이버 ID(비밀번호)를 입력해주세요.");

    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      // xlsx 라이브러리로 암호화된 파일 읽기 시도
      const workbook = XLSX.read(data, { password: naverId });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json<any>(worksheet);

      // 네이버 엑셀 컬럼 매핑 (추정: 네이버 엑셀 양식에 맞게 조정 필요)
      // 실제 네이버 엑셀 헤더명을 기준으로 파싱 로직 작성
      const parsedRecords: NaverRecord[] = json.map((row) => ({
        name: row["예약자명"] || row["주문자명"] || "",
        phone: row["연락처"] || "",
        serviceName: row["상품명"] || row["서비스명"] || "기타",
        visitedAt: row["이용완료일시"] || row["방문일시"] || new Date().toISOString(),
        amount: parseInt(row["결제금액"] || "0"),
      })).filter(r => r.name);

      // 기존 고객과 매핑 로직
      const results: MappingResult[] = parsedRecords.map(record => {
        const last4 = record.phone.replace(/[^0-9]/g, "").slice(-4);
        const recordDate = record.visitedAt.split(' ')[0]; // "2026-03-10"
        
        // 1. 이름 + 번호 끝 4자리 완전 일치 검색
        const match = customers.find(c => {
          const cPhoneLast4 = (c.phone || "").replace(/[^0-9]/g, "").slice(-4);
          return c.name === record.name && cPhoneLast4 === last4;
        });

        // 2. 중복 방문 기록 체크 (같은 날짜 + 같은 고객ID)
        const isDuplicate = match && visits.some(v => {
          // 네이버 엑셀 날짜 형식이 2026-03-10 또는 2026.03.10 등 다양할 수 있으므로 정규화 처리
          const normRecordDate = recordDate.replace(/[^0-9]/g, "");
          const normVDate = v.visited_at.replace(/[^0-9]/g, "").slice(0, 8);
          return v.customer_id === match.id && normVDate === normRecordDate;
        });

        return {
          record,
          matchedCustomer: match || null,
          status: isDuplicate ? "duplicate" : (match ? "match" : "new")
        };
      });

      setMappings(results);
      setStep("preview");
    } catch (error) {
      console.error(error);
      alert("엑셀 파일을 읽는 중 오류가 발생했습니다. 비밀번호(네이버 ID)가 맞는지 확인해주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    let successCount = 0;
    let skipCount = 0;

    for (const m of mappings) {
      if (m.status === "duplicate") {
        skipCount++;
        continue;
      }

      try {
        let customerId = m.matchedCustomer?.id;

        // 신규 고객인 경우 생성
        if (!customerId) {
          const { supabase } = await import("../../lib/supabase");
          const { data: newCustomer } = await supabase
            .from("customers")
            .insert({ name: m.record.name, phone: m.record.phone })
            .select()
            .single();
          customerId = newCustomer?.id;
        }

        if (customerId) {
          await addVisit({
            customer_id: customerId,
            visited_at: m.record.visitedAt,
            payment_amount: m.record.amount,
            payment_method: "card", // 네이버 예약은 보통 선결제/카드
            services: [m.record.serviceName],
            memo: "네이버 예약 자동 임포트"
          });
          successCount++;
        }
      } catch (e) {
        console.error("Import error for record:", m.record.name, e);
      }
    }

    alert(`${successCount}건의 데이터가 성공적으로 임포트되었습니다.${skipCount > 0 ? `\n(중복된 ${skipCount}건은 제외되었습니다.)` : ""}`);
    fetchCustomers();
    fetchVisits();
    onClose();
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 shrink-0 transition-colors">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center">
              <FileSpreadsheet className="w-6 h-6 mr-2 text-green-600 dark:text-green-500" />
              네이버 예약 엑셀 임포트
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-wider">스마트플레이스의 예약 정보를 통합합니다.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800">
          {step === "upload" ? (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl flex items-start transition-colors">
                <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                  네이버 엑셀 파일은 개인정보 보호를 위해 **네이버 로그인 ID**로 암호화되어 있습니다. 정확한 파싱을 위해 엑셀을 다운로드할 때 로그인했던 ID를 입력해주세요.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-slate-300 ml-1 transition-colors">네이버 ID (엑셀 비밀번호)</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <input 
                      type="text"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 text-gray-900 dark:text-white transition-all font-bold placeholder:text-gray-400 dark:placeholder:text-slate-600"
                      placeholder="예: naver_id_123"
                      value={naverId}
                      onChange={(e) => setNaverId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-slate-300 ml-1 transition-colors">엑셀 파일 선택</label>
                  <div className="border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-all group cursor-pointer relative">
                    <input 
                      type="file" 
                      accept=".xlsx, .xls"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="w-7 h-7 text-green-600 dark:text-green-500" />
                    </div>
                    <p className="text-sm font-black text-gray-700 dark:text-slate-200">{file ? file.name : "컴퓨터에서 파일 찾기"}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 font-medium">네이버에서 다운로드한 .xlsx 파일</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-gray-800 dark:text-slate-100 transition-colors">임포트 데이터 확인 ({mappings.length}건)</h4>
                <div className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">Preview Mode</div>
              </div>
              
              <div className="space-y-3">
                {mappings.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl group hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black mr-4 ${
                        m.status === 'match' ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                      }`}>
                        {m.record.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 dark:text-white transition-colors">
                          {m.record.name}
                          <span className="ml-2 text-xs text-gray-400 dark:text-slate-500 font-bold">{m.record.phone}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 font-bold uppercase truncate max-w-[200px] transition-colors">
                          {m.record.serviceName} | {m.record.visitedAt.split(' ')[0]}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {m.status === 'duplicate' ? (
                        <div className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-slate-900 text-gray-500 dark:text-slate-500 rounded-xl border border-transparent dark:border-slate-800 transition-colors">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                          <span className="text-[10px] font-black">중복 (Skip)</span>
                        </div>
                      ) : m.status === 'match' ? (
                        <div className="flex items-center px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-900/30 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          <span className="text-[10px] font-black">기존 고객</span>
                        </div>
                      ) : (
                        <div className="flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/30 transition-colors">
                          <UserPlus className="w-3.5 h-3.5 mr-1" />
                          <span className="text-[10px] font-black">신규 생성</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex space-x-4 bg-gray-50/50 dark:bg-slate-800/40 transition-colors shrink-0">
          {step === "upload" ? (
            <button
              onClick={processExcel}
              disabled={isProcessing || !file || !naverId}
              className="w-full py-4 bg-gray-900 dark:bg-blue-600 text-white font-black rounded-2xl hover:bg-black dark:hover:bg-blue-500 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center"
            >
              {isProcessing ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : null}
              {isProcessing ? "분석 중..." : "엑셀 데이터 분석하기"}
            </button>
          ) : (
            <>
              <button
                onClick={() => setStep("upload")}
                disabled={isProcessing}
                className="flex-1 py-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-black rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                다시 선택
              </button>
              <button
                onClick={handleImport}
                disabled={isProcessing}
                className="flex-[2] py-4 bg-green-600 dark:bg-green-500 text-white font-black rounded-2xl hover:bg-green-700 dark:hover:bg-green-600 transition-all shadow-xl active:scale-95 flex items-center justify-center px-8"
              >
                {isProcessing ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : null}
                {isProcessing ? "저장 중..." : "데이터 일괄 저장하기"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
