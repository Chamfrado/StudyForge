import os
from collections.abc import AsyncGenerator, Callable
from typing import Any

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

os.environ["APP_NAME"] = "StudyForge API Test"
os.environ["APP_ENV"] = "test"
os.environ["APP_DEBUG"] = "false"
os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://studyforge:studyforge@localhost:5434/studyforge_test",
)
os.environ["JWT_SECRET_KEY"] = "test-secret-key"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["JWT_ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"
os.environ["AI_PROVIDER"] = "mock"
os.environ["OPENAI_COMPATIBLE_API_KEY"] = ""

import app.modules.materials.service as material_service  # noqa: E402
from app.core.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.modules.flashcards.models import Flashcard  # noqa: E402, F401
from app.modules.materials.models import Material  # noqa: E402, F401
from app.modules.quizzes.models import Quiz, QuizAttempt, QuizQuestion  # noqa: E402, F401
from app.modules.subjects.models import Subject  # noqa: E402, F401
from app.modules.summaries.models import Summary  # noqa: E402, F401
from app.modules.users.models import User  # noqa: E402, F401


@pytest.fixture(scope="session")
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture(scope="session")
def test_database_url() -> str:
    return os.environ["DATABASE_URL"]


@pytest.fixture(scope="session")
async def test_engine(test_database_url: str) -> AsyncGenerator[Any, None]:
    engine = create_async_engine(test_database_url, echo=False)
    yield engine
    await engine.dispose()


@pytest.fixture
async def db_session_factory(
    test_engine: Any,
) -> AsyncGenerator[async_sessionmaker[AsyncSession], None]:
    async with test_engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    yield session_factory

    async with test_engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)


@pytest.fixture(autouse=True)
def isolated_material_storage(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(material_service, "STORAGE_DIR", material_service.STORAGE_DIR / "tests")


@pytest.fixture
async def client(
    db_session_factory: async_sessionmaker[AsyncSession],
) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with db_session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def user_factory() -> Callable[[str], dict[str, str]]:
    def make_user(prefix: str) -> dict[str, str]:
        return {
            "full_name": f"{prefix.title()} User",
            "email": f"{prefix}@example.com",
            "password": "strongpassword",
        }

    return make_user


@pytest.fixture
async def auth_headers(
    client: AsyncClient,
    user_factory: Callable[[str], dict[str, str]],
) -> Callable[[str], Any]:
    async def make_headers(prefix: str = "user") -> dict[str, str]:
        user = user_factory(prefix)
        register_response = await client.post("/auth/register", json=user)
        assert register_response.status_code == 201

        login_response = await client.post(
            "/auth/login",
            json={"email": user["email"], "password": user["password"]},
        )
        assert login_response.status_code == 200

        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    return make_headers


@pytest.fixture
def api_helpers(client: AsyncClient) -> dict[str, Callable[..., Any]]:
    async def create_subject(headers: dict[str, str], name: str = "Biology") -> dict[str, Any]:
        response = await client.post(
            "/subjects",
            headers=headers,
            json={"name": name, "description": "Study notes"},
        )
        assert response.status_code == 201
        return response.json()

    async def upload_material(
        headers: dict[str, str],
        subject_id: str,
        filename: str = "notes.txt",
        content: bytes = b"Cells contain organelles and genetic material.",
        title: str = "Cell Notes",
    ) -> dict[str, Any]:
        response = await client.post(
            "/materials/upload",
            headers=headers,
            data={"subject_id": subject_id, "title": title},
            files={"file": (filename, content, "text/plain")},
        )
        assert response.status_code == 201
        return response.json()

    async def create_material_flow(
        headers: dict[str, str],
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        subject = await create_subject(headers)
        material = await upload_material(headers, subject["id"])
        return subject, material

    return {
        "create_subject": create_subject,
        "upload_material": upload_material,
        "create_material_flow": create_material_flow,
    }
