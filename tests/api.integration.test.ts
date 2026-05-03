import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../apps/api/src/app.js";
import { connectDatabase } from "../apps/api/src/lib/database.js";

const app = createApp();
let accessToken: string;
let userId: string;

const TEST_USER = {
  fullName: "Integration Test User",
  email: `testuser_${Date.now()}@example.com`,
  password: "TestPass123!",
};

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  // Clean up test data
  const db = mongoose.connection.db;
  if (db) {
    await db.collection("users").deleteMany({ email: TEST_USER.email });
    await db.collection("userprofiles").deleteMany({ userId });
    await db.collection("jobs").deleteMany({ sourceUserId: userId });
    await db.collection("jobapplications").deleteMany({ userId });
    await db.collection("recruiterleads").deleteMany({ userId });
    await db.collection("generateddocuments").deleteMany({ userId });
  }
  await mongoose.disconnect();
});

describe("Health Check", () => {
  it("GET / returns platform info", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("AI Job Search Automation Platform");
    expect(res.body.version).toBe("1.0.0");
    expect(res.body.apiPrefix).toBe("/api/v1");
  });

  it("GET /api/v1/health returns ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", service: "job-automation-api" });
  });
});

describe("Auth - Signup", () => {
  it("POST /api/v1/auth/signup creates user and returns token", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send(TEST_USER);

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(TEST_USER.email);
    expect(res.body.user.fullName).toBe(TEST_USER.fullName);
    expect(res.body.user.id).toBeDefined();
    accessToken = res.body.accessToken;
    userId = res.body.user.id;
  });

  it("POST /api/v1/auth/signup rejects duplicate email", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send(TEST_USER);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Email is already registered");
  });

  it("POST /api/v1/auth/signup validates required fields", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "bad" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("POST /api/v1/auth/signup rejects short password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ fullName: "Test", email: "x@y.com", password: "short" });

    expect(res.status).toBe(400);
  });
});

describe("Auth - Login", () => {
  it("POST /api/v1/auth/login returns token for valid credentials", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    accessToken = res.body.accessToken;
  });

  it("POST /api/v1/auth/login rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: "WrongPass123!" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("POST /api/v1/auth/login rejects non-existent email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nobody@nowhere.com", password: "TestPass123!" });

    expect(res.status).toBe(401);
  });
});

describe("Auth - Protected Routes", () => {
  it("GET /api/v1/auth/me requires auth token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Missing bearer token");
  });

  it("GET /api/v1/auth/me rejects invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid access token");
  });

  it("GET /api/v1/auth/me returns user profile", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(TEST_USER.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });
});

describe("Settings", () => {
  it("PUT /api/v1/settings updates user preferences", async () => {
    const res = await request(app)
      .put("/api/v1/settings")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        currentCtc: 600000,
        expectedCtc: 1000000,
        preferredRoles: ["Backend Developer"],
        preferredLocations: ["Bangalore"],
        autoApplyEnabled: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.user.currentCtc).toBe(600000);
    expect(res.body.user.expectedCtc).toBe(1000000);
    expect(res.body.user.preferredRoles).toContain("Backend Developer");
    expect(res.body.user.autoApplyEnabled).toBe(true);
  });

  it("PUT /api/v1/settings stores encrypted portal credentials", async () => {
    const res = await request(app)
      .put("/api/v1/settings")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        portalCredentials: [
          {
            platform: "linkedin",
            username: "testlinkedin",
            password: "linkedinpass",
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.user.credentialVault).toHaveLength(1);
    expect(res.body.user.credentialVault[0].platform).toBe("linkedin");
    expect(res.body.user.credentialVault[0].encryptedPassword).toBeDefined();
    expect(res.body.user.credentialVault[0].iv).toBeDefined();
    expect(res.body.user.credentialVault[0].tag).toBeDefined();
    // original password must NOT be in the response
    expect(res.body.user.credentialVault[0].password).toBeUndefined();
  });

  it("PUT /api/v1/settings validates body", async () => {
    const res = await request(app)
      .put("/api/v1/settings")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ currentCtc: "not-a-number" });

    expect(res.status).toBe(400);
  });
});

