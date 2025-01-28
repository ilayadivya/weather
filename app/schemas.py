from pydantic import BaseModel
from typing import Optional

class UserLogin(BaseModel):
    username: str
    password: str
    
# User schema
class UserCreate(BaseModel):
    username: str
    password: str


class User(BaseModel):
    id: int
    username: str
   

    class Config:
        orm_mode = True

class LocationBase(BaseModel):
    name: str

class LocationCreate(LocationBase):
    pass

class LocationUpdate(LocationBase):
    user_id: int

class Location(LocationBase):
    id: int
    user_id: int
    is_default: bool

    class Config:
        orm_mode = True