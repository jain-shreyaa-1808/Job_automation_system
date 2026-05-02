import { describe, expect, it } from "vitest";

import {
  getPublicScrapeUrls,
  parseJobsFromHtml,
} from "../apps/api/src/services/job-providers/public-html-job-provider.js";

import indeedFixture from "./fixtures/indeed-search.html?raw";
import naukriFixture from "./fixtures/naukri-search.html?raw";
import founditFixture from "./fixtures/foundit-search.html?raw";
import hiristFixture from "./fixtures/hirist-search.html?raw";
import cutshortFixture from "./fixtures/cutshort-search.html?raw";
import instahyreFixture from "./fixtures/instahyre-search.html?raw";

describe("Public HTML Job Provider", () => {
  it("parses Indeed fixture cards", () => {
    const jobs = parseJobsFromHtml(
      "indeed",
      indeedFixture,
      "https://www.indeed.com/jobs?q=software+engineer&l=remote",
    );

    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Software Engineer");
    expect(jobs[0].company).toBe("Acme Inc");
    expect(jobs[0].location).toBe("Remote");
  });

  it("parses Naukri fixture cards", () => {
    const jobs = parseJobsFromHtml(
      "naukri",
      naukriFixture,
      "https://www.naukri.com/software-engineer-jobs",
    );

    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Backend Developer");
    expect(jobs[0].company).toBe("Globex");
  });

  it("parses Foundit fixture cards", () => {
    const jobs = parseJobsFromHtml(
      "foundit",
      founditFixture,
      "https://www.foundit.in/srp/results?query=software%20engineer",
    );

    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Full Stack Engineer");
    expect(jobs[0].company).toBe("Innotech");
  });

  it("parses Hirist fixture cards", () => {
    const jobs = parseJobsFromHtml(
      "hirist",
      hiristFixture,
      "https://www.hirist.tech/search/jobs/software%20engineer",
    );

    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Platform Engineer");
    expect(jobs[0].company).toBe("DataWorks");
  });

  it("parses Cutshort fixture cards", () => {
    const jobs = parseJobsFromHtml(
      "cutshort",
      cutshortFixture,
      "https://cutshort.io/jobs/software-engineer-jobs-in-Remote",
    );

    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Frontend Engineer");
    expect(jobs[0].company).toBe("Pixel Labs");
  });

  it("parses Instahyre fixture cards", () => {
    const jobs = parseJobsFromHtml(
      "instahyre",
      instahyreFixture,
      "https://www.instahyre.com/job-search/?search=software%20engineer",
    );

    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("AI Engineer");
    expect(jobs[0].company).toBe("Neuron Stack");
  });

  it("builds per-site pagination urls", () => {
    const indeedUrls = getPublicScrapeUrls("indeed", "software engineer", 3);
    const naukriUrls = getPublicScrapeUrls("naukri", "software engineer", 3);

    expect(indeedUrls).toHaveLength(3);
    expect(indeedUrls[1]).toContain("start=10");
    expect(indeedUrls[2]).toContain("start=20");

    expect(naukriUrls).toHaveLength(3);
    expect(naukriUrls[0]).toContain("software-engineer-jobs-1");
    expect(naukriUrls[2]).toContain("software-engineer-jobs-3");
  });
});
