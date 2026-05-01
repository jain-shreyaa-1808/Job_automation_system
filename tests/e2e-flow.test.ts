import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../apps/api/src/app.js";
import { connectDatabase } from "../apps/api/src/lib/database.js";
import { JobModel } from "../apps/api/src/models/Job.js";
import { UserProfileModel } from "../apps/api/src/models/UserProfile.js";

const app = createApp();
let accessToken: string;
let userId: string;
let testJobId: string;

const E2E_USER = {
  fullName: "E2E Test User",
  email: `e2e_${Date.now()}@example.com`,
  password: "E2ETestPass123!",
};

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  const db = mongoose.connection.db;
  if (db) {
    await db.collection("users").deleteMany({ email: E2E_USER.email });
    await db.collection("userprofiles").deleteMany({ userId });
    await db.collection("jobs").deleteMany({ sourceUserId: userId });
    await db.collection("jobapplications").deleteMany({ userId });
    await db.collection("recruiterleads").deleteMany({ userId });
    await db.collection("generateddocuments").deleteMany({ userId });
  }
  await mongoose.disconnect();
});

describe("End-to-End: Complete User Journey", () => {
  it("Step 1: User signs up", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send(E2E_USER);
    expect(res.status).toBe(201);
    accessToken = res.body.accessToken;
    userId = res.body.user.id;
  });

  it("Step 2: User updates settings with preferences", async () => {
    const res = await request(app)
      .put("/api/v1/settings")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        currentCtc: 500000,
        expectedCtc: 900000,
        preferredRoles: ["Full Stack Developer", "Backend Engineer"],
        preferredLocations: ["Bangalore", "Hyderabad"],
        autoApplyEnabled: true,
        portalCredentials: [
          { platform: "naukri", username: "e2euser", password: "naukri123" },
          { platform: "linkedin", username: "e2elin", password: "linpass" },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.user.preferredRoles).toHaveLength(2);
    expect(res.body.user.credentialVault).toHaveLength(2);
    // Verify passwords are encrypted, not stored in plaintext
    for (const cred of res.body.user.credentialVault) {
      expect(cred.encryptedPassword).toBeDefined();
      expect(cred.iv).toBeDefined();
      expect(cred.tag).toBeDefined();
    }
  });

  it("Step 3: User uploads resume (simulated via direct DB insert)", async () => {
    // Simulate a parsed profile using the Mongoose model
    await UserProfileModel.create({
      userId,
      name: E2E_USER.fullName,
      skills: ["javascript", "typescript", "react", "node.js", "mongodb"],
      projects: [
        {
          name: "Job Portal",
          summary: "Full-stack job portal with React and Node.js",
          technologies: ["react", "node.js", "mongodb"],
        },
      ],
      experience: [
        {
          company: "Tech Corp",
          title: "Junior Developer",
          startDate: "2024-06",
          endDate: "2025-04",
          summary: "Built APIs and frontend features.",
        },
      ],
      education: [
        {
          institution: "VTU",
          degree: "B.E. CS",
          startDate: "2020",
          endDate: "2024",
        },
      ],
      certifications: ["AWS Cloud Practitioner"],
      resumeScore: 78,
    });

    // Verify profile exists via dashboard
    const res = await request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.resumeScore).toBe(78);
  });

  it("Step 4: Jobs are fetched (simulated via DB insert)", async () => {
    // Insert a test job directly
    const job = await JobModel.create({
      sourceUserId: userId,
      title: "Backend Developer",
      company: "TestCorp",
      location: "Bangalore",
      description:
        "We need a backend developer with Node.js, TypeScript, MongoDB experience. Building microservices.",
      link: "https://testcorp.com/careers/backend-dev",
      platform: "naukri",
      status: "new",
      relevanceScore: 85,
    });
    testJobId = job._id.toString();

    const res = await request(app)
      .get("/api/v1/jobs")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.jobs[0].title).toBe("Backend Developer");
    expect(res.body.jobs[0].company).toBe("TestCorp");
  });

  it("Step 5: User runs job matching", async () => {
    const res = await request(app)
      .post("/api/v1/jobs/match")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.matches).toHaveLength(1);
    expect(res.body.matches[0].title).toBe("Backend Developer");
    expect(res.body.matches[0].matchScore).toBeDefined();
    expect(res.body.matches[0].matchedSkills).toBeInstanceOf(Array);
  });

  it("Step 6: User discovers HR contacts for the job", async () => {
    const res = await request(app)
      .post("/api/v1/hr/find")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: testJobId });

    expect(res.status).toBe(200);
    expect(res.body.leads).toBeInstanceOf(Array);
    expect(res.body.leads.length).toBeGreaterThan(0);
    expect(res.body.leads[0].company).toBe("TestCorp");
    expect(res.body.leads[0].name).toContain("Recruiting Team");
  });

  it("Step 7: User generates outreach messages", async () => {
    const res = await request(app)
      .post("/api/v1/outreach/generate")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: testJobId });

    expect(res.status).toBe(200);
    expect(res.body.email).toContain("Backend Developer");
    expect(res.body.email).toContain("TestCorp");
    expect(res.body.linkedinMessage).toContain("TestCorp");
    expect(res.body.referralMessage).toContain("TestCorp");
  });

  it("Step 8: User generates tailored resume", async () => {
    const res = await request(app)
      .post("/api/v1/resume/generate")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: testJobId });

    expect(res.status).toBe(200);
    expect(res.body.latex).toContain("TestCorp");
    expect(res.body.atsSuggestions).toBeInstanceOf(Array);
    expect(res.body.documentId).toBeDefined();
    expect(res.body.atsKeywordsInjected).toBeInstanceOf(Array);
  });

  it("Step 9: User applies for the job", async () => {
    const res = await request(app)
      .post("/api/v1/apply/job")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: testJobId });

    expect(res.status).toBe(200);
    expect(res.body.application).toBeDefined();
    expect(res.body.application.status).toBe("new");
    expect(res.body.application.appliedVia).toBe("automation");
  });

  it("Step 10: Dashboard reflects all activity", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    // Job should now be in "applied" state
    expect(res.body.tabs.applied.length).toBeGreaterThanOrEqual(1);
    expect(res.body.applications.length).toBeGreaterThanOrEqual(1);
    expect(res.body.recruiterLeads.length).toBeGreaterThanOrEqual(1);
    expect(res.body.resumeScore).toBe(78);
  });

  it("Step 11: Salary intelligence provides negotiation insights", async () => {
    const res = await request(app)
      .post("/api/v1/salary/intelligence")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        currentCtc: 500000,
        expectedCtc: 900000,
        preferredRoles: ["Backend Developer"],
      });

    expect(res.status).toBe(200);
    expect(res.body.marketRange.min).toBeGreaterThan(0);
    expect(res.body.negotiationTips.length).toBeGreaterThan(0);
  });
});
