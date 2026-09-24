from sqlalchemy import create_engine

from app.config import settings
from app.models import Base


engine = create_engine(settings.database_url)

def create_tables():
    Base.metadata.create_all(bind=engine)