import json
import os

postman_dir = r"C:\PROJECTS\DevPath\docs\postman"
os.makedirs(postman_dir, exist_ok=True)

# 1. Postman Environment
environment = {
    "id": "devpath-local-env",
    "name": "DevPath Local Environment",
    "values": [
        {"key": "base_url", "value": "http://127.0.0.1:8000", "type": "default", "enabled": True},
        {"key": "access_token", "value": "", "type": "secret", "enabled": True},
        {"key": "user_id", "value": "1", "type": "default", "enabled": True},
        {"key": "role_id", "value": "1", "type": "default", "enabled": True},
        {"key": "skill_id", "value": "1", "type": "default", "enabled": True},
        {"key": "roadmap_id", "value": "1", "type": "default", "enabled": True},
        {"key": "step_id", "value": "1", "type": "default", "enabled": True},
        {"key": "conversation_id", "value": "1", "type": "default", "enabled": True},
        {"key": "recommendation_id", "value": "1", "type": "default", "enabled": True},
        {"key": "test_email", "value": "devpath.api.user@example.com", "type": "default", "enabled": True},
        {"key": "test_password", "value": "SecurePassword123!", "type": "secret", "enabled": True}
    ],
    "_postman_variable_scope": "environment"
}

with open(os.path.join(postman_dir, "DevPath_Local.postman_environment.json"), "w", encoding="utf-8") as f:
    json.dump(environment, f, indent=2)


def make_request(name, method, url_path, auth_bearer=True, body=None, test_script=None, post_resp_script=None):
    events = []
    if post_resp_script or test_script:
        exec_lines = []
        if post_resp_script:
            exec_lines.extend(post_resp_script if isinstance(post_resp_script, list) else [post_resp_script])
        if test_script:
            exec_lines.extend(test_script if isinstance(test_script, list) else [test_script])
        events.append({
            "listen": "test",
            "script": {
                "type": "text/javascript",
                "exec": exec_lines
            }
        })
    
    path_segments = [p for p in url_path.strip("/").split("/") if p]
    
    req: dict = {
        "method": method,
        "header": [
            {"key": "Accept", "value": "application/json", "type": "text"}
        ],
        "url": {
            "raw": "{{base_url}}/" + "/".join(path_segments),
            "host": ["{{base_url}}"],
            "path": path_segments
        }
    }
    
    if auth_bearer:
        req["auth"] = {
            "type": "bearer",
            "bearer": [{"key": "token", "value": "{{access_token}}", "type": "string"}]
        }
    
    if body is not None:
        req["header"].append({"key": "Content-Type", "value": "application/json", "type": "text"})
        req["body"] = {
            "mode": "raw",
            "raw": json.dumps(body, indent=2)
        }
        
    return {
        "name": name,
        "event": events,
        "request": req,
        "response": []
    }


login_post_script = [
    "pm.test('Status is 200 OK', function () { pm.response.to.have.status(200); });",
    "var json = pm.response.json();",
    "if (json.access_token) {",
    "    pm.environment.set('access_token', json.access_token);",
    "    console.log('Access token saved to environment.');",
    "}"
]

status_200_test = [
    "pm.test('Status is 200 OK', function () { pm.response.to.have.status(200); });",
    "pm.test('Response is JSON', function () { pm.response.to.be.json; });"
]

status_201_test = [
    "pm.test('Status is 201 Created', function () { pm.response.to.have.status(201); });",
    "pm.test('Response is JSON', function () { pm.response.to.be.json; });"
]

status_204_test = [
    "pm.test('Status is 204 No Content', function () { pm.response.to.have.status(204); });"
]


