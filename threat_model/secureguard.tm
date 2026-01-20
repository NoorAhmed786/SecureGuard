{
  "system_info": {
    "name": "SecureGuard AI",
    "version": "1.2.0",
    "description": "SaaS platform for Phishing Detection, Security Scanning, and Awareness Training.",
    "methodology": "Microsoft SDL (STRIDE)",
    "owners": ["NoorAhmed786"],
    "date": "2025-01-01"
  },
  "assets": [
    {
      "id": "ASSET-01",
      "name": "User Credentials",
      "value": "Critical"
    },
    {
      "id": "ASSET-02",
      "name": "Payment Tokens",
      "value": "Critical"
    },
    {
      "id": "ASSET-03",
      "name": "Scan Reports",
      "value": "High"
    },
    {
      "id": "ASSET-04",
      "name": "JWT Signing Key",
      "value": "Critical"
    }
  ],
  "threats": [
    {
      "id": "STRIDE-S-01",
      "stride_category": "Spoofing",
      "title": "Attacker Impersonates User via Token Theft",
      "description": "Exploiting XSS to steal JWT tokens from the browser.",
      "component": "Frontend API Flow",
      "likelihood": "High",
      "impact": "Critical",
      "status": "Mitigated",
      "mitigation_strategy": "HttpOnly Cookies & CSP",
      "justification": "Prevents client-side scripts from accessing session tokens."
    },
    {
      "id": "STRIDE-T-01",
      "stride_category": "Tampering",
      "title": "SQL Injection",
      "description": "Injecting malicious SQL via search inputs.",
      "component": "Backend / DB Flow",
      "likelihood": "Medium",
      "impact": "Critical",
      "status": "Mitigated",
      "mitigation_strategy": "SQLAlchemy ORM / Parameterized Queries",
      "justification": "Inputs are sanitized before query execution."
    },
    {
      "id": "STRIDE-R-01",
      "stride_category": "Repudiation",
      "title": "No Audit Trail for Critical Actions",
      "description": "Users denying they performed a destructive action.",
      "component": "Payment / Admin Actions",
      "likelihood": "Medium",
      "impact": "Medium",
      "status": "Mitigated",
      "mitigation_strategy": "Centralized Application Logging",
      "justification": "Creates an immutable record of actions, timestamps, and IPs."
    },
    {
      "id": "STRIDE-I-01",
      "stride_category": "Information Disclosure",
      "title": "Verbose Stack Traces",
      "description": "Leaking system info via error messages.",
      "component": "Backend Error Handler",
      "likelihood": "High",
      "impact": "Medium",
      "status": "Mitigated",
      "mitigation_strategy": "Global Exception Handling (Generic Errors)",
      "justification": "Hides internal implementation details from end users."
    },
    {
      "id": "STRIDE-D-01",
      "stride_category": "Denial of Service",
      "title": "API Resource Exhaustion",
      "description": "Flooding the scanner with massive requests.",
      "component": "Scanner Endpoint",
      "likelihood": "High",
      "impact": "High",
      "status": "Mitigated",
      "mitigation_strategy": "Rate Limiting & Body Size Limits",
      "justification": "Prevents individual users from crashing the server."
    },
    {
      "id": "STRIDE-E-01",
      "stride_category": "Elevation of Privilege",
      "title": "IDOR (Insecure Direct Object Reference)",
      "description": "User A viewing User B's scan results by changing the ID.",
      "component": "Backend Results API",
      "likelihood": "Medium",
      "impact": "High",
      "status": "Mitigated",
      "mitigation_strategy": "Ownership-based Access Control",
      "justification": "Ensures data access is limited to the resource owner."
    },
    {
      "id": "STRIDE-S-02",
      "stride_category": "Spoofing",
      "title": "Widget API Key Theft",
      "description": "Attacker stealing API keys to impersonate a legitimate website.",
      "component": "Embeddable Widget / API Keys",
      "likelihood": "Medium",
      "impact": "High",
      "status": "Mitigated",
      "mitigation_strategy": "CORS & Domain Locking",
      "justification": "API keys are restricted to specific origin domains."
    },
    {
      "id": "STRIDE-D-02",
      "stride_category": "Denial of Service",
      "title": "Phishing Simulation Spam",
      "description": "Abusing the simulation engine to send unauthorized spam.",
      "component": "Simulation Engine",
      "likelihood": "Low",
      "impact": "Medium",
      "status": "Mitigated",
      "mitigation_strategy": "Admin-only Access & Rate Limiting",
      "justification": "Only authenticated admins can trigger simulations, with strict rate limits."
    }
  ]
}
