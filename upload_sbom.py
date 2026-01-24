#!/usr/bin/env python3
"""
Script to upload SBOM files to Dependency-Track via API
"""
import requests
import json
import sys
import os
from pathlib import Path

# Configuration
DT_API_URL = "http://localhost:8081/api/v1"
API_KEY = ""  # Set your API key here or pass as environment variable

# Project configurations for separate frontend and backend projects
PROJECTS = [
    {
        "name": "SecureGuard Frontend",
        "version": "1.0.0",
        "description": "SecureGuard AI - Frontend (Next.js)",
        "sbom_file": "bom-frontend.xml"  # Check root first, then subdirectory
    },
    {
        "name": "SecureGuard Backend",
        "version": "1.0.0",
        "description": "SecureGuard AI - Backend (FastAPI)",
        "sbom_file": "bom-backend.xml"  # Check root first, then subdirectory
    }
]

def get_api_key():
    """Get API key from environment or prompt user"""
    api_key = os.getenv("DT_API_KEY", API_KEY)
    if not api_key:
        print("ERROR: API key not set!")
        print("Set it as environment variable: export DT_API_KEY='your-key'")
        print("Or edit this script and set API_KEY variable")
        sys.exit(1)
    return api_key

def create_or_get_project(api_key, name, version):
    """Create project if it doesn't exist, return project UUID"""
    headers = {
        "X-Api-Key": api_key,
        "Content-Type": "application/json"
    }
    
    # First, try to find existing project
    url = f"{DT_API_URL}/project"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        projects = response.json()
        for project in projects:
            if project.get("name") == name and project.get("version") == version:
                print(f"Found existing project: {project['uuid']}")
                return project['uuid']
    
    # Create new project
    project_data = {
        "name": name,
        "version": version,
        "description": "SecureGuard AI - Next-Gen Cybersecurity SaaS",
        "active": True
    }
    
    response = requests.put(url, headers=headers, json=project_data)
    if response.status_code in [200, 201]:
        project = response.json()
        print(f"Created project: {project['uuid']}")
        return project['uuid']
    else:
        print(f"Error creating project: {response.status_code} - {response.text}")
        sys.exit(1)

def upload_bom(api_key, project_uuid, bom_file_path):
    """Upload BOM file to Dependency-Track"""
    headers = {
        "X-Api-Key": api_key
    }
    
    url = f"{DT_API_URL}/bom"
    
    with open(bom_file_path, 'rb') as f:
        files = {
            'bom': (os.path.basename(bom_file_path), f, 'application/json')
        }
        data = {
            'project': project_uuid
        }
        
        response = requests.post(url, headers=headers, files=files, data=data)
        
        if response.status_code in [200, 201]:
            print(f"✓ Successfully uploaded: {bom_file_path}")
            return True
        else:
            print(f"✗ Error uploading {bom_file_path}: {response.status_code}")
            print(f"  Response: {response.text}")
            return False

def find_sbom_file(base_dir, filename):
    """Find SBOM file in root directory first, then check subdirectories"""
    # Check root directory first
    root_path = base_dir / filename
    if root_path.exists():
        return root_path
    
    # Check frontend/backend subdirectories
    if "frontend" in filename.lower():
        subdir_path = base_dir / "frontend" / "bom.xml"
        if subdir_path.exists():
            return subdir_path
    elif "backend" in filename.lower():
        subdir_path = base_dir / "backend" / "bom.xml"
        if subdir_path.exists():
            return subdir_path
    
    return None

def main():
    api_key = get_api_key()
    base_dir = Path(__file__).parent
    
    print("Uploading SBOMs to Dependency-Track (Separate Projects)...")
    print("=" * 60)
    
    success_count = 0
    project_urls = []
    
    # Process each project configuration
    for project_config in PROJECTS:
        project_name = project_config["name"]
        project_version = project_config["version"]
        sbom_filename = project_config["sbom_file"]
        
        print(f"\n📦 Processing: {project_name}")
        
        # Find SBOM file
        sbom_file = find_sbom_file(base_dir, sbom_filename)
        if not sbom_file:
            print(f"  ⚠ SBOM file not found: {sbom_filename}")
            continue
        
        # Create or get project
        project_uuid = create_or_get_project(
            api_key, 
            project_name, 
            project_version
        )
        
        # Upload SBOM
        if upload_bom(api_key, project_uuid, sbom_file):
            success_count += 1
            project_urls.append({
                "name": project_name,
                "url": f"http://localhost:8080/projects/{project_uuid}"
            })
    
    # Summary
    print("\n" + "=" * 60)
    if success_count > 0:
        print(f"✓ Successfully uploaded {success_count} SBOM file(s) to {success_count} project(s)")
        print("\n📊 View your projects:")
        for proj in project_urls:
            print(f"  • {proj['name']}: {proj['url']}")
        print("\n💡 Tip: Use the Portfolio view in Dependency-Track to see all projects together")
    else:
        print("✗ No SBOM files were uploaded")

if __name__ == "__main__":
    main()
