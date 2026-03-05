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

# Clear existing data so we always have a clean ~100-job dataset
c.execute('DELETE FROM jobs')

# Generate ~100 varied jobs from templates
job_templates = [
    ("Python Backend Developer", "TechCorp", "Full-time", "Build and maintain REST APIs for large-scale products.", "Python, Flask, REST, SQL, Docker"),
    ("Junior Backend Developer", "DevHub", "Full-time", "Support backend services and fix bugs in APIs.", "Python, Django, PostgreSQL, Git"),
    ("Full Stack Engineer", "StartupXYZ", "Full-time", "Work across frontend and backend to ship features quickly.", "React, Node.js, Express, MongoDB, TypeScript"),
    ("Frontend Engineer (React)", "UIFirst", "Full-time", "Implement responsive UIs and reusable components.", "React, JavaScript, CSS, HTML, Redux"),
    ("React Intern", "WebSolutions", "Internship", "Assist in building landing pages and dashboards.", "React, Tailwind CSS, JavaScript"),
    ("Web Development Intern", "LearnDev", "Internship", "Learn basics of web dev and build small projects.", "HTML, CSS, JavaScript, Git"),
    ("Data Analyst Intern", "DataCo", "Internship", "Work with datasets, build reports and dashboards.", "Python, SQL, Excel, Power BI"),
    ("Junior Data Engineer", "DataCo", "Full-time", "Build data pipelines and ETL jobs.", "Python, SQL, Airflow, AWS"),
    ("Machine Learning Intern", "AI Labs", "Internship", "Train and evaluate basic ML models.", "Python, scikit-learn, Pandas, NumPy"),
    ("SDE 1", "BigTech", "Full-time", "Contribute to core services and microservices.", "Java, Spring Boot, SQL, AWS"),
    ("Cloud Support Engineer", "CloudStart", "Full-time", "Support customers on cloud-based products.", "Linux, AWS, Networking, Bash"),
    ("DevOps Engineer", "InfraWorks", "Full-time", "Manage CI/CD pipelines and infra automation.", "Docker, Kubernetes, Jenkins, Terraform"),
    ("QA Engineer", "QualityPlus", "Full-time", "Write test cases and automate regression suites.", "Selenium, Java, TestNG, Postman"),
    ("Automation Test Engineer", "QualityPlus", "Full-time", "Build and maintain automation frameworks.", "Python, Selenium, Pytest"),
    ("Android Developer", "MobileFirst", "Full-time", "Build Android apps and features.", "Kotlin, Android SDK, REST APIs"),
    ("iOS Developer", "MobileFirst", "Full-time", "Develop native iOS applications.", "Swift, iOS SDK, UIKit"),
    ("Support Engineer", "HelpDeskPro", "Full-time", "Troubleshoot customer issues and debug problems.", "SQL, Linux, Communication, Troubleshooting"),
    ("BI Developer", "InsightCorp", "Full-time", "Build BI dashboards and data models.", "Power BI, SQL, DAX, Excel"),
    ("Data Scientist", "InsightCorp", "Full-time", "Analyze data, build models, and present insights.", "Python, Pandas, scikit-learn, Statistics"),
    ("Game Developer Intern", "FunGames", "Internship", "Assist in building 2D/3D games.", "Unity, C#, Game Design"),
]

cities = [
    "Bangalore",
    "Mumbai",
    "Hyderabad",
    "Pune",
    "Chennai",
    "Delhi",
    "Gurugram",
    "Noida",
    "Kolkata",
    "Remote",
]

jobs = []
for title, company, job_type, desc, skills in job_templates:
    for city in cities:
        jobs.append((title, company, city, job_type, desc, skills))
        if len(jobs) >= 100:
            break
    if len(jobs) >= 100:
        break

for j in jobs:
    c.execute(
        "INSERT INTO jobs (title, company, location, job_type, description, skills) VALUES (?,?,?,?,?,?)",
        j,
    )

conn.commit()
conn.close()
print("Done! jobs.db created with", len(jobs), "jobs.")
