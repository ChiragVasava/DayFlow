# DayFlow HRMS - Resume Technical Analysis & Tech Stack Guide

This document identifies all technologies, frameworks, libraries, tools, database structures, and architecture patterns used in the DayFlow project, with resume recommendations and confidence ratings.

---

## 1. Programming Languages
*   **JavaScript (ES6+)**: Used for both frontend logic (React hooks, context, state) and backend runtime (Node.js, Express, database controllers).
*   **HTML5 / CSS3**: Used for structuring layouts, custom CSS animations, dashboard statistics cards, and media layout rules for printable payslips.
*   **NoSQL / MongoDB Query Language**: Used for writing Mongoose queries, updates, filters, and schema lookups.
*   **Shell Scripting (Bash / Batch)**: Simple orchestration scripts (`.bat` and `.sh` files) used for automating local workspace setup and startup.

---

## 2. Frontend
*   **Frameworks**: React.js (v18.2.0)
*   **Libraries**: 
    *   `react` / `react-dom`: Core virtual DOM rendering.
    *   `axios`: Promise-based HTTP client for browser-to-backend API communication.
    *   `date-fns`: Date parsing, formatting, and utilities.
*   **UI Frameworks**: Vanilla CSS (100% custom-written styles, layout flexboxes, grid interfaces, dashboard cards, and navigation animations).
*   **State Management**: React Context API (used inside `AuthContext.js` for user auth states) combined with React hooks (`useState`, `useEffect`).
*   **Routing**: React Router DOM (v6) (`BrowserRouter`, `Routes`, `Route`, `Navigate`, `useNavigate`, `useLocation` components).
*   **Forms**: Standard React Controlled Forms (state-bound inputs with form onSubmit handles).
*   **Validation**: Client-side data integrity checks (preventing empty submissions or matching passwords on the UI before making API calls).
*   **Charts**: Recharts (dynamic SVG analytics charts on the Admin Dashboard showing organizationheadcounts, leaves, and attendance distributions).
*   **Utilities**: 
    *   `react-hot-toast`: Dynamic notification system for success/error/warning alerts.
    *   `lucide-react`: Modern SVG icon pack.

---

## 3. Backend
*   **Frameworks**: Express.js (v4.18.2) running on Node.js.
*   **Authentication**: Token-based authentication using **JSON Web Tokens (JWT)**.
*   **Authorization**: Role-Based Access Control (RBAC) middleware verifying roles (`Admin`, `HR`, `Employee`) before executing controller logic.
*   **Validation**: `express-validator` (express request validation middleware).
*   **ORM / ODM**: Mongoose (v8.0.3) for model definitions, validation hooks, virtual queries, and schema population.
*   **File Upload**: Multer (v1.4.5) middleware utilized for parsing `multipart/form-data` and managing file disk storage during employee avatar uploads.
*   **Background Jobs**: None (no message queue system, but contains direct command-line automation scripts like `generatePayrolls.js`, `createAdmin.js`, and `addSampleAttendance.js`).
*   **Logging**: Standard system console logs for system tracking and Express error handling.
*   **Middleware**: 
    *   Custom authentication validation (`protect`, `authorize`).
    *   Cross-Origin Resource Sharing (`cors`).
    *   JSON body parser (`express.json()`).
    *   Static asset serving (`express.static()`) for profile photos.
    *   File parser (`multer`).
*   **API Framework**: Express Router (Modular routing design separating `/auth`, `/employees`, `/attendance`, `/leave`, and `/payroll` APIs).

---

## 4. Database
*   **Databases**: MongoDB (NoSQL Document Database).
*   **ORMs / ODMs**: Mongoose.
*   **Migration Tools**: None (handled using custom seeding scripts: `createAdmin.js` and `addSampleAttendance.js`).
*   **Database Drivers**: MongoDB Node.js native driver (used transitively through Mongoose).

---

## 5. AI
*   None. (This project does not include any AI SDKs, LLM connections, or vector databases).

---

## 6. Testing
*   None. (No automated unit, integration, or E2E tests are present in the active codebase).

---

## 7. DevOps
*   **CI/CD**: Git-based continuous deployment pipelines set up via Vercel (Frontend) and Render (Backend) to automatically rebuild and deploy code on pushes to the GitHub `main` branch.
*   **Build Tools**: `react-scripts` (Webpack / Babel engine wrapper under the hood), npm (Node Package Manager).
*   **Deployment**: Vercel configuration (`vercel.json` rewrite routing rules).

---

## 8. Cloud
*   **Vercel**: Hosts the React Single Page Application (SPA), handling static asset caching and rewrite routing.
*   **Render**: Hosts the Express/Node.js web service running continuous API instances.
*   **MongoDB Atlas**: Cloud DBaaS hosting the MongoDB cluster, replication, and collections.
*   **AWS EC2 & PM2**: Configured and documented as an alternative hosting environment using PM2 process managers to launch and keep Node processes alive.

---

## 9. APIs & Integrations
*   **Authentication**: Custom JSON Web Token-based API authorization endpoints.
*   **Third-party APIs**: None (100% custom-written API endpoints).
*   **Email**: Nodemailer (listed in backend `package.json` but is currently **inactive** and not used in the code).

---

