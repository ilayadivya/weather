from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint,Boolean
from sqlalchemy.orm import relationship
from database import Base

# User table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    password = Column(String(255))
    status = Column(String(20))
    locations = relationship("Location", back_populates="user")

# Location table
class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    is_default = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    __table_args__ = (UniqueConstraint('user_id', 'name', name='uix_user_location_name'),)

    user = relationship("User", back_populates="locations")