collection = {
    "info": {
        "_postman_id": "devpath-api-collection-v1",
        "name": "DevPath API Collection",
        "description": "Complete verified end-to-end API collection for DevPath career intelligence backend.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "00 System & Health",
            "item": [
                make_request("Root API Check", "GET", "/", auth_bearer=False, test_script=status_200_test),
                make_request("Health Check", "GET", "/health", auth_bearer=False, test_script=status_200_test)
            ]
        },
        {
            "name": "01 Auth",
            "item": [
                make_request("Signup New User", "POST", "/auth/signup", auth_bearer=False, body={"name": "DevPath Navigator", "email": "{{test_email}}", "password": "{{test_password}}"}, test_script=[
                    "pm.test('Status is 201 or 409', function () { pm.expect([201, 409]).to.include(pm.response.code); });",
                    "if (pm.response.code === 201) { pm.environment.set('user_id', pm.response.json().id); }"
                ]),
                make_request("Login & Extract JWT", "POST", "/auth/login", auth_bearer=False, body={"email": "{{test_email}}", "password": "{{test_password}}"}, post_resp_script=login_post_script),
                make_request("Get Current User", "GET", "/auth/me", auth_bearer=True, test_script=status_200_test),
                make_request("Complete Onboarding", "POST", "/auth/onboarding/complete", auth_bearer=True, test_script=[
                    "pm.test('Status is 200 or 409', function () { pm.expect([200, 409]).to.include(pm.response.code); });"
                ])
            ]
        },
        {
            "name": "02 Users & Profile",
            "item": [
                make_request("Create User Profile", "POST", "/api/v1/profile", auth_bearer=True, body={"experience_level": "intermediate", "career_intent": "switch_roles", "learning_preference": "hands_on", "weekly_hours": 15}, test_script=[
                    "pm.test('Status is 201 or 400', function () { pm.expect([201, 400]).to.include(pm.response.code); });"
                ]),
                make_request("Get My Profile", "GET", "/api/v1/profile/me", auth_bearer=True, test_script=status_200_test),
                make_request("Update My Profile", "PUT", "/api/v1/profile/me", auth_bearer=True, body={"weekly_hours": 20, "career_intent": "leadership"}, test_script=status_200_test)
            ]
        },
        {
            "name": "03 Roles & Skills",
            "item": [
                make_request("List All Roles", "GET", "/api/v1/roles", auth_bearer=False, test_script=[
                    "pm.test('Status is 200 OK', function () { pm.response.to.have.status(200); });",
                    "var roles = pm.response.json();",
                    "if (roles && roles.length > 0) { pm.environment.set('role_id', roles[0].id); }"
                ]),
                make_request("Get Role by ID", "GET", "/api/v1/roles/{{role_id}}", auth_bearer=False, test_script=status_200_test),
                make_request("Get Skills for Role", "GET", "/api/v1/roles/{{role_id}}/skills", auth_bearer=False, test_script=status_200_test),
                make_request("List All Skills", "GET", "/api/v1/skills", auth_bearer=False, test_script=[
                    "pm.test('Status is 200 OK', function () { pm.response.to.have.status(200); });",
                    "var skills = pm.response.json();",
                    "if (skills && skills.length > 0) { pm.environment.set('skill_id', skills[0].id); }"
                ]),
                make_request("Get Resources for Skill", "GET", "/api/v1/skills/{{skill_id}}/resources", auth_bearer=False, test_script=status_200_test)
            ]
        },
        {
            "name": "04 User Skills",
            "item": [
                make_request("Add User Skill", "POST", "/api/v1/user-skills", auth_bearer=True, body={"skill_id": 1, "level": "INTERMEDIATE", "status": "IN_PROGRESS"}, test_script=[
                    "pm.test('Status is 201 or 409', function () { pm.expect([201, 409]).to.include(pm.response.code); });"
                ]),
                make_request("List User Skills", "GET", "/api/v1/user-skills", auth_bearer=True, test_script=status_200_test),
                make_request("Update User Skill", "PUT", "/api/v1/user-skills/{{skill_id}}", auth_bearer=True, body={"level": "ADVANCED", "status": "COMPLETED"}, test_script=[
                    "pm.test('Status is 200 or 404', function () { pm.expect([200, 404]).to.include(pm.response.code); });"
                ]),
                make_request("Delete User Skill", "DELETE", "/api/v1/user-skills/{{skill_id}}", auth_bearer=True, test_script=[
                    "pm.test('Status is 204 or 404', function () { pm.expect([204, 404]).to.include(pm.response.code); });"
                ])
            ]
        },
        {
            "name": "05 Career Goals",
            "item": [
                make_request("Create Career Goal", "POST", "/api/v1/career-goals", auth_bearer=True, body={"target_role_id": 1, "experience_level": "intermediate", "timeline": "6 months", "preferences": "Focus on high scale systems."}, test_script=[
                    "pm.test('Status is 201 or 409', function () { pm.expect([201, 409]).to.include(pm.response.code); });"
                ]),
                make_request("Get Active Career Goal", "GET", "/api/v1/career-goals/me", auth_bearer=True, test_script=status_200_test),
                make_request("Update Active Career Goal", "PUT", "/api/v1/career-goals/me", auth_bearer=True, body={"experience_level": "senior", "timeline": "9 months"}, test_script=status_200_test),
                make_request("Delete Career Goal", "DELETE", "/api/v1/career-goals/me", auth_bearer=True, test_script=status_204_test)
            ]
        },
        {
            "name": "06 Skill Gap Analysis",
            "item": [
                make_request("Run Skill Gap Analysis", "POST", "/api/v1/skill-gap/analyze", auth_bearer=True, body={"role_id": 1}, test_script=status_201_test),
                make_request("Get Latest Skill Gap Analysis", "GET", "/api/v1/skill-gap/latest", auth_bearer=True, test_script=status_200_test)
            ]
        },
        {
            "name": "07 Personalization",
            "item": [
                make_request("Generate Personalized Recommendations", "POST", "/api/v1/personalization/analyze", auth_bearer=True, test_script=[
                    "pm.test('Status is 201 Created', function () { pm.response.to.have.status(201); });",
                    "var recs = pm.response.json();",
                    "if (recs && recs.length > 0) { pm.environment.set('recommendation_id', recs[0].id); }"
                ]),
                make_request("List Recommendations", "GET", "/api/v1/personalization/recommendations", auth_bearer=True, test_script=status_200_test),
                make_request("Get Single Recommendation", "GET", "/api/v1/personalization/recommendations/{{recommendation_id}}", auth_bearer=True, test_script=status_200_test)
            ]
        },
        {
            "name": "08 Roadmap",
            "item": [
                make_request("Generate Roadmap", "POST", "/api/v1/roadmap/generate", auth_bearer=True, body={"role_id": 1}, test_script=[
                    "pm.test('Status is 201 Created', function () { pm.response.to.have.status(201); });",
                    "var roadmap = pm.response.json();",
                    "if (roadmap) {",
                    "    pm.environment.set('roadmap_id', roadmap.id);",
                    "    if (roadmap.steps && roadmap.steps.length > 0) {",
                    "        pm.environment.set('step_id', roadmap.steps[0].id);",
                    "    }",
                    "}"
                ]),
                make_request("Get Current Roadmap", "GET", "/api/v1/roadmap/current", auth_bearer=True, test_script=status_200_test)
            ]
        },
        {
            "name": "09 Progress",
            "item": [
                make_request("List User Progress", "GET", "/api/v1/progress/me", auth_bearer=True, test_script=status_200_test),
                make_request("Get Progress for Roadmap", "GET", "/api/v1/progress/roadmap/{{roadmap_id}}", auth_bearer=True, test_script=status_200_test),
                make_request("Update Step Progress", "PUT", "/api/v1/progress/{{step_id}}", auth_bearer=True, body={"status": "completed"}, test_script=status_200_test)
            ]
        },
        {
            "name": "10 Dashboard",
            "item": [
                make_request("Get Dashboard Overview", "GET", "/api/v1/dashboard", auth_bearer=True, test_script=status_200_test)
            ]
        },
        {
            "name": "11 Conversations",
            "item": [
                make_request("Create Conversation", "POST", "/api/v1/conversations", auth_bearer=True, body={"title": "Career Coaching Strategy"}, test_script=[
                    "pm.test('Status is 201 Created', function () { pm.response.to.have.status(201); });",
                    "var conv = pm.response.json();",
                    "if (conv) { pm.environment.set('conversation_id', conv.id); }"
                ]),
                make_request("List Conversations", "GET", "/api/v1/conversations", auth_bearer=True, test_script=status_200_test),
                make_request("Get Conversation Detail", "GET", "/api/v1/conversations/{{conversation_id}}", auth_bearer=True, test_script=status_200_test),
                make_request("Add Message to Conversation", "POST", "/api/v1/conversations/{{conversation_id}}/messages", auth_bearer=True, body={"role": "user", "content": "How should I structure my learning journey?"}, test_script=status_201_test)
            ]
        },
        {
            "name": "12 AI Career Coach",
            "item": [
                make_request("AI Coach Chat", "POST", "/api/v1/coach/chat", auth_bearer=True, body={"conversation_id": 1, "message": "Give me guidance on mastering distributed systems architecture."}, test_script=[
                    "pm.test('Status is 200 OK', function () { pm.response.to.have.status(200); });",
                    "pm.test('Contains response content', function () { pm.expect(pm.response.json().response).to.be.a('string'); });"
                ])
            ]
        },
        {
            "name": "13 AI Intelligence",
            "item": [
                make_request("Career Intelligence Analysis", "POST", "/api/v1/intelligence/analyze", auth_bearer=True, body={"focus": "skills"}, test_script=status_200_test)
            ]
        },
        {
            "name": "14 Adaptive AI",
            "item": [
                make_request("Optimize Roadmap", "POST", "/api/v1/adaptive/roadmap-optimize", auth_bearer=True, test_script=status_200_test)
            ]
        },
        {
            "name": "15 AI Planner",
            "item": [
                make_request("Generate Weekly Learning Plan", "POST", "/api/v1/planner/weekly-plan", auth_bearer=True, test_script=status_200_test)
            ]
        },
        {
            "name": "16 AI Interview Coach",
            "item": [
                make_request("Prepare for Technical Interview", "POST", "/api/v1/interview/prepare", auth_bearer=True, test_script=status_200_test)
            ]
        }
    ]
}

with open(os.path.join(postman_dir, "DevPath_API.postman_collection.json"), "w", encoding="utf-8") as f:
    json.dump(collection, f, indent=2)

print("Generated Postman Collection and Environment in docs/postman successfully.")
