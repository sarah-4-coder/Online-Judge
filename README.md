# 🚀 CodeVerdict - Online Judge & Coding Contest Platform

**CodeVerdict** is a full-featured online judge and coding contest platform built with the MERN stack. It allows users to solve coding problems, participate in contests, run code against test cases, and get real-time verdicts — all in a sleek, developer-friendly UI.

---

## 🌐 Live URL

* **Live Demo Video:** (https://www.loom.com/share/9414053dd4914aa7b3e14911a0bca1ec?sid=06af45bc-9e17-4a71-9829-c96809059c91)
* **Frontend:** [https://codeverdict.online](https://www.codeverdict.online)
* **Backend:** Hosted on AWS EC2 behind Nginx with Docker

---

## ✨ Features

### 🧑‍💻 User Functionality

* ✅ Register & login with JWT authentication (cookies)
* 💻 Solve coding problems with Monaco Editor
* 🧪 Run code on sample test cases before submission
* 🚀 Submit code and receive verdicts like `Accepted`, `Wrong Answer`, etc.
* 📜 View personal submission history and verdicts
* 🧠 Get AI assistance for explanation, hints, and debugging (planned)

### 🏆 Contest Functionality

* 🗓️ Join live or upcoming coding contests
* 🧩 Solve multiple problems within time-limited contests
* 🟢 Problems marked green if solved during the contest
* 📈 Real-time leaderboard and personal contest submissions

---

## 🛠️ Tech Stack

| Layer              | Tech                                      |
| ------------------ | ----------------------------------------- |
| Frontend           | React, Tailwind CSS, Monaco Editor, Axios |
| Backend            | Node.js, Express.js, JWT Auth, Mongoose   |
| Database           | MongoDB (Cloud-hosted via MongoDB Atlas)  |
| Deployment         | Docker, AWS EC2, Nginx, Certbot, Vercel   |
| Container Registry | AWS Elastic Container Registry (ECR)      |
| Code Execution     | Custom Docker-based Compiler Microservice |

---

## 🚀 Deployment Architecture

### Frontend (Vercel)

* Deployed on Vercel with GitHub integration for CI/CD
* Auto-build & deploy on each `main` branch push
* Served via Vercel CDN with auto HTTPS on `codeverdict.online`

### Backend (AWS EC2 + Docker + Nginx)

* Backend is containerized using **Docker**
* Docker images are stored in **AWS ECR**
* Deployed on **AWS EC2** behind **Nginx** reverse proxy
* HTTPS via **Let's Encrypt** + **Certbot**
* Backend URL: `https://backend.codeverdict.online` (proxied)

---

## 📁 Project Structure

```
CodeVerdict/
│
├── backend-api/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── compiler-backend/        # Separate microservice for code execution
│
├── frontend/ (React)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   └── vite.config.js
```

---

## 📦 Setup & Run Locally

### 🔐 Prerequisites

* Node.js + npm
* Docker
* MongoDB Atlas or local MongoDB
* AWS CLI (for ECR deployment)

### 🔧 Backend

```bash
cd backend-api
npm install
cp .env.example .env  # Set your DB URI, JWT secrets, etc.

# Run locally
npm run dev
```

### 🔧 Frontend

```bash
cd frontend
npm install
npm run dev
```

### 🐳 Dockerize & Deploy

```bash
# Build and push Docker image
docker build -t your-ecr-repo-url/backend-api .
docker push your-ecr-repo-url/backend-api

# On EC2 instance
docker pull your-ecr-repo-url/backend-api
docker run -d -p 8000:8000 --env-file .env your-ecr-repo-url/backend-api
```

---

## 🚪 Future Enhancements

* 🧠 AI-Powered Code Helper (Google Gemini / GPT)
* 👥 Admin Dashboard for managing problems and contests
* 🏁 Full-featured Leaderboard with tie-breaking
* 📊 User statistics and profile achievements
* 🌐 Social login and user avatars

---

## 📄 License

MIT License

---

## 🙌 Acknowledgements

* [Monaco Editor](https://microsoft.github.io/monaco-editor/)
* [Recharts](https://recharts.org/)
* [Vercel](https://vercel.com/)
* [AWS EC2](https://aws.amazon.com/ec2/)
* [Let's Encrypt](https://letsencrypt.org/)

---

## 🤝 Connect

> Created with 💻 and ☕ by [Sparsh Rai](https://github.com/sparsh-rai)

Feel free to ⭐️ the repo if you find it useful!


