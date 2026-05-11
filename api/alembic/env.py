from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context
from app.core.config import settings
from app.core.database import Base
from app.modules.flashcards.models import Flashcard  # noqa: F401
from app.modules.materials.models import Material  # noqa: F401
from app.modules.quizzes.models import Quiz, QuizAttempt, QuizQuestion  # noqa: F401
from app.modules.subjects.models import Subject  # noqa: F401
from app.modules.summaries.models import Summary  # noqa: F401
from app.modules.users.models import User  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_migration_database_url() -> str:
    """
    Alembic uses a sync database driver.
    The FastAPI app uses asyncpg, so we convert the URL for migrations.
    """
    return settings.database_url.replace(
        "postgresql+asyncpg",
        "postgresql+psycopg",
    )


def run_migrations_offline() -> None:
    url = get_migration_database_url()

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)

    if configuration is None:
        raise RuntimeError("Alembic configuration section was not found.")

    configuration["sqlalchemy.url"] = get_migration_database_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()