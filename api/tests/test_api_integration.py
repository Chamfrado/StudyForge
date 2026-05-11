import uuid
from collections.abc import Callable
from typing import Any

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.anyio


async def test_health_check(client: AsyncClient) -> None:
    response = await client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "app": "StudyForge API Test",
        "environment": "test",
    }


async def test_cors_allows_local_frontend_origin(client: AsyncClient) -> None:
    response = await client.options(
        "/auth/login",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "POST" in response.headers["access-control-allow-methods"]


async def test_auth_register_login_and_me(
    client: AsyncClient,
    user_factory: Callable[[str], dict[str, str]],
) -> None:
    user = user_factory("ada")

    register_response = await client.post("/auth/register", json=user)
    assert register_response.status_code == 201
    assert register_response.json()["user"]["email"] == "ada@example.com"

    duplicate_response = await client.post("/auth/register", json=user)
    assert duplicate_response.status_code == 409

    bad_login_response = await client.post(
        "/auth/login",
        json={"email": user["email"], "password": "wrong-password"},
    )
    assert bad_login_response.status_code == 401

    login_response = await client.post(
        "/auth/login",
        json={"email": user["email"], "password": user["password"]},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["user"]["email"] == user["email"]


async def test_auth_rejects_missing_and_invalid_token(client: AsyncClient) -> None:
    missing_response = await client.get("/auth/me")
    assert missing_response.status_code == 401

    invalid_response = await client.get(
        "/auth/me",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert invalid_response.status_code == 401


async def test_subject_crud_and_user_isolation(
    client: AsyncClient,
    auth_headers: Callable[[str], Any],
) -> None:
    user_a_headers = await auth_headers("subject-a")
    user_b_headers = await auth_headers("subject-b")

    create_response = await client.post(
        "/subjects",
        headers=user_a_headers,
        json={"name": "Math", "description": "Algebra"},
    )
    assert create_response.status_code == 201
    subject = create_response.json()

    list_response = await client.get("/subjects", headers=user_a_headers)
    assert list_response.status_code == 200
    assert [item["id"] for item in list_response.json()["subjects"]] == [subject["id"]]

    get_response = await client.get(f"/subjects/{subject['id']}", headers=user_a_headers)
    assert get_response.status_code == 200

    isolated_get_response = await client.get(f"/subjects/{subject['id']}", headers=user_b_headers)
    assert isolated_get_response.status_code == 404

    update_response = await client.put(
        f"/subjects/{subject['id']}",
        headers=user_a_headers,
        json={"name": "Advanced Math", "description": "Linear algebra"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Advanced Math"

    delete_response = await client.delete(f"/subjects/{subject['id']}", headers=user_a_headers)
    assert delete_response.status_code == 204

    missing_response = await client.get(f"/subjects/{subject['id']}", headers=user_a_headers)
    assert missing_response.status_code == 404


async def test_material_uploads_and_validation_errors(
    client: AsyncClient,
    auth_headers: Callable[[str], Any],
    api_helpers: dict[str, Callable[..., Any]],
) -> None:
    user_a_headers = await auth_headers("material-a")
    user_b_headers = await auth_headers("material-b")
    subject = await api_helpers["create_subject"](user_a_headers)

    txt_material = await api_helpers["upload_material"](
        user_a_headers,
        subject["id"],
        filename="notes.txt",
        content=b"Plain text material",
    )
    assert txt_material["file_type"] == "txt"
    assert txt_material["extracted_text"] == "Plain text material"

    md_material = await api_helpers["upload_material"](
        user_a_headers,
        subject["id"],
        filename="notes.md",
        content=b"# Markdown material",
    )
    assert md_material["file_type"] == "md"

    list_response = await client.get("/materials", headers=user_a_headers)
    assert list_response.status_code == 200
    assert len(list_response.json()["materials"]) == 2

    isolated_upload_response = await client.post(
        "/materials/upload",
        headers=user_b_headers,
        data={"subject_id": subject["id"], "title": "Wrong owner"},
        files={"file": ("notes.txt", b"content", "text/plain")},
    )
    assert isolated_upload_response.status_code == 404

    unsupported_response = await client.post(
        "/materials/upload",
        headers=user_a_headers,
        data={"subject_id": subject["id"], "title": "Unsupported"},
        files={"file": ("malware.exe", b"content", "application/octet-stream")},
    )
    assert unsupported_response.status_code == 400

    empty_response = await client.post(
        "/materials/upload",
        headers=user_a_headers,
        data={"subject_id": subject["id"], "title": "Empty"},
        files={"file": ("empty.txt", b"", "text/plain")},
    )
    assert empty_response.status_code == 400

    invalid_utf8_response = await client.post(
        "/materials/upload",
        headers=user_a_headers,
        data={"subject_id": subject["id"], "title": "Invalid UTF-8"},
        files={"file": ("bad.txt", b"\xff\xfe\xfa", "text/plain")},
    )
    assert invalid_utf8_response.status_code == 400

    delete_response = await client.delete(
        f"/materials/{txt_material['id']}",
        headers=user_a_headers,
    )
    assert delete_response.status_code == 204

    missing_response = await client.get(f"/materials/{txt_material['id']}", headers=user_a_headers)
    assert missing_response.status_code == 404


async def test_mock_ai_generation_flashcards_quizzes_attempts_and_analytics(
    client: AsyncClient,
    auth_headers: Callable[[str], Any],
    api_helpers: dict[str, Callable[..., Any]],
) -> None:
    headers = await auth_headers("learning-flow")
    subject, material = await api_helpers["create_material_flow"](headers)

    empty_analytics_response = await client.get("/analytics/overview", headers=headers)
    assert empty_analytics_response.status_code == 200
    assert empty_analytics_response.json()["total_subjects"] == 1
    assert empty_analytics_response.json()["total_materials"] == 1
    assert empty_analytics_response.json()["total_flashcards"] == 0

    summary_response = await client.post(
        f"/ai/materials/{material['id']}/summary",
        headers=headers,
    )
    assert summary_response.status_code == 201
    assert "mock AI-generated summary" in summary_response.json()["content"]

    flashcards_response = await client.post(
        f"/ai/materials/{material['id']}/flashcards",
        headers=headers,
    )
    assert flashcards_response.status_code == 201
    flashcards = flashcards_response.json()["flashcards"]
    assert len(flashcards) == 3

    flashcard_list_response = await client.get("/flashcards", headers=headers)
    assert flashcard_list_response.status_code == 200
    assert len(flashcard_list_response.json()["flashcards"]) == 3

    flashcard_get_response = await client.get(f"/flashcards/{flashcards[0]['id']}", headers=headers)
    assert flashcard_get_response.status_code == 200

    csv_response = await client.get("/flashcards/export/csv", headers=headers)
    assert csv_response.status_code == 200
    assert csv_response.headers["content-type"].startswith("text/csv")
    assert "front,back,tags" in csv_response.text

    quiz_response = await client.post(f"/ai/materials/{material['id']}/quiz", headers=headers)
    assert quiz_response.status_code == 201
    quiz = quiz_response.json()
    assert len(quiz["questions"]) == 3

    quiz_list_response = await client.get("/quizzes", headers=headers)
    assert quiz_list_response.status_code == 200
    assert len(quiz_list_response.json()["quizzes"]) == 1

    quiz_get_response = await client.get(f"/quizzes/{quiz['id']}", headers=headers)
    assert quiz_get_response.status_code == 200

    empty_attempt_response = await client.post(
        f"/quizzes/{quiz['id']}/attempts",
        headers=headers,
        json={"answers": []},
    )
    assert empty_attempt_response.status_code == 400

    invalid_question_response = await client.post(
        f"/quizzes/{quiz['id']}/attempts",
        headers=headers,
        json={"answers": [{"question_id": str(uuid.uuid4()), "selected_answer": "A"}]},
    )
    assert invalid_question_response.status_code == 400

    answers = [
        {"question_id": quiz["questions"][0]["id"], "selected_answer": "A"},
        {"question_id": quiz["questions"][1]["id"], "selected_answer": "A"},
        {"question_id": quiz["questions"][2]["id"], "selected_answer": "A"},
    ]
    attempt_response = await client.post(
        f"/quizzes/{quiz['id']}/attempts",
        headers=headers,
        json={"answers": answers},
    )
    assert attempt_response.status_code == 201
    attempt = attempt_response.json()
    assert attempt["score"] == 2
    assert attempt["total_questions"] == 3
    assert attempt["percentage"] == 66.67

    attempt_list_response = await client.get(f"/quizzes/{quiz['id']}/attempts", headers=headers)
    assert attempt_list_response.status_code == 200
    assert len(attempt_list_response.json()["attempts"]) == 1

    overview_response = await client.get("/analytics/overview", headers=headers)
    assert overview_response.status_code == 200
    overview = overview_response.json()
    assert overview["total_subjects"] == 1
    assert overview["total_materials"] == 1
    assert overview["total_flashcards"] == 3
    assert overview["total_quizzes"] == 1
    assert overview["total_quiz_attempts"] == 1
    assert overview["average_quiz_score"] == 66.67
    assert overview["best_quiz_score"] == 66.67
    assert len(overview["latest_attempts"]) == 1

    subject_analytics_response = await client.get(
        f"/analytics/subjects/{subject['id']}",
        headers=headers,
    )
    assert subject_analytics_response.status_code == 200
    subject_analytics = subject_analytics_response.json()
    assert subject_analytics["subject_id"] == subject["id"]
    assert subject_analytics["total_flashcards"] == 3
    assert subject_analytics["total_quizzes"] == 1
    assert subject_analytics["total_quiz_attempts"] == 1

    flashcard_delete_response = await client.delete(
        f"/flashcards/{flashcards[0]['id']}",
        headers=headers,
    )
    assert flashcard_delete_response.status_code == 204

    deleted_flashcard_response = await client.get(
        f"/flashcards/{flashcards[0]['id']}",
        headers=headers,
    )
    assert deleted_flashcard_response.status_code == 404

    quiz_delete_response = await client.delete(f"/quizzes/{quiz['id']}", headers=headers)
    assert quiz_delete_response.status_code == 204

    deleted_quiz_response = await client.get(f"/quizzes/{quiz['id']}", headers=headers)
    assert deleted_quiz_response.status_code == 404


async def test_generated_resources_are_user_isolated(
    client: AsyncClient,
    auth_headers: Callable[[str], Any],
    api_helpers: dict[str, Callable[..., Any]],
) -> None:
    user_a_headers = await auth_headers("owner-a")
    user_b_headers = await auth_headers("owner-b")
    subject, material = await api_helpers["create_material_flow"](user_a_headers)

    flashcards_response = await client.post(
        f"/ai/materials/{material['id']}/flashcards",
        headers=user_a_headers,
    )
    assert flashcards_response.status_code == 201
    flashcard_id = flashcards_response.json()["flashcards"][0]["id"]

    quiz_response = await client.post(
        f"/ai/materials/{material['id']}/quiz",
        headers=user_a_headers,
    )
    assert quiz_response.status_code == 201
    quiz_id = quiz_response.json()["id"]

    assert (
        await client.post(f"/ai/materials/{material['id']}/summary", headers=user_b_headers)
    ).status_code == 404
    material_get_response = await client.get(
        f"/materials/{material['id']}",
        headers=user_b_headers,
    )
    assert material_get_response.status_code == 404
    assert (
        await client.get(f"/flashcards/{flashcard_id}", headers=user_b_headers)
    ).status_code == 404
    assert (await client.get(f"/quizzes/{quiz_id}", headers=user_b_headers)).status_code == 404
    assert (
        await client.get(f"/analytics/subjects/{subject['id']}", headers=user_b_headers)
    ).status_code == 404

    user_b_overview = await client.get("/analytics/overview", headers=user_b_headers)
    assert user_b_overview.status_code == 200
    assert user_b_overview.json()["total_subjects"] == 0
