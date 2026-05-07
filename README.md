# CV AI Pro — AI-д Суурилсан CV Сайжруулах Систем

Энэ төсөл нь PDF/DOCX CV upload, AI CV score, ATS keyword optimization, rewrite suggestions, interview бэлтгэл, career roadmap болон export preview бүхий responsive MVP юм.

## Гол сайжруулалт

- React/Vite dashboard-ийг CV систем болгож шинэчилсэн.
- Mobile/tablet/desktop responsive sidebar, cards, grid layout нэмсэн.
- PDF/DOCX upload validation: type, empty file, 10MB size limit.
- Processing status flow: uploaded → parsing → analyzing → completed.
- CV score dashboard: ATS, readability, skills match, experience, grammar, overall.
- Rewrite suggestions: accept / reject / regenerate interaction.
- Missing/recommended keyword cloud, interview question generator, career roadmap UI.
- PDF export-д `jsPDF`, DOCX MVP export-д Word-compatible document download нэмсэн.
- `server.ts` дээр requirements-д нийцсэн MVP API endpoints, consistent response format, auth/session mock, CV ownership check, prompt-injection guardrail, OpenAI fallback heuristic analysis нэмсэн.
- Legacy backend parser дээр DOCX support hook (`mammoth`) болон 10MB validation нэмсэн.
- `.gitignore` conflict marker зассан.

## Ашигласан үндсэн stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Express + TypeScript server
- OpenAI API optional, API key байхгүй үед heuristic fallback
- jsPDF browser export

## Local ажиллуулах

```bash
npm install
npm run dev
```

App default: `http://localhost:3000`

Build шалгах:

```bash
npm run build
npm run lint
```

> Анхаарах нь: энэ ZIP дээр `node_modules` болон root `package-lock.json` ороогүй. Тиймээс эхний удаа заавал `npm install` хийнэ.

## Environment variables

`.env.example`-ээс хуулж `.env` үүсгэнэ.

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
PORT=3000
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
```

`OPENAI_API_KEY` байхгүй үед app local heuristic analysis ашиглана. API key-г frontend дээр ашиглахгүй.

## MVP API endpoints

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### CV

```txt
POST   /api/cvs/upload
GET    /api/cvs
GET    /api/cvs/:id
DELETE /api/cvs/:id
GET    /api/cvs/:id/status
```

### Analysis / Rewrite / Keyword

```txt
POST /api/cvs/:id/analyze
GET  /api/cvs/:id/score
GET  /api/cvs/:id/feedback
POST /api/cvs/:id/rewrite
POST /api/cvs/:id/rewrite/:feedbackId/accept
POST /api/cvs/:id/rewrite/:feedbackId/reject
POST /api/cvs/:id/rewrite/:feedbackId/regenerate
POST /api/cvs/:id/keywords
POST /api/cvs/:id/job-match
```

### Interview / Career / Export

```txt
POST /api/cvs/:id/interview-questions
GET  /api/cvs/:id/interview-questions
POST /api/cvs/:id/career-recommendation
GET  /api/cvs/:id/career-recommendation
POST /api/cvs/:id/export/pdf
POST /api/cvs/:id/export/docx
GET  /api/cvs/:id/exports/:exportId/download
```

## API response format

Success:

```json
{
  "success": true,
  "data": {},
  "message": "Амжилттай",
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Зөвхөн PDF болон DOCX файл upload хийнэ үү."
  }
}
```

## Security / privacy notes

- CV personal data, raw CV text, OpenAI prompt/input/output-г console log хийхгүй.
- OpenAI API key-г зөвхөн server-side ашиглана.
- CV text/job description-ийг prompt дотор untrusted user content гэж үзнэ.
- AI response valid JSON schema shape байхгүй бол fallback heuristic result ашиглана.
- User зөвхөн өөрийн CV record-д access хийхээр ownership check нэмсэн.

## Manual test checklist

- [ ] `npm install` амжилттай дуусах.
- [ ] `npm run dev` app асаах.
- [ ] Dashboard desktop/mobile responsive харагдах.
- [ ] PDF file сонгоход upload status үүсэх.
- [ ] DOCX file сонгоход upload status үүсэх.
- [ ] Invalid file дээр Монгол error message гарах.
- [ ] 10MB-аас том file reject болох.
- [ ] CV status uploaded → parsing → analyzing → completed болох.
- [ ] Score cards болон metric explanation харагдах.
- [ ] Rewrite accept/reject/regenerate ажиллах.
- [ ] Interview questions харагдах.
- [ ] Career roadmap харагдах.
- [ ] PDF export татагдах.
- [ ] DOCX export татагдах.
- [ ] API response format consistent байх.
- [ ] Console/log дээр raw CV personal data гарахгүй.

## Дараагийн production алхам

- PostgreSQL + Prisma schema-г бодитоор холбох.
- Redis + BullMQ background queue нэмэх.
- S3/R2 private storage + signed URL хийх.
- Zod schema validation dependency нэмэх.
- Playwright E2E test нэмэх.
- Sentry/OpenTelemetry monitoring холбох.
