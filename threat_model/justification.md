# Threat Model Justification & Rationale

This document provides the detailed justification for the threats identified in the SecureGuard AI platform, following the Microsoft STRIDE methodology.

---

## 1. Spoofing: Attacker Impersonates User via Token Theft
**Justification:** 
The SecureGuard dashboard is a high-value target because it contains phishing results and user security metrics. If an attacker steals a JWT token via an XSS vulnerability, they can impersonate a legitimate user without needing their password. This threat is critical because identity is the first line of defense in a SaaS environment. We identify this because the frontend handles sensitive session data. The mitigation using **HttpOnly cookies** is chosen because it physically prevents JavaScript from reading the cookie, making standard XSS-based token theft impossible.

## 2. Tampering: SQL Injection in Search Queries
**Justification:**
Users frequently search for scanned emails or URLs. If the search inputs are concatenated directly into SQL queries, an attacker can "break out" of the query and execute arbitrary commands. This matters because it could lead to full database deletion or data exfiltration. We mitigate this using the **SQLAlchemy ORM**, which treats the input as a literal string rather than executable code. This is the industry standard for preventing SQL injection in modern Python web applications.

## 3. Tampering: Man-in-the-Middle (MitM)
**Justification:**
Because SecureGuard operates over the internet, data travels through many untrusted routers. Without encryption, a malicious actor could intercept and modify scan results in transit. For example, a "Malicious" result could be swapped for "Safe." We mitigate this by enforcing **TLS 1.2+ (HTTPS)** and **HSTS**. This ensures a cryptographically secure tunnel where any tampering with the packet would invalidate the checksum and drop the connection.

## 4. Repudiation: Lack of Audit Trails
**Justification:**
In a security platform, users or admins might perform critical actions like deleting logs or changing security settings. Repudiation occurs when a user denies taking an action and there is no proof to counter them. This is a risk for compliance and internal security. We address this by implementing **asynchronous logging** of all mutating actions. By recording the IP address and timestamp alongside the actor's ID, we create an immutable record that serves as a source of truth for forensic analysis.

## 5. Information Disclosure: Secret Leakage in Source Code
**Justification:**
Hardcoding API keys or database passwords in a Git repository is a common source of catastrophic breaches. If the repository is ever cloned by an unauthorized party or accidentally made public, all credentials would be compromised. We mitigate this by using **environment variables** and `.gitignore`. This methodology ensures that configuration is separated from code, a core principle of the 12-Factor App and Microsoft SDL.

## 6. Information Disclosure: Verbose Error Messages
**Justification:**
When a system fails, it often produces stack traces containing internal file paths, library versions, and logic flows. This information is invaluable to an attacker for mapping out further exploits. By implementing **generic error handling** in production, we deny the attacker any visibility into our internal stack. This justification follows the "Security through Obscurity" principle as a secondary layer of defense.

## 7. Denial of Service: Resource Exhaustion
**Justification:**
The phishing scanner is a computationally expensive component. If an attacker sends extremely large files or thousands of requests, they can consume all available RAM and CPU, making the service unavailable for legitimate users. We justify the use of **Rate Limiting** and **Body Size Limits** because they protect the underlying infrastructure from being overwhelmed. This ensures high availability and business continuity.

## 8. Elevation of Privilege: Broken Access Control (IDOR)
**Justification:**
Insecure Direct Object Reference (IDOR) occurs when an application exposes a reference to an internal implementation object, such as a database key. An attacker can manipulate these keys to access data they do not own. This is a massive risk in SaaS platforms where data multi-tenancy is required. We mitigate this by enforcing **ownership checks** at the application layer, ensuring the authenticated user ID matches the resource owner ID before returning any data.
