import { RecruiterLeadModel } from "../models/RecruiterLead.js";
import { JobModel } from "../models/Job.js";
import { AppError } from "../utils/app-error.js";
// Realistic contact role templates per company
const COMPANY_CONTACTS = {
    "Amazon India": [
        {
            nameTemplate: "Priya Sharma",
            title: "Senior Technical Recruiter",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Rahul Verma",
            title: "Hiring Manager - SDE",
            category: "hiring-manager",
        },
        {
            nameTemplate: "Ankita Joshi",
            title: "Talent Acquisition Partner",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Deepak Kumar",
            title: "SDE III - Potential Referral",
            category: "referral",
        },
        {
            nameTemplate: "Meera Nair",
            title: "HR Business Partner",
            category: "hr",
        },
    ],
    Flipkart: [
        {
            nameTemplate: "Sneha Reddy",
            title: "Technical Recruiter",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Karthik Iyer",
            title: "Engineering Manager",
            category: "hiring-manager",
        },
        {
            nameTemplate: "Ananya Gupta",
            title: "Talent Acquisition Lead",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Vikram Patel",
            title: "Senior Engineer - Potential Referral",
            category: "referral",
        },
    ],
    Razorpay: [
        {
            nameTemplate: "Neha Agarwal",
            title: "Technical Recruiter",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Arjun Mehta",
            title: "Engineering Manager - Payments",
            category: "hiring-manager",
        },
        {
            nameTemplate: "Riya Kapoor",
            title: "People Operations Lead",
            category: "hr",
        },
        {
            nameTemplate: "Siddharth Rao",
            title: "Backend Engineer - Potential Referral",
            category: "referral",
        },
    ],
    "Google India": [
        {
            nameTemplate: "Aishwarya Menon",
            title: "University Recruiter",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Rohan Das",
            title: "Technical Recruiting Lead",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Sunil Krishnamurthy",
            title: "Staff Engineer - Potential Referral",
            category: "referral",
        },
        {
            nameTemplate: "Pooja Bansal",
            title: "HR Manager - India Engineering",
            category: "hr",
        },
    ],
    Microsoft: [
        {
            nameTemplate: "Shreya Malhotra",
            title: "Senior Recruiter - Azure",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Amit Deshmukh",
            title: "Principal Engineering Manager",
            category: "hiring-manager",
        },
        {
            nameTemplate: "Kavitha Sundaram",
            title: "Talent Acquisition Partner",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Raj Chakraborty",
            title: "SDE II - Potential Referral",
            category: "referral",
        },
    ],
    Swiggy: [
        {
            nameTemplate: "Divya Krishnan",
            title: "Technical Recruiter",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Manish Tiwari",
            title: "Engineering Lead - Platform",
            category: "hiring-manager",
        },
        {
            nameTemplate: "Sanjana Hegde",
            title: "Talent Acquisition Specialist",
            category: "talent-acquisition",
        },
    ],
    Zerodha: [
        {
            nameTemplate: "Nithin Kamath",
            title: "CTO Office",
            category: "hiring-manager",
        },
        {
            nameTemplate: "Asha Bhat",
            title: "People & Culture Lead",
            category: "hr",
        },
        {
            nameTemplate: "Harish Gowda",
            title: "Senior Developer - Potential Referral",
            category: "referral",
        },
    ],
    Atlassian: [
        {
            nameTemplate: "Lakshmi Narayan",
            title: "Technical Recruiter - India",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "James Mitchell",
            title: "Engineering Manager - Platform",
            category: "hiring-manager",
        },
        {
            nameTemplate: "Nandini Rao",
            title: "Talent Acquisition Lead - APAC",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Arun Prakash",
            title: "Senior Engineer - Potential Referral",
            category: "referral",
        },
    ],
    "Cisco Systems": [
        {
            nameTemplate: "Sunitha Reddy",
            title: "University Talent Recruiter",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Rajesh Pillai",
            title: "Technical Leader - Wireless",
            category: "hiring-manager",
        },
        {
            nameTemplate: "Monica Jain",
            title: "HR Manager - India TAC",
            category: "hr",
        },
        {
            nameTemplate: "Vinay Shetty",
            title: "TAC Engineer III - Potential Referral",
            category: "referral",
        },
        {
            nameTemplate: "Deepa Nambiar",
            title: "Talent Acquisition Partner",
            category: "talent-acquisition",
        },
    ],
    "Uber India": [
        {
            nameTemplate: "Krithika Raman",
            title: "Technical Recruiter",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Sameer Ahuja",
            title: "Engineering Manager - Rides",
            category: "hiring-manager",
        },
        {
            nameTemplate: "Tanvi Shah",
            title: "Senior Engineer - Potential Referral",
            category: "referral",
        },
    ],
    Freshworks: [
        {
            nameTemplate: "Janani Subramaniam",
            title: "Technical Recruiter",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Aravind Kumar",
            title: "Engineering Manager",
            category: "hiring-manager",
        },
        {
            nameTemplate: "Pavithra Mohan",
            title: "Talent Acquisition Specialist",
            category: "talent-acquisition",
        },
    ],
    PhonePe: [
        {
            nameTemplate: "Rashmi Kulkarni",
            title: "Technical Recruiter",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Vivek Goyal",
            title: "Platform Engineering Lead",
            category: "hiring-manager",
        },
        {
            nameTemplate: "Smita Desai",
            title: "People Operations Manager",
            category: "hr",
        },
    ],
    Thoughtworks: [
        {
            nameTemplate: "Aditi Sharma",
            title: "Talent Acquisition Consultant",
            category: "talent-acquisition",
        },
        {
            nameTemplate: "Nikhil Parikh",
            title: "Technical Principal",
            category: "hiring-manager",
        },
        {
            nameTemplate: "Revathi Menon",
            title: "HR Business Partner",
            category: "hr",
        },
    ],
};
// Default contacts for companies not in the map
const DEFAULT_CONTACTS = [
    {
        nameTemplate: "Recruiting Team",
        title: "Talent Acquisition",
        category: "talent-acquisition",
    },
    {
        nameTemplate: "Engineering Hiring",
        title: "Hiring Manager",
        category: "hiring-manager",
    },
    { nameTemplate: "HR Department", title: "Human Resources", category: "hr" },
];
function generateLinkedInSearchUrl(name, company) {
    const query = encodeURIComponent(`${name} ${company}`);
    return `https://www.linkedin.com/search/results/people/?keywords=${query}`;
}
function generateRecentPosts(contact, jobTitle, company, location) {
    const posts = [];
    switch (contact.category) {
        case "talent-acquisition":
            posts.push(`🚀 We're hiring! ${company} is looking for talented ${jobTitle}s in ${location}. Apply now!`, `Exciting opportunities at ${company}! DM me if you're interested in engineering roles.`);
            break;
        case "hiring-manager":
            posts.push(`Looking to grow my team at ${company}. If you're passionate about building scalable systems, let's connect.`, `Just shipped a major feature with the team. Proud of what we've built at ${company}!`);
            break;
        case "hr":
            posts.push(`${company} is one of the best places to work in India! Proud of our engineering culture.`, `We value diversity and inclusion at ${company}. Check out our open positions!`);
            break;
        case "referral":
            posts.push(`Great time working at ${company}! The engineering culture here is top-notch.`, `If you're looking for your next role, I'd recommend checking out ${company}. Happy to refer strong candidates.`);
            break;
    }
    return posts;
}
export class HrDiscoveryService {
    async discover(userId, jobId) {
        const job = await JobModel.findById(jobId);
        if (!job) {
            throw AppError.notFound("Job not found");
        }
        const companyContacts = COMPANY_CONTACTS[job.company] ?? DEFAULT_CONTACTS;
        const leads = companyContacts.map((contact) => ({
            userId,
            jobId,
            name: contact.nameTemplate,
            title: `${contact.title} (${contact.category.replace("-", " ")})`,
            company: job.company,
            profileUrl: generateLinkedInSearchUrl(contact.nameTemplate, job.company),
            recentPosts: generateRecentPosts(contact, job.title, job.company, job.location),
        }));
        const saved = await Promise.all(leads.map((lead) => RecruiterLeadModel.findOneAndUpdate({ userId, jobId, name: lead.name }, lead, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        })));
        return saved;
    }
    async updateState(userId, leadId, state) {
        return RecruiterLeadModel.findOneAndUpdate({ _id: leadId, userId }, { state }, { new: true });
    }
}
//# sourceMappingURL=hr-discovery.service.js.map