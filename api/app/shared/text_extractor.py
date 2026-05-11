from io import BytesIO
from pathlib import Path

from docx import Document
from fastapi import HTTPException, status
from pypdf import PdfReader


SUPPORTED_EXTENSIONS = {".txt", ".md", ".pdf", ".docx"}


def extract_text_from_file(filename: str, raw_content: bytes) -> str:
    extension = Path(filename).suffix.lower()

    if extension in {".txt", ".md"}:
        return _extract_text_file(raw_content)

    if extension == ".pdf":
        return _extract_pdf_text(raw_content)

    if extension == ".docx":
        return _extract_docx_text(raw_content)

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported file type. Supported types: .txt, .md, .pdf, .docx.",
    )


def _extract_text_file(raw_content: bytes) -> str:
    try:
        return raw_content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text file must be encoded in UTF-8.",
        ) from None


def _extract_pdf_text(raw_content: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(raw_content))

        pages_text = []

        for page in reader.pages:
            page_text = page.extract_text() or ""
            pages_text.append(page_text)

        return "\n\n".join(pages_text)

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not extract text from PDF: {str(exc)}",
        ) from exc


def _extract_docx_text(raw_content: bytes) -> str:
    try:
        document = Document(BytesIO(raw_content))

        paragraphs = [
            paragraph.text.strip()
            for paragraph in document.paragraphs
            if paragraph.text.strip()
        ]

        return "\n\n".join(paragraphs)

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not extract text from DOCX: {str(exc)}",
        ) from exc