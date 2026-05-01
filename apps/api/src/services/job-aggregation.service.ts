import { JobModel } from "../models/Job.js";
import { UserModel } from "../models/User.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { JobMatchingService } from "./job-matching.service.js";

type JobSeed = {
  title: string;
  company: string;
  description: string;
  link: string;
  platform: string;
  location: string;
  postedDate: string; // ISO date string
  applicantCount: number;
};

// Generate postedDate relative to today for realistic sorting
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const SAMPLE_JOBS: JobSeed[] = [
  {
    title: "Software Development Engineer",
    company: "Amazon India",
    description:
      "Java, Python, AWS, distributed systems, microservices, REST APIs, Docker, Kubernetes, CI/CD, system design. We are looking for SDEs to work on large-scale distributed systems that power Amazon's global infrastructure. You will design and implement high-throughput services.",
    link: "https://www.amazon.jobs/en/search?base_query=Software+Development+Engineer&loc_query=India",
    platform: "Amazon Jobs",
    location: "Bengaluru",
    postedDate: daysAgo(1),
    applicantCount: 23,
  },
  {
    title: "Full Stack Developer",
    company: "Flipkart",
    description:
      "React, TypeScript, Node.js, Express, MongoDB, REST APIs, GraphQL, Docker, CI/CD, Agile. Join Flipkart's engineering team building next-generation e-commerce platform. Work on customer-facing features serving millions of users.",
    link: "https://www.flipkartcareers.com/#!/joblist",
    platform: "Flipkart Careers",
    location: "Bengaluru",
    postedDate: daysAgo(0),
    applicantCount: 8,
  },
  {
    title: "Backend Engineer",
    company: "Razorpay",
    description:
      "Node.js, TypeScript, MongoDB, PostgreSQL, Redis, microservices, Docker, Kubernetes, event-driven architecture. Build scalable payment infrastructure processing millions of transactions daily. Work with cutting-edge fintech stack.",
    link: "https://razorpay.com/jobs/",
    platform: "Razorpay Careers",
    location: "Bengaluru",
    postedDate: daysAgo(2),
    applicantCount: 45,
  },
  {
    title: "Software Engineer",
    company: "Google India",
    description:
      "C++, Java, Python, distributed systems, algorithms, data structures, large-scale systems, cloud infrastructure. Design, develop, test, deploy, maintain, and improve software across Google's product suite.",
    link: "https://www.google.com/about/careers/applications/jobs/results/?location=India&q=Software%20Engineer",
    platform: "Google Careers",
    location: "Hyderabad",
    postedDate: daysAgo(3),
    applicantCount: 120,
  },
  {
    title: "Software Development Engineer II",
    company: "Microsoft",
    description:
      "C#, TypeScript, React, Azure, cloud services, microservices, REST APIs, system design, CI/CD pipelines. Design and deliver world-class cloud solutions. Drive technical direction and deliver high quality products.",
    link: "https://careers.microsoft.com/v2/global/en/search?q=Software%20Development%20Engineer&l=India",
    platform: "Microsoft Careers",
    location: "Hyderabad",
    postedDate: daysAgo(5),
    applicantCount: 89,
  },
  {
    title: "Full Stack Engineer",
    company: "Swiggy",
    description:
      "React, Node.js, JavaScript, TypeScript, MongoDB, Redis, AWS, Docker, microservices, real-time systems. Build and scale food delivery and quick commerce platform features serving millions of orders daily.",
    link: "https://careers.swiggy.com/#/",
    platform: "Swiggy Careers",
    location: "Bengaluru",
    postedDate: daysAgo(1),
    applicantCount: 15,
  },
  {
    title: "Backend Developer",
    company: "Zerodha",
    description:
      "Python, Go, PostgreSQL, Redis, REST APIs, message queues, Linux, performance optimization, fintech. Build India's largest retail stockbroking platform handling millions of orders with ultra-low latency.",
    link: "https://zerodha.com/careers",
    platform: "Zerodha Careers",
    location: "Remote",
    postedDate: daysAgo(7),
    applicantCount: 200,
  },
  {
    title: "Software Engineer - Platform",
    company: "Atlassian",
    description:
      "Java, TypeScript, React, AWS, Docker, Kubernetes, microservices, REST APIs, Agile, distributed systems. Help build collaboration tools used by millions of teams worldwide. Shape the future of teamwork.",
    link: "https://www.atlassian.com/company/careers/all-jobs?location=India&team=Engineering",
    platform: "Atlassian Careers",
    location: "Bengaluru",
    postedDate: daysAgo(4),
    applicantCount: 67,
  },
  {
    title: "Wireless TAC Engineer",
    company: "Cisco Systems",
    description:
      "Wireless networking, TAC workflows, TCP/IP, Cisco IOS, troubleshooting, incident response, CCNA, CCNP. Provide technical support for Cisco wireless products and resolve complex network issues.",
    link: "https://jobs.cisco.com/jobs/SearchJobs/?21178=%5B169482%5D&21178_format=6020&listFilterMode=1",
    platform: "Cisco Careers",
    location: "Bengaluru",
    postedDate: daysAgo(0),
    applicantCount: 5,
  },
  {
    title: "Network Development Engineer",
    company: "Cisco Systems",
    description:
      "Python, networking, automation, REST APIs, wireless, Cisco IOS, Linux, Docker, scripting, CCNA, CCNP. Develop network automation tools and SDN solutions for next-generation infrastructure.",
    link: "https://jobs.cisco.com/jobs/SearchJobs/?21178=%5B169482%5D&21178_format=6020&listFilterMode=1&21180=%5B187%5D&21180_format=6022",
    platform: "Cisco Careers",
    location: "Bengaluru",
    postedDate: daysAgo(2),
    applicantCount: 32,
  },
  {
    title: "Software Engineer",
    company: "Uber India",
    description:
      "Java, Go, Python, microservices, distributed systems, Kafka, gRPC, Kubernetes, real-time systems. Build and scale ride-sharing and delivery platforms handling millions of trips globally.",
    link: "https://www.uber.com/in/en/careers/list/?query=Software%20Engineer&location=IND-Bengaluru",
    platform: "Uber Careers",
    location: "Bengaluru",
    postedDate: daysAgo(1),
    applicantCount: 42,
  },
  {
    title: "Frontend Engineer",
    company: "Freshworks",
    description:
      "React, TypeScript, JavaScript, CSS, HTML, REST APIs, GraphQL, Webpack, testing, accessibility. Build delightful SaaS product experiences for business software used by 60,000+ customers worldwide.",
    link: "https://www.freshworks.com/company/careers/",
    platform: "Freshworks Careers",
    location: "Chennai",
    postedDate: daysAgo(6),
    applicantCount: 150,
  },
  {
    title: "Platform Engineer",
    company: "PhonePe",
    description:
      "Java, Spring Boot, Kafka, Redis, MySQL, Kubernetes, Docker, microservices, CI/CD. Build India's leading digital payments platform processing billions of transactions.",
    link: "https://www.phonepe.com/careers/",
    platform: "PhonePe Careers",
    location: "Bengaluru",
    postedDate: daysAgo(3),
    applicantCount: 78,
  },
  {
    title: "DevOps Engineer",
    company: "Thoughtworks",
    description:
      "Kubernetes, Docker, Terraform, AWS, Azure, CI/CD, Jenkins, GitHub Actions, monitoring, Linux. Enable engineering teams to ship faster with modern cloud infrastructure and automation.",
    link: "https://www.thoughtworks.com/en-in/careers/jobs",
    platform: "Thoughtworks Careers",
    location: "Pune",
    postedDate: daysAgo(8),
    applicantCount: 95,
  },
  {
    title: "Technical Consulting Engineer",
    company: "Cisco Systems",
    description:
      "Networking, TCP/IP, routing, switching, CCNA, CCNP, troubleshooting, customer escalations, Cisco IOS, wireless, VPN. Provide expert-level technical support for enterprise networking solutions.",
    link: "https://jobs.cisco.com/jobs/SearchJobs/?21178=%5B169482%5D&21178_format=6020&listFilterMode=1",
    platform: "Cisco Careers",
    location: "Bengaluru",
    postedDate: daysAgo(0),
    applicantCount: 3,
  },
];

