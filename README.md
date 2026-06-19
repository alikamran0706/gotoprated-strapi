✈️ Go top Rated – Strapi Backend

Go top Rated is a Strapi-powered backend designed to manage travel, accommodation, and pilgrimage-related content with a structured and scalable API.

📖 Read More — Go top Rated

Go top Rated enables administrators to manage accommodations, quality ratings (1–7 star system), travel packages, and other pilgrimage services efficiently using Strapi’s headless CMS.

Built for flexibility and growth, Go top Rated integrates seamlessly with modern frontend frameworks and supports secure, role-based content management.

🧰 Requirements

Make sure you have the following installed:

Node.js ≥ 20.x (LTS recommended)

npm / yarn / pnpm

Database (one of the following):

SQLite (default, for development)

PostgreSQL (recommended for production)

MySQL / MariaDB

Check versions:

node -v
npm -v

📦 Installation
1️⃣ Clone the repository
git clone https://github.com/alikamran0706/flykaaba-strapi
cd fly-kaaba

2️⃣ Install dependencies
npm install
# or
yarn install
# or
pnpm install

⚙️ Environment Setup

Create an environment file:

cp .env.example .env


Update values such as:

Database credentials

App keys

API URL

Admin JWT secret

Example:

HOST=0.0.0.0
PORT=1337
APP_KEYS=your_app_keys
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret

🚀 Running the Project
Development mode (with auto-reload)
npm run develop
# or
yarn develop


Admin panel:

http://localhost:1337/admin

Production mode
npm run build
npm run start

🏗 Build Admin Panel
npm run build
# or
yarn build