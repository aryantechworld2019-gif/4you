from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.task_service import task_service
from app.api.dependencies import get_current_engineer

router = APIRouter()


@router.get("", response_model=List[TaskResponse])
async def get_tasks(current_user: dict = Depends(get_current_engineer)):
    """Get all installation tasks (Engineer only)"""
    tasks = task_service.get_all_tasks()
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskCreate, current_user: dict = Depends(get_current_engineer)):
    """Create a new installation task (Engineer only)"""
    try:
        task = task_service.create_task(task_data)
        return task
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
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
