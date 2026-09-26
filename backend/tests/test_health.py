from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200

def test_global_exception_handler(client):
    from app.main import app

    @app.get("/test-error")
    def test_error():
        raise RuntimeError("This is a test error")

    response = client.get("/test-error")

    assert response.status_code == 500
    assert response.json() == {
        "detail": "Internal server error"
    }