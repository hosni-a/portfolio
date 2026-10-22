/*
 * Portfolio content — Hosni Ben Ammar
 * ------------------------------------------------------------------
 * This is the ONLY file you need to edit to change the website content.
 * It is JSON-shaped: keep double quotes around keys and strings, separate
 * items with commas, and don't leave a trailing comma after the last item.
 * (Everything after "window.PORTFOLIO_DATA = ", minus the final ";", can be
 * pasted into a .json file as-is.)
 *
 * Dates use "YYYY-MM" (e.g. "2024-09"). Use null for "end" to mean "Present".
 * Any list can be emptied ([]) — its section is then hidden automatically.
 * See README.md → "Editing your content" for examples.
 */
window.PORTFOLIO_DATA = {
  "meta": {
    "title": "Hosni Ben Ammar — Senior Odoo Developer",
    "description": "Hosni Ben Ammar is a Senior Odoo Developer based in Sfax, Tunisia, with 5+ years of experience in ERP development: custom modules, integrations, localization and version migrations."
  },

  "profile": {
    "name": "Hosni Ben Ammar",
    "firstName": "Hosni",
    "lastName": "Ben Ammar",
    "headline": "Senior Odoo Developer @ DarbTech | Driving Innovation & Excellence in ERP Solutions | Specialist in Customization, Integration & Optimization",
    "roles": [
      "Senior Odoo Developer",
      "Tech Lead",
      "ERP Architect",
      "Python Developer",
      "Integration Specialist"
    ],
    "location": "Sfax, Tunisia",
    "availability": "Open to freelance & collaborations",
    "photo": null,
    "cvUrl": null
  },

  "contact": {
    "email": "hosni.ben.ammar@hotmail.com",
    "phone": "+21658996930",
    "location": "Sfax, Tunisia"
  },

  "socials": [
    { "name": "LinkedIn", "url": "https://www.linkedin.com/in/hosnibenammar", "icon": "linkedin" },
    { "name": "Email", "url": "mailto:hosni.ben.ammar@hotmail.com", "icon": "email" },
    { "name": "Phone", "url": "tel:+21658996930", "icon": "phone" }
  ],

  "whatsapp": {
    "number": "21658996930",
    "displayName": "Hosni Ben Ammar",
    "replyTime": "Typically replies within a few hours",
    "greeting": "Hi there 👋 Thanks for stopping by! Pick a topic below or write your own message, and it'll open straight in WhatsApp.",
    "timezone": "Africa/Tunis",
    "cityLabel": "Sfax",
    "hours": { "days": [1, 2, 3, 4, 5, 6], "start": "09:00", "end": "18:00" },
    "teaser": "Need an Odoo expert? Let's chat 💬",
    "teaserDelay": 12,
    "messages": [
      { "label": "Discuss an Odoo project", "text": "Hi Hosni, I found your portfolio and I'd like to discuss an Odoo project with you." },
      { "label": "Migration / upgrade", "text": "Hi Hosni, we need help migrating our Odoo instance to a newer version. Can we talk?" },
      { "label": "Hiring opportunity", "text": "Hi Hosni, I'm reaching out about a job opportunity that could interest you." },
      { "label": "Just saying hi", "text": "Hi Hosni, I came across your portfolio and wanted to say hello!" }
    ]
  },

  "about": {
    "paragraphs": [
      "Dynamic and detail-oriented Tech Lead Odoo Developer with over 5 years of hands-on experience in ERP development, specializing in Odoo. Expert in analyzing complex business requirements and transforming them into effective, scalable Odoo solutions. Proven ability to lead cross-functional teams and manage end-to-end development projects, from requirements gathering to deployment and post-implementation support.",
      "Strong proficiency in Python, REST APIs, and custom module development, with a deep understanding of Odoo’s architecture and best practices. Successfully managed multiple Odoo version upgrades, including a current focus on transitioning systems from Odoo 15 to Odoo 17, ensuring seamless integration with existing business workflows.",
      "Adept at delivering tailored solutions across various industries, optimizing operational efficiency, and enhancing user experience. Known for problem-solving skills, technical leadership, and ability to mentor junior developers, fostering a collaborative and innovative team environment. Passionate about leveraging technology to drive process improvements and achieve business objectives."
    ]
  },

  "stats": [
    { "value": 5, "suffix": "+", "label": "Years of experience" },
    { "value": 6, "suffix": "", "label": "Companies" },
    { "value": 4, "suffix": "", "label": "Markets served" },
    { "value": 1, "suffix": "", "label": "Odoo certification" }
  ],

  "skills": [
    {
      "category": "Odoo & ERP",
      "icon": "layers",
      "items": [
        { "name": "Custom module development", "level": 100 },
        { "name": "Odoo ORM & architecture", "level": 95 },
        { "name": "QWeb / OWL views & reports", "level": 90 },
        { "name": "Version migrations", "level": 88 },
        { "name": "Accounting, VAT & SEPA", "level": 80 },
        { "name": "Localization (FR / CH)", "level": 85 },
        { "name": "Website & eCommerce", "level": 85 },
        { "name": "Odoo.sh", "level": 100 }
      ]
    },
    {
      "category": "Backend & Databases",
      "icon": "server",
      "items": [
        { "name": "Python", "level": 95 },
        { "name": "Django", "level": 80 },
        { "name": "Flask", "level": 70 },
        { "name": "PHP", "level": 50 },
        { "name": "PostgreSQL", "level": 90 },
        { "name": "SQL Server", "level": 80 }
      ]
    },
    {
      "category": "Frontend & Mobile",
      "icon": "code",
      "items": [
        { "name": "JavaScript", "level": 85 },
        { "name": "XML", "level": 90 },
        { "name": "HTML & CSS", "level": 90 },
        { "name": "ReactJS", "level": 60 },
        { "name": "jQuery & Bootstrap", "level": 90 },
        { "name": "Flutter", "level": 50 }
      ]
    },
    {
      "category": "Integrations & DevOps",
      "icon": "plug",
      "items": [
        { "name": "REST APIs", "level": 95 },
        { "name": "Payment gateways", "level": 80 },
        { "name": "Banking & shipping integrations", "level": 80 },
        { "name": "CI/CD", "level": 80 },
        { "name": "Performance & caching", "level": 85 },
        { "name": "Security & GDPR", "level": 80 },
        { "name": "Face recognition", "level": 50 }
      ]
    },
    {
      "category": "Leadership",
      "icon": "users",
      "items": [
        { "name": "Technical leadership", "level": 88 },
        { "name": "Code reviews & best practices", "level": 95 },
        { "name": "Mentoring junior developers", "level": 85 },
        { "name": "Project management", "level": 80 },
        { "name": "Requirements analysis", "level": 92 }
      ]
    }
  ],

  "experience": [
    {
      "company": "DarbTech",
      "role": "Senior Odoo Developer",
      "location": "null",
      "start": "2026-05",
      "end": null,
      "summary": null,
      "highlights": [
        { "title": "Implementation Audits", "text": "Analysis of existing Odoo implementations, identification of bottlenecks, and proposal of technical improvements to architecture and custom modules." },
        { "title": "End-to-End Delivery", "text": "Management of new client project development, from requirements gathering and module design through to deployment on Odoo.sh." },
        { "title": "Engineering Standards", "text": "Implementation of coding standards and best practices within the development team, ensuring maintainable and scalable codebases." }
      ],
      "tags": ["Odoo", "Python", "Odoo.sh", "Architecture", "Code Quality"]
    },
    {
      "company": "Alfa Print",
      "role": "Tech Lead Odoo Developer",
      "location": "Sousse, Tunisia",
      "start": "2024-09",
      "end": "2026-04",
      "summary": "Led Odoo architecture and development, adapting the platform to French regulations and integrating it with banking and shipping services.",
      "highlights": [
        { "title": "System Architecture & Design", "text": "Created scalable Odoo architecture integrating seamlessly with the company's operations and third-party systems like CRM, ERP, and accounting tools." },
        { "title": "Customization & Development", "text": "Oversaw custom modules tailored to the company’s needs, particularly adapting Odoo for French-specific regulations like VAT, SEPA payments, and anti-fraud invoicing rules." },
        { "title": "Team Leadership", "text": "Led development teams, performed code reviews, and ensured adherence to best practices like continuous integration and deployment (CI/CD)." },
        { "title": "Localization & Compliance", "text": "Ensured compliance with French legal frameworks like GDPR and French fiscal laws, handling localization of tax, invoicing, and data protection standards." },
        { "title": "Project Management", "text": "Managed the lifecycle of Odoo implementation projects, working closely with cross-functional teams to define goals, gather requirements, and ensure timely delivery." },
        { "title": "Performance Optimization", "text": "Improved system performance through database optimization, server management, load balancing and caching." },
        { "title": "Third-Party Integrations", "text": "Integrated Odoo with French banking systems, shipping providers (e.g., La Poste), and other external services, developing APIs for custom data exchange." },
        { "title": "Security & Maintenance", "text": "Ensured Odoo platform security, performed regular audits, and managed data protection according to GDPR guidelines." },
        { "title": "Advanced Reporting", "text": "Implemented advanced reporting and real-time dashboards tailored to the company’s KPIs and French business regulations." },
        { "title": "Strategic Consulting", "text": "Advised leadership on aligning Odoo capabilities with business goals, optimizing workflows, and reducing costs." }
      ],
      "tags": ["Odoo", "Python", "Localization", "Accounting", "CI/CD", "GDPR", "Leadership"]
    },
    {
      "company": "Campion-Tech",
      "role": "Odoo Developer",
      "location": "Tunis, Tunisia",
      "start": "2023-02",
      "end": "2024-08",
      "summary": "Built a multilingual Odoo website and eCommerce platform for the Swiss market.",
      "highlights": [
        { "title": "Multilingual Website Development", "text": "Supported Switzerland’s four languages (German, French, Italian, and Romansh) with seamless switching and culturally appropriate content." },
        { "title": "Localization and Compliance", "text": "Ensured compliance with Swiss data protection law (FADP), e-commerce regulations, and accessibility standards." },
        { "title": "Custom Website Design", "text": "Developed custom themes reflecting Swiss aesthetics, with responsive designs optimized for mobile and desktop." },
        { "title": "E-commerce Integration", "text": "Set up local payment gateways (e.g., PostFinance), Swiss Francs (CHF) support, and VAT-compliant tax rules." },
        { "title": "SEO Optimization", "text": "Optimized the website for Swiss search engines using region-specific keywords, meta tags, and localized content." },
        { "title": "Performance Optimization", "text": "Optimized images, scripts, and other website elements to enhance loading speeds, even during high-traffic periods." },
        { "title": "Content Management", "text": "Customized Odoo’s CMS for multilingual content, blogs, and articles, improving user engagement." },
        { "title": "Customer Interaction Tools", "text": "Created custom forms and integrated multilingual live chat to support customers in real time." },
        { "title": "Analytics & Reporting", "text": "Set up analytics tools like Google Analytics and created custom dashboards to track user behavior and website performance." },
        { "title": "B2B and B2C Portals", "text": "Developed dedicated portals for businesses and individual customers to manage orders, accounts, and services online." }
      ],
      "tags": ["Odoo", "Website", "eCommerce", "Localization", "SEO", "JavaScript"]
    },
    {
      "company": "SlneeIT",
      "role": "Odoo Developer",
      "location": null,
      "start": "2023-12",
      "end": "2024-07",
      "summary": "Delivered an Arabic-first Odoo website tailored to the Middle East market.",
      "highlights": [
        { "title": "Arabic Language and RTL Support", "text": "Implemented Arabic as the primary language with Right-to-Left (RTL) text alignment, crucial for engaging local audiences in the Middle East." },
        { "title": "Multiple Language Options", "text": "Added support for additional languages like English, catering to both local and international users." },
        { "title": "Custom Themes", "text": "Developed custom themes reflecting the company’s branding and Middle Eastern market aesthetics and preferences." },
        { "title": "Mobile-Friendly Design", "text": "Optimized the website for mobile devices with a responsive design for smooth navigation on smartphones and tablets." },
        { "title": "UI/UX Enhancements", "text": "Created a simple, intuitive interface, making it easier for customers to browse services." },
        { "title": "SEO for the Middle East", "text": "Optimized the website for regional search engines using Arabic keywords, meta tags, and descriptions." }
      ],
      "tags": ["Odoo", "Website", "RTL", "SEO", "UI/UX"]
    },
    {
      "company": "Alfa Print",
      "role": "Full Stack Developer | Odoo Developer",
      "location": "Sousse, Tunisia",
      "start": "2022-04",
      "end": "2023-01",
      "summary": null,
      "highlights": [
        { "title": null, "text": "Developed and maintained both front-end and back-end components of web applications." },
        { "title": null, "text": "Customized and enhanced existing Odoo modules, including workflows, forms, and reports." },
        { "title": null, "text": "Developed and implemented new modules and functionalities within the Odoo platform." },
        { "title": null, "text": "Integrated third-party systems and APIs with Odoo, enabling data synchronization and seamless communication." },
        { "title": null, "text": "Created RESTful APIs and integrated them with front-end interfaces for data retrieval and manipulation." },
        { "title": null, "text": "Collaborated with the design team to implement user-friendly, responsive interfaces across devices and screen sizes." },
        { "title": null, "text": "Optimized web applications for performance, scalability, and responsiveness." },
        { "title": null, "text": "Troubleshot and resolved issues related to Odoo modules, configurations, and database performance." },
        { "title": null, "text": "Implemented and maintained security measures and access controls within the Odoo framework to protect sensitive data." },
        { "title": null, "text": "Assisted in the planning and estimation of development tasks and projects." }
      ],
      "tags": ["Odoo", "Python", "JavaScript", "ReactJS", "Django", "Flask", "PostgreSQL"]
    },
    {
      "company": "Mansour Modern School",
      "role": "Full-stack Developer",
      "location": "Bani Khiyar, Nabeul, Tunisia",
      "start": "2021-03",
      "end": "2021-06",
      "summary": null,
      "highlights": [
        { "title": "AI Attendance", "text": "Integrated an AI module to record attendance using facial recognition technology." },
        { "title": null, "text": "Developed and maintained both front-end and back-end components of web applications, with responsive, user-friendly interfaces." },
        { "title": null, "text": "Created RESTful APIs and integrated them with front-end interfaces for data retrieval and manipulation." },
        { "title": null, "text": "Implemented security measures, such as encryption and input validation, to protect against common web vulnerabilities." },
        { "title": null, "text": "Optimized web applications for performance, scalability, and responsiveness." },
        { "title": null, "text": "Built and maintained documentation for development processes, APIs, and system architecture." }
      ],
      "tags": ["Python", "Django", "Flutter", "PostgreSQL", "Face-Recognition"]
    },
    {
      "company": "Aftercode",
      "role": "Back End Developer",
      "location": "Dar Sha'ban, Nabeul, Tunisia",
      "start": "2021-04",
      "end": "2021-04",
      "summary": null,
      "highlights": [
        { "title": null, "text": "Compiled and analyzed data, processes and code to solve problems and identify areas for improvement." },
        { "title": null, "text": "Collaborated with front-end developers to design more functional and consistent code, improving user experience." },
        { "title": null, "text": "Created RESTful APIs and integrated them with front-end interfaces." },
        { "title": null, "text": "Took charge of the project as needed, and built documentation for development processes and APIs." }
      ],
      "tags": ["Python", "Django", "jQuery", "PostgreSQL"]
    }
  ],

  "projects": [
    {
      "title": "French Localization & Compliance Suite",
      "context": "Alfa Print · Tech Lead",
      "description": "Custom Odoo modules adapting the ERP to French regulations: VAT, SEPA payments, anti-fraud invoicing rules, GDPR and French fiscal compliance, plus real-time KPI dashboards.",
      "tags": ["Odoo", "Python", "Localization", "Accounting"],
      "icon": "shield",
      "url": null
    },
    {
      "title": "Banking & Shipping Integrations",
      "context": "Alfa Print · Tech Lead",
      "description": "Connected Odoo to French banking systems and shipping providers such as La Poste, with custom APIs for data exchange between Odoo and external services.",
      "tags": ["Odoo", "Python", "Integrations", "REST APIs"],
      "icon": "plug",
      "url": null
    },
    {
      "title": "Swiss Multilingual eCommerce Website",
      "context": "Campion-Tech",
      "description": "Odoo website and shop in German, French, Italian and Romansh: custom themes, PostFinance payments, CHF and VAT rules, FADP compliance, SEO and dedicated B2B/B2C portals.",
      "tags": ["Odoo", "eCommerce", "Website", "Localization"],
      "icon": "cart",
      "url": null
    },
    {
      "title": "Arabic RTL Corporate Website",
      "context": "SlneeIT",
      "description": "Arabic-first Odoo website with full right-to-left support and English as a second language, custom themes for the Middle East market, mobile-first design and Arabic SEO.",
      "tags": ["Odoo", "Website", "RTL", "SEO"],
      "icon": "translate",
      "url": null
    },
    {
      "title": "Odoo 15 → 17 Migration",
      "context": "ERP version upgrades",
      "description": "Upgrading Odoo systems from version 15 to 17 — porting custom modules and data while keeping existing business workflows running seamlessly.",
      "tags": ["Odoo", "Python", "Migration"],
      "icon": "refresh",
      "url": null
    },
    {
      "title": "Facial-Recognition Attendance Module",
      "context": "Mansour Modern School",
      "description": "AI module integrated into the school’s web application to record attendance using facial recognition.",
      "tags": ["Python", "Django", "AI", "Face-Recognition"],
      "icon": "camera",
      "url": null
    }
  ],

  "certifications": [
    { "name": "Odoo 19 Functional Certification", "issuer": "Odoo", "year": null, "url": null }
  ],

  "education": [
    {
      "school": "Higher Institute of Technological Studies of Nabeul",
      "degree": "Bachelor of Technology",
      "field": "Information Technology – Development of Information Systems",
      "start": "2017",
      "end": "2021"
    }
  ]
};
