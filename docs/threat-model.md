# Threat Model & Security Design

## Trust Boundaries
The system is divided into three main zones:
1.  **Untrusted**: The public internet.
2.  **DMZ**: The Frontend container (publicly accessible).
3.  **Trusted**: The Backend and Database network (internal only).

## Identified Threats (STRIDE)
-   **Spoofing**: Mitigated by JWT authentication.
-   **Tampering**: TLS for all data in transit; Input validation via Pydantic.
-   **Repudiation**: Comprehensive logging of scan requests.
-   **Information Disclosure**: Secrets management via `.env`; Error message suppression in prod.
-   **Denial of Service**: Rate limiting (to be implemented); Docker resource limits.
-   **Elevation of Privilege**: Role-Based Access Control (RBAC).
