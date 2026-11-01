# Student Task One: Centralized Academic Task & Deadline Management Platform

**Course Code:** MCA1005  
**Student Name:** Shimun Joshi  
**Institution:** Avantika University, Ujjain (School of Engineering)  

## Project Overview
Student Task One is a fully dynamic, multi-user web application where **any university student or faculty member can register, log in securely, create course-tagged academic tasks, and manage workflows across an interactive Kanban board**. 

## Features
- **Multi-User Authentication:** Secure registration and login supporting multiple student and faculty accounts.
- **Interactive Kanban Board:** Real-time task status tracking across *To Do*, *In Progress*, *Review*, and *Completed* columns with automated counter badges.
- **Coursework Management:** Filter tasks by course codes (MCA1005, MCA1002, etc.), priority levels, and due dates.
- **Robust Database & CI/CD:** Includes a 3NF normalized PostgreSQL schema (`database/schema.sql`) and automated GitHub Actions CI configuration.

## Local Execution Instructions
1. Extract this ZIP package.
2. Open your terminal inside `server/`.
3. Install dependencies and start the server:
   ```bash
   npm install
   npm start
   ```
4. Open your browser and navigate to `http://localhost:5000`. Register a new student account or log in with any email to test the live multi-user dashboard!
