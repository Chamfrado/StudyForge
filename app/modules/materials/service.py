import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.materials.models import Material, MaterialStatus
from app.modules.subjects.models import Subject
from app.modules.users.models import User
from app.shared.text_extractor import SUPPORTED_EXTENSIONS, extract_text_from_file



ALLOWED_EXTENSIONS = SUPPORTED_EXTENSIONS
STORAGE_DIR = Path("storage/materials")


class MaterialService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upload_material(
        self,
        current_user: User,
        subject_id: uuid.UUID,
        title: str,
        file: UploadFile,
    ) -> Material:
        subject = await self.db.scalar(
            select(Subject).where(
                Subject.id == subject_id,
                Subject.user_id == current_user.id,
            )
        )

        if subject is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found.",
            )

        original_filename = file.filename or "unnamed-file"
        file_extension = Path(original_filename).suffix.lower()

        if file_extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only .txt, .md, .pdf and .docx files are supported.",
            )

        raw_content = await file.read()

        extracted_text = extract_text_from_file(
            filename=original_filename,
            raw_content=raw_content,
        )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty.",
            )

        STORAGE_DIR.mkdir(parents=True, exist_ok=True)

        material_id = uuid.uuid4()
        safe_filename = f"{material_id}{file_extension}"
        storage_path = STORAGE_DIR / safe_filename

        storage_path.write_bytes(raw_content)

        material = Material(
            id=material_id,
            user_id=current_user.id,
            subject_id=subject.id,
            title=title,
            file_type=file_extension.replace(".", ""),
            original_filename=original_filename,
            storage_path=str(storage_path),
            extracted_text=extracted_text,
            status=MaterialStatus.READY.value,
        )

        self.db.add(material)
        await self.db.commit()
        await self.db.refresh(material)

        return material

    async def list_materials(self, current_user: User) -> list[Material]:
        result = await self.db.scalars(
            select(Material)
            .where(Material.user_id == current_user.id)
            .order_by(Material.created_at.desc())
        )

        return list(result)

    async def get_material(
        self,
        current_user: User,
        material_id: uuid.UUID,
    ) -> Material:
        material = await self.db.scalar(
            select(Material).where(
                Material.id == material_id,
                Material.user_id == current_user.id,
            )
        )

        if material is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Material not found.",
            )

        return material

    async def delete_material(
        self,
        current_user: User,
        material_id: uuid.UUID,
    ) -> None:
        material = await self.get_material(current_user, material_id)

        path = Path(material.storage_path)

        if path.exists():
            path.unlink()

        await self.db.delete(material)
        await self.db.commit()