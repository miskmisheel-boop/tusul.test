import {useMemo, useRef, useState} from 'react';
import type {MutableRefObject, ReactNode} from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  Gauge,
  GraduationCap,
  History,
  Languages,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  UserRound,
  X,
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

type Language = 'mn' | 'en';
type CvStatus = 'uploaded' | 'parsing' | 'analyzing' | 'completed' | 'failed';
type Severity = 'low' | 'medium' | 'high';
type ActiveView = 'overview' | 'upload' | 'analysis' | 'rewrite' | 'interview' | 'career' | 'export';

type Metric = {
  key: string;
  label: string;
  value: number;
  explanation: string;
  confidence: number;
};

type Feedback = {
  id: string;
  type: string;
  severity: Severity;
  original: string;
  suggestion: string;
  explanation: string;
  accepted?: boolean;
};

type CvRecord = {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  uploadedAt: string;
  status: CvStatus;
  overall: number;
};

type AnalysisResult = {
  scores: Metric[];
  summary: string;
  strengths: string[];
  weaknesses: string[];
  keywords: {
    missing: string[];
    recommended: string[];
  };
  feedback: Feedback[];
  interview: {
    technical: string[];
    hr: string[];
    behavioral: string[];
    suggestedAnswers: string[];
  };
  career: {
    currentLevel: string;
    recommendedRoles: string[];
    missingSkills: string[];
    roadmap: string[];
    estimatedDuration: string;
  };
};

