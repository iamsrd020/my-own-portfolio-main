const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:8080",
      "http://127.0.0.1:3000",
      // Add your production domain here when you deploy, e.g.:
      // 'https://cyrillopes.com'
    ],
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

// ── Anthropic client ────────────────────────────────────────
const anthropic = new Anthropic({
  // apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Nodemailer transporter ───────────────────────────────────
const transporter = nodemailer.createTransport({
  // host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  // port: process.env.EMAIL_PORT || 587,
  secure: true, // true for 465, false for other ports
  auth: {
    // user: process.env.EMAIL_USER,
    // pass: process.env.EMAIL_PASS,
  },
});

// ── System prompt with Cyril's full profile ─────────────────
const SYSTEM_PROMPT = `You are an AI assistant for Cyril Lopes, a Full Stack Software Engineer. Be friendly, professional, and concise (2-4 sentences max per reply). Here's everything you know about him:

PERSONAL:
- Name: Cyril Lopes
- Phone: +1 (913) 208 8744
- Email: contact@cyrillopes.com
- Location: Kansas City, MO — available worldwide (Remote)
- Status: Open to backend / full-stack / founding engineer roles — Full-time or Contract
- LinkedIn: linkedin.com/in/cyril-l-370131112
- GitHub: github.com/cyrillopes
- Portfolio: cyrillopes.github.io/Personal-Website

EDUCATION:
- M.S. Technology Management (Computer Science) — Avila University, Kansas City, MO (Jan 2025 – May 2026)
- B.Sc. Information Technology — University of Mumbai, India (2017–2020, CGPA: 8.90/10)

EXPERIENCE (~4 years total):
1. Dotsoft Business Solutions, Bengaluru (Apr–Dec 2025) — Software Engineer Backend/Full-Stack
   → AWS AppSync, Amplify, GraphQL, MySQL, CloudWatch, Lambda, S3, Node.js, React
2. Astria Digital, Bengaluru (Aug 2024–Apr 2025) — Software Developer Backend
   → Node.js, GraphQL APIs, MongoDB, AWS Lambda, Amazon S3, Git
3. Aiolos Cloud Solutions, Mumbai (Apr 2023–Aug 2024) — MERN Stack Developer
   → React.js, Next.js, Node.js, Redux Thunk, MongoDB, Amazon S3, Express.js
4. HUBX Commercial Ventures, Delhi (Dec 2022–Mar 2023) — MERN Stack Developer
   → React.js, Node.js, WordPress/WooCommerce, MongoDB, Bootstrap, HTML/CSS
5. Diacto Technologies, Pune (Feb–Aug 2022) — Associate Web Developer
   → HTML5, CSS3, jQuery, Bootstrap, Node.js, AJAX, DOMO cloud analytics
6. Emonics LLC (Nov 2020–Oct 2021) — Bench Sales Executive
   → Client outreach, sales growth, relationship management

FREELANCE PROJECTS:
- Bliss by Andrea (Toronto, Jun–Nov 2024): Portfolio website — React.js, Next.js, AWS, CMS, MongoDB. URL: blissbyandrea.com
- Skill Sprints (Mauritius, Jul–Nov 2024): Full job board platform — React.js, Node.js, MongoDB, JWT auth, role-based access, real-time tracking, AWS. URL: skillsprints.in
- Dakri Cartons (Mauritius, Mar 2023–May 2024): Sales app — Material UI, Figma, Storybook, React.js, SCSS

PERSONAL PROJECTS:
- Pokee: Restaurant delivery app — React, Node.js, MongoDB, Paytm payment gateway, JWT auth
- Paws for Adoption: Pet adoption platform — MERN stack, Bootstrap 5, search/filter, adoption workflows

TECHNICAL SKILLS:
- Frontend: JavaScript, React.js (90%), Next.js (85%), Redux (82%), HTML5/CSS3, Bootstrap, Material UI, Tailwind CSS
- Backend: Node.js (90%), Express.js (88%), GraphQL (85%), RESTful APIs (92%), JWT/OAuth, Microservices
- Databases: MongoDB (88%), MySQL (82%), SQLite (75%), Mongoose, Sequelize, Azure Data Studio
- Cloud/DevOps: AWS S3, Lambda, EC2, AppSync, Amplify, CloudWatch (85%), Git/GitHub (92%)
- Other: Jest, SCRUM/Agile, Postman, Storybook, Figma, WordPress/WooCommerce, DOMO

PERSONALITY / TONE NOTES:
- Cyril is hardworking, collaborative, and passionate about clean code and scalable systems
- He's mentored junior devs, led code reviews, and shipped products across 3 continents
- He responds quickly and is easy to work with
- Warm, direct, no-nonsense. Gets things done.

RESPONSE RULES:
- Keep answers short: 2-4 sentences max
- Be warm, confident, and direct
- Use emojis very sparingly (max 1 per reply)
- If asked about hiring/rates, encourage them to use the contact form or email contact@cyrillopes.com
- If asked something you don't know, say you're not sure but suggest contacting Cyril directly`;

// ── Chat endpoint ───────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required." });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res
      .status(500)
      .json({
        error:
          "API key not configured. Add ANTHROPIC_API_KEY to your .env file.",
      });
  }

  try {
    // Build message history for multi-turn conversations
    const messages = [];

    // Add previous history if provided (for multi-turn)
    if (Array.isArray(history)) {
      history.forEach(({ role, content }) => {
        if ((role === "user" || role === "assistant") && content) {
          messages.push({ role, content });
        }
      });
    }

    // Add the new user message
    messages.push({ role: "user", content: message });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply =
      response.content?.[0]?.text ||
      "I'm not sure about that — please contact Cyril directly at contact@cyrillopes.com!";

    res.json({ reply });
  } catch (err) {
    console.error("Anthropic API error:", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ── Contact form endpoint ────────────────────────────────────
app.post("/api/contact", async (req, res) => {
  const { fname, lname, email, subject, message } = req.body;

  if (!fname || !lname || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const wordCount = message.trim().split(/\s+/).length;
  if (wordCount > 30) {
    return res.status(400).json({ error: "Message must be 30 words or less." });
  }

  try {
    // Email to admin/Cyril
    const adminMailOptions = {
      // from: `"Cyril Lopes" <${process.env.EMAIL_FROM}>` || 'contact@cyrillopes.com',
      // to: `"Cyril Lopes" <${process.env.EMAIL_FROM}>`,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fname} ${lname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p>This message was sent from Cyril Lopes' portfolio website.</p>
      `,
    };

    // Confirmation email to user
    const userMailOptions = {
      // from: `"Cyril Lopes" <${process.env.EMAIL_FROM}>` || 'contact@cyrillopes.com',
      to: email,
      subject: "We Received Your Message",
      html: `
        <h2>Hi ${fname},</h2>
        <p>Thank you for reaching out! I have received your contact details and will contact you soon.</p>
        <p><strong>Your Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p>Best regards,<br>Cyril Lopes</p>
      `,
    };

    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Email error:", err.message);
    res.status(500).json({ error: "Failed to send email. Please try again." });
  }
});
// ── Hire me form endpoint ────────────────────────────────
app.post("/api/hire-me", async (req, res) => {
  const { fname, lname, email, projectType, budget, message } = req.body;

  if (!fname || !lname || !email || !projectType || !budget || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const wordCount = message.trim().split(/\s+/).length;
  if (wordCount > 50) {
    return res.status(400).json({ error: "Message must be 50 words or less." });
  }

  try {
    // Email to admin/Cyril
    const adminMailOptions = {
      // from: `"Cyril Lopes" <${process.env.EMAIL_FROM}>` || 'contact@cyrillopes.com',
      // to: process.env.EMAIL_FROM,
      subject: `Hire Me Request: ${projectType}`,
      html: `
        <h2>New Hire Me Form Submission</h2>
        <p><strong>Name:</strong> ${fname} ${lname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Project Type:</strong> ${projectType}</p>
        <p><strong>Budget Range:</strong> ${budget}</p>
        <p><strong>Project Details:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p>This message was sent from Cyril Lopes' portfolio website.</p>
      `,
    };

    // Confirmation email to user
    const userMailOptions = {
      // from: `"Cyril Lopes" <${process.env.EMAIL_FROM}>` || 'contact@cyrillopes.com',
      to: email,
      subject: "We Received Your Hire Me Request",
      html: `
        <h2>Hi ${fname},</h2>
        <p>Thank you for your interest! I have received your project inquiry for <strong>${projectType}</strong> and will contact you soon to discuss the opportunity.</p>
        <p><strong>Your Project Details:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p>Best regards,<br>Cyril Lopes</p>
      `,
    };

    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Email error:", err.message);
    res.status(500).json({ error: "Failed to send email. Please try again." });
  }
});
// ── Health check ────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Cyril's AI agent is running!",
    timestamp: new Date().toISOString(),
  });
});

// ── Serve the portfolio HTML ────────────────────────────────
const path = require("path");
app.use(express.static(path.join(__dirname)));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/api/chat`);
  console.log(`❤️  Health check: GET  http://localhost:${PORT}/api/health\n`);
});
