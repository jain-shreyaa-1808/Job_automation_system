import { chromium, type Locator, type Page } from "playwright";

type ApplyOptions = {
  jobLink: string;
  resumePath?: string;
  rateLimitPerMinute: number;
  headless: boolean;
};

type ApplyResult = {
  status: "submitted" | "manual-review";
  details: string;
};

const KNOWN_SELECTORS = {
  applyButton: [
    'button:has-text("Apply")',
    'a:has-text("Apply")',
    'button:has-text("Easy Apply")',
  ],
  name: ['input[name="name"]', 'input[placeholder*="Name"]'],
  email: ['input[type="email"]', 'input[name="email"]'],
  resume: ['input[type="file"]'],
  submit: ['button[type="submit"]', 'button:has-text("Submit")'],
};

export async function runAutoApply(
  options: ApplyOptions,
): Promise<ApplyResult> {
  const browser = await chromium.launch({ headless: options.headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(options.jobLink, { waitUntil: "domcontentloaded" });
    await throttle(page, options.rateLimitPerMinute);

    if (await hasCaptcha(page)) {
      return {
        status: "manual-review",
        details: "CAPTCHA detected. Handing off to manual review queue.",
      };
    }

    await clickFirst(page, KNOWN_SELECTORS.applyButton);
    await fillIfPresent(page, KNOWN_SELECTORS.name, "Candidate Name");
    await fillIfPresent(page, KNOWN_SELECTORS.email, "candidate@example.com");

    if (options.resumePath) {
      const uploadHandle = await findFirst(page, KNOWN_SELECTORS.resume);
      if (uploadHandle) {
        await uploadHandle.setInputFiles(options.resumePath);
      }
    }

    await clickFirst(page, KNOWN_SELECTORS.submit);

    return {
      status: "submitted",
      details:
        "Application submitted with rate limiting and generic form support.",
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

async function throttle(page: Page, rateLimitPerMinute: number) {
  const delayMs = Math.ceil(60000 / Math.max(rateLimitPerMinute, 1));
  await page.waitForTimeout(delayMs);
}

async function hasCaptcha(page: Page) {
  return (
    (await page
      .locator(
        'iframe[title*="captcha"], div[class*="captcha"], iframe[src*="recaptcha"]',
      )
      .count()) > 0
  );
}

async function clickFirst(page: Page, selectors: string[]) {
  const handle = await findFirst(page, selectors);
  if (handle) {
    await handle.click();
  }
}

async function fillIfPresent(page: Page, selectors: string[], value: string) {
  const handle = await findFirst(page, selectors);
  if (handle) {
    await handle.fill(value);
  }
}

async function findFirst(
  page: Page,
  selectors: string[],
): Promise<Locator | null> {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) > 0) {
      return locator;
    }
  }

  return null;
}
