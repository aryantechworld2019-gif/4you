from typing import List
from bson import ObjectId
from datetime import datetime
from app.core.database import get_database
from app.schemas.task import TaskCreate
from app.schemas.user import UserCreate
from app.services.user_service import user_service


class TaskService:
    def __init__(self):
        self.collection = get_database()["tasks"]

    def create_task(self, task_data: TaskCreate) -> dict:
        """Create a new installation task and register the user"""
        # Create the customer user account
        user_data = UserCreate(
            mobile=task_data.mobile,
            name=task_data.name,
            password=task_data.initial_password,
            role="customer",
            address=task_data.address,
            plan=task_data.plan
        )

        try:
            user_service.create_user(user_data)
        except ValueError:
            # User already exists, that's okay
            pass

        task_dict = {
            "name": task_data.name,
            "mobile": task_data.mobile,
            "address": task_data.address,
            "plan": task_data.plan,
            "status": task_data.status,
            "created_at": datetime.utcnow()
        }

        result = self.collection.insert_one(task_dict)
        task_dict["_id"] = result.inserted_id
        return self._format_task(task_dict)

    def get_all_tasks(self) -> List[dict]:
        """Get all installation tasks"""
        tasks = self.collection.find()
        return [self._format_task(task) for task in tasks]

    def get_task_by_id(self, task_id: str) -> dict:
        """Get a task by ID"""
        try:
            task = self.collection.find_one({"_id": ObjectId(task_id)})
            return self._format_task(task) if task else None
        except:
            return None

    def update_task_status(self, task_id: str, status: str) -> dict:
        """Update task status"""
        try:
            result = self.collection.find_one_and_update(
                {"_id": ObjectId(task_id)},
                {"$set": {"status": status}},
                return_document=True
            )
            return self._format_task(result) if result else None
        except:
            return None

    def _format_task(self, task: dict) -> dict:
        """Format task document from MongoDB"""
        if not task:
            return None
        task["id"] = str(task["_id"])
        del task["_id"]
        return task


task_service = TaskService()
