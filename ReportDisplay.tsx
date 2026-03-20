"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { theme, Language } from "@/themes/config";
import { 
  User, Palette, Shirt, ShoppingBag, Calendar, Star, CheckCircle2, 
  TrendingUp, ArrowUpRight, Sparkles, Heart, Eye, Crown, Zap,
  ChevronDown, ChevronUp, Dna, Sun, Moon, Layers, Package, AlertCircle, Loader2
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   REPORT DISPLAY — Enhanced Interactive Results
   ═══════════════════════════════════════════════════════════════ */

interface ReportDisplayProps {
  report: any;
  lang: Language;
}

const toEasternArabic = (num: number | string) => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num.toString().replace(/\d/g, (d) => arabicDigits[parseInt(d)]);
};

// Kibbe Types Data
const KIBBE_TYPES: Record<string, { family: string; yinYang: string; color: string }> = {
  "Dramatic": { family: "Dramatic", yinYang: "Extreme Yang", color: "#8B0000" },
  "Soft Dramatic": { family: "Dramatic", yinYang: "Yang with Yin undercurrent", color: "#A52A2A" },
  "Flamboyant Natural": { family: "Natural", yinYang: "Yang with Yin undercurrent", color: "#228B22" },
  "Natural": { family: "Natural", yinYang: "Balanced with Yang influence", color: "#2E8B57" },
  "Soft Natural": { family: "Natural", yinYang: "Yin with Yang undercurrent", color: "#3CB371" },
  "Classic": { family: "Classic", yinYang: "Balanced", color: "#4682B4" },
  "Soft Classic": { family: "Classic", yinYang: "Balanced with Yin influence", color: "#5F9EA0" },
  "Dramatic Classic": { family: "Classic", yinYang: "Balanced with Yang influence", color: "#6495ED" },
  "Romantic": { family: "Romantic", yinYang: "Extreme Yin", color: "#DB7093" },
  "Theatrical Romantic": { family: "Romantic", yinYang: "Yin with Yang undercurrent", color: "#FF69B4" },
  "Gamine": { family: "Gamine", yinYang: "Contrast (Yin/Yang mix)", color: "#9370DB" },
  "Soft Gamine": { family: "Gamine", yinYang: "Yin with Yang contrast", color: "#BA55D3" },
  "Flamboyant Gamine": { family: "Gamine", yinYang: "Yang with Yin contrast", color: "#8A2BE2" },
};

// Color Seasons Data
const COLOR_SEASONS: Record<string, { season: string; undertone: string; keywords: string[] }> = {
  "Light Spring": { season: "Spring", undertone: "Warm", keywords: ["Light", "Warm", "Bright"] },
  "Warm Spring": { season: "Spring", undertone: "Warm", keywords: ["Warm", "Bright"] },
  "Clear Spring": { season: "Spring", undertone: "Warm", keywords: ["Bright", "Warm"] },
  "Light Summer": { season: "Summer", undertone: "Cool", keywords: ["Light", "Cool", "Muted"] },
  "Cool Summer": { season: "Summer", undertone: "Cool", keywords: ["Cool", "Muted"] },
  "Soft Summer": { season: "Summer", undertone: "Cool", keywords: ["Muted", "Cool"] },
  "Warm Autumn": { season: "Autumn", undertone: "Warm", keywords: ["Warm", "Muted"] },
  "Soft Autumn": { season: "Autumn", undertone: "Warm", keywords: ["Muted", "Warm"] },
  "Deep Autumn": { season: "Autumn", undertone: "Warm", keywords: ["Deep", "Warm", "Muted"] },
  "Deep Winter": { season: "Winter", undertone: "Cool", keywords: ["Deep", "Cool", "Bright"] },
  "Cool Winter": { season: "Winter", undertone: "Cool", keywords: ["Cool", "Bright"] },
  "Clear Winter": { season: "Winter", undertone: "Cool", keywords: ["Bright", "Cool", "Deep"] },
};

