import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { getCerebrasClient, isCerebrasConfigured } from './cerebrasClient';
import { getAnthropicClient, isAnthropicConfigured, getClaudeModelName } from './claudeClient';
import { searchRules, loadRules } from './retriever';
import { calculateBuildingLimits, CalculatorInput } from './calculatorRules';
import { checkPlanCompliance, PlanSubmission } from './planChecker';
import { auditAnswer } from './verification';
import {
  registerUser,
  loginUser,
  verifyAuthToken,
  requestPasswordReset,
  resetPasswordWithToken,
  getAllUsers,
  sanitizeUser,
} from './authService';
import { requireAuth, AuthenticatedRequest } from './authMiddleware';
import { getDataDirectory } from './dataPaths';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

// Configure Production CORS
// Accepts CLIENT_ORIGIN or FRONTEND_URL from environment (e.g., https://your-site.netlify.app)
// In development, allows all origins or localhost
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.NETLIFY_SITE_URL,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // Check if origin matches Netlify preview deploy pattern (*.netlify.app)
    if (origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked request from origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Health Check (Public endpoint for liveness and provider monitoring)
app.get('/api/health', (req: Request, res: Response) => {
  const claudeActive = isAnthropicConfigured();
  const cerebrasActive = isCerebrasConfigured();
  const activeProvider = claudeActive ? 'claude' : (cerebrasActive ? 'cerebras' : 'local-grounded');
  const activeModel = claudeActive ? getClaudeModelName() : (cerebrasActive ? 'llama3.1-70b' : 'local-grounded-rules');

  res.json({
    status: 'healthy',
    activeProvider,
    claudeConfigured: claudeActive,
    cerebrasConfigured: cerebrasActive,
    model: activeModel,
    totalRulesIndexed: loadRules().length
  });
});

// ==========================================
// AUTHENTICATION API ROUTES (PUBLIC)
// ==========================================

// 1. Sign Up
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Please provide a valid name (at least 2 characters).' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const { user, token } = await registerUser(name, email, password);
    res.status(201).json({
      message: 'Account created successfully.',
      user,
      token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed.' });
  }
});

// 2. Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const { user, token } = await loginUser(email, password);
    res.json({
      message: 'Signed in successfully.',
      user,
      token,
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Authentication failed.' });
  }
});

// 3. Get Current User Profile (Session persistence check)
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const users = getAllUsers();
  const current = users.find(u => u.id === req.user?.userId);
  if (!current) {
    res.status(404).json({ error: 'User record not found.' });
    return;
  }
  res.json({
    user: sanitizeUser(current),
  });
});

// 4. Request Password Reset
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Valid email address is required.' });
      return;
    }
    const result = await requestPasswordReset(email);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Could not process reset request.' });
  }
});

// 5. Complete Password Reset
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      res.status(400).json({ error: 'Email, reset token, and new password are required.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }
    await resetPasswordWithToken(email, resetToken, newPassword);
    res.json({ success: true, message: 'Password has been reset successfully. You may now log in.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to reset password.' });
  }
});

// ==========================================
// PROTECTED APPLICATION ROUTES (REQUIRE AUTH)
// ==========================================

