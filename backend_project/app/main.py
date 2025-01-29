import os
from dotenv import load_dotenv
# FastAPI main entry point
from fastapi import FastAPI
from app.database import connect_to_mongo
from app.routes.user_routes import router as user_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
load_dotenv()

# Connect to MongoDB when app starts
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

PORT = os.getenv("FRONTEND_PORT", "5173")  # Default to 5173 if not set

origins = [
    f"http://localhost:{PORT}",  
    f"http://127.0.0.1:{PORT}",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Origins allowed to make requests
    allow_credentials=True,
    allow_methods=["*"],    # Methods allowed (GET, POST, etc.)
    allow_headers=["*"],    # Headers allowed (Content-Type, Authorization, etc.)
)

# Add routes
app.include_router(user_router)