export class JobAggregationService {
  private readonly matcher = new JobMatchingService();

  async fetchForUser(userId: string) {
    const [user, profile] = await Promise.all([
      UserModel.findById(userId),
      UserProfileModel.findOne({ userId }),
    ]);

    if (!user) {
      throw new Error("User not found");
    }

    const preferredRoles = new Set(
      user.preferredRoles.length
        ? user.preferredRoles.map((role) => role.toLowerCase())
        : [
            "software engineer",
            "network engineer",
            "wireless tac engineer",
            "technical consulting engineer",
          ],
    );

    const preferredKeywords = [...preferredRoles].flatMap((role) =>
      role.split(/\s+/).filter((w) => w.length > 2),
    );

    const jobs = SAMPLE_JOBS.filter((job) => {
      const lowerTitle = job.title.toLowerCase();
      // Match if any significant keyword from preferred roles appears in the title
      return preferredKeywords.some((keyword) => lowerTitle.includes(keyword));
    });

    const profileSkills = profile?.skills ?? [];

    const persisted = await Promise.all(
      jobs.map(async (job) => {
        const matching = this.matcher.match(profileSkills, job.description);

        return JobModel.findOneAndUpdate(
          {
            sourceUserId: userId,
            title: job.title,
            company: job.company,
            link: job.link,
          },
          {
            ...job,
            sourceUserId: userId,
            postedDate: new Date(job.postedDate),
            applicantCount: job.applicantCount,
            relevanceScore: matching.matchScore,
            matchedSkills: matching.matchedSkills,
            missingSkills: matching.missingSkills,
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          },
        );
      }),
    );

    // Sort: newest posted first, then fewest applicants (early applicant advantage)
    return persisted.sort((left, right) => {
      const leftDate = left.postedDate
        ? new Date(left.postedDate).getTime()
        : 0;
      const rightDate = right.postedDate
        ? new Date(right.postedDate).getTime()
        : 0;
      if (rightDate !== leftDate) return rightDate - leftDate;
      return (left.applicantCount ?? 999) - (right.applicantCount ?? 999);
    });
  }
}
