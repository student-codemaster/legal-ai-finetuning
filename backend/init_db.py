# backend/init_db.py

from .database import SessionLocal, engine, Base, User, Law, AppSettings
from .auth import get_password_hash

def init_database():
    """Initialize database with default data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Create default admin user if not exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@legalsimplifier.com",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                is_admin=True
            )
            db.add(admin_user)
            print("√ Default admin user created: admin/admin123")

        # Add some sample laws
        sample_laws = [
            {"law_ref": "IPC Section 302", "description": "Punishment for murder", "category": "criminal"},
            {"law_ref": "IPC Section 420", "description": "Cheating and dishonestly inducing delivery of property", "category": "criminal"},
            {"law_ref": "CrPC Section 154", "description": "Information in cognizable cases", "category": "criminal"},
            {"law_ref": "Contract Act Section 10", "description": "What agreements are contracts", "category": "civil"},
        ]

        for law_data in sample_laws:
            existing_law = db.query(Law).filter(Law.law_ref == law_data["law_ref"]).first()
            if not existing_law:
                law = Law(**law_data)
                db.add(law)

        # Add default app settings
        default_settings = [
            {"setting_key": "MAX_FILE_SIZE_MB", "setting_value": "10", "description": "Maximum file upload size in MB"},
            {"setting_key": "ALLOWED_FILE_TYPES", "setting_value": "pdf,docx", "description": "Allowed file types for upload"},
            {"setting_key": "DEFAULT_LANGUAGE", "setting_value": "en_XX", "description": "Default language for processing"},
            {"setting_key": "ENABLE_USER_REGISTRATION", "setting_value": "true", "description": "Allow new user registration"},
        ]

        for setting_data in default_settings:
            existing_setting = db.query(AppSettings).filter(AppSettings.setting_key == setting_data["setting_key"]).first()
            if not existing_setting:
                setting = AppSettings(**setting_data)
                db.add(setting)

        db.commit()
        print("√ Database initialized successfully")
        
    except Exception as e:
        print(f"X Database initialization failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()