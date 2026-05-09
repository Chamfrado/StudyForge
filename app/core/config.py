from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="StudyForge API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    app_debug: bool = Field(default=True, alias="APP_DEBUG")

    database_url: str = Field(alias="DATABASE_URL")

    jwt_secret_key: str = Field(alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(
        default=30,
        alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES",
    )
    ai_provider: str = Field(default="mock", alias="AI_PROVIDER")

    openai_compatible_api_key: str | None = Field(
        default=None,
        alias="OPENAI_COMPATIBLE_API_KEY",
    )
    
    openai_compatible_base_url: str = Field(
        default="https://api.groq.com/openai/v1",
        alias="OPENAI_COMPATIBLE_BASE_URL",
    )
    
    openai_compatible_model: str = Field(
        default="openai/gpt-oss-20b",
        alias="OPENAI_COMPATIBLE_MODEL",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()