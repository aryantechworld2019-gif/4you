from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token
from app.services.user_service import user_service
from app.schemas.user import TokenData

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise credentials_exception

    mobile: str = payload.get("sub")
    if mobile is None:
        raise credentials_exception

    user = user_service.get_user_by_mobile(mobile)
    if user is None:
        raise credentials_exception

    return user


async def get_current_customer(current_user: dict = Depends(get_current_user)) -> dict:
    """Get current customer user"""
    if current_user["role"] != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Customer role required."
        )
    return current_user


async def get_current_engineer(current_user: dict = Depends(get_current_user)) -> dict:
    """Get current engineer user"""
    if current_user["role"] != "engineer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Engineer role required."
        )
    return current_user
