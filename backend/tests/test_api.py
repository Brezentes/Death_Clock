from datetime import date, timedelta
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_plan():
    response = client.post("/api/plan", json={"birth_date": "2000-01-01", "planning_age": 80})
    assert response.status_code == 200
    assert response.json()["target_date"] == "2080-01-01T00:00:00+00:00"


def test_leap_day():
    response = client.post("/api/plan", json={"birth_date": "2000-02-29", "planning_age": 81})
    assert response.json()["target_date"] == "2081-02-28T00:00:00+00:00"


def test_invalid_plans():
    for payload in [
        {"birth_date": str(date.today() + timedelta(days=2)), "planning_age": 80},
        {"birth_date": "2000-01-01", "planning_age": 1},
        {"birth_date": "2000-01-01", "planning_age": 121},
        {"birth_date": "2000-01-01", "planning_age": 80.5},
        {"birth_date": "not-a-date", "planning_age": 80},
    ]:
        assert client.post("/api/plan", json=payload).status_code == 422
