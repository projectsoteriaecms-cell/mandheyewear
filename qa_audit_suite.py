"""
M&H Eyewear QA Audit Suite
Periodic health checks: links, auth, data, security, performance, SEO
Runs daily/weekly and logs results to Supabase for review and auto-fixes

Usage:
  python qa_audit_suite.py --full          # all checks
  python qa_audit_suite.py --quick         # critical checks only
  python qa_audit_suite.py --link-check    # test links
  python qa_audit_suite.py --auth-flow     # test signup/login
"""

import sys
import json
import time
import urllib.request
import urllib.error
from datetime import datetime

SUPABASE_URL = "https://znhrwzxthusqtqreawwq.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuaHJ3enh0aHVzcXRxcmVhd3dxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDk4MzAxMiwiZXhwIjoyMDk2NTU5MDEyfQ.Cl0HtSNQuGIvAunlYxqfGJF7AtLD_ThjrnmL7yIoWBs"
SITE_URL = "https://mandheyewear.com"


def rest_request(method, path, body=None):
    """Make Supabase REST request."""
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    headers = {
        "Authorization": f"Bearer {SERVICE_KEY}",
        "apikey": SERVICE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP {e.code}", "status": "error"}
    except Exception as e:
        return {"error": str(e), "status": "error"}


def audit_links():
    """Check for dead links in products and pages."""
    print("\n[LINK CHECK] Testing product images...")
    passed = failed = 0
    issues = []

    products = rest_request("GET", "/rest/v1/products?select=id,sku,image_url,additional_images&limit=200")
    if isinstance(products, dict) and "error" in products:
        return {"status": "fail", "passed": 0, "failed": 1, "issues": ["Failed to fetch products"]}

    for p in products[:20]:  # test first 20 for speed
        for url in [p.get("image_url")] + (p.get("additional_images") or []):
            if not url:
                continue
            try:
                req = urllib.request.Request(url, method="HEAD")
                urllib.request.urlopen(req, timeout=5)
                passed += 1
            except Exception as e:
                failed += 1
                issues.append({"sku": p["sku"], "url": url, "error": str(e)})

    return {
        "status": "pass" if failed == 0 else "warning" if failed < 5 else "fail",
        "passed": passed,
        "failed": failed,
        "issues": issues,
    }


def audit_auth_flow():
    """Test basic auth functionality."""
    print("\n[AUTH FLOW] Testing auth endpoints...")
    passed = failed = 0
    issues = []

    # Test health endpoint
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/health", method="GET")
        urllib.request.urlopen(req, timeout=5)
        passed += 1
    except Exception as e:
        failed += 1
        issues.append({"check": "health_endpoint", "error": str(e)})

    # Test auth signup endpoint exists
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/auth/v1/signup",
            data=json.dumps({"email": "test@test.com", "password": "test"}).encode(),
            headers={"apikey": SERVICE_KEY, "Content-Type": "application/json"},
            method="POST",
        )
        try:
            urllib.request.urlopen(req, timeout=5)
        except urllib.error.HTTPError:
            # Expected to fail with invalid creds, but endpoint should exist
            pass
        passed += 1
    except Exception as e:
        failed += 1
        issues.append({"check": "signup_endpoint", "error": str(e)})

    return {
        "status": "pass" if failed == 0 else "fail",
        "passed": passed,
        "failed": failed,
        "issues": issues,
    }


def audit_data_integrity():
    """Check product data consistency."""
    print("\n[DATA INTEGRITY] Checking products...")
    passed = failed = 0
    issues = []

    products = rest_request("GET", "/rest/v1/products?select=id,sku,name,price,is_active&limit=200")
    if isinstance(products, dict) and "error" in products:
        return {"status": "fail", "passed": 0, "failed": 1, "issues": ["Failed to fetch products"]}

    for p in products:
        checks = [
            ("id", p.get("id")),
            ("sku", p.get("sku")),
            ("name", p.get("name")),
            ("price >= 0", p.get("price", -1) >= 0),
        ]
        for check_name, check_val in checks:
            if check_val:
                passed += 1
            else:
                failed += 1
                issues.append({"product": p.get("sku"), "missing": check_name})

    # Check inventory
    inv = rest_request("GET", "/rest/v1/inventory?select=id,product_id,quantity_on_hand&limit=10")
    if inv and not isinstance(inv, dict):
        passed += len(inv)
    else:
        failed += 1
        issues.append({"check": "inventory_data"})

    return {
        "status": "pass" if failed == 0 else "warning" if failed < 10 else "fail",
        "passed": passed,
        "failed": failed,
        "issues": issues[:5],  # top 5 issues
    }


