import secrets

# Generate a random 32-byte hex string
secret_key = secrets.token_hex(32)
print(f"Your new SECRET_KEY: {secret_key}")

# Generate a JWT secret key
jwt_secret_key = secrets.token_hex(32)
print(f"Your new JWT_SECRET_KEY: {jwt_secret_key}")