type AppCopy = {
  appName: string;
  subtitle: string;
  welcome: string;
  welcomeDesc: string;
  uploadTitle: string;
  uploadDesc: string;
  analyze: string;
  jobDesc: string;
  rawText: string;
  export: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const sampleText = `Frontend Developer
React, TypeScript, Tailwind CSS ашиглан dashboard UI хөгжүүлсэн.
REST API integration хийж, loading болон error state-уудыг сайжруулсан.
Education: MUST Software Engineering.`;

const navigation: Array<{id: ActiveView; labelMn: string; labelEn: string; icon: LucideIcon}> = [
  {id: 'overview', labelMn: 'Нүүр', labelEn: 'Overview', icon: LayoutDashboard},
  {id: 'upload', labelMn: 'CV upload', labelEn: 'CV upload', icon: UploadCloud},
  {id: 'analysis', labelMn: 'Шинжилгээ', labelEn: 'Analysis', icon: BarChart3},
  {id: 'rewrite', labelMn: 'Rewrite', labelEn: 'Rewrite', icon: Sparkles},
  {id: 'interview', labelMn: 'Interview', labelEn: 'Interview', icon: MessageSquareText},
  {id: 'career', labelMn: 'Карьер', labelEn: 'Career', icon: Target},
  {id: 'export', labelMn: 'Export', labelEn: 'Export', icon: Download},
];

const initialRecords: CvRecord[] = [
  {
    id: 'cv_001',
    fileName: 'frontend-developer-cv.pdf',
    fileType: 'pdf',
    uploadedAt: '2026-05-08',
    status: 'completed',
    overall: 84,
  },
  {
    id: 'cv_002',
    fileName: 'junior-fullstack-cv.docx',
    fileType: 'docx',
    uploadedAt: '2026-05-06',
    status: 'analyzing',
    overall: 0,
  },
];

const defaultAnalysis: AnalysisResult = {
  scores: [
    {
      key: 'atsScore',
      label: 'ATS оноо',
      value: 90,
      explanation: 'PDF/DOCX бүтэц ойлгомжтой, section heading болон keyword-үүд ATS дээр уншигдах боломжтой.',
      confidence: 0.92,
    },
    {
      key: 'readability',
      label: 'Уншигдах байдал',
      value: 80,
      explanation: 'Ерөнхий flow сайн боловч bullet бүр action, tool, result гэсэн бүтэцтэй байвал илүү хүчтэй.',
      confidence: 0.87,
    },
    {
      key: 'skillsMatch',
      label: 'Skill match',
      value: 75,
      explanation: 'React, TypeScript, API skill тодорхой байна. Testing, accessibility, performance keyword дутуу.',
      confidence: 0.82,
    },
    {
      key: 'experience',
      label: 'Туршлага',
      value: 85,
      explanation: 'Юу хийсэн гэдэг нь тодорхой ч ямар үр дүн гарсан гэдгийг тоон үзүүлэлтээр батлах хэрэгтэй.',
      confidence: 0.88,
    },
    {
      key: 'grammar',
      label: 'Grammar',
      value: 92,
      explanation: 'Үндсэн бичвэр цэвэр. Зарим informal өгүүлбэрийг professional tone руу шилжүүлэх боломжтой.',
      confidence: 0.91,
    },
  ],
  summary:
    'CV ерөнхийдөө сайн боловч recruiter-д илүү хүчтэй харагдуулахын тулд хэмжигдэхүйц impact, ATS keyword, professional summary хэсгийг сайжруулах шаардлагатай.',
  strengths: ['Frontend skill тодорхой', 'Төсөл болон технологи дурдсан', 'ATS-д уншигдах section бүтэцтэй'],
  weaknesses: ['Impact metric бага', 'Job description-тэй keyword match дутуу', 'Summary хэсэг хэт ерөнхий'],
  keywords: {
    missing: ['Unit Testing', 'Accessibility', 'Performance Optimization', 'CI/CD', 'REST API Integration'],
    recommended: ['JavaScript', 'TypeScript', 'Responsive UI', 'Cross-functional collaboration', 'Design System'],
  },
  feedback: [
    {
      id: 'fb_1',
      type: 'experience',
      severity: 'medium',
      original: 'Website хөгжүүлсэн',
      suggestion:
        'React болон TypeScript ашиглан responsive веб платформ хөгжүүлж, хэрэглэгчийн navigation болон UI consistency-г сайжруулсан.',
      explanation: 'Technology, responsibility, outcome гурвыг тодорхой болгосон.',
    },
    {
      id: 'fb_2',
      type: 'ats',
      severity: 'high',
      original: 'API хийсэн',
      suggestion:
        'REST API integration, error handling болон loading state-уудыг хэрэгжүүлж frontend-backend data flow-г тогтвортой болгосон.',
      explanation: 'ATS keyword болон professional phrasing нэмсэн.',
    },
    {
      id: 'fb_3',
      type: 'grammar',
      severity: 'low',
      original: 'Багаар ажиллаж чадна',
      suggestion:
        'Cross-functional багтай хамтран requirement тодруулж, sprint delivery болон code review process-д идэвхтэй оролцсон.',
      explanation: 'Soft skill-ийг нотолгоотой туршлага болгон хувиргасан.',
    },
  ],
  interview: {
    technical: [
      'React component re-render-ийг хэрхэн багасгах вэ?',
      'TypeScript strict mode ашиглахын давуу тал юу вэ?',
      'REST API integration хийх үед error handling-ийг яаж зохион байгуулах вэ?',
    ],
    hr: [
      'Өөрийн хамгийн хүчтэй давуу талаа нэг төслийн жишээгээр тайлбарлана уу.',
      'Шинэ технологи хурдан сурахдаа ямар арга барил ашигладаг вэ?',
    ],
    behavioral: [
      'Deadline шахуу үед багийн priority-г яаж тогтоож байсан бэ?',
      'Code review дээр санал зөрсөн тохиолдлыг хэрхэн шийдсэн бэ?',
    ],
    suggestedAnswers: [
      'STAR аргачлал ашигла: Situation, Task, Action, Result.',
      'Хариулт бүрт technology, decision, measurable result оруулахыг зорь.',
    ],
  },
  career: {
    currentLevel: 'Junior to Mid-level Frontend Developer',
    recommendedRoles: ['Mid Frontend Developer', 'React Developer', 'Junior Fullstack Developer'],
    missingSkills: ['Node.js', 'PostgreSQL', 'Testing', 'System Design', 'Docker basics'],
    roadmap: [
      '1-р сар: TypeScript advanced + React patterns',
      '2-р сар: Unit/integration testing + Playwright basics',
      '3-р сар: Node.js, PostgreSQL, API security',
      '4-6-р сар: Portfolio project + deployment + interview practice',
    ],
    estimatedDuration: '3-6 сар',
  },
};

function calculateOverall(scores: Metric[]) {
  return Math.round(scores.reduce((sum, metric) => sum + metric.value, 0) / scores.length);
}

function getCopy(lang: Language): AppCopy {
  if (lang === 'en') {
    return {
      appName: 'CV AI Pro',
      subtitle: 'AI-powered CV improvement platform',
      welcome: 'CV performance dashboard',
      welcomeDesc:
        'Upload a CV, check ATS fit, review rewrite suggestions, prepare for interviews, plan a career path and export an optimized draft.',
      uploadTitle: 'CV upload and analysis',
      uploadDesc: 'PDF/DOCX up to 10MB. CV text is treated only as untrusted analysis input.',
      analyze: 'Start analysis',
      jobDesc: 'Target job description',
      rawText: 'Extracted or pasted CV text',
      export: 'Export',
    };
  }

  return {
    appName: 'CV AI Pro',
    subtitle: 'AI-д суурилсан CV сайжруулах систем',
    welcome: 'CV performance dashboard',
    welcomeDesc:
      'CV upload, ATS оноо, rewrite suggestion, interview бэлтгэл, career roadmap, export flow бүгд нэг дор.',
    uploadTitle: 'CV upload болон шинжилгээ',
    uploadDesc: 'PDF/DOCX файл 10MB хүртэл. CV текстийг зөвхөн шинжилгээний input гэж үзнэ.',
    analyze: 'Шинжилгээ эхлүүлэх',
    jobDesc: 'Target job description',
    rawText: 'CV-ээс уншсан эсвэл оруулсан текст',
    export: 'Export хийх',
  };
}

function getStatusText(status: CvStatus, lang: Language) {
  const values: Record<CvStatus, {mn: string; en: string}> = {
    uploaded: {mn: 'Upload хийгдсэн', en: 'Uploaded'},
    parsing: {mn: 'CV parse хийж байна', en: 'Parsing CV'},
    analyzing: {mn: 'AI шинжилгээ хийж байна', en: 'Analyzing'},
    completed: {mn: 'Дууссан', en: 'Completed'},
    failed: {mn: 'Алдаа гарсан', en: 'Failed'},
  };
  return values[status][lang];
}

function severityClass(severity: Severity) {
  if (severity === 'high') {
    return 'border-rose-300 bg-rose-50 text-rose-700';
  }
  if (severity === 'medium') {
    return 'border-amber-300 bg-amber-50 text-amber-700';
  }
  return 'border-emerald-300 bg-emerald-50 text-emerald-700';
}

function severityLabel(severity: Severity, lang: Language) {
  const labels: Record<Severity, {mn: string; en: string}> = {
    high: {mn: 'Өндөр', en: 'High'},
    medium: {mn: 'Дунд', en: 'Medium'},
    low: {mn: 'Бага', en: 'Low'},
  };
  return labels[severity][lang];
}

function buildFileType(file: File): 'pdf' | 'docx' | null {
  const name = file.name.toLowerCase();
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return 'docx';
  }
  return null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createAnalysisFromInput(rawText: string, jobDescription: string): AnalysisResult {
  const lower = `${rawText} ${jobDescription}`.toLowerCase();
  const hasReact = lower.includes('react');
  const hasTypeScript = lower.includes('typescript') || lower.includes('ts');
  const hasApi = lower.includes('api');
  const hasTesting = lower.includes('test');
  const hasMetrics = /\d+%|\d+\+|\$\d+|\d+ хэрэглэгч|\d+ users/.test(lower);

  const skillsScore = 62 + (hasReact ? 8 : 0) + (hasTypeScript ? 8 : 0) + (hasApi ? 7 : 0) + (hasTesting ? 7 : 0);
  const experienceScore = hasMetrics ? 88 : 76;
  const atsScore = 82 + (jobDescription.trim() ? 6 : 0) + (hasTypeScript ? 4 : 0);
  const readability = rawText.length > 350 ? 82 : 76;
  const grammar = 90;

  const scores = defaultAnalysis.scores.map((metric) => {
    if (metric.key === 'atsScore') return {...metric, value: Math.min(100, atsScore)};
    if (metric.key === 'readability') return {...metric, value: readability};
    if (metric.key === 'skillsMatch') return {...metric, value: Math.min(100, skillsScore)};
    if (metric.key === 'experience') return {...metric, value: experienceScore};
    if (metric.key === 'grammar') return {...metric, value: grammar};
    return metric;
  });

  return {
    ...defaultAnalysis,
    scores,
    summary: jobDescription.trim()
      ? 'Target job description дээр тулгуурлан CV keyword match, ATS structure, rewrite suggestion-уудыг шинэчилсэн.'
      : defaultAnalysis.summary,
    keywords: {
      missing: [
        ...(!hasTesting ? ['Unit Testing'] : []),
        'Accessibility',
        'Performance Optimization',
        ...(!hasApi ? ['REST API Integration'] : []),
        'CI/CD',
      ],
      recommended: defaultAnalysis.keywords.recommended,
    },
  };
}

export default function App() {
  const [lang, setLang] = useState<Language>('mn');
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [records, setRecords] = useState<CvRecord[]>(initialRecords);
  const [analysis, setAnalysis] = useState<AnalysisResult>(defaultAnalysis);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState(sampleText);
  const [jobDescription, setJobDescription] = useState(
    'Frontend Developer role: React, TypeScript, REST API, testing, responsive UI.',
  );
  const [uploadError, setUploadError] = useState('');
  const [processingStatus, setProcessingStatus] = useState<CvStatus>('completed');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const copy = getCopy(lang);
  const overall = useMemo(() => calculateOverall(analysis.scores), [analysis]);
  const acceptedCount = analysis.feedback.filter((item) => item.accepted).length;

  const setTemporaryToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const handleFile = (file: File) => {
    setUploadError('');
    const fileType = buildFileType(file);

    if (!fileType) {
      setUploadError(lang === 'mn' ? 'Зөвхөн PDF болон DOCX файл upload хийнэ үү.' : 'Only PDF and DOCX files are allowed.');
      setSelectedFile(null);
      return;
    }

    if (file.size <= 0) {
      setUploadError(lang === 'mn' ? 'Хоосон файл байна.' : 'The selected file is empty.');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError(lang === 'mn' ? 'Файлын хэмжээ 10MB-аас их байна.' : 'File size must be under 10MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    const nextRecord: CvRecord = {
      id: `cv_${Date.now()}`,
      fileName: file.name,
      fileType,
      uploadedAt: new Date().toISOString().slice(0, 10),
      status: 'uploaded',
      overall: 0,
    };
    setRecords((current) => [nextRecord, ...current]);
    setProcessingStatus('uploaded');
  };

  const runAnalysis = async () => {
    if (!selectedFile && !rawText.trim()) {
      setUploadError(lang === 'mn' ? 'CV файл эсвэл CV текст оруулна уу.' : 'Upload a CV file or paste CV text.');
      return;
    }

    setIsProcessing(true);
    setUploadError('');
    setProcessingStatus('parsing');
    setRecords((items) => items.map((item, index) => (index === 0 ? {...item, status: 'parsing'} : item)));

    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setProcessingStatus('analyzing');
    setRecords((items) => items.map((item, index) => (index === 0 ? {...item, status: 'analyzing'} : item)));

    await new Promise((resolve) => window.setTimeout(resolve, 650));
    const nextAnalysis = createAnalysisFromInput(rawText || sampleText, jobDescription);
    const nextOverall = calculateOverall(nextAnalysis.scores);
    setAnalysis(nextAnalysis);
    setProcessingStatus('completed');
    setRecords((items) => items.map((item, index) => (index === 0 ? {...item, status: 'completed', overall: nextOverall} : item)));
    setIsProcessing(false);
    setActiveView('analysis');
    setTemporaryToast(lang === 'mn' ? 'AI шинжилгээ амжилттай дууслаа.' : 'AI analysis completed.');
  };

  const acceptFeedback = (id: string) => {
    setAnalysis((current) => ({
      ...current,
      feedback: current.feedback.map((item) => (item.id === id ? {...item, accepted: true} : item)),
    }));
    setTemporaryToast(lang === 'mn' ? 'Rewrite шинэ CV draft-д нэмэгдлээ.' : 'Rewrite accepted into the CV draft.');
  };

  const rejectFeedback = (id: string) => {
    setAnalysis((current) => ({
      ...current,
      feedback: current.feedback.filter((item) => item.id !== id),
    }));
    setTemporaryToast(lang === 'mn' ? 'Санал устгагдлаа.' : 'Suggestion removed.');
  };

  const regenerateFeedback = (id: string) => {
    setAnalysis((current) => ({
      ...current,
      feedback: current.feedback.map((item) =>
        item.id === id
          ? {
              ...item,
              suggestion: `${item.suggestion} Мөн үр дүнг тоон үзүүлэлтээр тодруулж, target role-ийн keyword-үүдтэй уялдуулах боломжтой.`,
              accepted: false,
            }
          : item,
      ),
    }));
    setTemporaryToast(lang === 'mn' ? 'AI suggestion дахин үүсгэлээ.' : 'Suggestion regenerated.');
  };

  const exportOptimizedCv = async (format: 'pdf' | 'docx') => {
    const accepted = analysis.feedback.filter((item) => item.accepted).map((item) => `- ${item.suggestion}`);
    const content = [
      'OPTIMIZED CV DRAFT',
      '',
      analysis.summary,
      '',
      'CORE KEYWORDS',
      analysis.keywords.recommended.join(', '),
      '',
      'ACCEPTED REWRITES',
      accepted.length ? accepted.join('\n') : analysis.feedback.map((item) => `- ${item.suggestion}`).join('\n'),
      '',
      'NEXT ACTIONS',
      analysis.weaknesses.map((item) => `- ${item}`).join('\n'),
    ].join('\n');

    if (format === 'pdf') {
      const {jsPDF} = await import('jspdf');
      const doc = new jsPDF();
      const lines = doc.splitTextToSize(content, 180);
      doc.setFontSize(12);
      doc.text(lines, 15, 20);
      doc.save('optimized-cv.pdf');
      return;
    }

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Optimized CV</title></head><body><pre>${escapeHtml(
      content,
    )}</pre></body></html>`;
    const blob = new Blob([html], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'optimized-cv.docx';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:py-5">
            <div className="flex items-center gap-3">
              <div className="icon-breathe flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                <BrainCircuit size={22} />
              </div>
              <div>
                <p className="text-lg font-black">{copy.appName}</p>
                <p className="text-xs font-semibold text-slate-500">{copy.subtitle}</p>
              </div>
            </div>
            <button
              className="pressable rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 lg:mt-5 lg:w-full"
              onClick={() => setLang((value) => (value === 'mn' ? 'en' : 'mn'))}
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                <Languages size={15} /> {lang === 'mn' ? 'English' : 'Монгол'}
              </span>
            </button>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible lg:px-5 lg:py-3">
            {navigation.map((item) => (
              <button
                key={item.id}
                className={`nav-button flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold lg:min-w-0 ${
                  activeView === item.id
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
                onClick={() => setActiveView(item.id)}
                type="button"
              >
                <item.icon size={18} />
                {lang === 'mn' ? item.labelMn : item.labelEn}
              </button>
            ))}
          </nav>

          <div className="hidden px-5 py-5 lg:block">
            <div className="hover-lift rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <ShieldCheck size={18} />
                <p className="text-sm font-black">Privacy guard</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-emerald-900">
                {lang === 'mn'
                  ? 'CV personal data, raw CV text, AI prompt/output console log хийхгүй байх зарчимтай.'
                  : 'No CV personal data, raw text, AI prompt or output should be logged.'}
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-5">
            <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    MVP to production-ready
                  </span>
                  <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">
                    TypeScript / responsive / schema-ready
                  </span>
                </div>
                <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{copy.welcome}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{copy.welcomeDesc}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[340px]">
                <MiniStat label="Overall" value={`${overall}/100`} />
                <MiniStat label="Rewrite" value={`${acceptedCount}/${analysis.feedback.length}`} />
                <MiniStat label="Status" value={getStatusText(processingStatus, lang)} compact />
              </div>
            </header>

            {toast && (
              <div className="toast-rise fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl">
                {toast}
              </div>
            )}

            <div key={activeView} className="slow-view-enter">
              {activeView === 'overview' && (
                <OverviewView
                  lang={lang}
                  records={records}
                  analysis={analysis}
                  overall={overall}
                  setActiveView={setActiveView}
                />
              )}

              {activeView === 'upload' && (
                <UploadView
                  lang={lang}
                  copy={copy}
                  selectedFile={selectedFile}
                  uploadError={uploadError}
                  rawText={rawText}
                  jobDescription={jobDescription}
                  isProcessing={isProcessing}
                  processingStatus={processingStatus}
                  fileInputRef={fileInputRef}
                  setRawText={setRawText}
                  setJobDescription={setJobDescription}
                  handleFile={handleFile}
                  runAnalysis={runAnalysis}
                />
              )}

              {activeView === 'analysis' && <AnalysisView analysis={analysis} overall={overall} lang={lang} />}
              {activeView === 'rewrite' && (
                <RewriteView
                  analysis={analysis}
                  lang={lang}
                  acceptFeedback={acceptFeedback}
                  rejectFeedback={rejectFeedback}
                  regenerateFeedback={regenerateFeedback}
                />
              )}
              {activeView === 'interview' && <InterviewView analysis={analysis} lang={lang} />}
              {activeView === 'career' && <CareerView analysis={analysis} lang={lang} />}
              {activeView === 'export' && <ExportView analysis={analysis} lang={lang} exportOptimizedCv={exportOptimizedCv} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function MiniStat({label, value, compact}: {label: string; value: string; compact?: boolean}) {
  return (
    <div className="hover-lift rounded-lg border border-slate-200 bg-white px-3 py-3">
      <p className="text-[10px] font-black uppercase text-slate-500">{label}</p>
      <p className={`${compact ? 'text-xs leading-5' : 'text-xl'} mt-1 font-black text-slate-950`}>{value}</p>
    </div>
  );
}

function OverviewView({
  lang,
  records,
  analysis,
  overall,
  setActiveView,
}: {
  lang: Language;
  records: CvRecord[];
  analysis: AnalysisResult;
  overall: number;
  setActiveView: (view: ActiveView) => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ScoreCard icon={Gauge} label="Overall CV Score" value={overall} helper="5 metric average" />
          <ScoreCard icon={FileCheck2} label="ATS Score" value={analysis.scores[0].value} helper="Keyword & structure" />
          <ScoreCard icon={ClipboardCheck} label="Grammar" value={analysis.scores[4].value} helper="Tone & spelling" />
          <ScoreCard icon={BriefcaseBusiness} label="Skills Match" value={analysis.scores[2].value} helper="Target role fit" />
        </div>

        <Panel title={lang === 'mn' ? 'Сүүлийн CV файлууд' : 'Recent CVs'} icon={History}>
          <div className="divide-y divide-slate-200">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-3 rounded-lg px-2 py-3 transition-all duration-500 ease-out first:pt-0 last:pb-0 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{record.fileName}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {record.fileType.toUpperCase()} / {record.uploadedAt}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={record.status} lang={lang} />
                  <span className="rounded-md bg-slate-950 px-3 py-1 text-xs font-black text-white">
                    {record.overall ? `${record.overall}/100` : '--'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={lang === 'mn' ? 'AI feedback summary' : 'AI feedback summary'} icon={Sparkles}>
          <p className="text-sm leading-7 text-slate-700">{analysis.summary}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Checklist title={lang === 'mn' ? 'Давуу тал' : 'Strengths'} items={analysis.strengths} positive />
            <Checklist title={lang === 'mn' ? 'Сайжруулах хэсэг' : 'Improve'} items={analysis.weaknesses} />
          </div>
        </Panel>
      </section>

      <aside className="space-y-5">
        <Panel title="Quick Actions" icon={ArrowRight}>
          <div className="space-y-2">
            {[
              {label: lang === 'mn' ? 'Шинэ CV upload хийх' : 'Upload new CV', view: 'upload' as ActiveView, icon: UploadCloud},
              {label: lang === 'mn' ? 'Rewrite санал харах' : 'Review rewrites', view: 'rewrite' as ActiveView, icon: Sparkles},
              {label: lang === 'mn' ? 'Interview бэлтгэх' : 'Prepare interview', view: 'interview' as ActiveView, icon: MessageSquareText},
              {label: lang === 'mn' ? 'Export татах' : 'Download export', view: 'export' as ActiveView, icon: Download},
            ].map((action) => (
              <button
                key={action.label}
                className="pressable flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3 text-left text-sm font-black text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                onClick={() => setActiveView(action.view)}
                type="button"
              >
                <span className="inline-flex items-center gap-3">
                  <action.icon size={18} /> {action.label}
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Security checklist" icon={LockKeyhole}>
          <div className="space-y-3 text-sm text-slate-700">
            {[
              'OpenAI API key frontend дээр байхгүй',
              'Prompt injection guardrail server prompt-д байна',
              'Sensitive CV data console log хийхгүй',
              'Consistent API response format ашиглана',
            ].map((item) => (
              <div key={item} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={17} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Panel>
      </aside>
    </div>
  );
}

function UploadView({
  lang,
  copy,
  selectedFile,
  uploadError,
  rawText,
  jobDescription,
  isProcessing,
  processingStatus,
  fileInputRef,
  setRawText,
  setJobDescription,
  handleFile,
  runAnalysis,
}: {
  lang: Language;
  copy: AppCopy;
  selectedFile: File | null;
  uploadError: string;
  rawText: string;
  jobDescription: string;
  isProcessing: boolean;
  processingStatus: CvStatus;
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  setRawText: (value: string) => void;
  setJobDescription: (value: string) => void;
  handleFile: (file: File) => void;
  runAnalysis: () => Promise<void>;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Panel title={copy.uploadTitle} icon={UploadCloud} subtitle={copy.uploadDesc}>
        <div
          className="hover-lift rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-blue-400 hover:bg-blue-50/40"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
        >
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="icon-breathe mx-auto flex size-14 items-center justify-center rounded-lg bg-slate-950 text-white">
            <UploadCloud size={28} />
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-950">
            {selectedFile ? selectedFile.name : lang === 'mn' ? 'Файлаа энд чирж оруулах эсвэл сонгох' : 'Drop or choose your file'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">PDF / DOCX / Max 10MB</p>
          <button
            className="pressable mt-5 rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {lang === 'mn' ? 'Файл сонгох' : 'Choose file'}
          </button>
          {uploadError && (
            <div className="mx-auto mt-4 flex max-w-xl items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              <AlertTriangle size={18} /> {uploadError}
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-black uppercase text-slate-500">{copy.rawText}</span>
            <textarea
              className="min-h-56 w-full rounded-lg border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-800 outline-none transition-all duration-500 ease-out placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              placeholder="Paste CV text here for local analysis preview..."
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase text-slate-500">{copy.jobDesc}</span>
            <textarea
              className="min-h-56 w-full rounded-lg border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-800 outline-none transition-all duration-500 ease-out placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste target job description to optimize keywords..."
            />
          </label>
        </div>

        <button
          className="pressable mt-5 flex w-full items-center justify-center gap-3 rounded-lg bg-blue-700 px-6 py-4 text-sm font-black text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isProcessing}
          onClick={runAnalysis}
          type="button"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
          {isProcessing ? getStatusText(processingStatus, lang) : copy.analyze}
        </button>
      </Panel>

      <Panel title={lang === 'mn' ? 'Processing status' : 'Processing status'} icon={Gauge}>
        <div className="space-y-4">
          {(['uploaded', 'parsing', 'analyzing', 'completed'] as CvStatus[]).map((status) => (
            <div key={status} className="hover-lift flex gap-3 rounded-lg p-2">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-500 ease-out ${
                  status === processingStatus || processingStatus === 'completed'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                {status === processingStatus && isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              </div>
              <div>
                <p className="text-sm font-black text-slate-950">{getStatusText(status, lang)}</p>
                <p className="text-xs leading-5 text-slate-500">
                  {status === 'uploaded' && 'File validation, size/type check'}
                  {status === 'parsing' && 'Raw text + structured JSON extraction'}
                  {status === 'analyzing' && 'Stage-based AI scoring + schema validation'}
                  {status === 'completed' && 'Dashboard, rewrite, interview, export ready'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function AnalysisView({analysis, overall, lang}: {analysis: AnalysisResult; overall: number; lang: Language}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="card-enter hover-lift rounded-lg border border-blue-200 bg-blue-50 p-5 xl:col-span-2">
          <p className="text-xs font-black uppercase text-blue-800">Overall CV Score</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-6xl font-black text-slate-950">{overall}</span>
            <span className="mb-2 text-lg font-black text-slate-500">/100</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{analysis.summary}</p>
        </div>
        {analysis.scores.map((metric) => (
          <MetricTile key={metric.key} metric={metric} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={lang === 'mn' ? 'Дутуу keyword' : 'Missing keywords'} icon={Target}>
          <KeywordCloud items={analysis.keywords.missing} tone="missing" />
        </Panel>
        <Panel title={lang === 'mn' ? 'Санал болгох keyword' : 'Recommended keywords'} icon={Sparkles}>
          <KeywordCloud items={analysis.keywords.recommended} tone="recommended" />
        </Panel>
      </div>

      <Panel title="Recruiter-style feedback" icon={UserRound}>
        <div className="grid gap-4 lg:grid-cols-3">
          {analysis.feedback.map((item) => (
            <FeedbackCard key={item.id} item={item} lang={lang} compact />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function RewriteView({
  analysis,
  lang,
  acceptFeedback,
  rejectFeedback,
  regenerateFeedback,
}: {
  analysis: AnalysisResult;
  lang: Language;
  acceptFeedback: (id: string) => void;
  rejectFeedback: (id: string) => void;
  regenerateFeedback: (id: string) => void;
}) {
  return (
    <Panel title={lang === 'mn' ? 'AI rewrite suggestions' : 'AI rewrite suggestions'} icon={Sparkles}>
      <div className="grid gap-4 xl:grid-cols-3">
        {analysis.feedback.map((item) => (
          <FeedbackCard
            key={item.id}
            item={item}
            lang={lang}
            actions={
              <div className="mt-5 flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
                <button
                  className="pressable flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-xs font-black uppercase text-white hover:bg-emerald-600 disabled:opacity-50"
                  disabled={item.accepted}
                  onClick={() => acceptFeedback(item.id)}
                  type="button"
                >
                  <Check size={15} /> {item.accepted ? 'Accepted' : 'Accept'}
                </button>
                <button
                  className="pressable flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-xs font-black uppercase text-slate-700 hover:bg-slate-50"
                  onClick={() => regenerateFeedback(item.id)}
                  type="button"
                >
                  <RefreshCw size={15} /> Regen
                </button>
                <button
                  className="pressable flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-200 px-4 py-3 text-xs font-black uppercase text-rose-700 hover:bg-rose-50"
                  onClick={() => rejectFeedback(item.id)}
                  type="button"
                >
                  <X size={15} /> Reject
                </button>
              </div>
            }
          />
        ))}
      </div>
    </Panel>
  );
}

function InterviewView({analysis, lang}: {analysis: AnalysisResult; lang: Language}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <QuestionPanel title="Technical" icon={BrainCircuit} items={analysis.interview.technical} />
      <QuestionPanel title="HR" icon={UserRound} items={analysis.interview.hr} />
      <QuestionPanel title="Behavioral" icon={MessageSquareText} items={analysis.interview.behavioral} />
      <Panel title={lang === 'mn' ? 'Suggested answer strategy' : 'Suggested answer strategy'} icon={BookOpenCheck}>
        <Checklist items={analysis.interview.suggestedAnswers} title="STAR Framework" positive />
      </Panel>
    </div>
  );
}

function CareerView({analysis, lang}: {analysis: AnalysisResult; lang: Language}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Panel title={lang === 'mn' ? 'Career recommendation' : 'Career recommendation'} icon={GraduationCap}>
        <p className="text-xs font-black uppercase text-slate-500">Current level</p>
        <p className="mt-2 text-2xl font-black text-slate-950">{analysis.career.currentLevel}</p>
        <p className="mt-5 text-xs font-black uppercase text-slate-500">Estimated duration</p>
        <p className="mt-2 rounded-lg bg-blue-50 px-4 py-3 text-sm font-black text-blue-800">{analysis.career.estimatedDuration}</p>
        <div className="mt-5">
          <Checklist title="Recommended roles" items={analysis.career.recommendedRoles} positive />
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title={lang === 'mn' ? 'Дутуу skill' : 'Missing skills'} icon={Target}>
          <KeywordCloud items={analysis.career.missingSkills} tone="missing" />
        </Panel>
        <Panel title={lang === 'mn' ? '3-6 сарын roadmap' : '3-6 month roadmap'} icon={GraduationCap}>
          <div className="grid gap-3 md:grid-cols-2">
            {analysis.career.roadmap.map((step, index) => (
              <div key={step} className="hover-lift rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ExportView({
  analysis,
  lang,
  exportOptimizedCv,
}: {
  analysis: AnalysisResult;
  lang: Language;
  exportOptimizedCv: (format: 'pdf' | 'docx') => Promise<void>;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Panel title={lang === 'mn' ? 'Optimized CV preview' : 'Optimized CV preview'} icon={FileCheck2}>
        <div className="hover-lift rounded-lg border border-slate-200 bg-white p-6 text-slate-950">
          <p className="text-xs font-black uppercase text-blue-700">Professional Summary</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{analysis.summary}</p>
          <p className="mt-6 text-xs font-black uppercase text-blue-700">Core Skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.keywords.recommended.map((keyword) => (
              <span key={keyword} className="hover-lift rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {keyword}
              </span>
            ))}
          </div>
          <p className="mt-6 text-xs font-black uppercase text-blue-700">Experience highlights</p>
          <div className="mt-3 space-y-3">
            {analysis.feedback.map((item) => (
              <p key={item.id} className="hover-lift rounded-lg border border-slate-200 p-4 text-sm leading-6 text-slate-700">
                {item.suggestion}
              </p>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title={lang === 'mn' ? 'Download' : 'Download'} icon={Download}>
        <div className="space-y-3">
          <button
            className="pressable flex w-full items-center justify-center gap-3 rounded-lg bg-blue-700 px-5 py-4 text-sm font-black text-white hover:bg-blue-600"
            onClick={() => exportOptimizedCv('pdf')}
            type="button"
          >
            <Download size={18} /> PDF татах
          </button>
          <button
            className="pressable flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-5 py-4 text-sm font-black text-slate-800 hover:bg-slate-50"
            onClick={() => exportOptimizedCv('docx')}
            type="button"
          >
            <Download size={18} /> DOCX татах
          </button>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          {lang === 'mn'
            ? 'PDF export нь jsPDF ашиглана. DOCX нь MVP browser-compatible Word document байдлаар татагдана.'
            : 'PDF uses jsPDF. DOCX is exported as an MVP browser-compatible Word document.'}
        </p>
      </Panel>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="group card-enter hover-lift rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white transition-transform duration-500 ease-out group-hover:scale-105">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function ScoreCard({icon: Icon, label, value, helper}: {icon: LucideIcon; label: string; value: number; helper: string}) {
  return (
    <article className="group card-enter hover-lift rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition-transform duration-500 ease-out group-hover:scale-105">
          <Icon size={22} />
        </div>
      </div>
      <div className="mt-4 h-2 rounded bg-slate-100">
        <div className="progress-smooth h-2 rounded bg-blue-700" style={{width: `${value}%`}} />
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-500">{helper}</p>
    </article>
  );
}

function MetricTile({metric}: {metric: Metric}) {
  return (
    <article className="card-enter hover-lift rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-slate-950">{metric.label}</p>
        <span className="rounded-md bg-slate-950 px-3 py-1 text-xs font-black text-white">{metric.value}/100</span>
      </div>
      <div className="mt-4 h-2 rounded bg-slate-100">
        <div className="progress-smooth h-2 rounded bg-emerald-600" style={{width: `${metric.value}%`}} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{metric.explanation}</p>
      <p className="mt-3 text-xs font-bold text-slate-500">Confidence: {Math.round(metric.confidence * 100)}%</p>
    </article>
  );
}

function Checklist({title, items, positive}: {title?: string; items: string[]; positive?: boolean}) {
  return (
    <div>
      {title && <p className="mb-3 text-xs font-black uppercase text-slate-500">{title}</p>}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="hover-lift flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            {positive ? (
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} />
            ) : (
              <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />
            )}
            <p className="text-sm leading-6 text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({status, lang}: {status: CvStatus; lang: Language}) {
  const isDone = status === 'completed';
  const isWorking = status === 'parsing' || status === 'analyzing';
  return (
    <span
      className={`rounded-md px-3 py-1 text-xs font-black transition-all duration-500 ease-out ${
        isDone
          ? 'bg-emerald-50 text-emerald-700'
          : isWorking
            ? 'bg-blue-50 text-blue-700'
            : 'bg-slate-100 text-slate-700'
      }`}
    >
      {getStatusText(status, lang)}
    </span>
  );
}

function FeedbackCard({
  item,
  lang,
  actions,
  compact,
}: {
  item: Feedback;
  lang: Language;
  actions?: ReactNode;
  compact?: boolean;
}) {
  return (
    <article className="card-enter hover-lift rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black uppercase text-slate-600">
          {item.type}
        </span>
        <span className={`rounded-md border px-3 py-1 text-xs font-black uppercase ${severityClass(item.severity)}`}>
          {severityLabel(item.severity, lang)}
        </span>
      </div>
      <div className="mt-5 space-y-4">
        <div>
          <p className="text-[10px] font-black uppercase text-slate-500">Before</p>
          <p className="mt-2 rounded-lg bg-rose-50 p-4 text-sm leading-6 text-rose-800 transition-colors duration-500 ease-out hover:bg-rose-100">
            {item.original}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-slate-500">After</p>
          <p className="mt-2 rounded-lg bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 transition-colors duration-500 ease-out hover:bg-emerald-100">
            {item.suggestion}
          </p>
        </div>
        {!compact && <p className="text-xs leading-5 text-slate-500">{item.explanation}</p>}
      </div>
      {actions}
    </article>
  );
}

function KeywordCloud({items, tone}: {items: string[]; tone: 'missing' | 'recommended'}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`hover-lift rounded-md border px-3 py-2 text-sm font-bold ${
            tone === 'missing'
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function QuestionPanel({title, icon, items}: {title: string; icon: LucideIcon; items: string[]}) {
  return (
    <Panel title={title} icon={icon}>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item} className="hover-lift flex gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">
              {index + 1}
            </div>
            <p className="text-sm leading-6 text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
