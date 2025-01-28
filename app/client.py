import requests

# Signup
response = requests.post("http://127.0.0.1:8000/signup/", json={"username": "test", "password": "12345", "status": "active"})
print("Signup response:", response.text)

# Login
# Example login request
login_response = requests.post("http://127.0.0.1:8000/login/", json={"username": "test", "password": "12345"})

print("Login response:", login_response.text)

import sys
sys.exit()

# Check if the login was successful and get the token
if login_response.status_code == 200:
    token = login_response.json().get("access_token")
    print("JWT Token:", token)
else:
    print("Login failed:", login_response.json())
    exit()



headers = {
    "Authorization": f"Bearer {token}"
}
# Get users
response = requests.get("http://127.0.0.1:8000/users/", headers=headers)
print("Users:", response.json())

# Change password
response = requests.put("http://127.0.0.1:8000/change_password/1?new_password=newpassword123", headers=headers)
print("Change password response:", response.json())

# Add location
response = requests.post("http://127.0.0.1:8000/locations/", json={"name": "New Location","user_id":1}, headers=headers)
print("Location added:", response.json())

response = requests.get("http://127.0.0.1:8000/locations/", headers=headers)
print(response.json())

# Delete location
response = requests.delete("http://127.0.0.1:8000/locations/1", headers=headers)
print("Location deleted:", response.json())

# Set default location
response = requests.put("http://127.0.0.1:8000/locations/3/set_default", headers=headers)
print("Set default location response:", response.json())
