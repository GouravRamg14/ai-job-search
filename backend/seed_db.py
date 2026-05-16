import sqlite3
import random
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

from db_path import get_db_path

# Creates / updates jobs.db and jobs table
conn = sqlite3.connect(str(get_db_path()))
c = conn.cursor()

# Recreate table with posted_at, salary, experience_level, apply_url
c.execute('DROP TABLE IF EXISTS jobs')
c.execute('''
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    company TEXT,
    location TEXT,
    job_type TEXT,
    description TEXT,
    skills TEXT,
    image_url TEXT,
    posted_at TEXT,
    salary TEXT,
    experience_level TEXT,
    apply_url TEXT
)
''')

def company_logo_url(company):
    """Placeholder company logo: same company = same image."""
    name = quote(company or 'Company')
    return f"https://ui-avatars.com/api/?name={name}&size=256&background=4f46e5&color=fff&bold=1"

def apply_url_for_company(company):
    slug = (company or "company").replace(" ", "").lower()
    return f"https://{slug}.careers.example.com/apply"

def random_past_date(days_back_max=30):
    d = datetime.now(timezone.utc) - timedelta(days=random.randint(0, days_back_max))
    return d.strftime("%Y-%m-%dT%H:%M:%SZ")

# --- Configuration for generation ---

LOCATIONS = [
    "Bangalore", "Hyderabad", "Mumbai", "Delhi", "Chennai",
    "Pune", "Gurugram", "Noida", "Kolkata", "Remote",
    "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Kochi",
]

JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"]

EXPERIENCE_LEVELS = [
    "Entry level", "0–1 years", "0–2 years", "1–3 years",
    "Mid-level", "2–5 years", "3–5 years", "Senior", "5+ years",
]

SALARY_OPTIONS = [
    "₹3–5 LPA", "₹4–6 LPA", "₹6–10 LPA", "₹8–12 LPA", "₹10–15 LPA",
    "₹12–18 LPA", "₹15–25 LPA", "₹20–30 LPA", "₹25–40 LPA",
    "As per industry standards", "Not disclosed", "Stipend (Internship)",
    "₹500–1000/hr", "₹1500–3000/hr",
]

COMPANIES = [
    "TechCorp", "DevHub", "StartupXYZ", "BigTech", "LearnDev",
    "UIFirst", "WebSolutions", "DesignFlow", "InsightCorp", "SiteMakers",
    "StackWorks", "EnterpriseSoft", "DataCo", "OldSchoolWeb", "RailsHouse",
    "SideProjectLab", "BizLogic", "ShopSmart", "AdMetric", "LogiChain",
    "BankPlus", "VisualIQ", "AI Labs", "LanguageAI", "VisionTech",
    "FinAI", "InfraWorks", "CloudStart", "SysAdminPro", "NetSecure",
    "MonitorHQ", "QualityPlus", "TestCraft", "PerfMax", "MobileFirst",
    "AppBridge", "FunGames", "ImmersiveLab", "MobileCare", "EduTech",
    "BlogSphere", "GreenEnergy", "HealthPlus", "TravelNow", "FoodieApp",
    "FinServe", "MediaHouse", "RoboTech", "SpaceIO", "CryptoBase",
]

