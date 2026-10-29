# AI-Powered Customer Relationship Management (CRM)

## Project Overview

The AI-Powered Customer Relationship Management (CRM) System is a full-stack web application designed to manage customer information while leveraging a custom Transformer-based AI model to generate intelligent customer summaries, predictions, and recommendations.

The project follows a modular architecture consisting of:

- React Frontend
- Flask Backend
- PostgreSQL Database
- Custom Transformer AI Module

---

# Features Completed

## Authentication

- JWT-based Login Authentication
- Protected API Routes
- Secure Token Management

---

## Dashboard

- Customer Statistics
- Dashboard API
- Summary Cards
- Responsive UI

---

## Customer Management

- Add Customer
- View Customer
- Edit Customer
- Delete Customer
- Search Customer
- Pagination
- Customer Details Page

---

## Backend APIs

Implemented REST APIs for

- User Login
- Dashboard
- Customer CRUD
- Customer Search

---

## Database

PostgreSQL Database

Current Tables

- Users
- Customers

Customer Information Stored

- Name
- Email
- Mobile
- Designation
- Company
- State
- Comments
- Summary
- Prediction
- Recommended Action
- Registration Status
- Gap Analysis
- Update Notes

---

## Transformer AI

Developed a custom Transformer architecture using PyTorch.

Modules implemented

- Encoder
- Decoder
- Multi Head Attention
- Positional Encoding
- Token Embedding
- Tokenizer
- Dataset Loader

---

## AI Training

Training data is loaded from Excel files.

Implemented

- Excel Loader
- Tokenizer
- Dataset
- DataLoader
- Training Loop
- Checkpoint Saving

Current Training Files

```
training_data/
    ForTraining.xlsx
    PredictionTraining.xlsx
```

---

## Checkpoints

Generated Models

```
checkpoints/

summarization_model.pt

prediction_model.pt

tokenizer.pkl
```

(Currently under development)

---

## Project Structure

```
CRM/

│

├── backend/

│ ├── routes/

│ ├── services/

│ ├── models/

│ ├── middleware/

│ ├── database/

│ ├── validators/

│ └── app.py

│

├── frontend/

│ ├── src/

│ ├── pages/

│ ├── api/

│ ├── components/

│ └── App.jsx

│

├── transformer/

│ ├── checkpoints/

│ ├── models/

│ ├── tasks/

│ ├── utils/

│ ├── training_data/

│ ├── config.py

│ └── run_project.py

│

└── README.md
```

---

# Technology Stack

## Frontend

- React
- Vite
- Axios
- React Router DOM
- React Bootstrap

---

## Backend

- Flask
- Flask-JWT-Extended
- Flask-SQLAlchemy
- Flask-CORS
- Flasgger

---

## Database

- PostgreSQL
- SQLAlchemy ORM

---

## AI

- PyTorch
- Custom Transformer
- Pandas
- OpenPyXL

---

## Development Tools

- VS Code
- Git
- Postman
- pgAdmin
- Chrome

---

# Current Functional Flow

```
User

↓

Login

↓

Dashboard

↓

Customer Module

↓

Add Customer

↓

Store Customer Data

↓

PostgreSQL
```

---

# AI Functional Flow (In Progress)

```
Customer Comments

↓

Transformer

↓

AI Summary

↓

Prediction

↓

Recommended Action

↓

Save to PostgreSQL

↓

Display in CRM
```

---

# Development Progress

| Module | Status |
|---------|--------|
| Project Setup | ✅ Completed |
| JWT Authentication | ✅ Completed |
| Dashboard | ✅ Completed |
| Customer CRUD | ✅ Completed |
| Customer Search | ✅ Completed |
| Pagination | ✅ Completed |
| Edit Customer | ✅ Completed |
| Delete Customer | ✅ Completed |
| PostgreSQL Integration | ✅ Completed |
| Transformer Architecture | ✅ Completed |
| Excel Dataset Loader | ✅ Completed |
| Tokenizer | ✅ Completed |
| Summarization Dataset | ✅ Completed |
| Prediction Dataset | ✅ Completed |
| Transformer Training | ✅ Completed |
| Checkpoint Generation | 🔄 In Progress |
| AI Summary Integration | 🔄 In Progress |
| AI Prediction Integration | 🔄 In Progress |
| AI Recommendation Engine | ⏳ Planned |
| Dashboard AI Widgets | ⏳ Planned |
| Excel Customer Import | ⏳ Planned |
| Export Reports | ⏳ Planned |
| Docker Deployment | ⏳ Planned |
| Cloud Deployment | ⏳ Planned |

---

# Running the Project

## Backend

```bash
cd backend

python app.py
```

Runs on

```
http://127.0.0.1:5000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Runs on

```
http://localhost:5173
```

---

## Transformer Training

Summarization

```bash
cd transformer

python run_project.py --task summarization
```

Prediction

```bash
python run_project.py --task prediction
```

---

# Future Enhancements

- Automatic AI Summary Generation
- Automatic Customer Prediction
- AI-Based Follow-up Recommendation
- Customer Excel Upload
- AI Dashboard
- Email Automation
- CRM Analytics
- Export to Excel/PDF
- Docker Support
- Cloud Deployment
- Role-Based Access Control
- Model Retraining Pipeline

---

# Author

**Chetan S**

Master of Computer Applications (MCA)

AI-Powered CRM using React, Flask, PostgreSQL, and Custom Transformer.

---

# License

This project is developed for learning, research, and demonstration purposes.