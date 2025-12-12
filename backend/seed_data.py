"""
Seed script to populate the database with test data
Run this script after setting up MongoDB
"""
import sys
import os
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.core.database import connect_to_mongo, get_database
from app.core.security import get_password_hash


def seed_data():
    """Seed the database with test data"""
    print("🌱 Starting database seeding...")

    # Connect to MongoDB
    connect_to_mongo()
    db = get_database()

    # Clear existing data (optional - comment out if you want to keep existing data)
    print("🗑️  Clearing existing data...")
    db["users"].delete_many({})
    db["bills"].delete_many({})
    db["tasks"].delete_many({})

    # Create test users
    print("👤 Creating test users...")

    # Customer user
    customer_user = {
        "mobile": "9876543210",
        "name": "Rahul Sharma",
        "role": "customer",
        "hashed_password": get_password_hash("password"),
        "address": "Flat 402, Krishna Residency, Indiranagar, Bengaluru",
        "plan": "300 Mbps Fiber Blast",
        "created_at": datetime.utcnow()
    }
    customer_result = db["users"].insert_one(customer_user)
    customer_id = str(customer_result.inserted_id)
    print(f"✅ Created customer: {customer_user['name']} (mobile: {customer_user['mobile']}, password: password)")

    # Engineer user
    engineer_user = {
        "mobile": "8888888888",
        "name": "Tech Engineer",
        "role": "engineer",
        "hashed_password": get_password_hash("engineer"),
        "address": None,
        "plan": None,
        "created_at": datetime.utcnow()
    }
    db["users"].insert_one(engineer_user)
    print(f"✅ Created engineer: {engineer_user['name']} (mobile: {engineer_user['mobile']}, password: engineer)")

    # Create test bills for the customer
    print("💳 Creating test bills...")
    bills = [
        {
            "user_id": customer_id,
            "month": "November 2024",
            "amount": 1179.00,
            "due_date": "2024-12-05",
            "status": "Overdue",
            "pdf_filename": "invoice_november_2024.pdf",
            "created_at": datetime.utcnow()
        },
        {
            "user_id": customer_id,
            "month": "October 2024",
            "amount": 1179.00,
            "due_date": "2024-11-05",
            "status": "Paid",
            "pdf_filename": "invoice_october_2024.pdf",
            "created_at": datetime.utcnow()
        },
        {
            "user_id": customer_id,
            "month": "September 2024",
            "amount": 1179.00,
            "due_date": "2024-10-05",
            "status": "Paid",
            "pdf_filename": "invoice_september_2024.pdf",
            "created_at": datetime.utcnow()
        },
        {
            "user_id": customer_id,
            "month": "August 2024",
            "amount": 1179.00,
            "due_date": "2024-09-05",
            "status": "Paid",
            "pdf_filename": "invoice_august_2024.pdf",
            "created_at": datetime.utcnow()
        }
    ]
    db["bills"].insert_many(bills)
    print(f"✅ Created {len(bills)} bills for customer")

    # Create sample tasks (installations)
    print("📋 Creating sample installation tasks...")
    tasks = [
        {
            "name": "Priya Menon",
            "mobile": "9900112233",
            "address": "E-301, Prestige Towers, Whitefield, Bengaluru",
            "plan": "1 Gbps Premium",
            "status": "Pending Installation",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Vikram Singh",
            "mobile": "9988776655",
            "address": "House 12, Sector 7, HSR Layout, Bengaluru",
            "plan": "300 Mbps Fiber Blast",
            "status": "Installation Scheduled",
            "created_at": datetime.utcnow()
        }
    ]
    db["tasks"].insert_many(tasks)
    print(f"✅ Created {len(tasks)} installation tasks")

    print("\n🎉 Database seeding completed successfully!")
    print("\n📝 Test Credentials:")
    print("   Customer Login:")
    print("   - Mobile: 9876543210")
    print("   - Password: password")
    print("\n   Engineer Login:")
    print("   - Mobile: 8888888888")
    print("   - Password: engineer")
    print("\n🚀 You can now start the backend server!")


if __name__ == "__main__":
    seed_data()
