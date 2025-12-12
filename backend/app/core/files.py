import os
import shutil
from pathlib import Path
from fastapi import UploadFile
from datetime import datetime
import uuid


UPLOAD_DIR = Path("uploads")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB


def ensure_upload_dir():
    """Ensure upload directory exists"""
    UPLOAD_DIR.mkdir(exist_ok=True)
    (UPLOAD_DIR / "photos").mkdir(exist_ok=True)
    (UPLOAD_DIR / "documents").mkdir(exist_ok=True)


def validate_file(file: UploadFile) -> bool:
    """Validate file extension"""
    if not file.filename:
        return False
    ext = Path(file.filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS


def save_upload_file(file: UploadFile, subfolder: str) -> str:
    """
    Save uploaded file to disk

    Args:
        file: The uploaded file
        subfolder: Subfolder name (photos or documents)

    Returns:
        Relative path to saved file
    """
    ensure_upload_dir()

    if not validate_file(file):
        raise ValueError(f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    # Generate unique filename
    ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{ext}"

    # Create full path
    file_path = UPLOAD_DIR / subfolder / unique_filename

    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Return relative path
    return str(file_path)


def delete_file(file_path: str):
    """Delete a file from disk"""
    try:
        Path(file_path).unlink(missing_ok=True)
    except Exception:
        pass  # Ignore deletion errors
