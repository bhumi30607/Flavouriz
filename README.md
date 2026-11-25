Flavouriz 🍲
Flavouriz is a community-driven recipe-sharing platform where users
can discover, publish, save, and review traditional and everyday
recipes. The goal is to make sharing food knowledge simple while helping
people explore recipes from different kitchens and cultures.
A place to discover, share, and preserve recipes.

✨ Features
User Features
- User authentication -- Register and log in securely.
- Explore recipes -- Browse recipes shared by the community.
- Search and filter -- Find recipes by name, category,
  ingredients, or other available filters.
- Recipe details -- View ingredients, preparation steps, cooking
  time, and recipe information.
- Create and manage recipes -- Add, edit, and delete your own
  recipes.
- Save favourites -- Keep recipes in a personal cookbook.
- Ratings and reviews -- Share feedback on recipes.
- User profiles -- View and manage profile information and
  published recipes.
Admin Features
- Admin dashboard -- Manage platform content and users.
- Content moderation -- Review reported or inappropriate recipes
  and comments.
- Category management -- Organise recipes into categories.
Feature availability depends on the current implementation.
🧰 Tech Stack
  Layer               Technology        Purpose
  Frontend            React.js          Component-based user interface
Build Tool          Vite              Development server and production builds
Styling             Tailwind CSS      Responsive styling and utility classes
Backend             Node.js           Server-side JavaScript runtime
API                 Express.js        REST API and routing
Database            MongoDB Atlas     Cloud-hosted NoSQL database
ODM                 Mongoose          MongoDB schemas and data operations
Authentication      JWT               Token-based authentication
Password Security   bcrypt            Password hashing
Image Storage       Cloudinary        Recipe and profile image hosting
API Testing         Postman           API development and testing
Version Control     Git & GitHub      Source control and collaboration
Deployment          Vercel / Render   Frontend and backend hosting
🏗️ Project Architecture
Flavouriz follows a client-server architecture:
1. React frontend displays the pages and collects user input.
2. Express backend exposes REST API endpoints and handles
   application logic.
3. MongoDB Atlas stores users, recipes, favourites, reviews,
   comments, and reports.
4. Cloudinary stores uploaded images and returns image URLs.
5. JWT and bcrypt support authentication and password security.
User
  |
  v
React + Vite + Tailwind CSS
  |
  | HTTP requests (REST API)
  v
Node.js + Express.js
  |
  +------> MongoDB Atlas (Mongoose)
  |
  +------> Cloudinary (image uploads)
  |
  v
JSON response
  |
  v
React UI update
📁 Suggested Project Structure
The following is a suggested structure for keeping the frontend and
backend organised. Adjust folder and file names to match your
repository.
flavouriz/
│
├── client/                         # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── hooks/
│       ├── services/               # API calls
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── server/                         # Node.js + Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
│
├── .gitignore
└── README.md
🚀 Getting Started
Prerequisites
Install the following before running the project:
- Node.js (LTS recommended)
- npm (included with Node.js)
- A MongoDB Atlas account
- A Cloudinary account if image uploads are
  enabled
- Git
1. Clone the repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd flavouriz
2. Set up the backend
cd server
npm install
Create a .env file inside the server directory:
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
Only add the Cloudinary variables if your backend uses Cloudinary.

Start the backend using the script configured in server/package.json.
For example:
npm run dev
If your project does not have a dev script, add or use the appropriate
script from its package.json.
3. Set up the frontend
Open another terminal:
cd client
npm install
Create a .env file inside the client directory:
VITE_API_BASE_URL=http://localhost:5000/api
Start the frontend:
npm run dev
Vite will print the local development URL in the terminal, usually
http://localhost:5173.
🔐 Environment Variables
Never commit .env files, database credentials, API keys, or JWT
secrets to GitHub.

  Variable                  Used in    Description
  PORT                    Backend    Port used by the Express server
MONGODB_URI             Backend    MongoDB Atlas connection string
JWT_SECRET              Backend    Secret used to sign and verify JWTs
CLIENT_URL              Backend    Frontend origin for CORS configuration
CLOUDINARY_CLOUD_NAME   Backend    Cloudinary cloud name
CLOUDINARY_API_KEY      Backend    Cloudinary API key
CLOUDINARY_API_SECRET   Backend    Cloudinary API secret
VITE_API_BASE_URL       Frontend   Base URL of the backend API

Use your actual variable names if they differ. Frontend variables
prefixed with VITE_ are exposed to the browser, so never put secrets
in them.
🗃️ Database Design
The following MongoDB collections are proposed for the platform:
  Collection                          Purpose
  users                             User accounts, profile details, and
roles

  recipes                           Recipe title, description,
ingredients, steps, images, and
author

  favorites                         Recipes saved by users

  reviews                           Ratings and written feedback

  comments                          User comments on recipes
reports                           Content reports submitted for
moderation
Relationships can be represented using MongoDB ObjectId references. For
example, each recipe can store the ID of the user who created it.
🔌 API Overview
These are suggested REST API routes. Update them to match the endpoints
implemented in your backend.

  Method   Endpoint                     Purpose
  POST     /api/auth/register         Register a user
POST     /api/auth/login            Log in a user
GET      /api/recipes               Get recipes
GET      /api/recipes/:id           Get one recipe
POST     /api/recipes               Create a recipe
PUT      /api/recipes/:id           Update a recipe
DELETE   /api/recipes/:id           Delete a recipe
GET      /api/users/:id             Get user profile
POST     /api/favorites/:recipeId   Save a favourite
DELETE   /api/favorites/:recipeId   Remove a favourite
POST     /api/recipes/:id/reviews   Add a review

Protected routes should verify the user's JWT. The backend should also
check resource ownership and user roles before allowing edits,
deletions, or admin actions.
🖥️ Main Application Pages
- Home -- Introduction, featured recipes, and discovery entry
  points.
- Explore Recipes -- Recipe browsing, search, and filters.
- Recipe Details -- Ingredients, instructions, images, ratings,
  and reviews.
- Login / Register -- User authentication.
- Create / Edit Recipe -- Recipe publishing and management.
- My Cookbook -- Saved favourite recipes.
- My Recipes -- Recipes published by the logged-in user.
- User Profile -- User details and published recipes.
- Admin Dashboard -- Moderation and platform management.
🧪 Testing
- Test API endpoints using Postman.
- Verify registration, login, and protected routes.
- Validate recipe creation, editing, and deletion.
- Test search, filters, favourites, and reviews.
- Check form validation and error handling.
- Test responsive layouts on mobile, tablet, and desktop.
- Confirm that secrets are stored in environment variables and not
  committed.
🌱 Future Enhancements
- Personalised recipe recommendations.
- Ingredient-based recipe discovery.
- Meal planning and weekly menus.
- Shopping lists generated from ingredients.
- Nutrition and dietary preference filters.
- Social sharing and community collections.
🤝 Contributing
Contributions and suggestions are welcome.
1. Fork the repository.
2. Create a feature branch:
   git checkout -b feature/your-feature-name
3. Commit your changes:
   git commit -m "Add: your feature description"
4. Push the branch:
   git push origin feature/your-feature-name
5. Open a Pull Request.
👥 Contributors
Add the names and GitHub profiles of your project team members here.
📄 License
Choose and add a license before distributing the project. For example,
you may use the MIT License by adding a LICENSE file to the
repository.
Flavouriz --- Discover recipes. Share traditions. Create memories.
