from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import User
from config import settings
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db


security = HTTPBearer()


def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_byte_enc = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_password_byte_enc)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_access_token(credentials.credentials)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


async def register_user(db: AsyncSession, username: str, email: str, password: str, role: str = "user") -> User:
    # Check if exists
    result = await db.execute(select(User).where(User.username == username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")

    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
        role=role,
    )
    db.add(user)
    await db.flush()
    return user


async def authenticate_user(db: AsyncSession, username: str, password: str) -> User:
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return user
