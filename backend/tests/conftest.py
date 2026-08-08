import os


os.environ["DATABASE_URL"] = "sqlite:///./test_devpath.db"
os.environ["JWT_SECRET"] = "test-only-secret-that-is-not-used-in-production"
os.environ["JWT_ALGORITHM"] = "HS256"
