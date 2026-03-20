'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase-browser';
import Navbar from '@/components/Navbar';
import {
  Shirt, Sparkles, TrendingUp, Zap, Award,
  Camera, Heart, ShoppingBag, ArrowRight, AlertCircle, RefreshCw
} from 'lucide-react';

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || '3e7ca4db-8ea5-4b29-95fa-f5252d96f87d';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  gender: string;
  color: string;
  style_tags: string;
  body_shapes?: string;
  color_palette?: string;
  matchingScore?: number;
}

export default function MyStylePage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDark, setIsDark] = useState(false);
  const [hasReport, setHasReport] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  // قراءة اللغة والثيم من localStorage
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
      router.push('/auth/login?redirect=/my-style');
    }
  }, [user, authLoading, router]);

  const loadStyleData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setErrorMsg('');

      // جيب آخر تقرير للمستخدم - بنجرب field name الاتنين
      const { data: reports, error: repErr } = await supabase
        .from('reports')
        .select('id, report, report_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (repErr) {
        console.error('Reports error:', repErr);
        setHasReport(false);
        return;
      }

      if (!reports || reports.length === 0) {
        setHasReport(false);
        return;
      }

      setHasReport(true);

      // دعم field name الاتنين
      const reportData = reports[0].report || reports[0].report_data;
      if (!reportData) {
        setHasReport(false);
        return;
      }

      // استخرج بيانات المستخدم
      const bestColors = (reportData?.colorAnalysis?.bestColors || []) as string[];
      const bodyShape = reportData?.bodyAnalysis?.shape || '';
      const colorSeason = reportData?.styleDNA?.colorSeason || reportData?.colorAnalysis?.season || '';
      const kibbeType = reportData?.styleDNA?.kibbeType || '';
      const styleArchetype = reportData?.styleDNA?.styleArchetype || '';

      // جيب المنتجات من المتجر فقط
      const { data: allProducts, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', STORE_ID)
        .eq('in_stock', true)
        .limit(60);

      if (prodErr || !allProducts) {
        setProducts([]);
        return;
      }

      // احسب score لكل منتج
      const scored = allProducts.map((product: Product) => {
        let score = 0;

        // مطابقة شكل الجسم (أعلى أولوية)
        if (bodyShape && product.body_shapes) {
          const shapes = product.body_shapes.split(',').map(s => s.trim().toLowerCase());
          if (shapes.some(s =>
            bodyShape.toLowerCase().includes(s) || s.includes(bodyShape.toLowerCase().split(' ')[0])
          )) score += 35;
        }

        // مطابقة الفصل اللوني
        if (colorSeason && product.color_palette) {
          const season = colorSeason.split(' ').pop() || colorSeason;
          if (product.color_palette.toLowerCase().includes(season.toLowerCase())) score += 25;
        }

        // مطابقة الألوان المفضلة
        const productColor = (product.color || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        if (bestColors.some((c: string) => {
          const colorName = c.toLowerCase().replace(/#[0-9a-f]+/gi, '').trim().split(' ')[0];
          return colorName.length > 2 && (productColor.includes(colorName) || productName.includes(colorName));
        })) score += 20;

        // مطابقة الستايل
        const productTags = (product.style_tags || '').toLowerCase();
        if (styleArchetype && productTags.includes(styleArchetype.toLowerCase().split(' ')[0])) score += 10;
        if (kibbeType && productTags.includes(kibbeType.toLowerCase().split(' ')[0])) score += 10;

        return { ...product, matchingScore: Math.min(score, 98) };
      });

      scored.sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0));
      setProducts(scored);

    } catch (err) {
      console.error('Error loading style data:', err);
      setErrorMsg(lang === 'ar' ? 'حدث خطأ في التحميل' : 'Loading error');
    } finally {
      setLoading(false);
    }
  }, [user, lang, supabase]);

  useEffect(() => {
    if (user && !authLoading) {
      loadStyleData();
    }
  }, [user, authLoading]);

  const getProductImage = (product: Product) =>
    product.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';

  const getMatchingColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-500/10';
    if (score >= 40) return 'text-[var(--gold-primary)] bg-[var(--gold-primary)]/10';
    return 'text-muted-foreground bg-muted';
  };

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

  // حساب متوسط الـ score بأمان
  const avgScore = products.length > 0
    ? Math.round(products.reduce((acc, p) => acc + (p.matchingScore || 0), 0) / products.length)
    : 0;

  // حالة التحميل الأولي للـ auth
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="gold-spinner w-12 h-12" />
      </main>
    );
  }

  // غير مسجل دخول
  if (!user) return null;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar
        lang={lang}
        onLangChange={handleLangChange}
        isDark={isDark}
        onThemeToggle={handleThemeToggle}
      />

      <div className="pt-24 sm:pt-28 pb-12 px-4 flex-1">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className={`flex items-center gap-3 mb-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-[var(--gold-primary)]/10 flex items-center justify-center">
                <Shirt className="w-5 h-5 text-[var(--gold-primary)]" />
              </div>
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <h1 className={`text-2xl sm:text-3xl font-bold ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {lang === 'ar' ? 'ملابسي المخصصة' : 'My Personal Picks'}
                </h1>
                <p className={`text-sm text-muted-foreground ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {lang === 'ar' ? 'منتجات مختارة خصيصاً بناءً على تحليلك' : 'Products curated based on your style analysis'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="gold-spinner w-12 h-12" />
              <p className={`text-muted-foreground ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {lang === 'ar' ? 'جاري تحميل ملابسك المخصصة…' : 'Loading your personalized picks…'}
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && errorMsg && (
            <div className={`flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className={`text-red-600 ${lang === 'ar' ? 'font-arabic' : ''}`}>{errorMsg}</p>
              <button onClick={loadStyleData} className="mr-auto text-[var(--gold-primary)] hover:underline text-sm">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* No report */}
          {!loading && hasReport === false && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-[var(--gold-primary)]/10 flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-[var(--gold-primary)]" />
              </div>
              <h2 className={`text-xl font-bold mb-3 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {lang === 'ar' ? 'لم تقم بالتحليل بعد' : 'No Analysis Yet'}
              </h2>
              <p className={`text-muted-foreground mb-6 max-w-md mx-auto ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {lang === 'ar'
                  ? 'قم بتحليل أسلوبك الشخصي أولاً للحصول على ملابس مخصصة لك'
                  : 'Complete your style analysis first to get personalized clothing recommendations'}
              </p>
              <button
                onClick={() => router.push('/start-analysis')}
                className="btn-gold px-8 py-4 inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span className={lang === 'ar' ? 'font-arabic' : ''}>
                  {lang === 'ar' ? 'ابدأ التحليل' : 'Start Analysis'}
                </span>
              </button>
            </motion.div>
          )}

          {/* Products */}
          {!loading && hasReport === true && (
            <>
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3 sm:gap-4 mb-8"
              >
                {[
                  { icon: TrendingUp, value: products.length, label: lang === 'ar' ? 'منتج' : 'Products', color: 'text-[var(--gold-primary)]' },
                  { icon: Zap, value: products.filter(p => (p.matchingScore || 0) >= 70).length, label: lang === 'ar' ? 'مطابق' : 'Matched', color: 'text-green-500' },
                  { icon: Award, value: `${avgScore}%`, label: lang === 'ar' ? 'متوسط' : 'Avg Score', color: 'text-[var(--gold-primary)]' },
                ].map((stat, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 text-center border border-border">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="font-display text-xl sm:text-2xl font-bold">{stat.value}</p>
                    <p className={`text-xs text-muted-foreground ${lang === 'ar' ? 'font-arabic' : ''}`}>{stat.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* Products Grid */}
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className={`text-muted-foreground ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {lang === 'ar' ? 'لا توجد منتجات مناسبة حالياً' : 'No matching products right now'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  <AnimatePresence>
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.04, 0.5), duration: 0.35 }}
                        className="group"
                      >
                        <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--gold-primary)]/50 hover:shadow-lg hover:shadow-[var(--gold-primary)]/10 h-full flex flex-col">
                          {/* Image */}
                          <div className="aspect-[3/4] relative overflow-hidden bg-muted/30">
                            <img
                              src={getProductImage(product)}
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';
                              }}
                            />

                            {/* Match Score Badge */}
                            {(product.matchingScore || 0) > 0 && (
                              <div className={`absolute top-2 ${lang === 'ar' ? 'right-2' : 'right-2'} px-2 py-1 rounded-full text-[10px] font-bold ${getMatchingColor(product.matchingScore || 0)}`}>
                                {product.matchingScore}%
                              </div>
                            )}

                            {/* Perfect Badge */}
                            {(product.matchingScore || 0) >= 70 && (
                              <div className={`absolute top-2 ${lang === 'ar' ? 'left-2' : 'left-2'} px-2 py-1 rounded-full bg-green-500 text-white text-[10px] flex items-center gap-0.5`}>
                                <Zap className="w-2.5 h-2.5" />
                                {lang === 'ar' ? 'مناسب' : 'Match'}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className={`p-3 flex-1 flex flex-col ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                            <h3 className={`text-sm font-medium line-clamp-2 flex-1 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                              {product.name}
                            </h3>
                            <div className={`flex items-center justify-between mt-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                              <p className="font-display text-sm font-bold text-[var(--gold-primary)]">
                                {product.price?.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                              </p>
                              {product.category && (
                                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                  {product.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* View Store */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mt-10">
                <button
                  onClick={() => router.push('/store')}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-border hover:border-[var(--gold-primary)]/50 transition-all ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
                >
                  <ShoppingBag className="w-5 h-5 text-[var(--gold-primary)]" />
                  <span className={lang === 'ar' ? 'font-arabic' : ''}>
                    {lang === 'ar' ? 'عرض كل المنتجات' : 'View All Products'}
                  </span>
                  <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <footer className="py-6 border-t border-border px-4 mt-auto">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">© 2025 Glow Up AI</p>
        </div>
      </footer>
    </main>
  );
}
