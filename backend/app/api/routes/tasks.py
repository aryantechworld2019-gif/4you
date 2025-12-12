from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List, Optional
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.task_service import task_service
from app.api.dependencies import get_current_engineer
from app.core.files import save_upload_file

router = APIRouter()


@router.get("", response_model=List[TaskResponse])
async def get_tasks(current_user: dict = Depends(get_current_engineer)):
    """Get all installation tasks (Engineer only)"""
    tasks = task_service.get_all_tasks()
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    name: str = Form(...),
    mobile: str = Form(...),
    address: str = Form(...),
    plan: str = Form(...),
    initial_password: str = Form(...),
    status: str = Form("Pending Installation"),
    user_photo: Optional[UploadFile] = File(None),
    kyc_document: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_engineer)
):
    """Create a new installation task with file uploads (Engineer only)"""
    try:
        # Save uploaded files
        user_photo_path = None
        kyc_document_path = None

        if user_photo:
            user_photo_path = save_upload_file(user_photo, "photos")

        if kyc_document:
            kyc_document_path = save_upload_file(kyc_document, "documents")

        # Create task data
        task_data = TaskCreate(
            name=name,
            mobile=mobile,
            address=address,
            plan=plan,
            initial_password=initial_password,
            status=status
        )

        task = task_service.create_task(task_data, user_photo_path, kyc_document_path)
        return task
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: str,
    task_update: TaskUpdate,
    current_user: dict = Depends(get_current_engineer)
):
    """Update task status (Engineer only)"""
    task = task_service.get_task_by_id(task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    updated_task = task_service.update_task_status(task_id, task_update.status)
    return updated_task