// Module 1: AI Chatbot (Hindi & English with Rule Citations)
app.post('/api/chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const { message, language = 'en' } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Retrieve factual rules matching the query
    const searchResults = searchRules(message, 4);

    if (searchResults.length === 0 || searchResults[0].score < 5) {
      const insufficiencyMsg = language === 'hi'
        ? 'पर्याप्त साक्ष्य उपलब्ध नहीं हैं: इस प्रश्न के लिए आधिकारिक मध्य प्रदेश भूमि विकास नियम, 2012 में कोई सटीक नियम या धारा नहीं मिली। कृपया अपने प्रश्न में विशिष्ट नियम संख्या या विवरण दें।'
        : 'Insufficient Evidence: No specific statutory rule was found in the official Madhya Pradesh Bhumi Vikas Rules, 2012 for this query. Please provide more specifics or rule references.';

      res.json({
        reply: insufficiencyMsg,
        evidenceSufficient: false,
        citations: []
      });
      return;
    }

    const contextText = searchResults.map(sr => {
      return `[Rule: ${sr.rule.ruleNumber} | Title: ${sr.rule.title} | Page: ${sr.rule.pageNumber} | Part: ${sr.rule.part}]\n${sr.rule.content}\n`;
    }).join('\n---\n');

    const citations = searchResults.map(sr => ({
      ruleNumber: sr.rule.ruleNumber,
      title: sr.rule.title,
      pageNumber: sr.rule.pageNumber,
      sourceDoc: sr.rule.sourceDoc,
      excerpt: sr.snippet
    }));

    const anthropicClient = getAnthropicClient();
    const cerebrasClient = getCerebrasClient();

    const systemPrompt = `You are "Bhumi Vikas Sahayak", the official municipal building regulatory assistant for Bhopal Impact Lab.
Your task is to answer building development questions strictly using the verified excerpts from the Madhya Pradesh Bhumi Vikas Rules, 2012 provided below.
RULES:
1. Cite the exact Rule number, Table number, and Page number for every factual statement.
2. Answer in ${language === 'hi' ? 'Hindi (Devanagari)' : 'English'}.
3. If the provided excerpts do not contain the answer, explicitly state: "Evidence is insufficient in the provided regulations to answer this query accurately." Do not invent numbers, fees, or regulations.
4. Keep the tone professional, municipal, and concise.

VERIFIED STATUTORY EXCERPTS:
${contextText}`;

    if (anthropicClient) {
      // Use Claude API
      const claudeModel = getClaudeModelName();
      const messageResponse = await anthropicClient.messages.create({
        model: claudeModel,
        max_tokens: 800,
        system: systemPrompt,
        messages: [
          { role: 'user', content: message }
        ]
      });

      const reply = messageResponse.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n') || 'No response generated.';

      res.json({
        reply,
        evidenceSufficient: true,
        citations,
        provider: 'claude',
        model: claudeModel
      });
    } else if (cerebrasClient) {
      // Call Cerebras SDK
      const response: any = await cerebrasClient.chat.completions.create({
        model: 'llama3.1-70b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.1,
        max_tokens: 800
      });

      const reply = response.choices?.[0]?.message?.content || 'No response generated.';
      res.json({
        reply,
        evidenceSufficient: true,
        citations,
        provider: 'cerebras',
        model: 'llama3.1-70b'
      });
    } else {
      // Fallback deterministic response based on indexed facts when neither API key is set
      const topRule = searchResults[0];
      const fallbackReply = language === 'hi'
        ? `[सूचना: AI API Key कॉन्फ़िगर नहीं है, प्रत्यक्ष नियम संदर्भ दिखाया जा रहा है]\n\n**${topRule.rule.ruleNumber}: ${topRule.rule.title}** (पृष्ठ ${topRule.rule.pageNumber}):\n\n${topRule.snippet}\n\n*स्रोत: मध्य प्रदेश भूमि विकास नियम, 2012 (अद्यतन 06 मार्च 2025)*`
        : `[Note: Operating in local factual retrieval mode - AI API Key not provided]\n\nBased on official **${topRule.rule.ruleNumber} ("${topRule.rule.title}", Page ${topRule.rule.pageNumber})**:\n\n${topRule.snippet}\n\n*Source: Madhya Pradesh Bhumi Vikas Rules, 2012 (Updated up to 6th March 2025)*`;

      res.json({
        reply: fallbackReply,
        evidenceSufficient: true,
        citations,
        provider: 'local-grounded',
        model: 'local-grounded-rules'
      });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Error processing chat query' });
  }
});

