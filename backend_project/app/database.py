# MongoDB connection setup
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URI, DB_NAME

mongo_client = None

async def connect_to_mongo():
    global mongo_client
    mongo_client = AsyncIOMotorClient(MONGO_URI)
    print("Connected to MongoDB!")

def get_database():
    return mongo_client[DB_NAME]
