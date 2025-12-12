from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.services.user_service import user_service
from app.core.security import create_access_token
from app.core.config import settings
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        user = user_service.create_user(user_data)
        # Remove sensitive data
        user.pop("hashed_password", None)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    """Login user and return JWT token"""
    user = user_service.authenticate_user(
        login_data.mobile,
        login_data.password,
        login_data.role
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number, password, or role",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["mobile"], "role": user["role"]},
        expires_delta=access_token_expires
    )

    # Remove sensitive data
    user.pop("hashed_password", None)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    # Remove sensitive data
    current_user.pop("hashed_password", None)
    return current_user
