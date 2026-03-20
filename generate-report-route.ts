import { NextRequest, NextResponse } from 'next/server';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, convertInchesToTwip, ShadingType,
} from 'docx';

/* ═══════════════════════════════════════════════════════════════
   WORD REPORT ONLY — PDF removed
   ═══════════════════════════════════════════════════════════════ */

interface ReportData {
  styleScore?: {
    currentStyle?: number;
    bodyHarmony?: number;
    colorHarmony?: number;
    stylePotential?: number;
    finalScore?: number;
    styleStatement?: string;
  };
  styleDNA?: {
    kibbeType?: string;
    kibbeDescription?: string;
    colorSeason?: string;
    colorSeasonDescription?: string;
  };
  bodyAnalysis?: {
    shape?: string;
    proportions?: string;
    strengths?: string[];
    areasToBalance?: string[];
  };
  faceAnalysis?: {
    shape?: string;
    hairstyles?: string[];
    glasses?: string[];
    makeup?: { focus?: string; techniques?: string[] };
  };
  colorAnalysis?: {
    bestColors?: string[];
    neutralColors?: string[];
    avoidColors?: string[];
    metallicChoice?: string;
  };
  clothingRecommendations?: {
    silhouette?: string;
    tops?: unknown;
    bottoms?: unknown;
    outerwear?: unknown;
    accessories?: unknown;
    toAvoid?: string[];
  };
  glowUpPlan?: Array<{
    phase: string;
    timeframe?: string;
    focus?: string;
    steps?: string[];
    shoppingList?: string[];
  }>;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const GOLD = 'C9A84C';
const DARK = '1A0A2E';
const GRAY = '666666';

const isAr = (lang: 'ar' | 'en') => lang === 'ar';

/** بيعمل فقرة عنوان */
function heading1(text: string, ar: boolean): Paragraph {
  return new Paragraph({
    bidirectional: ar,
    alignment: ar ? AlignmentType.RIGHT : AlignmentType.LEFT,
    spacing: { before: 300, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: GOLD,
        font: ar ? 'Traditional Arabic' : 'Calibri',
        rightToLeft: ar,
      }),
    ],
  });
}

/** بيعمل فقرة نص عادي */
function para(text: string, ar: boolean, bold = false, color = DARK): Paragraph {
  return new Paragraph({
    bidirectional: ar,
    alignment: ar ? AlignmentType.RIGHT : AlignmentType.LEFT,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text,
        bold,
        size: 22,
        color,
        font: ar ? 'Traditional Arabic' : 'Calibri',
        rightToLeft: ar,
      }),
    ],
  });
}

/** بيعمل نقطة في قائمة — البوليت على الجانب الصح حسب اللغة */
function bullet(text: string, ar: boolean): Paragraph {
  const prefix = ar ? '◆  ' : '•  ';
  return new Paragraph({
    bidirectional: ar,
    alignment: ar ? AlignmentType.RIGHT : AlignmentType.LEFT,
    spacing: { after: 80 },
    indent: ar
      ? { right: convertInchesToTwip(0.3) }
      : { left: convertInchesToTwip(0.3) },
    children: [
      new TextRun({
        text: prefix + text,
        size: 22,
        color: DARK,
        font: ar ? 'Traditional Arabic' : 'Calibri',
        rightToLeft: ar,
      }),
    ],
  });
}

/** فاصل */
function divider(): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    children: [
      new TextRun({
        text: '─────────────────────────────────',
        color: GOLD,
        size: 20,
      }),
    ],
    alignment: AlignmentType.CENTER,
  });
}

/** تحويل object/array إلى نصوص */
function flatten(data: unknown): string[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.map(String);
  if (typeof data === 'object') {
    return Object.entries(data as Record<string, unknown>).flatMap(([k, v]) => {
      const val = Array.isArray(v) ? v.join(', ') : String(v ?? '');
      return [`${k}: ${val}`];
    });
  }
  return [String(data)];
}

// ── Main generator ────────────────────────────────────────────────────────────

