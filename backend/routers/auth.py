from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas.auth import UserCreate, UserLogin, Token, UserResponse
from services.auth_service import register_user, authenticate_user, create_access_token, get_current_user
from models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    user = await register_user(
        db=db,
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        role=user_data.role,
    )

    access_token = create_access_token(data={"sub": user.username, "role": user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at,
        },
    }


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login and get JWT token."""
    user = await authenticate_user(db=db, username=user_data.username, password=user_data.password)

    access_token = create_access_token(data={"sub": user.username, "role": user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at,
        },
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "created_at": current_user.created_at,
    }
