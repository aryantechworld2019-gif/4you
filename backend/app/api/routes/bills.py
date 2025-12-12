from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.schemas.bill import BillResponse, BillCreate
from app.services.bill_service import bill_service
from app.api.dependencies import get_current_customer

router = APIRouter()


@router.get("", response_model=List[BillResponse])
async def get_bills(current_user: dict = Depends(get_current_customer)):
    """Get all bills for current customer"""
    bills = bill_service.get_bills_by_user(current_user["id"])
    return bills


@router.patch("/{bill_id}/pay", response_model=BillResponse)
async def pay_bill(bill_id: str, current_user: dict = Depends(get_current_customer)):
    """Pay a bill (mark as Paid)"""
    bill = bill_service.get_bill_by_id(bill_id)

    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found"
        )

    # Verify bill belongs to current user
    if bill["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pay this bill"
        )

    updated_bill = bill_service.update_bill_status(bill_id, "Paid")
    return updated_bill


@router.post("", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
async def create_bill(bill_data: BillCreate):
    """Create a new bill (for testing purposes)"""
    bill = bill_service.create_bill(bill_data)
    return bill
