import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../apps/api/src/app.js";
import { connectDatabase } from "../apps/api/src/lib/database.js";

/**
 * AI Response Validation Tests
 *
 * Validates the quality and correctness of AI-generated content:
 * 1. ATS-friendly resume generation from job descriptions
 * 2. Cold email generation
 * 3. LinkedIn message generation
 * 4. Referral request generation
 */

const app = createApp();
let accessToken: string;
let userId: string;
let testJobId: string;

const TEST_USER = {
  fullName: "AI Test User",
  email: `ai_test_${Date.now()}@example.com`,
  password: "TestPass123!",
};

beforeAll(async () => {
  await connectDatabase();

  // 1. Create test user
  const signupRes = await request(app)
    .post("/api/v1/auth/signup")
    .send(TEST_USER);
  accessToken = signupRes.body.accessToken;
  userId = signupRes.body.user.id;

  // 2. Insert a realistic user profile (simulates parsed resume)
  const db = mongoose.connection.db!;
  await db.collection("userprofiles").insertOne({
    userId: new mongoose.Types.ObjectId(userId),
    name: "AI Test User",
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "Docker",
      "AWS",
      "Python",
      "REST APIs",
    ],
    experience: [
      {
        title: "Senior Software Engineer",
        company: "TechCorp",
        startDate: "2021-01",
        endDate: "Present",
        summary:
          "Led a team of 5 engineers building a real-time analytics dashboard serving 500K+ daily active users. Reduced API latency by 40% through microservice optimization.",
      },
      {
        title: "Software Engineer",
        company: "StartupXYZ",
        startDate: "2019-03",
        endDate: "2020-12",
        summary:
          "Built RESTful APIs using Node.js and Express, integrated payment processing with Stripe, deployed to AWS using Docker containers.",
      },
    ],
    projects: [
      {
        name: "E-Commerce Platform",
        summary:
          "Full-stack e-commerce platform with React frontend, Node.js backend, and MongoDB. Handled 10K+ concurrent users with 99.9% uptime.",
        technologies: ["React", "Node.js", "MongoDB", "Redis", "Docker"],
      },
      {
        name: "CI/CD Pipeline Automation",
        summary:
          "Automated deployment pipeline using GitHub Actions and Docker, reducing deployment time from 45 minutes to 8 minutes.",
        technologies: ["Docker", "GitHub Actions", "AWS", "Terraform"],
      },
    ],
    education: [
      {
        degree: "B.Tech in Computer Science",
        institution: "IIT Delhi",
        startDate: "2015",
        endDate: "2019",
      },
    ],
    certifications: ["AWS Solutions Architect Associate", "MongoDB Developer"],
    resumeFileName: "ai_test_resume.pdf",
    resumeStoragePath: "/uploads/test.pdf",
  });

  // 3. Insert a test job with rich description
  const jobResult = await db.collection("jobs").insertOne({
    sourceUserId: new mongoose.Types.ObjectId(userId),
    title: "Full Stack Developer",
    company: "Flipkart",
    description:
      "React, TypeScript, Node.js, Express, MongoDB, REST APIs, GraphQL, Docker, CI/CD, Agile. Join Flipkart's engineering team building next-generation e-commerce platform. Work on customer-facing features serving millions of users. Strong experience with microservices architecture and distributed systems required. Familiarity with AWS and Kubernetes is a plus.",
    link: "https://www.flipkartcareers.com/#!/job/12345",
    platform: "Flipkart Careers",
    location: "Bengaluru",
    postedDate: new Date(),
    applicantCount: 12,
    relevanceScore: 85,
    matchedSkills: [
      "React",
      "TypeScript",
      "Node.js",
      "Express",
      "MongoDB",
      "Docker",
    ],
    missingSkills: ["GraphQL", "Kubernetes"],
    status: "new",
    linkStatus: "valid",
  });
  testJobId = jobResult.insertedId.toString();

  // 4. Insert a recruiter lead for outreach tests
  await db.collection("recruiterleads").insertOne({
    userId: new mongoose.Types.ObjectId(userId),
    jobId: new mongoose.Types.ObjectId(testJobId),
    name: "Priya Sharma",
    title: "Engineering Manager",
    company: "Flipkart",
    linkedinUrl: "https://linkedin.com/in/priyasharma",
    source: "linkedin",
    state: "pending",
    recentPosts: ["Excited about our new tech stack migration!"],
  });
});