// Animated Score Ring
const ScoreRing = ({ score, label, lang, delay, size = "normal" }: { 
  score: number; 
  label: string; 
  lang: Language; 
  delay: number;
  size?: "normal" | "large";
}) => {
  const radius = size === "large" ? 50 : 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;

  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
    >
      <div className={`relative ${size === "large" ? "w-28 h-28 sm:w-32 sm:h-32" : "w-20 h-20 sm:w-24 sm:h-24"} mb-2 sm:mb-3`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
          <defs>
            <linearGradient id={`goldGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE066" />
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
          </defs>
          <motion.circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={`url(#goldGrad-${label})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, delay: delay + 0.3, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-display ${size === "large" ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"} font-bold gold-text ltr-text`}>
            {lang === 'ar' ? toEasternArabic(score) : score}
          </span>
        </div>
      </div>
      <span className={`font-label text-[9px] sm:text-[10px] tracking-[0.15em] text-muted-foreground text-center uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
        {label}
      </span>
    </motion.div>
  );
};

// Section Card with Expandable Content
const SectionCard = ({ 
  title, 
  icon: Icon, 
  children, 
  lang, 
  delay,
  defaultExpanded = true 
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  lang: Language; 
  delay: number;
  defaultExpanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div 
      className="glass-card glass-card-accent rounded-2xl sm:rounded-3xl overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.6 }}
    >
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-5 sm:p-6 md:p-8 hover:bg-[var(--gold-primary)]/5 transition-colors ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
      >
        <div className={`flex items-center gap-3 sm:gap-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[var(--gold-primary)]/10 flex items-center justify-center">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--gold-primary)]" />
          </div>
          <h3 className={`font-display text-lg sm:text-xl md:text-2xl font-semibold text-foreground ${lang === 'ar' ? 'font-arabic' : ''}`}>
            {title}
          </h3>
        </div>
        {isExpanded ? 
          <ChevronUp className="w-5 h-5 text-muted-foreground" /> : 
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        }
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 md:px-8 pb-5 sm:pb-6 md:pb-8">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Style DNA Visual Component
const StyleDNACard = ({ styleDNA, lang }: { styleDNA: any; lang: Language }) => {
  const kibbeType = styleDNA?.kibbeType || "Classic";
  const kibbeInfo = KIBBE_TYPES[kibbeType] || KIBBE_TYPES["Classic"];
  const colorSeason = styleDNA?.colorSeason || "Soft Summer";
  const seasonInfo = COLOR_SEASONS[colorSeason] || COLOR_SEASONS["Soft Summer"];

  return (
    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
      {/* Kibbe Type Card */}
      <motion.div 
        className="glass rounded-2xl p-5 sm:p-6 relative overflow-hidden group"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div 
          className="absolute inset-0 opacity-10 blur-3xl transition-opacity group-hover:opacity-20"
          style={{ background: kibbeInfo.color }}
        />
        
        <div className="relative z-10">
          <div className={`flex items-center gap-3 mb-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold-primary)] to-[var(--purple-deep)] flex items-center justify-center">
              <Dna className="w-6 h-6 text-white" />
            </div>
            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
              <p className={`font-label text-[10px] sm:text-xs tracking-widest text-muted-foreground uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {lang === 'ar' ? 'نوع كيبي' : 'Kibbe Type'}
              </p>
              <h4 className={`font-display text-lg sm:text-xl font-semibold gold-text ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {kibbeType}
              </h4>
            </div>
          </div>
          
          {/* Yin-Yang Spectrum */}
          <div className="mb-4">
            <p className={`font-label text-[10px] sm:text-xs tracking-widest text-muted-foreground mb-2 uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
              {lang === 'ar' ? 'طيف ين-يانج' : 'Yin-Yang Spectrum'}
            </p>
            <div className={`h-2 rounded-full relative ${lang === 'ar' ? 'bg-gradient-to-l from-pink-300 via-purple-400 to-blue-600' : 'bg-gradient-to-r from-pink-300 via-purple-400 to-blue-600'}`}>
              <motion.div 
                className="absolute w-4 h-4 rounded-full bg-white border-2 border-[var(--gold-primary)] -top-1 shadow-lg"
                initial={{ [lang === 'ar' ? 'right' : 'left']: "0%" }}
                animate={{ 
                  [lang === 'ar' ? 'right' : 'left']: kibbeInfo.yinYang.includes("Yang") ? 
                    (kibbeInfo.yinYang.includes("Extreme") ? "85%" : "65%") : 
                    (kibbeInfo.yinYang.includes("Yin") ? 
                      (kibbeInfo.yinYang.includes("Extreme") ? "15%" : "35%") : "50%")
                }}
                transition={{ delay: 0.5, duration: 1 }}
              />
            </div>
            <div className={`flex justify-between mt-1 text-[10px] text-muted-foreground ${lang === 'ar' ? 'flex-row-reverse font-arabic' : ''}`}>
              <span>{lang === 'ar' ? 'ين (ناعم)' : 'Yin (Soft)'}</span>
              <span>{lang === 'ar' ? 'يانج (حاد)' : 'Yang (Sharp)'}</span>
            </div>
          </div>

          <p className={`text-sm text-muted-foreground leading-relaxed ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
            {styleDNA?.kibbeDescription || ''}
          </p>
        </div>
      </motion.div>

      {/* Color Season Card */}
      <motion.div 
        className="glass rounded-2xl p-5 sm:p-6 relative overflow-hidden group"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative z-10">
          <div className={`flex items-center gap-3 mb-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
              <p className={`font-label text-[10px] sm:text-xs tracking-widest text-muted-foreground uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {lang === 'ar' ? 'موسم الألوان' : 'Color Season'}
              </p>
              <h4 className={`font-display text-lg sm:text-xl font-semibold gold-text ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {colorSeason}
              </h4>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {seasonInfo.keywords.map((keyword, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="px-3 py-1 rounded-full bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] text-xs font-label tracking-wider"
              >
                {keyword}
              </motion.span>
            ))}
          </div>

          <p className={`text-sm text-muted-foreground leading-relaxed ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
            {styleDNA?.colorSeasonDescription || ''}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// Color Palette Display
const ColorPaletteDisplay = ({ colorAnalysis, lang }: { colorAnalysis: any; lang: Language }) => {
  const bestColors = colorAnalysis?.bestColors || [];
  const neutralColors = colorAnalysis?.neutralColors || [];
  const avoidColors = colorAnalysis?.avoidColors || [];

  const extractHex = (colorStr: string) => {
    const hexMatch = colorStr.match(/#[0-9A-Fa-f]{6}/);
    return hexMatch ? hexMatch[0] : null;
  };

  const colorNameToHex = (name: string): string => {
    const colorMap: Record<string, string> = {
      "red": "#EF4444", "blue": "#3B82F6", "green": "#22C55E", "yellow": "#EAB308",
      "purple": "#A855F7", "pink": "#EC4899", "orange": "#F97316", "brown": "#92400E",
      "black": "#1F2937", "white": "#F9FAFB", "gray": "#6B7280", "beige": "#D4B896",
      "navy": "#1E3A5A", "burgundy": "#881337", "cream": "#FFFDD0", "coral": "#FF7F50",
      "teal": "#14B8A6", "olive": "#6B7A3C", "gold": "#FFD700", "silver": "#C0C0C0"
    };
    const lowerName = name.toLowerCase();
    for (const [key, hex] of Object.entries(colorMap)) {
      if (lowerName.includes(key)) return hex;
    }
    return "#9CA3AF";
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className={`font-label text-xs tracking-widest text-green-600 mb-3 uppercase ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
          {lang === 'ar' ? 'أفضل الألوان لك' : 'Your Best Colors'}
        </h4>
        <div className={`flex flex-wrap gap-2 ${lang === 'ar' ? 'justify-end' : ''}`}>
          {bestColors.map((color: string, i: number) => {
            const hex = extractHex(color) || colorNameToHex(color);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className="group relative"
              >
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: hex }}
                />
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {color.split('#')[0].trim().slice(0, 15)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className={`font-label text-xs tracking-widest text-muted-foreground mb-3 uppercase ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
          {lang === 'ar' ? 'ألوان محايدة' : 'Neutral Colors'}
        </h4>
        <div className={`flex flex-wrap gap-2 ${lang === 'ar' ? 'justify-end' : ''}`}>
          {neutralColors.map((color: string, i: number) => {
            const hex = extractHex(color) || colorNameToHex(color);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i + 0.3 }}
                className="w-10 h-10 rounded-lg shadow-md"
                style={{ backgroundColor: hex }}
                title={color}
              />
            );
          })}
        </div>
      </div>

      <div>
        <h4 className={`font-label text-xs tracking-widest text-red-500 mb-3 uppercase ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
          {lang === 'ar' ? 'تجنب هذه الألوان' : 'Avoid These Colors'}
        </h4>
        <div className={`flex flex-wrap gap-2 ${lang === 'ar' ? 'justify-end' : ''}`}>
          {avoidColors.map((color: string, i: number) => {
            const hex = extractHex(color) || colorNameToHex(color);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i + 0.5 }}
                className="w-10 h-10 rounded-lg shadow-md relative opacity-60"
                style={{ backgroundColor: hex }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-red-500 rotate-45" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {colorAnalysis?.metallicChoice && (
        <div className={`flex items-center gap-3 p-4 rounded-xl bg-[var(--gold-primary)]/5 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          <Sparkles className="w-5 h-5 text-[var(--gold-primary)]" />
          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <span className={`font-label text-xs text-muted-foreground uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
              {lang === 'ar' ? 'المعدن المفضل:' : 'Best Metallic:'}
            </span>
            <span className={`font-semibold text-foreground ml-2 ${lang === 'ar' ? 'font-arabic' : ''}`}>
              {colorAnalysis.metallicChoice}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Clothing Recommendations
const ClothingRecSection = ({ recommendations, lang }: { recommendations: any; lang: Language }) => {
  const sections = [
    { key: 'tops', icon: Shirt, title: lang === 'ar' ? 'القمصان والبلوزات' : 'Tops & Blouses' },
    { key: 'bottoms', icon: Layers, title: lang === 'ar' ? 'البنطلونات والتنورات' : 'Pants & Skirts' },
    { key: 'dresses', icon: Crown, title: lang === 'ar' ? 'الفستانات' : 'Dresses' },
    { key: 'outerwear', icon: Zap, title: lang === 'ar' ? 'الجاكيتات والمعاطف' : 'Jackets & Coats' },
    { key: 'accessories', icon: Heart, title: lang === 'ar' ? 'الإكسسوارات' : 'Accessories' },
  ];

  return (
    <div className="space-y-6">
      {recommendations?.silhouette && (
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--gold-primary)]/10 border border-[var(--gold-primary)]/20">
          <p className={`font-label text-xs tracking-widest text-muted-foreground mb-2 uppercase ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
            {lang === 'ar' ? 'السيلويت المثالي' : 'Ideal Silhouette'}
          </p>
          <p className={`font-display text-lg sm:text-xl font-semibold gold-text ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
            {recommendations.silhouette}
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map(({ key, icon: Icon, title }) => {
          const data = recommendations?.[key];
          if (!data) return null;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-4"
            >
              <div className={`flex items-center gap-2 mb-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <Icon className="w-4 h-4 text-[var(--gold-primary)]" />
                <h4 className={`font-display text-sm sm:text-base font-semibold ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {title}
                </h4>
              </div>
              
              {Array.isArray(data) ? (
                <ul className={`space-y-1.5 text-sm text-muted-foreground ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {data.slice(0, 3).map((item: string, i: number) => (
                    /* FIX: RTL bullet — النقطة على اليمين للعربي */
                    <li key={i} className={`flex items-start gap-2 ${lang === 'ar' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <span className="text-[var(--gold-primary)] shrink-0 mt-0.5">◆</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : typeof data === 'object' ? (
                <div className="space-y-2">
                  {Object.entries(data).map(([subKey, subValue]) => (
                    <div key={subKey} className={lang === 'ar' ? 'text-right' : 'text-left'}>
                      <span className={`font-label text-[10px] tracking-wider text-muted-foreground uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
                        {subKey}:
                      </span>
                      <span className={`text-sm ml-2 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                        {Array.isArray(subValue) ? subValue.join(', ') : String(subValue ?? '')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </div>

      {recommendations?.toAvoid?.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <h4 className={`font-label text-xs tracking-widest text-red-500 mb-3 uppercase ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
            {lang === 'ar' ? 'تجنب' : 'To Avoid'}
          </h4>
          <div className={`flex flex-wrap gap-2 ${lang === 'ar' ? 'justify-end' : ''}`}>
            {recommendations.toAvoid.map((item: string, i: number) => (
              <span key={i} className="px-3 py-1 rounded-full bg-red-500/20 text-red-600 text-xs">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Glow Up Plan Timeline
const GlowUpPlan = ({ plan, lang }: { plan: any[]; lang: Language }) => {
  return (
    <div className="relative">
      {/* FIX: الخط العمودي على الجانب الصح حسب اللغة */}
      <div className={`absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--gold-primary)] via-[var(--gold-primary)]/40 to-transparent ${lang === 'ar' ? 'right-5 sm:right-6' : 'left-5 sm:left-6'}`} />
      
      <div className="space-y-6 sm:space-y-8">
        {[...new Map(plan.map((p: any) => [p.phase, p])).values()].map((phase: any, i: number) => (
          <motion.div 
            key={phase.phase || i} 
            className={`relative flex gap-4 sm:gap-6 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
            initial={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <motion.div 
              className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--gold-deep)] via-[var(--gold-primary)] to-[var(--gold-light)] flex items-center justify-center shrink-0 shadow-lg shadow-[var(--gold-primary)]/30"
              whileHover={{ scale: 1.1 }}
            >
              <span className="font-display text-sm sm:text-base font-bold text-white ltr-text">{i + 1}</span>
            </motion.div>
            
            <div className="flex-1 glass rounded-xl sm:rounded-2xl p-4 sm:p-5 border-[var(--gold-primary)]/10 hover:border-[var(--gold-primary)]/30 transition-colors">
              <div className={`flex items-center justify-between mb-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <h4 className={`font-display font-semibold text-foreground ${lang === 'ar' ? 'font-arabic text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
                    {phase.phase}
                  </h4>
                  {phase.focus && (
                    <p className={`text-xs text-[var(--gold-primary)] mt-1 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                      {phase.focus}
                    </p>
                  )}
                </div>
                <span className="font-label text-[10px] sm:text-xs tracking-wider text-muted-foreground ltr-text shrink-0">
                  {phase.timeframe}
                </span>
              </div>
              
              {/* FIX: steps - النقطة على اليمين للعربي */}
              <ul className={`text-muted-foreground space-y-1.5 sm:space-y-2 text-sm mb-4 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {(phase.steps || []).map((step: string, j: number) => (
                  <li key={j} className={`flex items-start gap-2 ${lang === 'ar' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--gold-primary)] shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>

              {phase.shoppingList?.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className={`font-label text-[10px] tracking-wider text-muted-foreground mb-2 uppercase ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
                    {lang === 'ar' ? 'قائمة التسوق:' : 'Shopping List:'}
                  </p>
                  <div className={`flex flex-wrap gap-1.5 ${lang === 'ar' ? 'justify-end' : ''}`}>
                    {phase.shoppingList.map((item: string, k: number) => (
                      <span key={k} className="px-2 py-0.5 rounded-full bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Helper function
const get = (obj: any, path: string, defaultValue: any = '') => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? defaultValue;
};

// Product interface
interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  image?: string;
  image_url?: string;
  category?: string;
  colors?: string | string[];
  color?: string;
  sizes?: string | string[];
  brand?: string;
  body_shapes?: string;
  color_palette?: string;
  style_tags?: string;
  matchScore?: number;
}

// Clothes Suggestions Section - لا تتكرر لأن useEffect بيشتغل مرة واحدة عند mount
const ClothesSuggestionsSection = ({ 
  lang, 
  colorSeason, 
  kibbeType,
  bodyShape,
  styleTags 
}: { 
  lang: Language; 
  colorSeason?: string; 
  kibbeType?: string;
  bodyShape?: string;
  styleTags?: string;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMatching, setTotalMatching] = useState(0);
  const [fetched, setFetched] = useState(false); // منع التكرار

  useEffect(() => {
    if (fetched) return; // FIX: لا تجيب أكتر من مرة
    setFetched(true);

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('limit', '12');
        if (bodyShape) params.set('body_shape', bodyShape);
        if (colorSeason) params.set('color_season', colorSeason);
        if (styleTags) params.set('style_tags', styleTags);
        
        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();
        
        if (data.success && data.products && data.products.length > 0) {
          // FIX: إزالة التكرار بالـ id
          const unique = Array.from(
            new Map(data.products.map((p: Product) => [p.id, p])).values()
          ) as Product[];
          setProducts(unique);
          setTotalMatching(data.totalMatching || unique.length);
        } else {
          setProducts([]);
          setError(data.error || null);
        }
      } catch (err) {
        setProducts([]);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // FIX: dependency array فاضي — بيشتغل مرة واحدة فقط

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-[var(--gold-primary)] animate-spin mb-4" />
        <p className={`text-muted-foreground ${lang === 'ar' ? 'font-arabic' : ''}`}>
          {lang === 'ar' ? 'جاري البحث عن ملابس تناسبك...' : 'Finding clothes that match your style...'}
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h4 className={`font-display text-lg font-semibold mb-2 ${lang === 'ar' ? 'font-arabic' : ''}`}>
          {lang === 'ar' ? 'لا توجد منتجات حالياً' : 'No Products Available'}
        </h4>
        <p className={`text-sm text-muted-foreground max-w-md ${lang === 'ar' ? 'font-arabic' : ''}`}>
          {lang === 'ar' 
            ? 'لم يتم العثور على منتجات تناسب مواصفاتك حالياً.'
            : 'No products matching your profile found.'}
        </p>
        {error && (
          <div className={`mt-4 flex items-center gap-2 text-amber-600 text-sm ${lang === 'ar' ? 'flex-row-reverse font-arabic' : ''}`}>
            <AlertCircle className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تلميح: أضف منتجات في Supabase' : 'Tip: Add products in Supabase'}</span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 ${lang === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
        <p className={`text-sm text-muted-foreground ${lang === 'ar' ? 'font-arabic' : ''}`}>
          {lang === 'ar' 
            ? `${products.length} منتج مقترح خصيصاً لك` 
            : `${products.length} personalized suggestions for you`}
        </p>
        {totalMatching > products.length && (
          <p className={`text-xs text-[var(--gold-primary)] ${lang === 'ar' ? 'font-arabic' : ''}`}>
            {lang === 'ar' 
              ? `من أصل ${totalMatching} منتج متوافق`
              : `From ${totalMatching} matching products`}
          </p>
        )}
      </div>

      <div className={`flex flex-wrap gap-3 mb-4 p-3 rounded-lg bg-[var(--gold-primary)]/5 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-1.5 text-xs text-muted-foreground ${lang === 'ar' ? 'flex-row-reverse font-arabic' : ''}`}>
          <Star className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
          <span>{lang === 'ar' ? 'المنتجات مرتبة حسب التوافق معك' : 'Products sorted by match score'}</span>
        </div>
      </div>

      {/* FIX: grid مع AnimatePresence لمنع التكرار المرئي */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product, i) => {
          const imageUrl = product.image || product.image_url;
          const productColor = product.color || (typeof product.colors === 'string' ? product.colors : '');
          
          return (
            <motion.div
              key={product.id} // FIX: key ثابت بالـ id مش بالـ index
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.3 }}
              className="group glass rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-[var(--gold-primary)]/10 transition-all duration-300"
            >
              <div className="relative aspect-[3/4] bg-muted/30 overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
                    <Shirt className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
                
                {product.matchScore && product.matchScore > 0 && (
                  <div className={`absolute top-2 ${lang === 'ar' ? 'left-2' : 'right-2'}`}>
                    <span className="px-2 py-1 rounded-full bg-[var(--gold-primary)] text-white text-[10px] font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {product.matchScore}
                    </span>
                  </div>
                )}
                
                {product.category && (
                  <div className={`absolute top-2 ${lang === 'ar' ? 'right-2' : 'left-2'}`}>
                    <span className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-label tracking-wider uppercase">
                      {product.category}
                    </span>
                  </div>
                )}
              </div>

              <div className={`p-3 sm:p-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h4 className={`font-semibold text-sm mb-1 line-clamp-2 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {product.name}
                </h4>
                
                {productColor && (
                  <p className={`text-xs text-muted-foreground mb-2 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {productColor}
                  </p>
                )}
                
                {product.price && (
                  <p className={`font-display text-base font-bold text-[var(--gold-primary)] ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {product.price} {lang === 'ar' ? 'ج.م' : 'EGP'}
                  </p>
                )}

                {product.style_tags && (
                  <div className={`flex flex-wrap gap-1 mt-2 ${lang === 'ar' ? 'justify-end' : ''}`}>
                    {product.style_tags.split(',').slice(0, 2).map((tag, ti) => (
                      <span key={ti} className="px-1.5 py-0.5 rounded bg-muted/50 text-[9px] text-muted-foreground">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════
export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, lang }) => {
  const styleDNA = report.styleDNA || report.style_dna || {};
  const bodyAnalysis = report.bodyAnalysis || report.body_analysis || {};
  const faceAnalysis = report.faceAnalysis || report.face_analysis || {};
  const colorAnalysis = report.colorAnalysis || report.color_analysis || {};
  const clothingRecs = report.clothingRecommendations || report.clothing_recommendations || {};
  const glowUpPlan = report.glowUpPlan || report.glow_up_plan || [];
  const styleScore = report.styleScore || report.style_score || {};

  const [isDownloading, setIsDownloading] = useState(false);

  // FIX: Word only — PDF removed
  const downloadReport = async () => {
    setIsDownloading(true);
    try {
      const reportData = {
        styleScore, styleDNA, bodyAnalysis, faceAnalysis,
        colorAnalysis, clothingRecommendations: clothingRecs, glowUpPlan
      };
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: reportData, format: 'word', lang }),
      });
      if (!response.ok) throw new Error('Failed to generate report');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `glow-up-report-${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(lang === 'ar' ? 'فشل تحميل التقرير' : 'Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
      
      {/* Hero */}
      <motion.div className="text-center mb-12 sm:mb-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[var(--gold-deep)] via-[var(--gold-primary)] to-[var(--gold-light)] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl shadow-[var(--gold-primary)]/40"
        >
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${lang === 'ar' ? 'font-arabic' : ''}`}
        >
          <span className="gold-text">{lang === 'ar' ? 'تحليلك جاهز!' : 'Your Analysis is Ready!'}</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className={`font-display text-lg sm:text-xl text-muted-foreground italic max-w-2xl mx-auto leading-relaxed mb-8 ${lang === 'ar' ? 'font-arabic' : ''}`}
        >
          &ldquo;{styleScore.styleStatement || styleScore.style_statement || ''}&rdquo;
        </motion.p>

        {/* FIX: زر Word واحد بس */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <button
            onClick={downloadReport}
            disabled={isDownloading}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full btn-gold transition-all group disabled:opacity-50 disabled:cursor-not-allowed ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
            <span className={`text-sm font-medium ${lang === 'ar' ? 'font-arabic' : ''}`}>
              {lang === 'ar' ? 'تحميل التقرير Word' : 'Download Word Report'}
            </span>
          </button>
        </motion.div>
      </motion.div>

      {/* Style Scores */}
      <motion.div 
        className="relative mb-12 sm:mb-16"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-primary)]/5 via-transparent to-[var(--purple-deep)]/5 rounded-3xl" />
        
        <div className="relative glass-card rounded-3xl sm:rounded-[2rem] p-8 sm:p-10 md:p-12 border-2 border-[var(--gold-primary)]/20">
          <div className="text-center mb-8 sm:mb-10">
            <div className={`flex items-center justify-center gap-2 mb-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              <TrendingUp className="w-5 h-5 text-[var(--gold-primary)]" />
              <span className={`font-label text-xs sm:text-sm tracking-[0.2em] text-[var(--gold-primary)] uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {lang === 'ar' ? 'نتيجتك الشاملة' : 'Your Overall Score'}
              </span>
            </div>
            <h3 className={`font-display text-2xl sm:text-3xl font-semibold ${lang === 'ar' ? 'font-arabic' : ''}`}>
              {lang === 'ar' ? 'تقييم أسلوبك الشخصي' : 'Your Personal Style Assessment'}
            </h3>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16">
            <ScoreRing score={styleScore.currentStyle || 7} label={lang === 'ar' ? "حالك" : "Current"} lang={lang} delay={0.5} />
            <ScoreRing score={styleScore.bodyHarmony || 8} label={lang === 'ar' ? "تناسق" : "Harmony"} lang={lang} delay={0.6} />
            <ScoreRing score={styleScore.colorHarmony || 7} label={lang === 'ar' ? "ألوان" : "Colors"} lang={lang} delay={0.7} />
            <ScoreRing score={styleScore.stylePotential || 9} label={lang === 'ar' ? "إمكانية" : "Potential"} lang={lang} delay={0.8} />
          </div>

          <motion.div 
            className="mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-[var(--gold-primary)]/20 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }}
          >
            <p className={`font-label text-xs tracking-widest text-muted-foreground mb-3 uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
              {lang === 'ar' ? 'النتيجة النهائية' : 'Final Score'}
            </p>
            <ScoreRing score={styleScore.finalScore || 8} label="" lang={lang} delay={1} size="large" />
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          DETAILED SECTIONS — الترتيب الصح
          ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-6 sm:space-y-8">

        {/* FIX: StyleDNA section — كان مكتوب بس مش معروض */}
        {(styleDNA.kibbeType || styleDNA.colorSeason) && (
          <SectionCard
            title={lang === 'ar' ? "الحمض النووي لأسلوبك" : "Your Style DNA"}
            icon={Dna}
            lang={lang}
            delay={0.5}
          >
            <StyleDNACard styleDNA={styleDNA} lang={lang} />
          </SectionCard>
        )}

        {/* Color Analysis */}
        <SectionCard 
          title={lang === 'ar' ? "تحليل الألوان" : "Color Analysis"} 
          icon={Palette} lang={lang} delay={0.6}
        >
          <ColorPaletteDisplay colorAnalysis={colorAnalysis} lang={lang} />
        </SectionCard>

        {/* Body Analysis */}
        <SectionCard 
          title={lang === 'ar' ? "تحليل الجسم" : "Body Analysis"} 
          icon={User} lang={lang} delay={0.7}
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
              <p className={`font-label text-xs tracking-wider text-muted-foreground mb-2 uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {lang === 'ar' ? 'شكل الجسم' : 'Body Shape'}
              </p>
              <p className={`font-display text-xl sm:text-2xl font-semibold gold-text mb-3 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {bodyAnalysis.shape}
              </p>
              <p className={`text-muted-foreground leading-relaxed ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {bodyAnalysis.proportions}
              </p>
            </div>
            <div className="space-y-3">
              {bodyAnalysis.strengths?.length > 0 && (
                <div>
                  <p className={`font-label text-xs tracking-wider text-green-600 mb-2 uppercase ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
                    {lang === 'ar' ? 'نقاط القوة' : 'Strengths'}
                  </p>
                  <ul className="space-y-1">
                    {bodyAnalysis.strengths.map((s: string, i: number) => (
                      <li key={i} className={`flex items-center gap-2 text-sm ${lang === 'ar' ? 'flex-row-reverse font-arabic text-right' : ''}`}>
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Face Analysis */}
        <SectionCard 
          title={lang === 'ar' ? "تحليل الوجه" : "Face Analysis"} 
          icon={Eye} lang={lang} delay={0.8}
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
              <p className={`font-label text-xs tracking-wider text-muted-foreground mb-2 uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {lang === 'ar' ? 'شكل الوجه' : 'Face Shape'}
              </p>
              <p className={`font-display text-xl font-semibold gold-text mb-4 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {faceAnalysis.shape}
              </p>
              
              {faceAnalysis.hairstyles?.length > 0 && (
                <div className="mb-4">
                  <p className={`font-label text-xs tracking-wider text-muted-foreground mb-2 uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {lang === 'ar' ? 'تسريحات مناسبة' : 'Recommended Hairstyles'}
                  </p>
                  <ul className="space-y-1">
                    {faceAnalysis.hairstyles.slice(0, 4).map((h: string, i: number) => (
                      <li key={i} className={`flex items-center gap-2 text-sm ${lang === 'ar' ? 'flex-row-reverse font-arabic' : ''}`}>
                        <Sparkles className="w-3 h-3 text-[var(--gold-primary)] shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
              {faceAnalysis.glasses?.length > 0 && (
                <div className="mb-4">
                  <p className={`font-label text-xs tracking-wider text-muted-foreground mb-2 uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {lang === 'ar' ? 'نظارات مناسبة' : 'Recommended Glasses'}
                  </p>
                  <ul className="space-y-1">
                    {faceAnalysis.glasses.slice(0, 4).map((g: string, i: number) => (
                      <li key={i} className={`flex items-center gap-2 text-sm ${lang === 'ar' ? 'flex-row-reverse font-arabic' : ''}`}>
                        <Eye className="w-3 h-3 text-[var(--gold-primary)] shrink-0" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {faceAnalysis.makeup && (
                <div className="p-4 rounded-xl bg-[var(--gold-primary)]/5">
                  <p className={`font-label text-xs tracking-wider text-muted-foreground mb-2 uppercase ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {lang === 'ar' ? 'نصيحة مكياج' : 'Makeup Tip'}
                  </p>
                  <p className={`text-sm ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {faceAnalysis.makeup.focus}
                  </p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Clothing Recommendations */}
        <SectionCard 
          title={lang === 'ar' ? "توصيات الملابس" : "Clothing Recommendations"} 
          icon={Shirt} lang={lang} delay={0.9}
        >
          <ClothingRecSection recommendations={clothingRecs} lang={lang} />
        </SectionCard>

        {/* Glow Up Plan */}
        {glowUpPlan.length > 0 && (
          <SectionCard 
            title={lang === 'ar' ? "خطة التطوير" : "Glow Up Plan"} 
            icon={Calendar} lang={lang} delay={1}
          >
            <GlowUpPlan plan={glowUpPlan} lang={lang} />
          </SectionCard>
        )}

        {/* FIX: منتجات مخصوصة — كانت مش بتظهر */}
        <SectionCard
          title={lang === 'ar' ? "ملابس مخصوصة لك ✨" : "Clothes Picked For You ✨"}
          icon={ShoppingBag}
          lang={lang}
          delay={1.1}
        >
          <ClothesSuggestionsSection
            lang={lang}
            colorSeason={styleDNA?.colorSeason || colorAnalysis?.season || colorAnalysis?.subSeason}
            kibbeType={styleDNA?.kibbeType}
            bodyShape={bodyAnalysis?.shape}
            styleTags={styleDNA?.styleArchetype}
          />
        </SectionCard>

      </div>
    </div>
  );
};