describe("Resume", () => {
  it("GET /api/v1/resume/sample-output returns sample data (no auth)", async () => {
    const res = await request(app).get("/api/v1/resume/sample-output");
    expect(res.status).toBe(200);
    expect(res.body.name).toBeDefined();
    expect(res.body.skills).toBeInstanceOf(Array);
    expect(res.body.resumeScore).toBeGreaterThan(0);
  });

  it("POST /api/v1/parse-resume rejects missing file", async () => {
    const res = await request(app)
      .post("/api/v1/parse-resume")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Resume file is required");
  });
});

describe("Jobs", () => {
  it("POST /api/v1/jobs/fetch returns array (may be empty)", async () => {
    const res = await request(app)
      .post("/api/v1/jobs/fetch")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.jobs).toBeInstanceOf(Array);
  });

  it("GET /api/v1/jobs returns job list", async () => {
    const res = await request(app)
      .get("/api/v1/jobs")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.jobs).toBeInstanceOf(Array);
  });

  it("POST /api/v1/jobs/match returns matches", async () => {
    const res = await request(app)
      .post("/api/v1/jobs/match")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.matches).toBeInstanceOf(Array);
  });

  it("GET /api/v1/jobs filters by tags, skills, and location", async () => {
    const db = mongoose.connection.db!;
    await db.collection("jobs").insertMany([
      {
        sourceUserId: new mongoose.Types.ObjectId(userId),
        title: "Frontend Engineer",
        normalizedTitle: "frontend engineer",
        company: "Filter Corp",
        description: "React and TypeScript role",
        link: "https://example.com/frontend-role",
        platform: "Indeed",
        location: "Remote - Filterland",
        extractedSkills: ["fixture-react", "fixture-typescript"],
        categoryTags: ["FixtureFrontendTag", "FixtureCloudTag"],
        relevanceScore: 91,
        matchedSkills: ["react"],
        missingSkills: ["typescript"],
        status: "new",
        jobSource: "remote",
        isProfileFit: true,
        linkStatus: "valid",
      },
      {
        sourceUserId: new mongoose.Types.ObjectId(userId),
        title: "Backend Engineer",
        normalizedTitle: "backend engineer",
        company: "Filter Corp",
        description: "Node.js and MongoDB role",
        link: "https://example.com/backend-role",
        platform: "Naukri",
        location: "Bengaluru",
        extractedSkills: ["node.js", "mongodb"],
        categoryTags: ["Backend"],
        relevanceScore: 89,
        matchedSkills: ["node.js"],
        missingSkills: [],
        status: "new",
        jobSource: "remote",
        isProfileFit: true,
        linkStatus: "valid",
      },
    ]);

    const tagRes = await request(app)
      .get("/api/v1/jobs?tags=FixtureFrontendTag")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(tagRes.status).toBe(200);
    expect(tagRes.body.jobs).toHaveLength(1);
    expect(tagRes.body.jobs[0].title).toBe("Frontend Engineer");

    const skillRes = await request(app)
      .get("/api/v1/jobs?skills=fixture-react")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(skillRes.status).toBe(200);
    expect(skillRes.body.jobs).toHaveLength(1);
    expect(skillRes.body.jobs[0].title).toBe("Frontend Engineer");

    const locationRes = await request(app)
      .get("/api/v1/jobs?location=filterland")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(locationRes.status).toBe(200);
    expect(locationRes.body.jobs).toHaveLength(1);
    expect(locationRes.body.jobs[0].title).toBe("Frontend Engineer");

    const platformRes = await request(app)
      .get("/api/v1/jobs?platform=Indeed")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(platformRes.status).toBe(200);
    expect(platformRes.body.jobs).toHaveLength(1);
    expect(platformRes.body.jobs[0].title).toBe("Frontend Engineer");
  });

  it("PATCH /api/v1/jobs/:jobId/status updates the job state", async () => {
    const db = mongoose.connection.db!;
    const insertResult = await db.collection("jobs").insertOne({
      sourceUserId: new mongoose.Types.ObjectId(userId),
      title: "Status Target Role",
      normalizedTitle: "status target role",
      company: "Status Corp",
      description: "Status update fixture",
      link: `https://example.com/status-role-${Date.now()}`,
      platform: "Foundit",
      location: "Remote",
      extractedSkills: ["typescript"],
      categoryTags: ["Backend"],
      relevanceScore: 80,
      matchedSkills: ["typescript"],
      missingSkills: [],
      status: "new",
      jobSource: "remote",
      isProfileFit: true,
      linkStatus: "valid",
    });

    const res = await request(app)
      .patch(`/api/v1/jobs/${insertResult.insertedId.toString()}/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "finished" });

    expect(res.status).toBe(200);
    expect(res.body.job.status).toBe("finished");
  });
});

describe("Dashboard", () => {
  it("GET /api/v1/dashboard returns structured data", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.tabs).toBeDefined();
    expect(res.body.tabs.newJobs).toBeInstanceOf(Array);
    expect(res.body.tabs.applied).toBeInstanceOf(Array);
    expect(res.body.applications).toBeInstanceOf(Array);
    expect(res.body.recruiterLeads).toBeInstanceOf(Array);
    expect(res.body.resumeScore).toBeDefined();
  });

  it("GET /api/v1/dashboard only includes verified profile-fit jobs", async () => {
    const db = mongoose.connection.db!;
    await db.collection("jobs").insertMany([
      {
        sourceUserId: new mongoose.Types.ObjectId(userId),
        title: "Visible Dashboard Job",
        normalizedTitle: "visible dashboard job",
        company: "Visible Corp",
        description: "Visible dashboard fixture",
        link: `https://example.com/dashboard-visible-${Date.now()}`,
        platform: "Foundit",
        location: "Remote",
        extractedSkills: ["typescript"],
        categoryTags: ["Backend"],
        relevanceScore: 82,
        matchedSkills: ["typescript"],
        missingSkills: [],
        status: "new",
        jobSource: "remote",
        isProfileFit: true,
        linkStatus: "valid",
      },
      {
        sourceUserId: new mongoose.Types.ObjectId(userId),
        title: "Invalid Dashboard Job",
        normalizedTitle: "invalid dashboard job",
        company: "Hidden Corp",
        description: "Should not appear on dashboard",
        link: `https://example.com/dashboard-invalid-${Date.now()}`,
        platform: "Foundit",
        location: "Remote",
        extractedSkills: [],
        categoryTags: [],
        relevanceScore: 10,
        matchedSkills: [],
        missingSkills: [],
        status: "new",
        jobSource: "remote",
        isProfileFit: false,
        linkStatus: "invalid",
      },
    ]);

    const res = await request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    const titles = Object.values(res.body.tabs)
      .flat()
      .map((job: any) => job.title);
    expect(titles).toContain("Visible Dashboard Job");
    expect(titles).not.toContain("Invalid Dashboard Job");
  });
});

