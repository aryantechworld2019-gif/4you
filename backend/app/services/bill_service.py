from typing import List
from bson import ObjectId
from datetime import datetime
from app.core.database import get_database
from app.schemas.bill import BillCreate


class BillService:
    def __init__(self):
        self.collection = get_database()["bills"]

    def create_bill(self, bill_data: BillCreate) -> dict:
        """Create a new bill"""
        bill_dict = {
            "user_id": bill_data.user_id,
            "month": bill_data.month,
            "amount": bill_data.amount,
            "due_date": bill_data.due_date,
            "status": bill_data.status,
            "pdf_filename": f"invoice_{bill_data.month.replace(' ', '_').lower()}.pdf",
            "created_at": datetime.utcnow()
        }

        result = self.collection.insert_one(bill_dict)
        bill_dict["_id"] = result.inserted_id
        return self._format_bill(bill_dict)

    def get_bills_by_user(self, user_id: str) -> List[dict]:
        """Get all bills for a user"""
        bills = self.collection.find({"user_id": user_id})
        return [self._format_bill(bill) for bill in bills]

    def get_bill_by_id(self, bill_id: str) -> dict:
        """Get a bill by ID"""
        try:
            bill = self.collection.find_one({"_id": ObjectId(bill_id)})
            return self._format_bill(bill) if bill else None
        except:
            return None

    def update_bill_status(self, bill_id: str, status: str) -> dict:
        """Update bill status"""
        try:
            result = self.collection.find_one_and_update(
                {"_id": ObjectId(bill_id)},
                {"$set": {"status": status}},
                return_document=True
            )
            return self._format_bill(result) if result else None
        except:
            return None

    def _format_bill(self, bill: dict) -> dict:
        """Format bill document from MongoDB"""
        if not bill:
            return None
        bill["id"] = str(bill["_id"])
        del bill["_id"]
        return bill


bill_service = BillService()
