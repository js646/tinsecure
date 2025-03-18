# Tinsecure - Capture The Flag Web Application  

**Tinsecure** is a deliberately vulnerable web application designed for practicing web penetration testing techniques.
It includes a web frontend and an Express.js server, focusing on common web exploits.  

## ⚠️ Vulnerabilities included:

<details>
  <summary>Spoiler-Protection: Click to reveal vulnerabilities</summary>

- **XSS in Chat Function**: JavaScript inputs are not sanitized, allowing cross-site scripting (XSS) attacks.  
- **Access to All User Profile Pictures**: By incrementing the number in the image URL, all profile pictures can be accessed.  
- **SQL Injection in Login**: The login query can be bypassed using SQL injection.  
- **Reading Chats of Any Users**: Manipulating the chat window URL allows access to conversations between arbitrary users.  
- **Weak Password Reset Mechanism**: Passwords can be reset if the email and security question answer are known.  
- **Leak of Admin Password Hash**: The email and SHA-1 hash of the admin password are exposed at a specific URL.  

</details>  

## 🚀 Getting Started  

Clone the repository, install dependencies, and start hacking:  

```sh
git clone https://github.com/your-repo/tinsecure.git  
cd tinsecure  
npm install  
npm start  
```

## Disclaimer
This project is intended for educational and security research purposes only. Test responsibly and only in authorized environments.

Happy Hacking! 🔥