describe("HR Discovery", () => {
  it("POST /api/v1/hr/find returns LinkedIn hiring lead metadata", async () => {
    const db = mongoose.connection.db!;
    const insertedJob = await db.collection("jobs").insertOne({
      sourceUserId: new mongoose.Types.ObjectId(userId),
      title: "Software Engineer",
      normalizedTitle: "software engineer",
      company: "TestCorp",
      description: "Build backend systems with TypeScript and Node.js",
      link: "https://example.com/software-engineer",
      platform: "LinkedIn",
      location: "Bangalore, India",
      extractedSkills: ["typescript", "node.js"],
      categoryTags: ["backend"],
      relevanceScore: 88,
      matchedSkills: ["typescript"],
      missingSkills: ["system design"],
      status: "new",
      linkStatus: "valid",
      isProfileFit: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post("/api/v1/hr/find")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: insertedJob.insertedId.toString() });

    expect(res.status).toBe(200);
    expect(res.body.leads).toBeInstanceOf(Array);
    expect(res.body.leads.length).toBeGreaterThan(0);
    expect(res.body.leads[0].company).toBe("TestCorp");
    expect(res.body.leads[0].profileUrl).toContain(
      "linkedin.com/search/results/people",
    );
    expect(res.body.leads[0].searchUrl).toContain(
      "linkedin.com/search/results/people",
    );
    expect(res.body.leads[0].searchQuery).toContain("TestCorp");
    expect(res.body.leads[0].hiringSignal).toContain("hiring");
  });

  it("POST /api/v1/hr/find returns 404 for non-existent job", async () => {
    const res = await request(app)
      .post("/api/v1/hr/find")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: "000000000000000000000001" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Job not found");
  });

  it("POST /api/v1/hr/find validates body", async () => {
    const res = await request(app)
      .post("/api/v1/hr/find")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("PATCH /api/v1/hr/state updates recruiter lead state", async () => {
    const db = mongoose.connection.db!;
    const jobId = new mongoose.Types.ObjectId();
    const leadId = new mongoose.Types.ObjectId();

    await db.collection("jobs").insertOne({
      _id: jobId,
      sourceUserId: new mongoose.Types.ObjectId(userId),
      title: "Software Engineer",
      normalizedTitle: "software engineer",
      company: "Stateful Corp",
      description: "Hiring for backend development",
      link: "https://example.com/stateful-role",
      platform: "LinkedIn",
      location: "Remote",
      extractedSkills: ["typescript"],
      categoryTags: ["backend"],
      relevanceScore: 90,
      matchedSkills: ["typescript"],
      missingSkills: [],
      status: "new",
      linkStatus: "valid",
      isProfileFit: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.collection("recruiterleads").insertOne({
      _id: leadId,
      userId: new mongoose.Types.ObjectId(userId),
      jobId,
      name: "Test Recruiter",
      title: "Technical Recruiter",
      category: "talent-acquisition",
      company: "Stateful Corp",
      profileUrl:
        "https://www.linkedin.com/search/results/people/?keywords=test",
      searchUrl:
        "https://www.linkedin.com/search/results/people/?keywords=stateful",
      searchQuery: "Stateful Corp technical recruiter hiring software engineer",
      hiringSignal: "Likely active hiring owner for software engineer roles.",
      recentPosts: ["We're hiring engineers now"],
      state: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .patch("/api/v1/hr/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ leadId: leadId.toString(), state: "action-taken" });

    expect(res.status).toBe(200);
    expect(res.body.lead.state).toBe("action-taken");
    expect(res.body.lead.name).toBe("Test Recruiter");
  });
});

describe("Auto Apply", () => {
  it("POST /api/v1/apply/job returns 404 for non-existent job", async () => {
    const res = await request(app)
      .post("/api/v1/apply/job")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: "000000000000000000000001" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Job not found");
  });
});

describe("Outreach", () => {
  it("POST /api/v1/outreach/generate returns 404 for missing profile/job", async () => {
    const res = await request(app)
      .post("/api/v1/outreach/generate")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ jobId: "000000000000000000000001" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Profile or job not found");
  });
});

describe("Salary Intelligence", () => {
  it("POST /api/v1/salary/intelligence returns market data", async () => {
    const res = await request(app)
      .post("/api/v1/salary/intelligence")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        currentCtc: 600000,
        expectedCtc: 1000000,
        preferredRoles: ["Backend Developer"],
      });

    expect(res.status).toBe(200);
    expect(res.body.marketRange).toBeDefined();
    expect(res.body.marketRange.min).toBeGreaterThan(0);
    expect(res.body.marketRange.max).toBeGreaterThan(res.body.marketRange.min);
    expect(res.body.negotiationTips).toBeInstanceOf(Array);
    expect(res.body.negotiationTips.length).toBeGreaterThan(0);
  });

  it("POST /api/v1/salary/intelligence validates input", async () => {
    const res = await request(app)
      .post("/api/v1/salary/intelligence")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ currentCtc: -1 });

    expect(res.status).toBe(400);
  });
});
