import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.database import connect_to_mongo
from app.routes.user_routes import router as user_router

app = FastAPI()
load_dotenv()

# Connect to MongoDB when app starts
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

# Get frontend port for CORS (for frontend requests)
FRONTEND_PORT = os.getenv("FRONTEND_PORT", "5173")  # Default to 5173 if not set

origins = [
    f"http://localhost:{FRONTEND_PORT}",  
    f"http://127.0.0.1:{FRONTEND_PORT}",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allowed frontend origins
    allow_credentials=True,
    allow_methods=["*"],    
    allow_headers=["*"],    
)

@app.get("/")
async def root():
    return {"message": "FastAPI app is up and running!"}
# Add routes
app.include_router(user_router)

if __name__ == "__main__":
    # Get backend port assigned by Render (default to 8000 locally)
    backend_port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=backend_port)
