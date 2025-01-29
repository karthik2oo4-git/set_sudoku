from pydantic import BaseModel

class UserScore(BaseModel):
    playerName: str
    password:str
    score: int =0
    timeTaken: float=0.0
