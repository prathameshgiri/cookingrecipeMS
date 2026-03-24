# 🥘 Cooking Recipe Management System

## 📖 Description
This is a full-stack Cooking Recipe Management web application where users can explore authentic Indian recipes, read detailed step-by-step guides, submit interactive feedback for specific recipes, and contact the platform. Admins have a dedicated, secured portal to fully manage interactions, view incoming queries, and track recipe feedback.

## 🚀 Features
- **Browse Authentic Recipes:** Curated list of high-quality Indian recipes.
- **Detailed Instructions:** Step-by-step cooking process and dynamic ingredients list.
- **Live User Feedback:** Visitors can leave feedback and ratings instantly below each recipe.
- **Contact System:** A modern dual-card contact form for inquiries.
- **Secured Admin Dashboard:** Dedicated standalone Admin portal running on its own secured port.
- **Responsive UI:** Premium glassmorphism aesthetics, beautiful animations, and smooth scrolling.

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3 (Custom Variables, Animations), Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** JSON-based File Datastore (recipes, feedback, contacts)
- **Architecture:** Dual-Port Delivery (User App on 3000, Admin App on 3001)

## 📂 Project Structure
```text
/
├── data/
│   ├── recipes.json       # Pre-filled authentic recipes
│   ├── feedback.json      # User feedback store
│   └── contact.json       # Contact form submissions
├── public/
│   ├── index.html         # Main User Interface
│   ├── admin.html         # Admin Authentication & Dashboard
│   ├── css/style.css      # Core Stylesheet
│   └── js/
│       ├── main.js        # User interaction logic
│       └── admin.js       # Admin portal logic
└── server.js              # Express Backend Server setup
```

## ⚙️ Installation & Setup
1. **Clone the repository** (or download it directly)
2. **Install dependencies:**
   ```bash
   npm install express cors body-parser
   ```
3. **Start the servers:**
   ```bash
   node server.js
   ```
4. **Access the application:**
   - User Interface: Open `http://localhost:3000`
   - Admin Portal: Open `http://localhost:3001` *(Credentials: admin / admin123)*

## 🔐 Environment Variables
*(Currently configurable directly inside server.js)*
```env
USER_PORT=3000
ADMIN_PORT=3001
```

## 👨‍💻 Developer
- **Name:** Prathamesh Giri
- **Role:** Full Stack Developer
- **Skills:** Web Development, App Development, UI/UX Design

## 🎯 Developed For
This project was specifically developed for **Pallavi Yevale**.
- **Purpose:** Final Year College Project (BCA)
- Educational Purpose
- Real-world Practice

## 📞 Contact Information
- **Email:** contact@prathameshgiri.in
- **Phone:** +91 8698333062
- **Portfolio:** https://prathameshgiri.in

## 📜 License
This project is licensed under the MIT License.

## ⭐ Future Enhancements
- Integration with MongoDB / Firebase
- User Authentication (Login/Register for submitting recipes)
- AI-based Recipe Recommendation System
- Mobile App Version