afterAll(async () => {
  const db = mongoose.connection.db;
  if (db) {
    await db.collection("users").deleteMany({ email: TEST_USER.email });
    await db
      .collection("userprofiles")
      .deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    await db
      .collection("jobs")
      .deleteMany({ sourceUserId: new mongoose.Types.ObjectId(userId) });
    await db
      .collection("jobapplications")
      .deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    await db
      .collection("recruiterleads")
      .deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    await db
      .collection("generateddocuments")
      .deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
  }
  await mongoose.disconnect();
});

// ────────────────────────────────────────────────────────────
// RESUME GENERATION VALIDATION
// ────────────────────────────────────────────────────────────

describe("AI Resume Generation - ATS Compliance", () => {
  let resumeResult: {
    documentId: string;
    latex: string;
    atsSuggestions: string[];
    atsKeywordsInjected: string[];
  };

  it("generates a tailored resume successfully", async () => {
    const res = await request(app)
      .post("/api/v1/resume/generate")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: testJobId });

    expect(res.status).toBe(200);
    expect(res.body.documentId).toBeDefined();
    expect(res.body.latex).toBeDefined();
    expect(res.body.atsSuggestions).toBeInstanceOf(Array);
    expect(res.body.atsKeywordsInjected).toBeInstanceOf(Array);
    resumeResult = res.body;
  });

  it("contains valid LaTeX document structure", () => {
    const { latex } = resumeResult;
    expect(latex).toContain("\\documentclass");
    expect(latex).toContain("\\begin{document}");
    expect(latex).toContain("\\end{document}");
    expect(latex).toContain("\\section*{");
  });

  it("includes candidate name in the header", () => {
    expect(resumeResult.latex).toContain("AI Test User");
  });

  it("targets the specific job title and company", () => {
    expect(resumeResult.latex).toContain("Full Stack Developer");
    expect(resumeResult.latex).toContain("Flipkart");
  });

  it("has all required ATS resume sections", () => {
    const { latex } = resumeResult;
    expect(latex).toContain("Professional Summary");
    expect(latex).toContain("Technical Skills");
    expect(latex).toContain("Professional Experience");
    expect(latex).toContain("Projects");
    expect(latex).toContain("Education");
  });

  it("includes the certifications section when certs exist", () => {
    expect(resumeResult.latex).toContain("Certifications");
    expect(resumeResult.latex).toContain("AWS Solutions Architect");
  });

  it("front-loads JD-matched skills before other skills", () => {
    const { latex } = resumeResult;
    const skillsStart = latex.indexOf("Technical Skills");
    const experienceStart = latex.indexOf("Professional Experience");
    const skillsSection = latex.slice(skillsStart, experienceStart);

    // Matched skills (React, TypeScript, Node.js) should appear in the skills section
    expect(skillsSection).toContain("React");
    expect(skillsSection).toContain("TypeScript");
    expect(skillsSection).toContain("Node.js");
  });

  it("injects ATS keywords from the job description", () => {
    const { atsKeywordsInjected } = resumeResult;
    expect(atsKeywordsInjected.length).toBeGreaterThan(0);

    // Should include matched skills
    const injectedLower = atsKeywordsInjected.map((k) => k.toLowerCase());
    expect(injectedLower).toEqual(
      expect.arrayContaining(["react", "typescript", "node.js"]),
    );
  });

  it("provides actionable ATS suggestions", () => {
    const { atsSuggestions } = resumeResult;
    expect(atsSuggestions.length).toBeGreaterThanOrEqual(2);

    // Should suggest adding missing skills
    const allSuggestions = atsSuggestions.join(" ").toLowerCase();
    expect(allSuggestions).toMatch(/keyword|quantif|tailor|ats/i);
  });

  it("includes candidate experience in chronological order", () => {
    const { latex } = resumeResult;
    expect(latex).toContain("TechCorp");
    expect(latex).toContain("StartupXYZ");
    expect(latex).toContain("Senior Software Engineer");
  });

  it("includes projects with technologies", () => {
    const { latex } = resumeResult;
    expect(latex).toContain("E-Commerce Platform");
    expect(latex).toContain("CI/CD Pipeline Automation");
  });

  it("includes education details", () => {
    const { latex } = resumeResult;
    expect(latex).toContain("B.Tech");
    expect(latex).toContain("IIT Delhi");
  });

  it("does not contain raw HTML or markdown artifacts", () => {
    const { latex } = resumeResult;
    expect(latex).not.toMatch(/<\/?[a-z]+>/i);
    expect(latex).not.toContain("```");
    expect(latex).not.toContain("**");
  });

  it("persists the generated document to the database", async () => {
    const res = await request(app)
      .get(`/api/v1/resume/download/${resumeResult.documentId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(
      /text\/x-tex|application\/x-latex|application\/octet/,
    );
  });
});

// ────────────────────────────────────────────────────────────
// OUTREACH MESSAGE VALIDATION
// ────────────────────────────────────────────────────────────

describe("AI Outreach Generation - Message Quality", () => {
  let outreachResult: {
    email: string;
    linkedinMessage: string;
    referralMessage: string;
  };

  it("generates all three outreach message types", async () => {
    const res = await request(app)
      .post("/api/v1/outreach/generate")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: testJobId });

    expect(res.status).toBe(200);
    expect(res.body.email).toBeDefined();
    expect(res.body.linkedinMessage).toBeDefined();
    expect(res.body.referralMessage).toBeDefined();
    outreachResult = res.body;
  });

  // ── Cold Email Tests ──

  it("cold email has a proper subject line", () => {
    expect(outreachResult.email).toMatch(/^Subject: .+/);
    expect(outreachResult.email).toContain("Full Stack Developer");
  });

  it("cold email addresses the recipient with a greeting", () => {
    expect(outreachResult.email).toMatch(/Dear .+,/);
  });

  it("cold email mentions the target company and role", () => {
    expect(outreachResult.email).toContain("Flipkart");
    expect(outreachResult.email).toContain("Full Stack Developer");
  });

  it("cold email highlights relevant technical skills", () => {
    const email = outreachResult.email.toLowerCase();
    const mentionsSkills =
      email.includes("react") ||
      email.includes("node") ||
      email.includes("typescript") ||
      email.includes("mongodb");
    expect(mentionsSkills).toBe(true);
  });

  it("cold email references relevant experience", () => {
    const email = outreachResult.email;
    // Should reference the most relevant experience
    const referencesExperience =
      email.includes("TechCorp") ||
      email.includes("StartupXYZ") ||
      email.includes("Senior Software Engineer") ||
      email.includes("Software Engineer");
    expect(referencesExperience).toBe(true);
  });

  it("cold email includes the sender name", () => {
    expect(outreachResult.email).toContain("AI Test User");
  });

  it("cold email has a professional closing", () => {
    expect(outreachResult.email).toMatch(/regards|sincerely|thank/i);
  });

  it("cold email is appropriately sized (not too short, not too long)", () => {
    const wordCount = outreachResult.email.split(/\s+/).length;
    expect(wordCount).toBeGreaterThan(80);
    expect(wordCount).toBeLessThan(500);
  });

  // ── LinkedIn Message Tests ──

  it("LinkedIn message starts with a greeting", () => {
    expect(outreachResult.linkedinMessage).toMatch(/^(Hi|Hello|Hey)/);
  });

  it("LinkedIn message mentions the target role and company", () => {
    expect(outreachResult.linkedinMessage).toContain("Full Stack Developer");
    expect(outreachResult.linkedinMessage).toContain("Flipkart");
  });

  it("LinkedIn message is concise (under 200 words for platform limits)", () => {
    const wordCount = outreachResult.linkedinMessage.split(/\s+/).length;
    expect(wordCount).toBeLessThan(200);
    expect(wordCount).toBeGreaterThan(30);
  });

  it("LinkedIn message includes a call to action", () => {
    const msg = outreachResult.linkedinMessage.toLowerCase();
    const hasCTA =
      msg.includes("connect") ||
      msg.includes("chat") ||
      msg.includes("discuss") ||
      msg.includes("learn more");
    expect(hasCTA).toBe(true);
  });

  it("LinkedIn message includes relevant skills", () => {
    const msg = outreachResult.linkedinMessage.toLowerCase();
    const mentionsSkills =
      msg.includes("react") ||
      msg.includes("node") ||
      msg.includes("typescript");
    expect(mentionsSkills).toBe(true);
  });

  // ── Referral Request Tests ──

  it("referral request mentions the target company", () => {
    expect(outreachResult.referralMessage).toContain("Flipkart");
  });

  it("referral request mentions the target role", () => {
    expect(outreachResult.referralMessage).toContain("Full Stack Developer");
  });

  it("referral request has a polite, peer-oriented tone", () => {
    const msg = outreachResult.referralMessage.toLowerCase();
    const hasPoliteTone =
      msg.includes("refer") ||
      msg.includes("wondering") ||
      msg.includes("appreciate") ||
      msg.includes("mean a lot");
    expect(hasPoliteTone).toBe(true);
  });

  it("referral request includes the sender's relevant background", () => {
    const msg = outreachResult.referralMessage.toLowerCase();
    const hasBg =
      msg.includes("experience") ||
      msg.includes("working") ||
      msg.includes("background") ||
      msg.includes("expertise");
    expect(hasBg).toBe(true);
  });

  it("referral request is appropriately sized", () => {
    const wordCount = outreachResult.referralMessage.split(/\s+/).length;
    expect(wordCount).toBeGreaterThan(40);
    expect(wordCount).toBeLessThan(300);
  });

  // ── Cross-cutting quality checks ──

  it("none of the messages contain placeholder tokens", () => {
    const all = [
      outreachResult.email,
      outreachResult.linkedinMessage,
      outreachResult.referralMessage,
    ].join(" ");

    expect(all).not.toMatch(/\{[A-Z_]+\}/);
    expect(all).not.toMatch(/\[INSERT/i);
    expect(all).not.toMatch(/TODO/i);
    expect(all).not.toContain("undefined");
    expect(all).not.toContain("null");
  });

  it("messages are personalized (not generic templates)", () => {
    // Email should contain specific technical terms from the JD
    const email = outreachResult.email.toLowerCase();
    const jdTermsInEmail = [
      "react",
      "node",
      "typescript",
      "mongodb",
      "docker",
    ].filter((t) => email.includes(t));
    expect(jdTermsInEmail.length).toBeGreaterThanOrEqual(2);
  });

  it("all three messages are distinct from each other", () => {
    const { email, linkedinMessage, referralMessage } = outreachResult;
    expect(email).not.toBe(linkedinMessage);
    expect(email).not.toBe(referralMessage);
    expect(linkedinMessage).not.toBe(referralMessage);
  });
});

// ────────────────────────────────────────────────────────────
// EDGE CASES
// ────────────────────────────────────────────────────────────

describe("AI Generation - Edge Cases", () => {
  it("resume generation returns 404 for non-existent job", async () => {
    const res = await request(app)
      .post("/api/v1/resume/generate")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: "000000000000000000000099" });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("not found");
  });

  it("outreach generation returns 404 for non-existent job", async () => {
    const res = await request(app)
      .post("/api/v1/outreach/generate")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: "000000000000000000000099" });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("not found");
  });

  it("resume generation handles job with minimal description", async () => {
    const db = mongoose.connection.db!;
    const minimalJob = await db.collection("jobs").insertOne({
      sourceUserId: new mongoose.Types.ObjectId(userId),
      title: "Developer",
      company: "MinCo",
      description: "JavaScript",
      link: "https://example.com/job",
      platform: "Direct",
      location: "Remote",
      matchedSkills: ["JavaScript"],
      missingSkills: [],
      status: "new",
      linkStatus: "valid",
    });

    const res = await request(app)
      .post("/api/v1/resume/generate")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: minimalJob.insertedId.toString() });

    expect(res.status).toBe(200);
    expect(res.body.latex).toContain("\\documentclass");
    expect(res.body.latex).toContain("Developer");
    expect(res.body.latex).toContain("MinCo");

    // Cleanup
    await db.collection("jobs").deleteOne({ _id: minimalJob.insertedId });
    await db
      .collection("generateddocuments")
      .deleteMany({ jobId: minimalJob.insertedId });
  });

  it("outreach handles job with minimal description", async () => {
    const db = mongoose.connection.db!;
    const minimalJob = await db.collection("jobs").insertOne({
      sourceUserId: new mongoose.Types.ObjectId(userId),
      title: "Intern",
      company: "SmallCo",
      description: "Python basics",
      link: "https://example.com/intern",
      platform: "Direct",
      location: "Remote",
      matchedSkills: ["Python"],
      missingSkills: [],
      status: "new",
      linkStatus: "valid",
    });

    const res = await request(app)
      .post("/api/v1/outreach/generate")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: minimalJob.insertedId.toString() });

    expect(res.status).toBe(200);
    expect(res.body.email).toContain("Intern");
    expect(res.body.email).toContain("SmallCo");
    expect(res.body.linkedinMessage).toContain("SmallCo");
    expect(res.body.referralMessage).toContain("SmallCo");

    // Cleanup
    await db.collection("jobs").deleteOne({ _id: minimalJob.insertedId });
    await db
      .collection("generateddocuments")
      .deleteMany({ jobId: minimalJob.insertedId });
  });

  it("resume generation for a second job produces different content", async () => {
    const db = mongoose.connection.db!;
    const backendJob = await db.collection("jobs").insertOne({
      sourceUserId: new mongoose.Types.ObjectId(userId),
      title: "Backend Engineer",
      company: "Razorpay",
      description:
        "Node.js, TypeScript, MongoDB, PostgreSQL, Redis, microservices, Docker, Kubernetes, event-driven architecture. Build scalable payment infrastructure.",
      link: "https://razorpay.com/jobs/backend",
      platform: "Razorpay Careers",
      location: "Bengaluru",
      matchedSkills: ["Node.js", "TypeScript", "MongoDB", "Docker"],
      missingSkills: ["PostgreSQL", "Redis", "Kubernetes"],
      status: "new",
      linkStatus: "valid",
    });

    const res = await request(app)
      .post("/api/v1/resume/generate")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: backendJob.insertedId.toString() });

    expect(res.status).toBe(200);
    // Should be tailored to Razorpay, not Flipkart
    expect(res.body.latex).toContain("Razorpay");
    expect(res.body.latex).toContain("Backend Engineer");
    expect(res.body.latex).not.toContain("Flipkart");

    // Cleanup
    await db.collection("jobs").deleteOne({ _id: backendJob.insertedId });
    await db
      .collection("generateddocuments")
      .deleteMany({ jobId: backendJob.insertedId });
  });
});

// ────────────────────────────────────────────────────────────
// LINK VALIDATION
// ────────────────────────────────────────────────────────────

describe("Job Link Validation", () => {
  it("POST /api/v1/jobs/validate-links returns validation counts", async () => {
    const res = await request(app)
      .post("/api/v1/jobs/validate-links")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBeDefined();
    expect(res.body.valid).toBeDefined();
    expect(res.body.invalid).toBeDefined();
    expect(res.body.total).toBe(res.body.valid + res.body.invalid);
  });

  it("GET /api/v1/jobs filters out invalid links by default", async () => {
    const db = mongoose.connection.db!;
    // Insert a job with invalid link status
    await db.collection("jobs").insertOne({
      sourceUserId: new mongoose.Types.ObjectId(userId),
      title: "Invalid Link Job",
      company: "GhostCorp",
      description: "This job link is invalid",
      link: "https://example.com/dead-link",
      platform: "Test",
      location: "Remote",
      matchedSkills: [],
      missingSkills: [],
      status: "new",
      linkStatus: "invalid",
    });

    const res = await request(app)
      .get("/api/v1/jobs")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    const titles = res.body.jobs.map((j: any) => j.title);
    expect(titles).not.toContain("Invalid Link Job");
  });

  it("GET /api/v1/jobs?showAll=true includes invalid links", async () => {
    const res = await request(app)
      .get("/api/v1/jobs?showAll=true")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    const titles = res.body.jobs.map((j: any) => j.title);
    expect(titles).toContain("Invalid Link Job");
  });
});
