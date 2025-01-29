from fastapi import APIRouter, HTTPException
from app.schemas.user_schema import UserScore
from app.database import get_database
from bson import ObjectId

router = APIRouter(prefix="/scores", tags=["Scores"])


def serialize_user_score(user) -> dict:
    return {
        "id": str(user["_id"]),
        "playerName": user["playerName"],
        "score": user["score"],
        "timeTaken": user["timeTaken"],
    }



@router.get("/show_score/{playerName}")
async def show_score(playerName: str):
    db = get_database()
    collection = db["scores"]
    
    # Find user by playerName
    user = await collection.find_one({"playerName": playerName})
    
    # If user is found, return the score and timeTaken
    if user:
        return {
            "playerName": user["playerName"],
            "score": user["score"],
            "timeTaken": user["timeTaken"]
        }
    
    # If user not found, raise HTTP 404 error
    raise HTTPException(status_code=404, detail="Player not found.")


def serialize_score(score):
    """Convert MongoDB object to a serializable dictionary."""
    score["_id"] = str(score["_id"])
    return score

@router.get("/leaderboard")
async def get_leaderboard():
    db = get_database()
    collection = db["scores"]
    scores = await collection.find().sort("score", -1).to_list(10)  # Sort by score descending
    serialized_scores = [serialize_score(score) for score in scores]  # Serialize each score
    return serialized_scores

# @router.post("/add_user_score/")
# async def add_user_score(user_score: UserScore):
#     db = get_database()
#     collection = db["scores"]
#     # Check if playerName already exists
#     existing_user = await collection.find_one({"playerName": user_score.playerName})
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Player name already exists.")
    
#     # Insert new user score
#     user_dict = user_score.dict()
#     result = await collection.insert_one(user_dict)
#     return {"message": "User score added successfully", "id": str(result.inserted_id)}

# Route: Update user score and time
@router.put("/update_user_score/")
async def update_user_score(user : UserScore):
    db = get_database()
    collection = db["scores"]
    exuser = await collection.find_one({"playerName": user.playerName})
    if exuser:
        await collection.update_one(
            {"playerName": user.playerName},
            {"$set": {"score": user.score, "timeTaken": user.timeTaken}}
        )
        return {"message": "User score updated successfully"}
    raise HTTPException(status_code=404, detail="Player not found.")



# User signup
@router.post("/signup/")
async def signup(user: UserScore):
    db = get_database()
    collection = db["scores"]
    # Check if playerName already exists
    existing_user = await collection.find_one({"playerName": user.playerName})
    if existing_user:
        raise HTTPException(status_code=400, detail="Player name already exists.")
    
    # Insert user into the database
    user_dict = user.dict()
    await collection.insert_one(user_dict)
    return {"message": "User registered successfully"}

# User login
@router.post("/login/")
async def login(user: UserScore):
    db = get_database()
    collection = db["scores"]
    # Find user in the database
    existing_user = await collection.find_one({"playerName": user.playerName})
    if not existing_user:
        raise HTTPException(status_code=404, detail="Player not found.")
    
    # Verify password
    if user.password != existing_user["password"]:
        raise HTTPException(status_code=401, detail="Invalid password.")
    
    return {"message": f"Welcome, {user.playerName}!"}


# Route: Delete user by playerName
@router.delete("/delete_user_score/{playerName}")
async def delete_user_score(playerName: str):
    db = get_database()
    collection = db["scores"]
    result = await collection.delete_one({"playerName": playerName})
    if result.deleted_count:
        return {"message": "User deleted successfully"}
    raise HTTPException(status_code=404, detail="Player not found.")