# Job templates: (title_pattern, skills, description_pattern)
# {level} will be replaced with seniority prefix where applicable
JOB_TEMPLATES = [
    # Backend
    ("{level}Python Backend Developer", "Python, Flask, REST, Docker, SQL", "Build and maintain scalable backend services and REST APIs."),
    ("{level}Django Developer", "Python, Django, DRF, Celery, PostgreSQL", "Develop web applications and APIs using Django framework."),
    ("{level}Node.js Backend Developer", "Node.js, Express, MongoDB, TypeScript", "Design event-driven backend services using Node.js ecosystem."),
    ("{level}Java Backend Engineer", "Java, Spring Boot, Microservices, Kafka", "Build enterprise-grade backend systems with Java and Spring."),
    ("{level}Go Backend Developer", "Go, gRPC, Docker, PostgreSQL", "Develop high-performance backend services in Go."),
    ("{level}FastAPI Developer", "Python, FastAPI, Pydantic, async, Redis", "Build modern async APIs with FastAPI and Python."),
    ("{level}Ruby on Rails Developer", "Ruby, Rails, PostgreSQL, Redis, Sidekiq", "Ship features quickly using Ruby on Rails."),
    ("{level}PHP Laravel Developer", "PHP, Laravel, MySQL, Vue.js", "Build and maintain web applications with Laravel."),
    ("{level}Rust Backend Engineer", "Rust, Actix, PostgreSQL, Docker", "Develop safe and performant backend services in Rust."),
    ("{level}GraphQL API Developer", "GraphQL, Node.js, TypeScript, Prisma", "Design and implement GraphQL APIs for client applications."),

    # Frontend
    ("{level}React Frontend Developer", "React, TypeScript, Redux, Tailwind CSS", "Build responsive and interactive user interfaces with React."),
    ("{level}Angular Developer", "Angular, TypeScript, RxJS, SCSS, NgRx", "Develop enterprise web applications using Angular."),
    ("{level}Vue.js Developer", "Vue.js, Vuex, JavaScript, Tailwind CSS", "Create dynamic SPAs and web interfaces with Vue.js."),
    ("{level}Next.js Developer", "Next.js, React, TypeScript, Vercel", "Build SSR/SSG web applications with Next.js."),
    ("{level}Frontend Engineer", "JavaScript, HTML5, CSS3, Webpack, React", "Implement pixel-perfect UI from design mockups."),
    ("{level}UI Engineer", "React, Storybook, Design Systems, CSS-in-JS", "Build reusable component libraries and design systems."),
    ("{level}Svelte Developer", "Svelte, SvelteKit, TypeScript, Tailwind", "Develop fast web applications with Svelte framework."),

    # Full Stack
    ("{level}Full Stack Developer (MERN)", "MongoDB, Express, React, Node.js", "Own features end-to-end across frontend and backend."),
    ("{level}Full Stack Developer (Python + React)", "Python, Flask, React, PostgreSQL", "Build full-stack web applications with Python backend and React frontend."),
    ("{level}Full Stack Engineer (Java)", "Java, Spring, React, MySQL, Docker", "Develop enterprise full-stack applications."),
    ("{level}Full Stack Developer (T3 Stack)", "TypeScript, Next.js, tRPC, Prisma, Tailwind", "Build type-safe full-stack applications with the T3 stack."),

    # Data & Analytics
    ("{level}Data Analyst", "SQL, Python, Pandas, Power BI, Excel", "Analyze business data and create actionable reports."),
    ("{level}Business Intelligence Developer", "SQL, Tableau, Power BI, ETL, Data Warehousing", "Build dashboards and BI solutions for stakeholders."),
    ("{level}Data Engineer", "Python, Spark, Airflow, SQL, AWS", "Design and maintain scalable data pipelines."),
    ("{level}Analytics Engineer", "SQL, dbt, Snowflake, Python", "Build data models and analytics infrastructure."),
    ("{level}Business Analyst", "SQL, Excel, JIRA, Documentation, Stakeholder Management", "Bridge business needs and technical implementation."),

    # AI/ML
    ("{level}Machine Learning Engineer", "Python, scikit-learn, TensorFlow, Docker, MLOps", "Deploy and maintain ML models in production."),
    ("{level}Data Scientist", "Python, Statistics, scikit-learn, Pandas, SQL", "Build predictive models and derive insights from data."),
    ("{level}NLP Engineer", "Python, Transformers, spaCy, PyTorch, NLP", "Develop natural language processing solutions."),
    ("{level}Computer Vision Engineer", "Python, OpenCV, PyTorch, Deep Learning", "Build image processing and object detection pipelines."),
    ("{level}MLOps Engineer", "Python, MLflow, Docker, Kubernetes, Airflow", "Manage ML infrastructure and model deployment pipelines."),
    ("{level}AI Research Engineer", "Python, PyTorch, Deep Learning, Research", "Research and prototype novel AI/ML approaches."),
    ("{level}LLM Engineer", "Python, LangChain, OpenAI API, Vector DBs, RAG", "Build applications powered by large language models."),

    # DevOps & Cloud
    ("{level}DevOps Engineer", "Docker, Kubernetes, Jenkins, AWS, Terraform", "Manage CI/CD pipelines and cloud infrastructure."),
    ("{level}Cloud Engineer", "AWS, Azure, Terraform, Linux, Networking", "Design and maintain cloud infrastructure at scale."),
    ("{level}Site Reliability Engineer", "Python, Kubernetes, Monitoring, Incident Response", "Ensure high availability and reliability of services."),
    ("{level}Platform Engineer", "Go, Kubernetes, CI/CD, Internal Tools", "Build internal developer platforms and tooling."),
    ("{level}Infrastructure Engineer", "Linux, Ansible, Terraform, AWS, Networking", "Manage and automate server infrastructure."),

    # Mobile
    ("{level}Android Developer", "Kotlin, Android SDK, Jetpack Compose, REST", "Build and maintain native Android applications."),
    ("{level}iOS Developer", "Swift, SwiftUI, UIKit, Core Data", "Develop native iOS applications with modern Swift."),
    ("{level}React Native Developer", "React Native, TypeScript, Redux, REST APIs", "Build cross-platform mobile applications."),
    ("{level}Flutter Developer", "Dart, Flutter, Firebase, REST APIs", "Create beautiful cross-platform mobile apps with Flutter."),

    # QA & Testing
    ("{level}QA Engineer", "Test Planning, Selenium, JIRA, Regression Testing", "Design test strategies and ensure software quality."),
    ("{level}Automation Test Engineer", "Selenium, Java, TestNG, CI/CD, REST Assured", "Build and maintain automated test suites."),
    ("{level}SDET", "Python, Pytest, API Testing, Docker, CI/CD", "Develop testing frameworks and automation tools."),
    ("{level}Performance Test Engineer", "JMeter, Gatling, Load Testing, Monitoring", "Conduct performance and scalability testing."),

    # Security
    ("{level}Security Engineer", "OWASP, Penetration Testing, Security Tools, Python", "Identify vulnerabilities and secure applications."),
    ("{level}Cybersecurity Analyst", "SIEM, Incident Response, Network Security, Compliance", "Monitor and respond to security threats."),

    # Design & UX
    ("{level}UI/UX Designer", "Figma, Adobe XD, User Research, Prototyping", "Design intuitive and beautiful user experiences."),
    ("{level}Product Designer", "Figma, Design Systems, User Testing, Wireframing", "Own product design from concept to delivery."),
    ("{level}UX Researcher", "User Interviews, Surveys, Usability Testing, Analytics", "Conduct research to inform product decisions."),

    # Product & Management
    ("{level}Product Manager", "Roadmapping, Analytics, Stakeholder Management, Agile", "Define product strategy and drive feature development."),
    ("{level}Technical Project Manager", "Agile, Scrum, JIRA, Risk Management", "Manage technical projects and cross-functional teams."),
    ("{level}Scrum Master", "Scrum, Agile, Facilitation, JIRA, Coaching", "Facilitate agile ceremonies and remove team blockers."),

    # Content & Marketing
    ("{level}Technical Writer", "Documentation, API Docs, Markdown, Developer Tools", "Create clear technical documentation and guides."),
    ("{level}Content Strategist", "Content Marketing, SEO, Analytics, Writing", "Develop content strategy to drive user engagement."),
    ("{level}Digital Marketing Specialist", "Google Ads, SEO, Social Media, Analytics", "Plan and execute digital marketing campaigns."),
    ("{level}SEO Specialist", "SEO, Google Analytics, Keyword Research, Content", "Optimize web presence for search engine visibility."),

    # Support & Operations
    ("{level}Technical Support Engineer", "Linux, Troubleshooting, Customer Support, Networking", "Provide technical support and resolve customer issues."),
    ("{level}Database Administrator", "MySQL, PostgreSQL, Backup, Performance Tuning", "Manage and optimize database systems."),
    ("{level}System Administrator", "Linux, Windows Server, Shell Scripting, Networking", "Maintain servers, backups, and infrastructure."),
    ("{level}Network Engineer", "Cisco, Networking, Firewalls, VPN, Security", "Design and manage network infrastructure."),

    # Emerging Tech
    ("{level}Blockchain Developer", "Solidity, Ethereum, Web3.js, Smart Contracts", "Develop decentralized applications and smart contracts."),
    ("{level}IoT Engineer", "Embedded C, MQTT, Sensors, Python, Edge Computing", "Build IoT solutions and connected device systems."),
    ("{level}AR/VR Developer", "Unity, C#, ARCore, ARKit, 3D Development", "Create immersive AR/VR experiences."),
    ("{level}Game Developer", "Unity, C#, Game Design, 2D/3D Graphics", "Build and optimize games for various platforms."),

    # Domain-specific
    ("{level}FinTech Developer", "Python, REST APIs, Payment Systems, Security", "Build financial technology solutions and payment integrations."),
    ("{level}Healthcare Tech Developer", "Python, FHIR, HL7, REST APIs, Security", "Develop healthcare applications with compliance standards."),
    ("{level}EdTech Developer", "React, Node.js, Video Streaming, REST APIs", "Build educational platforms and learning tools."),
    ("{level}E-commerce Developer", "React, Node.js, Payment Gateways, Microservices", "Develop online shopping and marketplace features."),
]

