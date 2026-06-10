# ── FILE: llm_pro/tests/test_serving.py ─────────────────────────────────
"""
Unit tests for the serving API.
"""

import pytest
from fastapi.testclient import TestClient
from serving.api_server import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "queue_depth": 0}
