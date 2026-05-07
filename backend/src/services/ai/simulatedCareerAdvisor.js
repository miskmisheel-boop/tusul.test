const { detectSkills, inferExperienceLevel, findWeakPoints, rewriteCvText } = require("../../utils/cvHeuristics");
const { normalizeAnalysisResponse } = require("../../utils/analysisSchema");

const providerName = "simulated";

function unique(items) {
  return [...new Set(items)];
}

function mapExperienceLevelLabel(experienceLevel, language) {
  if (language !== "mn") {
    return experienceLevel;
  }

  if (experienceLevel === "Senior") {
    return "Ахисан түвшин";
  }

  if (experienceLevel === "Mid-Level") {
    return "Дунд түвшин";
  }

  return "Анхан шат";
}

function getMongolianLevelForms(experienceLevel) {
  if (experienceLevel === "Senior") {
    return {
      label: "Ахисан түвшин",
      locative: "ахисан түвшинд",
      adjectival: "ахисан түвшний"
    };
  }

  if (experienceLevel === "Mid-Level") {
    return {
      label: "Дунд түвшин",
      locative: "дунд түвшинд",
      adjectival: "дунд түвшний"
    };
  }

  return {
    label: "Анхан шат",
    locative: "анхан шатанд",
    adjectival: "анхан шатны"
  };
}

function buildLocalizedContent(payload, skills, experienceLevel, weakPoints) {
  const localizedExperienceLevel = mapExperienceLevelLabel(experienceLevel, payload.language);
  const mnLevelForms = getMongolianLevelForms(experienceLevel);

  if (payload.language === "mn") {
    return {
      weakPoints: weakPoints.map((item) => {
        if (item === "Few measurable achievements are visible in the CV.") {
          return "CV дээр тоон үзүүлэлттэй, хэмжигдэхүйц амжилтууд хангалттай тодорхой биш байна.";
        }

        if (item === "The CV does not clearly showcase a broad enough skills section.") {
          return "CV-ийн ур чадварын хэсэг хангалттай өргөн, тодорхой харагдахгүй байна.";
        }

        if (item === "Project or professional experience descriptions need more detail.") {
          return "Төслийн болон ажлын туршлагын тайлбаруудыг илүү дэлгэрэнгүй болгох шаардлагатай.";
        }

        if (item === "A targeted professional summary is missing.") {
          return "Зорилтот ажлын чиглэлд тохирсон мэргэжлийн товч танилцуулга дутуу байна.";
        }

        if (item === "No major weak points detected from the simulated analysis.") {
          return "Симуляцлагдсан шинжилгээгээр томоохон сул тал илрээгүй.";
        }

        return item;
      }),
      careerRecommendations: unique([
        `Таны одоогийн ${mnLevelForms.locative} нийцэх ${payload.targetRole} чиглэлийн ажлуудад төвлөрөх нь зүйтэй.`,
        "Портфолио болон төслүүддээ хэмжигдэхүйц үр дүн, бизнесийн нөлөөг илүү тодорхой тусгаарай.",
        "Ажлын ярилцлага болон анкет илгээхдээ тухайн албан тушаалд нийцсэн жишээ, кейсүүдийг онцлон ашиглаарай."
      ]),
      cvImprovementSuggestions: unique([
        "Сүүлийн ажлууд болон төслүүд дээрээ хэмжигдэхүйц үр дүн, тоон үзүүлэлт нэмээрэй.",
        "Гол ур чадваруудаа товч, ойлгомжтой, уншихад хялбар хэсэг болгон бүлэглээрэй.",
        "CV-ийн мэргэжлийн танилцуулга хэсгийг зорилтот ажлын байр болон салбарт нийцүүлэн сайжруулаарай."
      ]),
      summary: `${payload.fullName} нь ${payload.targetRole} чиглэлд ${localizedExperienceLevel.toLowerCase()} түвшний нэр дэвшигчийн дүр зурагтай бөгөөд CV дээрээс ${skills.length} төрлийн ур чадвар илэрлээ.`,
      rewrittenCv: rewriteCvText({
        ...payload,
        titleSuffix: "албан тушаалд нэр дэвшигч",
        experienceLevelLabel: localizedExperienceLevel,
        summaryLabel: "МЭРГЭЖЛИЙН ТОВЧ ТАНИЛЦУУЛГА",
        skillsLabel: "ГОЛ УР ЧАДВАРУУД",
        highlightsLabel: "ТУРШЛАГЫН ОНЦЛОХ ХЭСГҮҮД",
        projectsLabel: "ТӨСЛҮҮД",
        educationLabel: "БОЛОВСРОЛ",
        summaryText: `${mnLevelForms.adjectival} ${payload.targetRole} чиглэлд ажиллах зорилготой, ${skills.slice(0, 6).join(", ") || "холбогдох техникийн болон мэргэжлийн ур чадварууд"} дээр суурилсан туршлагатай нэр дэвшигч. Практик үр дүн гаргах, хурдан суралцах, өндөр нөлөөтэй багт хувь нэмэр оруулахад төвлөрсөн.`,
        highlights: [
          "- Ажлын туршлага бүрийн bullet-ийг хүчтэй үйл үгээр эхлүүлж сайжруулаарай.",
          "- Хурд, чанар, өсөлт, үр ашиг зэрэг хэмжигдэхүйц нөлөөг тоон үзүүлэлтээр нэмээрэй.",
          `- Амжилтуудаа ${payload.targetRole} албан тушаалын шаардлага, түлхүүр үгстэй уялдуулан бичээрэй.`
        ],
        projects: [
          "- Хэрэглэсэн технологи, хамрах хүрээ, үр дүн бүхий 2-3 хамааралтай төслийг оруулаарай."
        ],
        education: [
          "- Холбогдох боловсрол, сертификат, сүүлийн үеийн сургалтуудаа энд оруулаарай."
        ]
      })
    };
  }

  return {
    weakPoints,
    careerRecommendations: unique([
      `Target ${payload.targetRole} roles that match your current ${experienceLevel.toLowerCase()} profile.`,
      "Strengthen your portfolio with measurable outcomes and business impact.",
      "Use tailored project examples when applying to positions."
    ]),
    cvImprovementSuggestions: unique([
      "Add quantified achievements for each recent role or project.",
      "Group your core technical skills into a short, scannable section.",
      "Tailor the summary section toward the target role and domain."
    ]),
    summary: `${payload.fullName} appears to be a ${experienceLevel.toLowerCase()} candidate for ${payload.targetRole} with ${skills.length} identifiable skill areas in the CV.`,
    rewrittenCv: rewriteCvText(payload)
  };
}