// Module 2: Smart Building Calculator (Protected)
app.post('/api/calculator', requireAuth, (req: Request, res: Response) => {
  try {
    const input: CalculatorInput = req.body;
    if (!input.roadWidthMeters || !input.plotAreaSqM || !input.occupancyType) {
      res.status(400).json({ error: 'Missing required parameters: roadWidthMeters, plotAreaSqM, occupancyType' });
      return;
    }
    const result = calculateBuildingLimits(input);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 3: Building Plan Checker (Protected)
app.post('/api/plan-check', requireAuth, (req: Request, res: Response) => {
  try {
    const plan: PlanSubmission = req.body;
    if (!plan.plotAreaSqM || !plan.proposedBuiltUpAreaSqM) {
      res.status(400).json({ error: 'Missing plotAreaSqM or proposedBuiltUpAreaSqM' });
      return;
    }
    const evaluation = checkPlanCompliance(plan);
    res.json(evaluation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 4: Rule Amendment Tracker (Protected)
app.get('/api/amendments', requireAuth, (req: Request, res: Response) => {
  try {
    const filePath = path.join(getDataDirectory(), 'indexed/amendments.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      res.json(data);
    } else {
      res.json([]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 6: Rule Comparison Dashboard (Protected)
app.get('/api/comparisons', requireAuth, (req: Request, res: Response) => {
  try {
    const comparisons = [
      {
        id: 'comp-1',
        title: 'Table 4 Ground Coverage vs Height Norms',
        category: 'Building Limits',
        ruleReference: 'Rule 42(1), Table 4',
        page: 59,
        baseline2012: 'Rigid ground coverage percentages enforced in Column 6; required individual exception orders for medium high buildings.',
        current2025: 'Column 6 & Note (1) deleted by Gazette No. 74 dated 06-03-2025; coverage now governed directly by front MOS (7.5m-12m) and permissible FAR (1:1.50 to 1:2.0).',
        impact: 'Permits greater design flexibility on plots 1000-2000 sq.m without breaching FAR or setback safety.'
      },
      {
        id: 'comp-2',
        title: 'Building Sanction Application Fees',
        category: 'Fees & Charges',
        ruleReference: 'Rule 21(2) & 21(3)',
        page: 35,
        baseline2012: 'Development fee Rs. 5000/ha; standard flat scrutiny fee per manual physical paper file.',
        current2025: 'Built-up building permission application fee fixed at Rs. 1.00 per sq.m of proposed built-up area; online treasury gateway integrated with deemed sanction protocol.',
        impact: 'Transparent, standardized cost computation and removal of manual fee calculation delays.'
      },
      {
        id: 'comp-3',
        title: 'Fire Safety & Clearance Delegation',
        category: 'Safety & Clearances',
        ruleReference: 'Rule 87(4)',
        page: 97,
        baseline2012: 'Local municipal fire inspection without formalized statutory state-level oversight.',
        current2025: 'Mandatory Designated State Fire Authority clearance; Part IV of National Building Code (NBC 2016) made binding under Notification F-3-30/2020.',
        impact: 'Stricter life-safety audits for high-rises and assembly occupancies in Bhopal.'
      },
      {
        id: 'comp-4',
        title: 'Land Surrender FAR Incentive (Table 8 Note 1)',
        category: 'FAR & Density',
        ruleReference: 'Rule 61, Table 8 Note 1',
        page: 84,
        baseline2012: 'Only cash compensation for road widening or land surrender.',
        current2025: 'Additional FAR calculated by adding twice the area of surrendered plot directly to remaining property in lieu of monetary compensation.',
        impact: 'Speeds up road widening on major Bhopal corridors by incentivizing private plot owners.'
      }
    ];
    res.json(comparisons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Module 7: AI Answer Verification System (Protected)
app.post('/api/verify', requireAuth, (req: Request, res: Response) => {
  try {
    const { statement } = req.body;
    if (!statement || typeof statement !== 'string') {
      res.status(400).json({ error: 'Statement is required' });
      return;
    }
    const audit = auditAnswer(statement);
    res.json(audit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`Bhumi Vikas Sahayak Server running on http://${HOST}:${PORT}`);
  console.log(`Anthropic Claude status: ${isAnthropicConfigured() ? `CONFIGURED (${getClaudeModelName()})` : 'NOT CONFIGURED'}`);
  console.log(`Cerebras SDK status: ${isCerebrasConfigured() ? 'CONFIGURED (llama3.1-70b)' : 'NOT CONFIGURED'}`);
  console.log(`Authentication: JWT + Salted Bcrypt Active`);
  console.log(`Allowed CORS origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'All (development)'}`);
});