## 10. Security
*   **JWT**: Tokens contain signed headers and payloads generated using custom `jsonwebtoken` secrets with validation.
*   **bcryptjs**: Salted one-way password hashing (used for database saves via Mongoose pre-save model hooks).
*   **CORS**: Cross-Origin Resource Sharing enabled on the Express backend to securely whitelist and allow requests from Vercel origins.
*   **Validation & Sanitization**: Enforced through Mongoose Schema validation (e.g. `trim: true`, `unique: true`) and Express Validator middleware to block invalid requests.

---

## 11. Architecture
*   **RESTful API Architecture**: Decoupled design where client communication is handled exclusively via JSON payloads over HTTP methods (GET, POST, PUT, DELETE).
*   **MVC Pattern (Model-View-Controller)**: Inspired structure with backend models defining Mongoose schemas, router modules acting as controllers, and React components representing the view layer.
*   **Monolithic Backend / Decoupled MERN Architecture**: All backend services run inside a single process, communicating with an independent, decoupled frontend.
*   **Role-Based Access Control (RBAC)**: Custom routing protection that dynamically evaluates authorization privileges.

---

## 12. Other Technologies
*   **Concurrently**: Used to run the backend nodemon process and frontend build server simultaneously.
*   **dotenv**: Node utility used to load environment variables.
*   **Git / GitHub**: Version control and deployment synchronization.

---

## 13. Resume Recommendation

### A. Core Tech Stack (Definite additions)
*These are technologies you interacted with, modified, configured, and tested locally/online.*
*   **React.js**
*   **Node.js & Express.js**
*   **MongoDB & Mongoose ODM**
*   **JavaScript (ES6+)**
*   **HTML5 & CSS3**
*   **RESTful APIs**
*   **JWT Authentication & bcryptjs**
*   **Axios**
*   **React Router**

### B. Mention only if you prepare/understand well
*These are tools in the project that you should only put on your resume if you can explain their concepts during an interview.*
*   **Recharts** (Be prepared to explain how you bind databases to dynamic chart interfaces).
*   **Multer** (Be prepared to explain how multipart/form-data works and how files are saved to disks or cloud buckets).
*   **Role-Based Access Control (RBAC)** (Be prepared to explain custom middleware authorization chains).
*   **Vercel & Render** (Be prepared to explain continuous deployment from Git hooks).
*   **AWS EC2 & PM2** (Be prepared to explain process management and cloud instance configuration).

### C. Do NOT include
*These are packages or directories that are auto-generated, inactive, or configuration-only.*
*   **Nodemailer** (It's in your `package.json`, but because it's completely unused, claiming it could backfire in an interview).
*   **Concurrently / Nodemon** (These are development tools, not core software engineering skills).
*   **npm / package-lock.json** (These are package managers, expected implicitly).

### D. Technologies recruiters expect you to know
*If they see this MERN project on your resume, recruiters will ask about or expect:*
*   **Git & GitHub** (Version control and branch management).
*   **Chrome DevTools / Network Tab** (Recruiters will expect you to know how to debug HTTP requests, payloads, cookies, and tokens).
*   **Database Normalization vs. Denormalization** (Expected when talking about MongoDB documents vs. relational databases).
*   **API Security** (Recruiters will expect you to explain how to secure REST APIs, such as sanitization and JWT verification).

---

## 14. Confidence Rating

*   **JavaScript (ES6+)**: **Advanced** (Deep usage across frontend state hooks, context handlers, routers, database controllers, and helper utilities).
*   **React.js**: **Advanced** (Heavy utilization of state, effects, context APIs, dynamic layouts, and custom routing configurations).
*   **Node.js / Express.js**: **Advanced** (Modular routes, custom validation chains, security handlers, file processors, and system initialization).
*   **MongoDB / Mongoose**: **Advanced** (Custom document schemas, database validation triggers, multi-collection referencing, and complex data calculations).
*   **HTML5 / CSS3**: **Advanced** (Vanilla CSS configurations, responsiveness, print media layouts for payslips, and customized input forms).
*   **JSON Web Tokens (JWT)**: **Advanced** (Auth verification, custom signature generation, secure header injection, and client interception).
*   **bcryptjs**: **Advanced** (One-way salted encryption hooks inside database model triggers).
*   **React Router DOM (v6)**: **Advanced** (Client-side routing, protected views using route guards, and history navigation).
*   **Axios**: **Advanced** (HTTP request wrappers, base URL fallbacks, self-healing path structures, and custom interceptors).
*   **Express Validator**: **Advanced** (Input sanitation, format checks, and request parameters verification).
*   **Recharts**: **Intermediate** (Chart rendering, data parsing, and mapping MERN collections to SVG visual graphs).
*   **Multer**: **Intermediate** (Disk storage file configuration, limits validation, and file path mappings).
*   **React Hot Toast / date-fns / Lucide React**: **Intermediate** (Layout alerts, icon selections, and clean date processing/parsing).
*   **CORS / dotenv**: **Configuration Only** (Basic setup for environment paths and cross-origin connections).
*   **Vercel / Render / MongoDB Atlas**: **Configuration Only** (Hosting set up via config scripts and online dashboards).
*   **AWS EC2 & PM2**: **Configuration Only** (Deployment setup via process orchestration files).
*   **Shell / Batch Scripting**: **Basic** (Simple batch scripts for installing packages and launching development nodes).
*   **Nodemailer**: **Configuration Only / Unused** (Inactive dependency).
