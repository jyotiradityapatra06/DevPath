import os
import sys
import time
import uuid
from typing import Any, Dict, List

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.database.connection import get_db
from app.main import app
from app.models.role import Role
from app.models.skill import Skill


from app.models.learning_resource import LearningResource
from app.models.role_skill import RoleSkill


class _ResultsCollector:
    def __init__(self):
        self.results: List[Dict[str, Any]] = []

    def record(
        self,
        method: str,
        endpoint: str,
        auth_required: bool,
        test_type: str,
        status_code: int,
        expected_status: int,
        passed: bool,
        duration_ms: float,
        notes: str = "",
        response_sample: Any = None,
    ):
        self.results.append({
            "method": method,
            "endpoint": endpoint,
            "auth": auth_required,
            "test_type": test_type,
            "status_code": status_code,
            "expected_status": expected_status,
            "passed": passed,
            "duration_ms": duration_ms,
            "notes": notes,
            "response_sample": str(response_sample)[:200] if response_sample else "",
        })


from app.database.connection import Base, engine, get_db

collector = _ResultsCollector()


def test_full_devpath_api_pass(client: TestClient | None = None):
    if client is None:
        client = TestClient(app)
        Base.metadata.create_all(bind=engine)
    
    ts = int(time.time())
    user_email = f"devpath.api.test.{ts}@example.com"
    user_password = "SecurePassword123!"
    user_name = "API Test Navigator"

    user_b_email = f"devpath.api.test.userb.{ts}@example.com"
    user_b_password = "SecurePassword123!"
    user_b_name = "User B"

    # Fetch reference seed data from DB
    db = next(get_db())
    Base.metadata.create_all(bind=db.get_bind())
    roles = db.query(Role).all()
    skills = db.query(Skill).all()

    if not roles or not skills:
        r = Role(title="Backend Developer", description="Backend Developer Role")
        db.add(r)
        s1 = Skill(name="Python", category="Language", difficulty="Intermediate")
        s2 = Skill(name="FastAPI", category="Framework", difficulty="Intermediate")
        db.add(s1)
        db.add(s2)
        db.flush()
        db.add(RoleSkill(role_id=r.id, skill_id=s1.id, importance=5))
        db.add(RoleSkill(role_id=r.id, skill_id=s2.id, importance=4))
        db.add(LearningResource(title="Python Official Documentation", provider="Python.org", resource_type="documentation", url="https://docs.python.org/3/", difficulty="Intermediate", rating=4.9, skill_id=s1.id))
        db.commit()
        roles = [r]
        skills = [s1, s2]

    target_role = roles[0]
    target_skill_1 = skills[0]
    target_skill_2 = skills[1] if len(skills) > 1 else skills[0]

    # =========================================================================
    # 00. PUBLIC / SYSTEM ENDPOINTS
    # =========================================================================
    # GET /
    t0 = time.time()
    res = client.get("/")
    collector.record("GET", "/", False, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Root status check", res.json())

    # GET /health
    t0 = time.time()
    res = client.get("/health")
    collector.record("GET", "/health", False, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Health check", res.json())

    # =========================================================================
    # 01. AUTHENTICATION
    # =========================================================================
    # POST /auth/signup - Success
    t0 = time.time()
    res = client.post("/auth/signup", json={"name": user_name, "email": user_email, "password": user_password})
    collector.record("POST", "/auth/signup", False, "Success", res.status_code, 201, res.status_code == 201, (time.time() - t0)*1000, "User created", res.json())
    assert res.status_code == 201
    user_data = res.json()
    user_id = user_data["id"]

    # POST /auth/signup - Conflict (Duplicate)
    t0 = time.time()
    res = client.post("/auth/signup", json={"name": user_name, "email": user_email, "password": user_password})
    collector.record("POST", "/auth/signup", False, "Duplicate Conflict", res.status_code, 409, res.status_code == 409, (time.time() - t0)*1000, "Duplicate email rejected", res.json())

    # POST /auth/signup - Validation Failure (Invalid email / missing pass)
    t0 = time.time()
    res = client.post("/auth/signup", json={"name": "", "email": "invalid-email"})
    collector.record("POST", "/auth/signup", False, "Validation Failure", res.status_code, 422, res.status_code == 422, (time.time() - t0)*1000, "Schema validation", res.json())

    # Create User B for isolation checks
    res_b = client.post("/auth/signup", json={"name": user_b_name, "email": user_b_email, "password": user_b_password})
    assert res_b.status_code == 201
    res_b_login = client.post("/auth/login", json={"email": user_b_email, "password": user_b_password})
    token_b = res_b_login.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # POST /auth/login - Success
    t0 = time.time()
    res = client.post("/auth/login", json={"email": user_email, "password": user_password})
    collector.record("POST", "/auth/login", False, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Login successful", res.json())
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    bad_headers = {"Authorization": "Bearer invalid.jwt.token.string"}

    # POST /auth/login - Invalid credentials
    t0 = time.time()
    res = client.post("/auth/login", json={"email": user_email, "password": "WrongPassword!"})
    collector.record("POST", "/auth/login", False, "Auth Failure", res.status_code, 401, res.status_code == 401, (time.time() - t0)*1000, "Invalid password rejected", res.json())

    # GET /auth/me - Success
    t0 = time.time()
    res = client.get("/auth/me", headers=headers)
    collector.record("GET", "/auth/me", True, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Current user info", res.json())

    # GET /auth/me - Missing Token
    t0 = time.time()
    res = client.get("/auth/me")
    collector.record("GET", "/auth/me", True, "Missing Token", res.status_code, 401, res.status_code == 401, (time.time() - t0)*1000, "Unauthorized check", res.json())

    # GET /auth/me - Invalid Token
    t0 = time.time()
    res = client.get("/auth/me", headers=bad_headers)
    collector.record("GET", "/auth/me", True, "Invalid Token", res.status_code, 401, res.status_code == 401, (time.time() - t0)*1000, "Bad token check", res.json())

    # =========================================================================
    # 02. ROLES & SKILLS (PUBLIC / METADATA)
    # =========================================================================
    # GET /api/v1/roles - Success
    t0 = time.time()
    res = client.get("/api/v1/roles")
    collector.record("GET", "/api/v1/roles", False, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, f"Listed {len(res.json())} roles", res.json())

    # GET /api/v1/roles/{role_id} - Success
    t0 = time.time()
    res = client.get(f"/api/v1/roles/{target_role.id}")
    collector.record("GET", "/api/v1/roles/{role_id}", False, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, f"Role: {res.json().get('title')}", res.json())

    # GET /api/v1/roles/{role_id} - 404 Not Found
    t0 = time.time()
    res = client.get("/api/v1/roles/999999")
    collector.record("GET", "/api/v1/roles/{role_id}", False, "Resource Failure", res.status_code, 404, res.status_code == 404, (time.time() - t0)*1000, "Non-existent role", res.json())

    # GET /api/v1/roles/{role_id}/skills - Success
    t0 = time.time()
    res = client.get(f"/api/v1/roles/{target_role.id}/skills")
    collector.record("GET", "/api/v1/roles/{role_id}/skills", False, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, f"Skills for {target_role.title}", res.json())

    # GET /api/v1/roles/{role_id}/skills - 404 Not Found
    t0 = time.time()
    res = client.get("/api/v1/roles/999999/skills")
    collector.record("GET", "/api/v1/roles/{role_id}/skills", False, "Resource Failure", res.status_code, 404, res.status_code == 404, (time.time() - t0)*1000, "Non-existent role skills", res.json())

    # GET /api/v1/skills - Success
    t0 = time.time()
    res = client.get("/api/v1/skills")
    collector.record("GET", "/api/v1/skills", False, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, f"Listed {len(res.json())} skills", res.json())

    # GET /api/v1/skills/{skill_id}/resources - Success
    t0 = time.time()
    res = client.get(f"/api/v1/skills/{target_skill_1.id}/resources")
    collector.record("GET", "/api/v1/skills/{skill_id}/resources", False, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, f"Resources for {target_skill_1.name}", res.json())

    # GET /api/v1/skills/{skill_id}/resources - 404 Not Found
    t0 = time.time()
    res = client.get("/api/v1/skills/999999/resources")
    collector.record("GET", "/api/v1/skills/{skill_id}/resources", False, "Resource Failure", res.status_code, 404, res.status_code == 404, (time.time() - t0)*1000, "Non-existent skill resources", res.json())

    # =========================================================================
    # 03. USER PROFILE (/api/v1/profile)
    # =========================================================================
    # GET /api/v1/profile/me - 404 Before creation
    t0 = time.time()
    res = client.get("/api/v1/profile/me", headers=headers)
    collector.record("GET", "/api/v1/profile/me", True, "Initial 404 State", res.status_code, 404, res.status_code == 404, (time.time() - t0)*1000, "No profile yet", res.json())

    # POST /api/v1/profile - Missing Auth
    t0 = time.time()
    res = client.post("/api/v1/profile", json={"experience_level": "intermediate", "career_intent": "upskill", "learning_preference": "hands_on"})
    collector.record("POST", "/api/v1/profile", True, "Missing Token", res.status_code, 401, res.status_code == 401, (time.time() - t0)*1000, "Unauthorized check", res.json())

    # POST /api/v1/profile - Success
    t0 = time.time()
    res = client.post(
        "/api/v1/profile",
        json={"experience_level": "intermediate", "career_intent": "switch_roles", "learning_preference": "hands_on", "weekly_hours": 15},
        headers=headers
    )
    collector.record("POST", "/api/v1/profile", True, "Success", res.status_code, 201, res.status_code == 201, (time.time() - t0)*1000, "Profile created", res.json())

    # POST /api/v1/profile - Duplicate Error
    t0 = time.time()
    res = client.post(
        "/api/v1/profile",
        json={"experience_level": "intermediate", "career_intent": "switch_roles", "learning_preference": "hands_on", "weekly_hours": 15},
        headers=headers
    )
    collector.record("POST", "/api/v1/profile", True, "Duplicate 400", res.status_code, 400, res.status_code == 400, (time.time() - t0)*1000, "Duplicate profile prevented", res.json())

    # GET /api/v1/profile/me - Success
    t0 = time.time()
    res = client.get("/api/v1/profile/me", headers=headers)
    collector.record("GET", "/api/v1/profile/me", True, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Profile retrieved", res.json())

    # PUT /api/v1/profile/me - Success Update
    t0 = time.time()
    res = client.put(
        "/api/v1/profile/me",
        json={"weekly_hours": 20, "career_intent": "leadership"},
        headers=headers
    )
    collector.record("PUT", "/api/v1/profile/me", True, "Success Update", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Profile updated", res.json())

    # =========================================================================
    # 04. USER SKILLS (/api/v1/user-skills)
    # =========================================================================
    # POST /api/v1/user-skills - Success
    t0 = time.time()
    res = client.post(
        "/api/v1/user-skills",
        json={"skill_id": target_skill_1.id, "level": "INTERMEDIATE", "status": "IN_PROGRESS"},
        headers=headers
    )
    collector.record("POST", "/api/v1/user-skills", True, "Success", res.status_code, 201, res.status_code == 201, (time.time() - t0)*1000, f"Added skill {target_skill_1.name}", res.json())

    # POST /api/v1/user-skills - Duplicate Conflict 409
    t0 = time.time()
    res = client.post(
        "/api/v1/user-skills",
        json={"skill_id": target_skill_1.id, "level": "INTERMEDIATE", "status": "IN_PROGRESS"},
        headers=headers
    )
    collector.record("POST", "/api/v1/user-skills", True, "Duplicate Conflict 409", res.status_code, 409, res.status_code == 409, (time.time() - t0)*1000, "Duplicate skill rejected", res.json())

    # POST /api/v1/user-skills - 404 Non-existent skill
    t0 = time.time()
    res = client.post(
        "/api/v1/user-skills",
        json={"skill_id": 999999, "level": "INTERMEDIATE", "status": "IN_PROGRESS"},
        headers=headers
    )
    collector.record("POST", "/api/v1/user-skills", True, "Resource Failure 404", res.status_code, 404, res.status_code == 404, (time.time() - t0)*1000, "Unknown skill_id", res.json())

    # Add second skill
    client.post("/api/v1/user-skills", json={"skill_id": target_skill_2.id, "level": "ADVANCED", "status": "COMPLETED"}, headers=headers)

    # GET /api/v1/user-skills - Success List
    t0 = time.time()
    res = client.get("/api/v1/user-skills", headers=headers)
    collector.record("GET", "/api/v1/user-skills", True, "Success List", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, f"Listed {len(res.json())} user skills", res.json())

    # PUT /api/v1/user-skills/{skill_id} - Success Update
    t0 = time.time()
    res = client.put(
        f"/api/v1/user-skills/{target_skill_1.id}",
        json={"level": "ADVANCED", "status": "COMPLETED"},
        headers=headers
    )
    collector.record("PUT", "/api/v1/user-skills/{skill_id}", True, "Success Update", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Skill updated", res.json())

    # PUT /api/v1/user-skills/{skill_id} - 404 Not Found
    t0 = time.time()
    res = client.put(
        "/api/v1/user-skills/999999",
        json={"level": "ADVANCED", "status": "COMPLETED"},
        headers=headers
    )
    collector.record("PUT", "/api/v1/user-skills/{skill_id}", True, "Resource Failure 404", res.status_code, 404, res.status_code == 404, (time.time() - t0)*1000, "Unknown user skill", res.json())

    # DELETE /api/v1/user-skills/{skill_id} - Success
    t0 = time.time()
    res = client.delete(f"/api/v1/user-skills/{target_skill_2.id}", headers=headers)
    collector.record("DELETE", "/api/v1/user-skills/{skill_id}", True, "Success Delete", res.status_code, 204, res.status_code == 204, (time.time() - t0)*1000, "Skill deleted", None)

    # Re-add target_skill_2 so user has full skill set for gap analysis
    client.post("/api/v1/user-skills", json={"skill_id": target_skill_2.id, "level": "BEGINNER", "status": "IN_PROGRESS"}, headers=headers)

    # =========================================================================
    # 05. CAREER GOALS (/api/v1/career-goals)
    # =========================================================================
    # GET /api/v1/career-goals/me - 404 Initial
    t0 = time.time()
    res = client.get("/api/v1/career-goals/me", headers=headers)
    collector.record("GET", "/api/v1/career-goals/me", True, "Initial 404 State", res.status_code, 404, res.status_code == 404, (time.time() - t0)*1000, "No goal yet", res.json())

    # POST /api/v1/career-goals - Success
    t0 = time.time()
    res = client.post(
        "/api/v1/career-goals",
        json={"target_role_id": target_role.id, "experience_level": "intermediate", "timeline": "6 months", "preferences": "Focus on high-scale distributed systems."},
        headers=headers
    )
    collector.record("POST", "/api/v1/career-goals", True, "Success", res.status_code, 201, res.status_code == 201, (time.time() - t0)*1000, "Goal created", res.json())

    # POST /api/v1/career-goals - Duplicate Conflict 409
    t0 = time.time()
    res = client.post(
        "/api/v1/career-goals",
        json={"target_role_id": target_role.id, "experience_level": "intermediate"},
        headers=headers
    )
    collector.record("POST", "/api/v1/career-goals", True, "Duplicate Conflict 409", res.status_code, 409, res.status_code == 409, (time.time() - t0)*1000, "Active goal already exists", res.json())

    # GET /api/v1/career-goals/me - Success
    t0 = time.time()
    res = client.get("/api/v1/career-goals/me", headers=headers)
    collector.record("GET", "/api/v1/career-goals/me", True, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Goal retrieved", res.json())

    # PUT /api/v1/career-goals/me - Success Update
    t0 = time.time()
    res = client.put(
        "/api/v1/career-goals/me",
        json={"experience_level": "senior", "timeline": "9 months"},
        headers=headers
    )
    collector.record("PUT", "/api/v1/career-goals/me", True, "Success Update", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Goal updated", res.json())

    # POST /auth/onboarding/complete - Success now that profile, goal, and skills exist
    t0 = time.time()
    res = client.post("/auth/onboarding/complete", headers=headers)
    collector.record("POST", "/auth/onboarding/complete", True, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Onboarding completed", res.json())

    # =========================================================================
    # 06. SKILL GAP ANALYSIS (/api/v1/skill-gap)
    # =========================================================================
    # POST /api/v1/skill-gap/analyze - Success
    t0 = time.time()
    res = client.post("/api/v1/skill-gap/analyze", json={"role_id": target_role.id}, headers=headers)
    collector.record("POST", "/api/v1/skill-gap/analyze", True, "Success", res.status_code, 201, res.status_code == 201, (time.time() - t0)*1000, f"Gap score: {res.json().get('overall_score')}%", res.json())

    # POST /api/v1/skill-gap/analyze - 404 Non-existent role
    t0 = time.time()
    res = client.post("/api/v1/skill-gap/analyze", json={"role_id": 999999}, headers=headers)
    collector.record("POST", "/api/v1/skill-gap/analyze", True, "Resource Failure 404", res.status_code, 404, res.status_code == 404, (time.time() - t0)*1000, "Invalid role_id", res.json())

    # GET /api/v1/skill-gap/latest - Success
    t0 = time.time()
    res = client.get("/api/v1/skill-gap/latest", headers=headers)
    collector.record("GET", "/api/v1/skill-gap/latest", True, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Latest gap analysis", res.json())

    # =========================================================================
    # 07. PERSONALIZATION (/api/v1/personalization)
    # =========================================================================
    # POST /api/v1/personalization/analyze - Success
    t0 = time.time()
    res = client.post("/api/v1/personalization/analyze", headers=headers)
    collector.record("POST", "/api/v1/personalization/analyze", True, "Success", res.status_code, 201, res.status_code == 201, (time.time() - t0)*1000, f"Generated {len(res.json())} recommendations", res.json())
    recommendations = res.json()
    first_rec_id = recommendations[0]["id"] if len(recommendations) > 0 else 1

    # GET /api/v1/personalization/recommendations - Success List
    t0 = time.time()
    res = client.get("/api/v1/personalization/recommendations", headers=headers)
    collector.record("GET", "/api/v1/personalization/recommendations", True, "Success List", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, f"Listed {len(res.json())} recommendations", res.json())

    # GET /api/v1/personalization/recommendations/{recommendation_id} - Success
    t0 = time.time()
    res = client.get(f"/api/v1/personalization/recommendations/{first_rec_id}", headers=headers)
    collector.record("GET", "/api/v1/personalization/recommendations/{recommendation_id}", True, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Single recommendation", res.json())

    # GET /api/v1/personalization/recommendations/{recommendation_id} - User Isolation (User B cannot access User A's rec)
    t0 = time.time()
    res = client.get(f"/api/v1/personalization/recommendations/{first_rec_id}", headers=headers_b)
    collector.record("GET", "/api/v1/personalization/recommendations/{recommendation_id}", True, "User Isolation 404", res.status_code, 404, res.status_code == 404, (time.time() - t0)*1000, "User B isolation verified", res.json())

    # =========================================================================
    # 08. ROADMAP (/api/v1/roadmap)
    # =========================================================================
    # POST /api/v1/roadmap/generate - Success
    t0 = time.time()
    res = client.post("/api/v1/roadmap/generate", json={"role_id": target_role.id}, headers=headers)
    collector.record("POST", "/api/v1/roadmap/generate", True, "Success", res.status_code, 201, res.status_code == 201, (time.time() - t0)*1000, f"Roadmap generated: {res.json().get('title')}", res.json())
    roadmap_data = res.json()
    roadmap_id = roadmap_data["id"]
    steps = roadmap_data["steps"]
    first_step_id = steps[0]["id"] if len(steps) > 0 else 1

    # GET /api/v1/roadmap/current - Success
    t0 = time.time()
    res = client.get("/api/v1/roadmap/current", headers=headers)
    collector.record("GET", "/api/v1/roadmap/current", True, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, f"Current roadmap with {len(res.json().get('steps', []))} steps", res.json())

    # =========================================================================
    # 09. PROGRESS (/api/v1/progress)
    # =========================================================================
    # GET /api/v1/progress/me - Success List
    t0 = time.time()
    res = client.get("/api/v1/progress/me", headers=headers)
    collector.record("GET", "/api/v1/progress/me", True, "Success List", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, f"Progress steps: {len(res.json())}", res.json())

    # GET /api/v1/progress/roadmap/{roadmap_id} - Success
    t0 = time.time()
    res = client.get(f"/api/v1/progress/roadmap/{roadmap_id}", headers=headers)
    collector.record("GET", "/api/v1/progress/roadmap/{roadmap_id}", True, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, f"Roadmap progress percentage: {res.json().get('completion_percentage')}%", res.json())

    # PUT /api/v1/progress/{step_id} - Success Update to in_progress
    t0 = time.time()
    res = client.put(f"/api/v1/progress/{first_step_id}", json={"status": "in_progress"}, headers=headers)
    collector.record("PUT", "/api/v1/progress/{step_id}", True, "Success Update", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Step updated to in_progress", res.json())

    # PUT /api/v1/progress/{step_id} - Success Update to completed
    t0 = time.time()
    res = client.put(f"/api/v1/progress/{first_step_id}", json={"status": "completed"}, headers=headers)
    collector.record("PUT", "/api/v1/progress/{step_id}", True, "Success Complete", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Step completed", res.json())

    # =========================================================================
    # 10. DASHBOARD (/api/v1/dashboard)
    # =========================================================================
    # GET /api/v1/dashboard - Success
    t0 = time.time()
    res = client.get("/api/v1/dashboard", headers=headers)
    collector.record("GET", "/api/v1/dashboard", True, "Success", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Dashboard overview aggregated", res.json())

    # =========================================================================
    # 11. CONVERSATIONS (/api/v1/conversations)
    # =========================================================================
    # POST /api/v1/conversations - Success
    t0 = time.time()
    res = client.post("/api/v1/conversations", json={"title": "Career Coaching Strategy"}, headers=headers)
    collector.record("POST", "/api/v1/conversations", True, "Success", res.status_code, 201, res.status_code == 201, (time.time() - t0)*1000, "Conversation created", res.json())
    conv_id = res.json()["id"]

    # GET /api/v1/conversations - Success List
    t0 = time.time()
    res = client.get("/api/v1/conversations", headers=headers)
    collector.record("GET", "/api/v1/conversations", True, "Success List", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, f"Listed {len(res.json())} conversations", res.json())

    # GET /api/v1/conversations/{conversation_id} - Success Detail
    t0 = time.time()
    res = client.get(f"/api/v1/conversations/{conv_id}", headers=headers)
    collector.record("GET", "/api/v1/conversations/{conversation_id}", True, "Success Detail", res.status_code, 200, res.status_code == 200, (time.time() - t0)*1000, "Conversation details retrieved", res.json())

    # GET /api/v1/conversations/{conversation_id} - User Isolation (User B cannot access User A's conversation)
    t0 = time.time()
    res = client.get(f"/api/v1/conversations/{conv_id}", headers=headers_b)
    collector.record("GET", "/api/v1/conversations/{conversation_id}", True, "User Isolation 404", res.status_code, 404, res.status_code == 404, (time.time() - t0)*1000, "User B isolation verified", res.json())

    # POST /api/v1/conversations/{conversation_id}/messages - Success
    t0 = time.time()
    res = client.post(
        f"/api/v1/conversations/{conv_id}/messages",
        json={"role": "user", "content": "How should I structure my learning journey?"},
        headers=headers
    )
    collector.record("POST", "/api/v1/conversations/{conversation_id}/messages", True, "Success", res.status_code, 201, res.status_code == 201, (time.time() - t0)*1000, "Message stored", res.json())

    # =========================================================================
    # 12. AI ENDPOINTS (Live AI / Gemini Calls)
    # =========================================================================
    # POST /api/v1/coach/chat - Success
    t0 = time.time()
    res = client.post(
        "/api/v1/coach/chat",
        json={"conversation_id": conv_id, "message": "Give me guidance on mastering distributed systems architecture."},
        headers=headers
    )
    coach_passed = res.status_code == 200
    collector.record("POST", "/api/v1/coach/chat", True, "Success", res.status_code, 200, coach_passed, (time.time() - t0)*1000, "AI Coach Chat response generated", res.json() if coach_passed else res.text)

    # POST /api/v1/intelligence/analyze - Success
    t0 = time.time()
    res = client.post(
        "/api/v1/intelligence/analyze",
        json={"focus": "skills"},
        headers=headers
    )
    intel_passed = res.status_code == 200
    collector.record("POST", "/api/v1/intelligence/analyze", True, "Success", res.status_code, 200, intel_passed, (time.time() - t0)*1000, "Career intelligence generated", res.json() if intel_passed else res.text)

    # POST /api/v1/adaptive/roadmap-optimize - Success
    t0 = time.time()
    res = client.post("/api/v1/adaptive/roadmap-optimize", headers=headers)
    adaptive_passed = res.status_code == 200
    collector.record("POST", "/api/v1/adaptive/roadmap-optimize", True, "Success", res.status_code, 200, adaptive_passed, (time.time() - t0)*1000, "Adaptive optimization returned", res.json() if adaptive_passed else res.text)

    # POST /api/v1/planner/weekly-plan - Success
    t0 = time.time()
    res = client.post("/api/v1/planner/weekly-plan", headers=headers)
    planner_passed = res.status_code == 200
    collector.record("POST", "/api/v1/planner/weekly-plan", True, "Success", res.status_code, 200, planner_passed, (time.time() - t0)*1000, "Weekly plan generated", res.json() if planner_passed else res.text)

    # POST /api/v1/interview/prepare - Success
    t0 = time.time()
    res = client.post("/api/v1/interview/prepare", headers=headers)
    interview_passed = res.status_code == 200
    collector.record("POST", "/api/v1/interview/prepare", True, "Success", res.status_code, 200, interview_passed, (time.time() - t0)*1000, "Interview preparation generated", res.json() if interview_passed else res.text)

    # =========================================================================
    # 13. CLEANUP / DELETE ENDPOINTS
    # =========================================================================
    # DELETE /api/v1/career-goals/me - Success
    t0 = time.time()
    res = client.delete("/api/v1/career-goals/me", headers=headers)
    collector.record("DELETE", "/api/v1/career-goals/me", True, "Success Delete", res.status_code, 204, res.status_code == 204, (time.time() - t0)*1000, "Career goal deleted", None)


if __name__ == "__main__":
    import json
    test_full_devpath_api_pass()
    passed = sum(1 for r in collector.results if r["passed"])
    failed = sum(1 for r in collector.results if not r["passed"])
    print(f"\n--- Total executed test actions: {len(collector.results)} ---")
    print(f"Passed: {passed}, Failed: {failed}")
    
    with open("test_results.json", "w", encoding="utf-8") as f:
        json.dump(collector.results, f, indent=2)
    
    for r in collector.results:
        status_sym = "[PASS]" if r["passed"] else "[FAIL]"
        print(f"{status_sym} {r['method']:6} {r['endpoint']:50} ({r['test_type']:22}) -> Status: {r['status_code']} (Expected {r['expected_status']}) in {r['duration_ms']:.1f}ms : {r['notes']}")