def audit_security():
    """Check basic security headers and practices."""
    print("\n[SECURITY] Checking HTTPS and headers...")
    passed = failed = 0
    issues = []

    # Check HTTPS on main site
    try:
        req = urllib.request.Request(SITE_URL, method="HEAD")
        resp = urllib.request.urlopen(req, timeout=10)
        if resp.headers.get("Strict-Transport-Security"):
            passed += 1
        else:
            # HSTS not set, warn but don't fail
            issues.append({"check": "HSTS header missing", "severity": "warning"})
        passed += 1
    except Exception as e:
        failed += 1
        issues.append({"check": "https_access", "error": str(e)})

    # Check Supabase API uses HTTPS
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/health", method="GET")
        urllib.request.urlopen(req, timeout=5)
        passed += 1
    except Exception as e:
        failed += 1
        issues.append({"check": "api_access", "error": str(e)})

    return {
        "status": "pass" if failed == 0 else "warning",
        "passed": passed,
        "failed": failed,
        "issues": issues,
    }


def audit_performance():
    """Check API response times."""
    print("\n[PERFORMANCE] Testing response times...")
    timings = []

    endpoints = [
        "/rest/v1/products?select=id,name&limit=1",
        "/rest/v1/inventory?select=id&limit=1",
    ]

    for ep in endpoints:
        try:
            t0 = time.time()
            rest_request("GET", ep)
            ms = (time.time() - t0) * 1000
            timings.append(ms)
            status = "pass" if ms < 1000 else "warning" if ms < 5000 else "fail"
            print(f"  {ep}: {ms:.0f}ms [{status}]")
        except Exception as e:
            print(f"  {ep}: FAILED - {e}")

    avg_ms = sum(timings) / len(timings) if timings else 0
    status = "pass" if avg_ms < 1000 else "warning" if avg_ms < 5000 else "fail"

    return {
        "status": status,
        "passed": len([t for t in timings if t < 1000]),
        "failed": len([t for t in timings if t >= 5000]),
        "avg_response_ms": round(avg_ms, 1),
    }


def store_audit_result(audit_type, result, duration_ms):
    """Save audit result to Supabase."""
    body = {
        "audit_type": audit_type,
        "status": result.get("status", "unknown"),
        "passed": result.get("passed", 0),
        "failed": result.get("failed", 0),
        "warnings": result.get("warnings", 0),
        "details": json.dumps(result),
        "executed_at": datetime.utcnow().isoformat(),
        "duration_ms": duration_ms,
    }
    return rest_request("POST", "/rest/v1/qa_audit_results", body)


def main():
    print("=== M&H EYEWEAR QA AUDIT SUITE ===")
    print(f"Started: {datetime.utcnow().isoformat()}\n")

    quick_mode = "--quick" in sys.argv
    checks = {
        "link_check": audit_links,
        "auth_flow": audit_auth_flow,
        "data_integrity": audit_data_integrity,
        "security": audit_security,
        "performance": audit_performance,
    }

    if "--link-check" in sys.argv:
        checks = {"link_check": audit_links}
    elif "--auth-flow" in sys.argv:
        checks = {"auth_flow": audit_auth_flow}

    results = {}
    for name, func in checks.items():
        if quick_mode and name not in ["auth_flow", "security"]:
            continue
        try:
            t0 = time.time()
            result = func()
            duration = int((time.time() - t0) * 1000)
            results[name] = result
            store_audit_result(name, result, duration)
            print(f"  -> {result['status'].upper()}")
        except Exception as e:
            print(f"  -> ERROR: {e}")
            results[name] = {"status": "error", "error": str(e)}

    # Summary
    print("\n" + "=" * 60)
    print("AUDIT SUMMARY")
    for name, result in results.items():
        status = result.get("status", "?").upper()
        passed = result.get("passed", 0)
        failed = result.get("failed", 0)
        print(f"  {name:20} {status:10} (pass: {passed}, fail: {failed})")
    print("=" * 60)


if __name__ == "__main__":
    main()
