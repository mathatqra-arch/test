'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase-browser';
import Navbar from '@/components/Navbar';
import {
  FileText, Trash2, Calendar, Palette,
  Shirt, ArrowRight, AlertCircle, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

interface Report {
  id: string;
  created_at: string;
  report?: Record<string, unknown>;
  report_data?: Record<string, unknown>;
}

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDark, setIsDark] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // قراءة اللغة والثيم
  useEffect(() => {
    const savedLang = (localStorage.getItem('glow-lang') as 'ar' | 'en') || 'ar';
    const savedDark = localStorage.getItem('glow-theme') === 'dark';
    setLang(savedLang);
    setIsDark(savedDark);
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    if (savedDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/reports');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) fetchReports();
  }, [user, authLoading]);

  const fetchReports = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // نجرب نجيب بـ user_id
      const { data, error } = await supabase
        .from('reports')
        .select('id, created_at, report, report_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch reports error:', error);
        setReports([]);
        return;
      }
      setReports(data || []);
    } catch (err) {
      console.error('Reports fetch error:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id: string) => {
    const msg = lang === 'ar' ? 'هل أنت متأكد من حذف هذا التقرير؟' : 'Delete this report?';
    if (!confirm(msg)) return;
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (!error) setReports(prev => prev.filter(r => r.id !== id));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  const getData = (r: Report) => r.report || r.report_data || {};

  const handleLangChange = (newLang: 'ar' | 'en') => {
    setLang(newLang);
    localStorage.setItem('glow-lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleThemeToggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('glow-theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="gold-spinner w-10 h-10" />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar lang={lang} onLangChange={handleLangChange} isDark={isDark} onThemeToggle={handleThemeToggle} />

      <div className="pt-24 sm:pt-28 pb-12 px-4 flex-1">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className={`flex items-center gap-3 mb-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-[var(--gold-primary)]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[var(--gold-primary)]" />
              </div>
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <p className={`text-sm text-[var(--gold-primary)] font-semibold ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {lang === 'ar' ? 'تقاريري' : 'My Reports'}
                </p>
                <h1 className={`text-2xl sm:text-3xl font-bold ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {lang === 'ar' ? 'تقارير التحليل المحفوظة' : 'Saved Style Reports'}
                </h1>
              </div>
            </div>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="gold-spinner w-10 h-10" />
              <p className={`text-muted-foreground ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {lang === 'ar' ? 'جاري تحميل تقاريرك…' : 'Loading your reports…'}
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && reports.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className={`text-lg font-bold mb-2 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {lang === 'ar' ? 'لا توجد تقارير بعد' : 'No reports yet'}
              </h2>
              <p className={`text-muted-foreground mb-6 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {lang === 'ar' ? 'ابدأ تحليل أسلوبك الشخصي الآن' : 'Start your personal style analysis now'}
              </p>
              <button
                onClick={() => router.push('/start-analysis')}
                className="btn-gold px-8 py-4 inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span className={lang === 'ar' ? 'font-arabic' : ''}>
                  {lang === 'ar' ? 'ابدأ التحليل' : 'Start Analysis'}
                </span>
                <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </motion.div>
          )}

          {/* Reports List */}
          {!loading && reports.length > 0 && (
            <div className="space-y-4">
              <AnimatePresence>
                {reports.map((report, i) => {
                  const data = getData(report) as Record<string, unknown>;
                  const dna = (data.styleDNA || {}) as Record<string, unknown>;
                  const score = (data.styleScore || {}) as Record<string, unknown>;
                  const isExpanded = expandedId === report.id;

                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.07, duration: 0.35 }}
                      className="glass-card rounded-2xl overflow-hidden border border-border"
                    >
                      {/* Report Header */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : report.id)}
                        className={`w-full p-5 flex items-center justify-between gap-4 hover:bg-[var(--gold-primary)]/5 transition-colors ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`flex items-center gap-4 flex-1 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                          {/* Icon */}
                          <div className="w-12 h-12 rounded-xl bg-[var(--gold-primary)]/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-6 h-6 text-[var(--gold-primary)]" />
                          </div>

                          {/* Info */}
                          <div className={`flex-1 min-w-0 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div className={`flex items-center gap-2 flex-wrap mb-1 ${lang === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
                              {dna.kibbeType && (
                                <span className="px-2 py-0.5 rounded-full bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] text-xs font-medium">
                                  {String(dna.kibbeType)}
                                </span>
                              )}
                              {dna.colorSeason && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-xs font-medium">
                                  {String(dna.colorSeason)}
                                </span>
                              )}
                              {score.finalScore && (
                                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-bold">
                                  {String(score.finalScore)}/10
                                </span>
                              )}
                            </div>
                            <div className={`flex items-center gap-1.5 text-sm text-muted-foreground ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                              <Calendar className="w-3.5 h-3.5" />
                              <span className={lang === 'ar' ? 'font-arabic' : ''}>{formatDate(report.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className={`flex items-center gap-2 shrink-0 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteReport(report.id); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          }
                        </div>
                      </button>

                      {/* Expanded Content */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 border-t border-border pt-4">
                              <div className="grid sm:grid-cols-3 gap-3">
                                {/* Body Shape */}
                                {(data.bodyAnalysis as Record<string, unknown>)?.shape && (
                                  <div className={`glass rounded-xl p-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                    <div className={`flex items-center gap-2 mb-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                      <Shirt className="w-4 h-4 text-[var(--gold-primary)]" />
                                      <p className={`text-xs text-muted-foreground ${lang === 'ar' ? 'font-arabic' : 'uppercase tracking-wider'}`}>
                                        {lang === 'ar' ? 'شكل الجسم' : 'Body Shape'}
                                      </p>
                                    </div>
                                    <p className={`font-semibold ${lang === 'ar' ? 'font-arabic' : ''}`}>
                                      {String((data.bodyAnalysis as Record<string, unknown>)?.shape || '')}
                                    </p>
                                  </div>
                                )}
                                {/* Color Season */}
                                {dna.colorSeason && (
                                  <div className={`glass rounded-xl p-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                    <div className={`flex items-center gap-2 mb-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                      <Palette className="w-4 h-4 text-[var(--gold-primary)]" />
                                      <p className={`text-xs text-muted-foreground ${lang === 'ar' ? 'font-arabic' : 'uppercase tracking-wider'}`}>
                                        {lang === 'ar' ? 'موسم الألوان' : 'Color Season'}
                                      </p>
                                    </div>
                                    <p className="font-semibold">{String(dna.colorSeason)}</p>
                                  </div>
                                )}
                                {/* Kibbe */}
                                {dna.kibbeType && (
                                  <div className={`glass rounded-xl p-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                    <div className={`flex items-center gap-2 mb-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                      <Sparkles className="w-4 h-4 text-[var(--gold-primary)]" />
                                      <p className={`text-xs text-muted-foreground ${lang === 'ar' ? 'font-arabic' : 'uppercase tracking-wider'}`}>
                                        {lang === 'ar' ? 'نوع كيبي' : 'Kibbe Type'}
                                      </p>
                                    </div>
                                    <p className="font-semibold">{String(dna.kibbeType)}</p>
                                  </div>
                                )}
                              </div>
                              {/* Action */}
                              <div className={`mt-4 flex ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}>
                                <button
                                  onClick={() => router.push('/start-analysis')}
                                  className={`inline-flex items-center gap-2 text-sm text-[var(--gold-primary)] hover:underline ${lang === 'ar' ? 'flex-row-reverse font-arabic' : ''}`}
                                >
                                  {lang === 'ar' ? 'تحليل جديد' : 'New Analysis'}
                                  <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <footer className="py-6 border-t border-border px-4 mt-auto">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">© 2025 Glow Up AI</p>
        </div>
      </footer>
    </main>
  );
}
