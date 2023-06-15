import re
import hashlib 
import os 

def confirm_cidr(cidr):
    cidr_pattern = "^((1\d{2}|2[0-4]\d|25[0-5]|\d{1,2})\.){3}(1\d{2}|2[0-4]\d|25[0-5]|\d{1,2})(\/([0-9]|[1-2]\d|3[0-2]))$"

    match = re.search(cidr_pattern, cidr)
    if match:
        return True
    else:
        return False
    
def salt_password(pw):
    salt = os.getenv("SALT")
    # Appending the salt to the password
    salted_password = pw + salt
    # Hashing the salted password
    hashed_password = hashlib.sha256(salted_password.encode()).hexdigest()
    return hashed_password