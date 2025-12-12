from pymongo import MongoClient
from pymongo.database import Database
from app.core.config import settings


class MongoDB:
    client: MongoClient = None
    db: Database = None


mongodb = MongoDB()


def connect_to_mongo():
    """Connect to MongoDB"""
    mongodb.client = MongoClient(settings.MONGODB_URL)
    mongodb.db = mongodb.client[settings.MONGODB_DB_NAME]
    print(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")


def close_mongo_connection():
    """Close MongoDB connection"""
    mongodb.client.close()
    print("❌ Closed MongoDB connection")


def get_database() -> Database:
    """Get MongoDB database instance"""
    return mongodb.db