async function analyzeCareerProfile(payload) {
  const skills = detectSkills(payload.cvText);
  const experienceLevel = inferExperienceLevel(payload.cvText, payload.experienceYears);
  const weakPoints = findWeakPoints(payload.cvText, skills);
  const localized = buildLocalizedContent(payload, skills, experienceLevel, weakPoints);

  return normalizeAnalysisResponse({
    candidateName: payload.fullName,
    targetRole: payload.targetRole,
    skills,
    experienceLevel,
    weakPoints: localized.weakPoints,
    careerRecommendations: localized.careerRecommendations,
    cvImprovementSuggestions: localized.cvImprovementSuggestions,
    rewrittenCv: localized.rewrittenCv,
    summary: localized.summary
  });
}

async function rewriteCv(payload) {
  const skills = detectSkills(payload.cvText);
  const experienceLevel = inferExperienceLevel(payload.cvText, payload.experienceYears);
  const localized = buildLocalizedContent(payload, skills, experienceLevel, findWeakPoints(payload.cvText, skills));
  return localized.rewrittenCv;
}

function getStructuredJobLevel(experienceLevel, language) {
  if (language === "mn") {
    return mapExperienceLevelLabel(experienceLevel, language).toLowerCase();
  }

  return String(experienceLevel || "Junior").toLowerCase();
}

module.exports = {
  providerName,
  analyzeCareerProfile,
  rewriteCv,
  getStructuredJobLevel
};
