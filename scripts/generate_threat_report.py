import json
import os
from datetime import datetime

# Configuration
JSON_FILE = 'docs/threat-model.json'
OUTPUT_FILE = 'docs/threat-report.html'

def load_threat_model(filepath):
    with open(filepath, 'r') as f:
        return json.load(f)

def generate_html(data):
    system = data['system_info']
    assets = data['assets']
    threats = data['threats']
    
    # Simple CSS for professional look
    css = """
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; background-color: #f4f6f8; }
        header { background: #2c3e50; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
        h1 { margin: 0; }
        .meta { font-size: 0.9em; opacity: 0.8; }
        .section { background: #fff; padding: 20px; margin-bottom: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: 600; }
        .tag { padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; color: #fff; }
        .critical { background-color: #e74c3c; }
        .high { background-color: #e67e22; }
        .medium { background-color: #f1c40f; color: #333; }
        .low { background-color: #3498db; }
        .mitigated { background-color: #27ae60; }
        .in-progress { background-color: #f39c12; }
        .stride { font-weight: bold; color: #2c3e50; }
    </style>
    """
    
    # HTML Header
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Threat Model Report - {system['name']}</title>
        {css}
    </head>
    <body>
        <header>
            <h1>🛡️ Threat Model Report: {system['name']}</h1>
            <p class="meta">Version: {system['version']} | Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>
        </header>

        <div class="section">
            <h2>System Overview</h2>
            <p>{system['description']}</p>
        </div>

        <div class="section">
            <h2>💎 Critical Assets</h2>
            <table>
                <thead>
                    <tr>
                        <th>Asset Name</th>
                        <th>Description</th>
                        <th>Value/Sensitivity</th>
                    </tr>
                </thead>
                <tbody>
    """
    
    # Assets Data
    for asset in assets:
        html += f"""
                    <tr>
                        <td><strong>{asset['name']}</strong></td>
                        <td>{asset['description']}</td>
                        <td><span class="tag critical">{asset['value']}</span></td>
                    </tr>
        """
        
    html += """
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>⚠️ Identified Threats (STRIDE)</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>STRIDE</th>
                        <th>Threat Description</th>
                        <th>Severity</th>
                        <th>Mitigation & Justification</th>
                    </tr>
                </thead>
                <tbody>
    """
    
    # Threats Data
    for threat in threats:
        severity_class = threat['severity'].lower()
        status_class = threat['status'].lower().replace(" ", "-")
        
        html += f"""
                    <tr>
                        <td>{threat['id']}</td>
                        <td><span class="stride">{threat['stride_category']}</span></td>
                        <td>
                            <strong>{threat['title']}</strong><br>
                            <em>Component: {threat['component']}</em><br>
                            {threat['description']}
                        </td>
                        <td><span class="tag {severity_class}">{threat['severity']}</span></td>
                        <td>
                            <div style="margin-bottom: 8px;">
                                <span class="tag {status_class}">{threat['status']}</span>
                            </div>
                            <strong>Strategy:</strong> {threat['mitigation_strategy']}<br><br>
                            <strong>Justification:</strong> <em>{threat['justification']}</em>
                        </td>
                    </tr>
        """
        
    html += """
                </tbody>
            </table>
        </div>
        
        <footer style="text-align: center; margin-top: 40px; color: #7f8c8d; font-size: 0.9em;">
            Generated automatically by SecureGuard Threat Engine
        </footer>
    </body>
    </html>
    """
    
    return html

def main():
    if not os.path.exists(JSON_FILE):
        print(f"Error: Could not find {JSON_FILE}")
        return

    print(f"Loading threat model from {JSON_FILE}...")
    data = load_threat_model(JSON_FILE)
    
    print("Generating HTML report...")
    html_content = generate_html(data)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    print(f"Success! Report saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