LEVEL_PREFIXES = {
    "Entry level": "Junior ",
    "0–1 years": "Junior ",
    "0–2 years": "Junior ",
    "1–3 years": "",
    "Mid-level": "",
    "2–5 years": "",
    "3–5 years": "Senior ",
    "Senior": "Senior ",
    "5+ years": "Lead ",
}

random.seed(42)  # Reproducible results

jobs = []

# Generate jobs ensuring coverage across all filter combinations
for template_idx, (title_pat, skills, desc) in enumerate(JOB_TEMPLATES):
    # Each template gets distributed across multiple locations, job types, experience levels
    num_variants = random.randint(5, 8)
    for variant in range(num_variants):
        location = LOCATIONS[(template_idx + variant * 3) % len(LOCATIONS)]
        job_type = JOB_TYPES[(template_idx + variant) % len(JOB_TYPES)]
        exp_level = EXPERIENCE_LEVELS[(template_idx * 2 + variant) % len(EXPERIENCE_LEVELS)]
        company = COMPANIES[(template_idx + variant * 7) % len(COMPANIES)]

        level_prefix = LEVEL_PREFIXES.get(exp_level, "")
        title = title_pat.format(level=level_prefix)

        # Adjust salary based on experience
        if exp_level in ("Entry level", "0–1 years", "0–2 years"):
            salary = random.choice(["₹3–5 LPA", "₹4–6 LPA", "₹6–10 LPA", "Stipend (Internship)"])
        elif exp_level in ("1–3 years", "Mid-level", "2–5 years"):
            salary = random.choice(["₹8–12 LPA", "₹10–15 LPA", "₹12–18 LPA", "As per industry standards"])
        else:
            salary = random.choice(["₹15–25 LPA", "₹20–30 LPA", "₹25–40 LPA", "Not disclosed"])

        # For internships, override salary
        if job_type == "Internship":
            salary = random.choice(["Stipend (Internship)", "₹3–5 LPA", "Not disclosed"])
            exp_level = random.choice(["Entry level", "0–1 years", "0–2 years"])
            level_prefix = LEVEL_PREFIXES[exp_level]
            title = title_pat.format(level=level_prefix)

        # For freelance, adjust
        if job_type == "Freelance":
            salary = random.choice(["₹500–1000/hr", "₹1500–3000/hr", "As per industry standards"])

        jobs.append((title, company, location, job_type, desc, skills, exp_level, salary))

# Shuffle for variety
random.shuffle(jobs)

# Insert into database
for j in jobs:
    title, company, location, job_type, description, skills, experience_level, salary = j
    image_url = company_logo_url(company)
    posted_at = random_past_date()
    apply_url = apply_url_for_company(company)
    c.execute(
        """INSERT INTO jobs (title, company, location, job_type, description, skills, image_url,
           posted_at, salary, experience_level, apply_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
        (title, company, location, job_type, description, skills, image_url,
         posted_at, salary, experience_level, apply_url),
    )

conn.commit()
conn.close()
print(f"Done! jobs.db created with {len(jobs)} jobs.")