async function generateWordReport(report: ReportData, lang: 'ar' | 'en') {
  const ar = isAr(lang);
  const s = report.styleScore || {};
  const dna = report.styleDNA || {};
  const body = report.bodyAnalysis || {};
  const face = report.faceAnalysis || {};
  const colors = report.colorAnalysis || {};
  const clothing = report.clothingRecommendations || {};
  const plan = report.glowUpPlan || [];

  const children: Paragraph[] = [];

  // ── Title ──
  children.push(
    new Paragraph({
      bidirectional: ar,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: ar ? 'تقرير Glow Up AI' : 'Glow Up AI Report',
          bold: true,
          size: 48,
          color: GOLD,
          font: ar ? 'Traditional Arabic' : 'Playfair Display',
          rightToLeft: ar,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: new Date().toLocaleDateString(ar ? 'ar-EG' : 'en-US'),
          size: 20,
          color: GRAY,
          font: 'Calibri',
        }),
      ],
    }),
  );

  // ── Style Statement ──
  if (s.styleStatement) {
    children.push(
      new Paragraph({
        bidirectional: ar,
        alignment: AlignmentType.CENTER,
        spacing: { before: 160, after: 320 },
        children: [
          new TextRun({
            text: `"${s.styleStatement}"`,
            italics: true,
            size: 24,
            color: DARK,
            font: ar ? 'Traditional Arabic' : 'Calibri',
            rightToLeft: ar,
          }),
        ],
      }),
    );
  }

  children.push(divider());

  // ── Scores ──
  children.push(heading1(ar ? '📊 تقييم الأسلوب' : '📊 Style Assessment', ar));
  const scoreRows = [
    [ar ? 'الأسلوب الحالي' : 'Current Style', s.currentStyle],
    [ar ? 'تناسق الجسم' : 'Body Harmony', s.bodyHarmony],
    [ar ? 'تناسق الألوان' : 'Color Harmony', s.colorHarmony],
    [ar ? 'الإمكانية' : 'Potential', s.stylePotential],
    [ar ? 'النتيجة النهائية' : 'Final Score', s.finalScore],
  ];
  scoreRows.forEach(([label, val]) => {
    if (val) children.push(para(`${label}: ${val}/10`, ar));
  });

  // ── Style DNA ──
  if (dna.kibbeType || dna.colorSeason) {
    children.push(divider(), heading1(ar ? '🧬 الحمض النووي للأسلوب' : '🧬 Style DNA', ar));
    if (dna.kibbeType) {
      children.push(para(`${ar ? 'نوع كيبي' : 'Kibbe Type'}: ${dna.kibbeType}`, ar, true));
      if (dna.kibbeDescription) children.push(para(dna.kibbeDescription, ar));
    }
    if (dna.colorSeason) {
      children.push(para(`${ar ? 'موسم الألوان' : 'Color Season'}: ${dna.colorSeason}`, ar, true));
      if (dna.colorSeasonDescription) children.push(para(dna.colorSeasonDescription, ar));
    }
  }

  // ── Body Analysis ──
  if (body.shape) {
    children.push(divider(), heading1(ar ? '👤 تحليل الجسم' : '👤 Body Analysis', ar));
    children.push(para(`${ar ? 'شكل الجسم' : 'Body Shape'}: ${body.shape}`, ar, true));
    if (body.proportions) children.push(para(body.proportions, ar));
    if (body.strengths?.length) {
      children.push(para(ar ? 'نقاط القوة:' : 'Strengths:', ar, true, '2D7A2D'));
      body.strengths.forEach(s => children.push(bullet('✓  ' + s, ar)));
    }
    if (body.areasToBalance?.length) {
      children.push(para(ar ? 'فرص التطوير:' : 'Areas to Balance:', ar, true, GOLD));
      body.areasToBalance.forEach(s => children.push(bullet(s, ar)));
    }
  }

  // ── Face Analysis ──
  if (face.shape) {
    children.push(divider(), heading1(ar ? '😊 تحليل الوجه' : '😊 Face Analysis', ar));
    children.push(para(`${ar ? 'شكل الوجه' : 'Face Shape'}: ${face.shape}`, ar, true));
    if (face.hairstyles?.length) {
      children.push(para(ar ? 'تسريحات مناسبة:' : 'Recommended Hairstyles:', ar, true));
      face.hairstyles.forEach(h => children.push(bullet(h, ar)));
    }
    if (face.glasses?.length) {
      children.push(para(ar ? 'نظارات مناسبة:' : 'Recommended Glasses:', ar, true));
      face.glasses.forEach(g => children.push(bullet(g, ar)));
    }
    if (face.makeup?.focus) {
      children.push(para(`${ar ? 'نصيحة مكياج' : 'Makeup Tip'}: ${face.makeup.focus}`, ar));
    }
  }

  // ── Color Analysis ──
  if (colors.bestColors?.length || colors.avoidColors?.length) {
    children.push(divider(), heading1(ar ? '🎨 تحليل الألوان' : '🎨 Color Analysis', ar));
    if (colors.bestColors?.length) {
      children.push(para(ar ? '✅ أفضل الألوان:' : '✅ Best Colors:', ar, true, '2D7A2D'));
      children.push(para(colors.bestColors.join(' · '), ar));
    }
    if (colors.neutralColors?.length) {
      children.push(para(ar ? '⚪ الألوان المحايدة:' : '⚪ Neutral Colors:', ar, true));
      children.push(para(colors.neutralColors.join(' · '), ar));
    }
    if (colors.avoidColors?.length) {
      children.push(para(ar ? '❌ تجنب:' : '❌ Avoid:', ar, true, 'CC0000'));
      children.push(para(colors.avoidColors.join(' · '), ar));
    }
    if (colors.metallicChoice) {
      children.push(para(`✨ ${ar ? 'المعدن المفضل' : 'Best Metallic'}: ${colors.metallicChoice}`, ar));
    }
  }

  // ── Clothing Recommendations ──
  if (clothing.silhouette || clothing.toAvoid?.length) {
    children.push(divider(), heading1(ar ? '👗 توصيات الملابس' : '👗 Clothing Recommendations', ar));
    if (clothing.silhouette) {
      children.push(para(`${ar ? 'السيلويت المثالي' : 'Ideal Silhouette'}: ${clothing.silhouette}`, ar, true));
    }
    const sections: [string, unknown][] = [
      [ar ? 'القمصان' : 'Tops', clothing.tops],
      [ar ? 'البنطلونات' : 'Bottoms', clothing.bottoms],
      [ar ? 'الجاكيتات' : 'Outerwear', clothing.outerwear],
      [ar ? 'الإكسسوارات' : 'Accessories', clothing.accessories],
    ];
    sections.forEach(([label, data]) => {
      const items = flatten(data);
      if (items.length) {
        children.push(para(`${label}:`, ar, true));
        items.slice(0, 5).forEach(item => children.push(bullet(item, ar)));
      }
    });
    if (clothing.toAvoid?.length) {
      children.push(para(ar ? '🚫 تجنب:' : '🚫 To Avoid:', ar, true, 'CC0000'));
      clothing.toAvoid.forEach(item => children.push(bullet(item, ar)));
    }
  }

  // ── Glow Up Plan ──
  if (plan.length) {
    children.push(divider(), heading1(ar ? '📅 خطة التطوير' : '📅 Glow Up Plan', ar));
    plan.forEach((phase, i) => {
      children.push(
        new Paragraph({
          bidirectional: ar,
          alignment: ar ? AlignmentType.RIGHT : AlignmentType.LEFT,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: `${i + 1}. ${phase.phase}`,
              bold: true,
              size: 24,
              color: GOLD,
              font: ar ? 'Traditional Arabic' : 'Calibri',
              rightToLeft: ar,
            }),
            ...(phase.timeframe ? [new TextRun({
              text: `  (${phase.timeframe})`,
              size: 20,
              color: GRAY,
              font: 'Calibri',
            })] : []),
          ],
        }),
      );
      if (phase.focus) children.push(para(phase.focus, ar, false, GOLD));
      phase.steps?.forEach(step => children.push(bullet('✓  ' + step, ar)));
      if (phase.shoppingList?.length) {
        children.push(para(ar ? 'قائمة التسوق:' : 'Shopping List:', ar, true));
        children.push(para(phase.shoppingList.join(ar ? ' · ' : ' · '), ar, false, GRAY));
      }
    });
  }

  // ── Footer ──
  children.push(
    divider(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: ar ? 'تم إنشاؤه بواسطة Glow Up AI' : 'Generated by Glow Up AI',
          size: 18,
          color: GRAY,
          italics: true,
          font: ar ? 'Traditional Arabic' : 'Calibri',
        }),
      ],
    }),
  );

  // ── Build Document ──
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: ar ? 'Traditional Arabic' : 'Calibri',
            size: 22,
            color: DARK,
          },
          paragraph: {
            bidirectional: ar,
          },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          },
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const date = new Date().toISOString().split('T')[0];

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="glow-up-report-${date}.docx"`,
    },
  });
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report, format, lang } = body as {
      report: ReportData;
      format: 'pdf' | 'word';
      lang: 'ar' | 'en';
    };

    if (!report) {
      return NextResponse.json({ success: false, error: 'Missing report data' }, { status: 400 });
    }

    // PDF removed — return Word for both cases
    return generateWordReport(report, lang || 'ar');

  } catch (error: unknown) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
