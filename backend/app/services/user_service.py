from typing import Optional
from bson import ObjectId
from datetime import datetime
from app.core.database import get_database
from app.core.security import get_password_hash, verify_password
from app.schemas.user import UserCreate


class UserService:
    @property
    def collection(self):
        """Get users collection from database"""
        return get_database()["users"]

    def create_user(self, user_data: UserCreate) -> dict:
        """Create a new user"""
        # Check if user already exists
        existing_user = self.collection.find_one({"mobile": user_data.mobile})
        if existing_user:
            raise ValueError("User with this mobile number already exists")

        user_dict = {
            "mobile": user_data.mobile,
            "name": user_data.name,
            "role": user_data.role,
            "hashed_password": get_password_hash(user_data.password),
            "address": user_data.address,
            "plan": user_data.plan,
            "created_at": datetime.utcnow()
        }

        result = self.collection.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        return self._format_user(user_dict)

    def get_user_by_mobile(self, mobile: str) -> Optional[dict]:
        """Get user by mobile number"""
        user = self.collection.find_one({"mobile": mobile})
        return self._format_user(user) if user else None

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID"""
        try:
            user = self.collection.find_one({"_id": ObjectId(user_id)})
            return self._format_user(user) if user else None
        except:
            return None

    def authenticate_user(self, mobile: str, password: str, role: str) -> Optional[dict]:
        """Authenticate user with mobile, password and role"""
        user = self.get_user_by_mobile(mobile)
        if not user:
            return None
        if user["role"] != role:
            return None
        if not verify_password(password, user["hashed_password"]):
            return None
        return user

    def _format_user(self, user: dict) -> dict:
        """Format user document from MongoDB"""
        if not user:
            return None
        user["id"] = str(user["_id"])
        del user["_id"]
        return user


user_service = UserService()
