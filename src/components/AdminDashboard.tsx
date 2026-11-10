import React, { useState } from 'react';
import { Unit } from '../types/assessment';
import { InfographicLesson } from '../types/infographic';
import { InfographicGenerator } from '../services/InfographicGenerator';

interface AdminDashboardProps {
  units: Unit[];
  onPreviewLesson: (lessonId: string) => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  units,
  onPreviewLesson,
  onClose,
}) => {
  const [infographics, setInfographics] = useState<InfographicLesson[]>(() =>
    InfographicGenerator.getAllInfographics()
  );

  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const [loadingUnitId, setLoadingUnitId] = useState<number | null>(null);
  const [adminApiKey, setAdminApiKey] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Edit modal state
  const [editingLesson, setEditingLesson] = useState<InfographicLesson | null>(null);
  const [editCentralTitle, setEditCentralTitle] = useState<string>('');
  const [editMainIdea, setEditMainIdea] = useState<string>('');

  const refreshList = () => {
    setInfographics(InfographicGenerator.getAllInfographics());
  };

  // Generate for single lesson
  const handleGenerateLesson = async (lessonId: string) => {
    setLoadingLessonId(lessonId);
    setFeedbackMessage(null);
    try {
      await InfographicGenerator.generateInfographicForLesson(lessonId, adminApiKey || undefined);
      refreshList();
      setFeedbackMessage(`تم توليد وتحديث إنفوجرافيك الدرس (${lessonId}) بنجاح.`);
    } catch (e: any) {
      console.error(e);
      setFeedbackMessage(`حدث خطأ أثناء التوليد: ${e.message || e}`);
    } finally {
      setLoadingLessonId(null);
    }
  };

  // Generate for entire unit
  const handleGenerateUnit = async (unitId: number) => {
    setLoadingUnitId(unitId);
    setFeedbackMessage(null);
    try {
      await InfographicGenerator.generateInfographicsForUnit(unitId, adminApiKey || undefined);
      refreshList();
      setFeedbackMessage(`تم توليد وتحديث كافة إنفوجرافيك دروس الوحدة ${unitId} بنجاح.`);
    } catch (e: any) {
      console.error(e);
      setFeedbackMessage(`حدث خطأ أثناء توليد الوحدة: ${e.message || e}`);
    } finally {
      setLoadingUnitId(null);
    }
  };

  // Approve for students
  const handleApprove = (lessonId: string) => {
    InfographicGenerator.approveInfographic(lessonId, 'الموجه العام المعتمد');
    refreshList();
    setFeedbackMessage(`تم اعتماد ونشر إنفوجرافيك الدرس (${lessonId}) للطلاب.`);
  };

  // Open edit modal
  const handleOpenEdit = (info: InfographicLesson) => {
    setEditingLesson(info);
    setEditCentralTitle(info.mainConcept.centralTitle);
    setEditMainIdea(info.mainConcept.mainIdea);
  };

  // Save edit
  const handleSaveEdit = () => {
    if (!editingLesson) return;
    const updated: InfographicLesson = {
      ...editingLesson,
      mainConcept: {
        ...editingLesson.mainConcept,
        centralTitle: editCentralTitle,
        mainIdea: editMainIdea,
      },
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    InfographicGenerator.saveInfographic(updated);
    refreshList();
    setEditingLesson(null);
    setFeedbackMessage('تم حفظ تعديلات الإنفوجرافيك بنجاح.');
  };

  // Reset to textbook master
  const handleResetDefaults = () => {
    if (confirm('هل أنت متأكد من استعادة النسخة الأصلية المعتمدة لجميع الإنفوجرافيك؟')) {
      InfographicGenerator.resetToDefault();
      refreshList();
      setFeedbackMessage('تمت استعادة الإنفوجرافيك الأصلي المعتمد لجميع الدروس.');
    }
  };

  const totalCount = infographics.length;
  const publishedCount = infographics.filter(i => i.status === 'published').length;
  const reviewCount = infographics.filter(i => i.status === 'review').length;

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-400 text-amber-950 font-black text-xs rounded-full">
              ⚙️ لوحة المعلم والمشرف الأكاديمي
            </span>
            <span className="text-xs text-slate-400 font-bold">
              نظام توليد وإدارة الإنفوجرافيك (NotebookLM Engine)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            إدارة إنفوجرافيك المنهج الدراسي
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            متابعة حالة التغطية، التوليد بالذكاء الاصطناعي، ومراجعة واعتماد اللوحات البصرية قبل النشر للطلاب
          </p>
        </div>

        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>← العودة لـ "ذاكر لي"</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
          <span>✓ {feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-700 hover:text-emerald-950">
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500">إجمالي الدروس والوحدات</span>
          <div className="text-2xl font-black text-slate-900">{totalCount} موديول</div>
          <span className="text-[11px] text-emerald-700 font-bold">تغطية 100% لكتاب الوزارة</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500">منشور ومعتمد للطلاب</span>
          <div className="text-2xl font-black text-emerald-600">{publishedCount} درس</div>
          <span className="text-[11px] text-slate-500">متاح فوراً بلا إنترنت وبلا API</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500">قيد المراجعة / مسودة</span>
          <div className="text-2xl font-black text-amber-600">{reviewCount} درس</div>
          <span className="text-[11px] text-amber-700">تتطلب اعتماد المشرف</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500">محرك التوليد النشط</span>
          <div className="text-base font-black text-blue-700">Local + Gemini AI</div>
          <span className="text-[11px] text-slate-500">خوارزمية استخراج محلية معتمدة</span>
        </div>
      </div>

      {/* Admin Settings & Optional API Key */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🔑</span>
            <h4 className="text-xs font-black text-slate-800">
              إعدادات توليد المشرف (اختياري للمعلمين فقط):
            </h4>
          </div>
          <button
            onClick={handleResetDefaults}
            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-xl transition-all cursor-pointer"
          >
            استعادة النسخة الأصلية المعتمدة لجميع الدروس
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="password"
            value={adminApiKey}
            onChange={(e) => setAdminApiKey(e.target.value)}
            placeholder="مفتاح Gemini API للمشرف (اختياري - النظام يعمل محلياً بنسبة 100% بدون أي مفتاح)..."
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-[11px] text-slate-500">
            * الطلاب لا يحتاجون أي مفتاح نهائياً للمذاكرة والأسئلة والإنفوجرافيك.
          </span>
        </div>
      </div>

      {/* Table of all Units and Lessons */}
      <div className="space-y-6">
        {units.map((unit) => {
          const unitInfographics = infographics.filter(i => i.unitId === unit.id);
          const isUnitLoading = loadingUnitId === unit.id;

          return (
            <div key={unit.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Unit Header Bar */}
              <div className="bg-slate-100/90 p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-black text-blue-700 uppercase">الوحدة {unit.id}</span>
                  <h3 className="text-base font-black text-slate-900">{unit.title}</h3>
                  <p className="text-xs text-slate-500">{unit.subtitle}</p>
                </div>

                <button
                  disabled={isUnitLoading}
                  onClick={() => handleGenerateUnit(unit.id)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isUnitLoading ? '⏳' : '⚡'}</span>
                  <span>{isUnitLoading ? 'جاري توليد الوحدة...' : 'توليد إنفوجرافيك الوحدة كاملاً'}</span>
                </button>
              </div>

              {/* Lessons Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-3 sm:p-4">الدرس والموديول</th>
                      <th className="p-3 sm:p-4">الصفحات</th>
                      <th className="p-3 sm:p-4">النمط البصري</th>
                      <th className="p-3 sm:p-4">حالة النشر</th>
                      <th className="p-3 sm:p-4">المعتمد</th>
                      <th className="p-3 sm:p-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unit.lessons.map((lesson) => {
                      const info = unitInfographics.find(i => i.lessonId === lesson.id);
                      const isLessonLoading = loadingLessonId === lesson.id;

                      return (
                        <tr key={lesson.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 sm:p-4 font-bold text-slate-900">
                            <div>{lesson.title}</div>
                            {info && (
                              <div className="text-[11px] text-slate-500 font-normal truncate max-w-xs">
                                {info.mainConcept.centralTitle}
                              </div>
                            )}
                          </td>

                          <td className="p-3 sm:p-4 text-slate-600">
                            {info?.pagesRange || '—'}
                          </td>

                          <td className="p-3 sm:p-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                              {info?.format === 'geographical_map' && '🗺️ خريطة جغرافية'}
                              {info?.format === 'timeline' && '⏳ خط زمني'}
                              {info?.format === 'comparison' && '⚖️ مقارنة بصرية'}
                              {info?.format === 'mindmap' && '🧠 خريطة ذهنية'}
                              {info?.format === 'comprehensive_board' && '🎨 لوحة شاملة'}
                            </span>
                          </td>

                          <td className="p-3 sm:p-4">
                            {info?.status === 'published' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                                <span>✓</span>
                                <span>منشور للطلاب</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                                <span>⏳</span>
                                <span>قيد المراجعة</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3 sm:p-4 text-[11px] text-slate-500">
                            <div>{info?.approvedBy || '—'}</div>
                            <div className="text-[10px] text-slate-400">{info?.lastUpdated}</div>
                          </td>

                          <td className="p-3 sm:p-4">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => onPreviewLesson(lesson.id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-all cursor-pointer"
                                title="معاينة اللوحة"
                              >
                                👁️ معاينة
                              </button>

                              {info && (
                                <button
                                  onClick={() => handleOpenEdit(info)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-all cursor-pointer"
                                  title="تعديل الملاحظات"
                                >
                                  ✏️ تعديل
                                </button>
                              )}

                              <button
                                disabled={isLessonLoading}
                                onClick={() => handleGenerateLesson(lesson.id)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-lg text-[11px] transition-all cursor-pointer disabled:opacity-50"
                                title="إعادة توليد بالذكاء الاصطناعي"
                              >
                                {isLessonLoading ? 'جاري...' : '⚡ توليد'}
                              </button>

                              {info?.status !== 'published' && (
                                <button
                                  onClick={() => handleApprove(lesson.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-all cursor-pointer"
                                  title="اعتماد ونشر للطلاب"
                                >
                                  ✓ اعتماد
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-black text-slate-900">
                تعديل إنفوجرافيك: {editingLesson.lessonTitle}
              </h4>
              <button
                onClick={() => setEditingLesson(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">العنوان المركزي:</label>
                <input
                  type="text"
                  value={editCentralTitle}
                  onChange={(e) => setEditCentralTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الفكرة المحورية:</label>
                <textarea
                  rows={4}
                  value={editMainIdea}
                  onChange={(e) => setEditMainIdea(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingLesson(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-blue-700 text-white text-xs font-bold rounded-xl hover:bg-blue-800"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
