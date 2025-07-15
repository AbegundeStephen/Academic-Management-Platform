# 🎓 Academic Management Platform (University CRM System)

A full-stack, dockerized University CRM system that simplifies academic workflows with **role-based dashboards**, **course lifecycle management**, **AI-powered features**, and **real-time tools** for students, lecturers, and admins.

---

## 🚀 Features

- 🔐 **JWT Authentication & RBAC**
  - Role-based login for Student, Lecturer, and Admin
  - Access-controlled dashboards using middleware

- 📚 **Course Management**
  - Lecturers: Create/update courses, upload syllabi (PDF/DOCX)
  - Students: Browse/enroll/drop courses
  - Admins: Approve enrollments, assign lecturers

- 📝 **Assignment Workflow**
  - Students submit assignments (file or text)
  - Lecturers grade submissions (0–100 scale)
  - System auto-calculates grades via weighted averages

- 🤖 **AI Assistant Integration**
  - `/ai/recommend`: Suggest courses based on interest
  - `/ai/syllabus`: Generate syllabus from topic
  - Powered by OpenAI or mocked locally

- 🐳 **Dockerized Architecture**
  - Containers: Frontend, Backend, PostgreSQL
  - One-command spin-up via `docker-compose`

- 🛠 **Bonus Features**
  - Real-time grade/enrollment notifications (WebSockets)
  - PDF Transcript Generator
  - (Optional) Plagiarism checker (mocked AI)

---

## 📁 Project Structure

