from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Настройка CORS для связи с Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модель блока питания
class PowerSupply(BaseModel):
    id: str
    name: str
    max_ma: int

# Модель педали (соответствует твоему интерфейсу на фронте)
class Pedal(BaseModel):
    id: str
    name: str
    maDraw: int
    voltage: int
    color: str

# Общая модель запроса
class CalculationRequest(BaseModel):
    pedals: List[Pedal]
    power_supply: Optional[PowerSupply] = None

@app.get("/")
def home():
    return {"message": "Rig Builder API is active"}

@app.post("/calculate")
async def calculate_rig(request: CalculationRequest):
    # 1. Считаем суммарное потребление
    total_ma = sum(p.maDraw for p in request.pedals)
    
    # 2. Определяем лимит (берем из БП или 500mA по умолчанию)
    limit = request.power_supply.max_ma if request.power_supply else 500
    
    # 3. Проверка безопасности
    is_safe = total_ma <= limit
    
    return {
        "total_ma": total_ma,
        "limit": limit,
        "is_safe": is_safe,
        "status": "Safe" if is_safe else "Overload",
        "recommendation": f"Current draw {total_ma}mA is within {limit}mA limit." if is_safe 
                         else f"Warning! Total draw ({total_ma}mA) exceeds power supply limit ({limit}mA)."
    }