import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

print('GET /')
r = client.get('/')
print(r.status_code, r.json())

print('\nGET /admin/laws')
r = client.get('/admin/laws')
print(r.status_code, len(r.json()))

# Register a test user
username = 'smoketestuser'
print('\nPOST /register')
r = client.post('/register', data={'username': username, 'email': username+'@example.com', 'password': 'testpass'})
print(r.status_code, r.json())

# Login
print('\nPOST /login')
r = client.post('/login', data={'username': username, 'password': 'testpass'})
print(r.status_code, r.json())

token = r.json().get('access_token')
headers = {'Authorization': f'Bearer {token}'}

# GET profile
print('\nGET /user/profile')
r = client.get('/user/profile', headers=headers)
print(r.status_code, r.json())

# GET user queries (should be empty)
print('\nGET /user/queries')
r = client.get('/user/queries', headers=headers)
print(r.status_code, r.json())

# Submit feedback (expect 404 because query id likely doesn't exist)
print('\nPOST /user/feedback (expected 404)')
r = client.post('/user/feedback', headers=headers, json={'query_id': 9999, 'rating': 4, 'feedback_text': 'test'})
print(r.status_code, r.text)
