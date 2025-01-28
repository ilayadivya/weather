from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
from database import SessionLocal, engine
from models import User, Location, Base
import schemas
from typing import List
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
import http.client

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Secret key for JWT token encoding and decoding
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create database tables
Base.metadata.create_all(bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Utility function to hash passwords
def hash_password(password: str):
    return pwd_context.hash(password)

# Utility function to verify password hashes
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# Utility function to create JWT token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# OAuth2 password bearer (to extract the token from the Authorization header)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Dependency to get the current user from the JWT token
def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the token and extract the payload
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")  # 'sub' field is the username
        if username is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.get("/")
def print_helo():
    return {"message": "helo"}
# 1. Signup route
@app.post("/signup/", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = user.password
    new_user = User(username=user.username, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# 2. Login route with JWT token
@app.post("/login/")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # Query the database for a matching username and password
    db_user = db.query(User).filter(
        User.username == user.username,
        User.password == user.password
    ).first()

    # If no user is found, raise an exception
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Create a JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )

    # Return the token and username
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": db_user.username
    }

# 3. Get all users (protected route)
@app.get("/users/", response_model=List[schemas.User])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).all()

# 4. Change password route (protected route)
@app.put("/change_password/{user_id}")
def change_password(user_id: int, new_password: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to change this user's password")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return {"message": "Password updated successfully"}

# 5. Add a new location (protected route)
@app.post("/locations/", response_model=schemas.Location)
def add_location(location: schemas.LocationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing_location = db.query(Location).filter(Location.name == location.name, Location.user_id == current_user.id).first()
    if existing_location:
        raise HTTPException(status_code=400, detail="Location with this name already exists for the user")

    db_location = Location(name=location.name, user_id=current_user.id)
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

# 6. Delete a location (protected route)
@app.delete("/locations/{location_id}")
def delete_location(location_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    if location.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this location")
    
    db.delete(location)
    db.commit()
    return {"message": "Location deleted"}

# 7. Get all locations (protected route)
@app.get("/locations/", response_model=List[schemas.Location])
def get_all_locations(skip: int = 0, limit: int = 30, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    locations = db.query(Location).filter(Location.user_id == current_user.id).offset(skip).limit(limit).all()
    return locations

# 8. Set a location as the default (protected route)
@app.put("/locations/{location_id}/set_default")
def set_default_location(location_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    location = db.query(Location).filter(Location.id == location_id, Location.user_id == current_user.id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    # Unset default for other locations
    db.query(Location).filter(Location.user_id == current_user.id, Location.is_default == True).update({Location.is_default: False})

    # Set the selected location as default
    location.is_default = True
    db.commit()
    return {"message": f"Location {location.name} set as default"}
