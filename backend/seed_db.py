import sqlite3

# Creates jobs.db and jobs table
conn = sqlite3.connect('jobs.db')
c = conn.cursor()

c.execute('''
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    company TEXT,
    location TEXT,
    job_type TEXT,
    description TEXT,
    skills TEXT
)
''')

# Clear existing data so we always have a clean ~100‑job dataset
c.execute('DELETE FROM jobs')

# Explicit list of ~100 reasonably unique jobs
jobs = [
    ("Junior Python Backend Developer", "TechCorp", "Bangalore", "Full-time", "Work on REST APIs for internal tools under senior guidance.", "Python, Flask, REST, Git"),
    ("Python Backend Developer", "TechCorp", "Bangalore", "Full-time", "Design and maintain scalable microservices for customer-facing products.", "Python, Flask, SQLAlchemy, Docker, Redis"),
    ("Senior Python Backend Engineer", "TechCorp", "Remote", "Lead backend architecture and mentor junior developers.", "Python, FastAPI, PostgreSQL, Kubernetes, AWS"),
    ("Django Backend Developer", "DevHub", "Hyderabad", "Full-time", "Build admin panels and APIs using Django and DRF.", "Python, Django, Django REST Framework, Celery"),
    ("Flask API Engineer", "DevHub", "Mumbai", "Full-time", "Develop internal APIs for analytics and reporting.", "Python, Flask, Pandas, SQL"),
    ("Backend Engineer (Node/Python)", "StartupXYZ", "Bangalore", "Full-time", "Work on event-driven backend services in a startup environment.", "Node.js, Python, Kafka, MongoDB"),
    ("Full Stack Developer (Python + React)", "StartupXYZ", "Remote", "Own features end-to-end across backend and frontend.", "Python, FastAPI, React, TypeScript, PostgreSQL"),
    ("SDE 1 Backend", "BigTech", "Bangalore", "Full-time", "Implement features in large-scale distributed backend systems.", "Java, Python, Spring Boot, MySQL"),
    ("SDE 2 Backend", "BigTech", "Hyderabad", "Full-time", "Design and optimize low-latency backend components.", "Java, Kotlin, Microservices, Kafka"),
    ("Backend Intern (Python)", "LearnDev", "Pune", "Internship", "Assist in building small backend utilities.", "Python, SQLite, REST, Git"),

    ("React Frontend Developer", "UIFirst", "Bangalore", "Full-time", "Build dashboards and component libraries in React.", "React, JavaScript, TypeScript, Redux, CSS"),
    ("Junior React Developer", "UIFirst", "Hyderabad", "Full-time", "Implement UI screens from Figma designs.", "React, JavaScript, HTML, CSS"),
    ("Senior Frontend Engineer", "UIFirst", "Remote", "Own frontend architecture and performance.", "React, TypeScript, Next.js, Webpack"),
    ("Frontend Intern", "WebSolutions", "Mumbai", "Internship", "Learn modern frontend stacks and assist on client projects.", "HTML, CSS, JavaScript, React"),
    ("Angular Frontend Developer", "WebSolutions", "Delhi", "Full-time", "Work on enterprise admin portals using Angular.", "Angular, TypeScript, RxJS, SCSS"),
    ("Vue.js Frontend Engineer", "DesignFlow", "Chennai", "Full-time", "Develop responsive marketing websites and SPAs.", "Vue.js, JavaScript, Tailwind CSS"),
    ("UI Engineer (Design Systems)", "DesignFlow", "Gurugram", "Full-time", "Build reusable UI components and design tokens.", "React, Storybook, Figma, CSS-in-JS"),
    ("Frontend Engineer (Data Viz)", "InsightCorp", "Noida", "Full-time", "Create interactive data visualizations and charts.", "React, D3.js, TypeScript"),
    ("Web Developer", "SiteMakers", "Kolkata", "Full-time", "Develop and maintain client websites and landing pages.", "HTML5, CSS3, JavaScript, SEO"),
    ("Website Intern", "SiteMakers", "Pune", "Internship", "Support senior devs with content updates and bug fixes.", "HTML, CSS, WordPress, Git"),

    ("Full Stack Developer (MERN)", "StackWorks", "Bangalore", "Full-time", "Build full-stack features for SaaS products.", "MongoDB, Express, React, Node.js"),
    ("Junior Full Stack Developer", "StackWorks", "Hyderabad", "Full-time", "Work across APIs and UI for internal tools.", "React, Node.js, PostgreSQL"),
    ("Full Stack Engineer (Java + React)", "EnterpriseSoft", "Mumbai", "Full-time", "Develop enterprise web applications for large clients.", "Java, Spring, React, Oracle DB"),
    ("Full Stack Intern", "EnterpriseSoft", "Noida", "Internship", "Learn full stack concepts and contribute to small modules.", "JavaScript, Node.js, React, MySQL"),
    ("Full Stack Engineer (Python / Vue)", "DataCo", "Remote", "Build data-heavy full-stack features and internal dashboards.", "Python, Flask, Vue.js, SQL"),
    ("LAMP Stack Developer", "OldSchoolWeb", "Chennai", "Full-time", "Maintain legacy PHP applications and migrate pieces to modern stack.", "PHP, Laravel, MySQL, JavaScript"),
    ("Junior PHP Developer", "OldSchoolWeb", "Delhi", "Full-time", "Fix bugs and add small features to client sites.", "PHP, MySQL, HTML, CSS"),
    ("Full Stack Developer (Ruby on Rails)", "RailsHouse", "Bangalore", "Full-time", "Ship features quickly on Ruby on Rails applications.", "Ruby, Rails, Postgres, React"),
    ("Backend-heavy Full Stack Engineer", "RailsHouse", "Remote", "Focus on API design with some frontend work.", "Ruby, Rails, GraphQL, React"),
    ("Freelance-style Full Stack Intern", "SideProjectLab", "Pune", "Internship", "Work on multiple mini full-stack side projects.", "Next.js, Node.js, Prisma, SQLite"),

    ("Data Analyst", "InsightCorp", "Bangalore", "Full-time", "Analyze product metrics and create weekly reports.", "SQL, Excel, Power BI, Python"),
    ("Junior Data Analyst", "InsightCorp", "Hyderabad", "Full-time", "Support senior analysts with data cleaning and charts.", "SQL, Excel, Tableau"),
    ("Data Analyst Intern", "DataCo", "Mumbai", "Internship", "Work on ad-hoc analysis and dashboards.", "Python, Pandas, Excel"),
    ("Business Analyst", "BizLogic", "Delhi", "Full-time", "Interact with stakeholders and convert requirements into specs.", "SQL, Excel, Documentation"),
    ("Product Data Analyst", "ShopSmart", "Gurugram", "Full-time", "Analyze e-commerce funnels and conversion rates.", "SQL, Python, A/B Testing"),
    ("Marketing Data Analyst", "AdMetric", "Remote", "Full-time", "Evaluate marketing campaigns and ROAS.", "Google Analytics, SQL, Excel"),
    ("Operations Analyst", "LogiChain", "Chennai", "Full-time", "Analyze logistics and supply chain performance.", "SQL, Excel, Power BI"),
    ("Reporting Specialist", "BankPlus", "Noida", "Full-time", "Prepare regulatory and internal bank reports.", "SQL, Excel, PowerPoint"),
    ("Data Visualization Engineer", "VisualIQ", "Bangalore", "Full-time", "Create interactive dashboards for clients.", "Tableau, Power BI, SQL"),
    ("Junior BI Developer", "VisualIQ", "Pune", "Full-time", "Support BI projects and ETL pipelines.", "SQL, SSIS, Power BI"),

    ("Machine Learning Engineer", "AI Labs", "Bangalore", "Full-time", "Deploy ML models to production APIs.", "Python, scikit-learn, Docker, REST"),
    ("ML Engineer Intern", "AI Labs", "Hyderabad", "Internship", "Experiment with models on small datasets.", "Python, Pandas, NumPy"),
    ("Data Scientist", "InsightCorp", "Mumbai", "Full-time", "Build predictive models and present insights to leadership.", "Python, scikit-learn, Statistics"),
    ("NLP Engineer", "LanguageAI", "Remote", "Full-time", "Work on text classification and embeddings.", "Python, Transformers, spaCy"),
    ("Computer Vision Engineer", "VisionTech", "Chennai", "Full-time", "Develop image processing and detection pipelines.", "Python, OpenCV, PyTorch"),
    ("Applied Scientist", "BigTech", "Bangalore", "Full-time", "Research and prototype models for new features.", "Python, Deep Learning, Experimentation"),
    ("Junior ML Engineer", "FinAI", "Gurugram", "Full-time", "Work on credit risk and fraud models.", "Python, XGBoost, SQL"),
    ("ML Ops Engineer", "FinAI", "Noida", "Full-time", "Monitor and maintain ML pipelines in production.", "Python, Airflow, Docker, Kubernetes"),
    ("Recommendation Systems Engineer", "ShopSmart", "Remote", "Full-time", "Improve product recommendation quality.", "Python, Recommender Systems, Spark"),
    ("AI Intern", "StartupXYZ", "Pune", "Internship", "Help build simple ML-powered features.", "Python, scikit-learn, Pandas"),

    ("DevOps Engineer", "InfraWorks", "Bangalore", "Full-time", "Own CI/CD and cloud deployments.", "Docker, Kubernetes, Jenkins, AWS"),
    ("Junior DevOps Engineer", "InfraWorks", "Hyderabad", "Full-time", "Maintain pipelines and monitoring dashboards.", "Linux, Bash, Jenkins, Grafana"),
    ("Site Reliability Engineer", "BigTech", "Bangalore", "Full-time", "Ensure high availability of core services.", "Python, Monitoring, Kubernetes"),
    ("Cloud Engineer", "CloudStart", "Mumbai", "Full-time", "Manage multi-tenant cloud infrastructure.", "AWS, Terraform, Linux"),
    ("Platform Engineer", "CloudStart", "Remote", "Full-time", "Build internal developer platforms and tooling.", "Go, Kubernetes, CI/CD"),
    ("DevOps Intern", "DevHub", "Pune", "Internship", "Support build and deployment automation tasks.", "Linux, GitHub Actions, Docker"),
    ("System Administrator", "SysAdminPro", "Delhi", "Full-time", "Maintain servers, backups, and user accounts.", "Linux, Windows Server, Shell scripting"),
    ("Network Engineer", "NetSecure", "Gurugram", "Full-time", "Manage routers, firewalls, and VPNs.", "Cisco, Networking, Security"),
    ("Cloud Support Engineer", "CloudStart", "Noida", "Full-time", "Troubleshoot customer issues on cloud products.", "Linux, AWS, Customer Support"),
    ("Observability Engineer", "MonitorHQ", "Chennai", "Full-time", "Build monitoring and alerting systems.", "Prometheus, Grafana, Logging"),

    ("QA Engineer", "QualityPlus", "Bangalore", "Full-time", "Design and execute manual test cases.", "Test planning, Regression testing, JIRA"),
    ("Automation Test Engineer", "QualityPlus", "Hyderabad", "Full-time", "Implement UI automation suites.", "Selenium, Java, TestNG"),
    ("QA Intern", "QualityPlus", "Pune", "Internship", "Support QA team with test execution.", "Manual testing, Documentation"),
    ("SDET", "BigTech", "Bangalore", "Full-time", "Build frameworks and tools for automated testing.", "Java, JUnit, Selenium, REST Assured"),
    ("API Test Engineer", "DevHub", "Mumbai", "Full-time", "Test and validate REST APIs.", "Postman, Swagger, JSON"),
    ("Mobile QA Engineer", "MobileFirst", "Chennai", "Full-time", "Test Android and iOS applications.", "Appium, Android, iOS"),
    ("Performance Test Engineer", "PerfMax", "Noida", "Full-time", "Conduct performance and load testing.", "JMeter, LoadRunner"),
    ("Game QA Tester", "FunGames", "Bangalore", "Full-time", "Test gameplay, UI, and stability of games.", "Testing, Documentation"),
    ("Automation Engineer (Python)", "TestCraft", "Remote", "Full-time", "Write automation scripts in Python.", "Python, Pytest, Selenium"),
    ("Quality Specialist", "BankPlus", "Hyderabad", "Full-time", "Ensure quality checks in financial applications.", "Testing, Compliance"),

    ("Android Developer", "MobileFirst", "Bangalore", "Full-time", "Develop and maintain Android applications.", "Kotlin, Android SDK, REST APIs"),
    ("Junior Android Developer", "MobileFirst", "Pune", "Full-time", "Implement screens and bug fixes in Android apps.", "Java, Android, Git"),
    ("iOS Developer", "MobileFirst", "Mumbai", "Full-time", "Build native iOS features.", "Swift, iOS SDK, UIKit"),
    ("React Native Developer", "AppBridge", "Chennai", "Full-time", "Deliver cross-platform mobile applications.", "React Native, JavaScript, REST"),
    ("Flutter Developer", "AppBridge", "Hyderabad", "Full-time", "Create mobile apps with Flutter.", "Dart, Flutter, Firebase"),
    ("Mobile Intern", "FunGames", "Bangalore", "Internship", "Assist with mobile game prototypes.", "Unity, C#"),
    ("Unity Game Developer", "FunGames", "Remote", "Full-time", "Build and optimize 2D/3D games.", "Unity, C#, Game Design"),
    ("Junior Game Developer", "FunGames", "Kolkata", "Full-time", "Implement gameplay features and UI.", "C#, Unity, Git"),
    ("AR/VR Developer", "ImmersiveLab", "Gurugram", "Full-time", "Experiment with AR/VR experiences.", "Unity, C#, ARCore/ARKit"),
    ("Mobile Support Engineer", "MobileCare", "Noida", "Full-time", "Troubleshoot production mobile issues with dev team.", "Android, iOS, Debugging"),
]

# Safety check: ensure every job tuple has exactly 6 fields
for idx, j in enumerate(jobs):
    if len(j) != 6:
        print(f"Skipping invalid job at index {idx} (expected 6 fields, got {len(j)}): {j}")
        continue
    c.execute("INSERT INTO jobs (title, company, location, job_type, description, skills) VALUES (?,?,?,?,?,?)", j)

conn.commit()
conn.close()
print("Done! jobs.db created with", len(jobs), "jobs.")
