# E-Commerce Landing Page

A modern, full-stack e-commerce landing page built with Next.js 16, React 19, MongoDB, and NextAuth.

## 🚀 Quick Start with Docker

### Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Git installed

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/gowtamkumar/eCommerce-multi-store-saasLanding-Page.git
cd eCommerce-multi-store-saasLanding-Page
```

### 2️⃣ Setup Environment

```bash
# Copy environment file
cp .env.dev.example .env

# (Optional) Edit .env to enable auto-seeding
# Change SEED_DB=false to SEED_DB=true for first run
```

### 3️⃣ Start Development Environment

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

This will:

- ✅ Build the application
- ✅ Start MongoDB database
- ✅ Start Next.js development server
- ✅ Automatically seed database (if `SEED_DB=true`)

### 4️⃣ Access Application

- **Application**: http://localhost:3001
- **MongoDB**: localhost:27018

### 5️⃣ Default Credentials

**Admin User:**

- Username: `admin`
- Password: `password123`

**Regular User:**

- Username: `johndoe`
- Password: `password123`

⚠️ **Change these in production!**

## 📦 Docker Commands

### View Logs

```bash
docker-compose -f docker-compose.dev.yml logs -f app
```

### Stop Application

```bash
docker-compose -f docker-compose.dev.yml down
```

### Restart Application

```bash
docker-compose -f docker-compose.dev.yml restart
```

### Manual Database Seeding

```bash
docker-compose -f docker-compose.dev.yml exec app node scripts/seed.js
```

### Access MongoDB Shell

```bash
docker-compose -f docker-compose.dev.yml exec mongodb mongosh -u admin -p adminpassword
```

### Rebuild After Code Changes

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

## 🛠️ Local Development (Without Docker)

### Prerequisites

- Node.js 20+ installed
- MongoDB installed and running

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Update MONGODB_URI in .env.local to your local MongoDB
# Example: MONGODB_URI=mongodb://localhost:27017/ecommerce

# Seed database
npm run seed

# Start development server
npm run dev
```

Access at http://localhost:3000

## 🚀 Production Deployment

### 1. Setup Environment

```bash
# Generate secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For MongoDB password

# Copy production environment template
cp .env.prod.example .env

# Edit .env with your generated secrets
```

### 2. Start Production

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. Seed Database

```bash
docker-compose -f docker-compose.prod.yml exec app node scripts/seed.js
```

## 🔐 Security

Before deploying to production:

- ✅ Change default credentials
- ✅ Generate strong `NEXTAUTH_SECRET`
- ✅ Use strong MongoDB password
- ✅ Configure SSL/TLS
- ✅ Update `NEXTAUTH_URL` to your domain

See `.gemini/antigravity/brain/.../security-audit.md` for detailed security guidelines.

## 📖 Features

### Public

- Dynamic product showcase
- Contact form
- FAQ section
- Customer testimonials
- Payment integration (SSLCommerz & COD)

### Admin

- Dashboard with analytics
- Product management
- Order management
- Customer management
- Content management (pages, FAQs, testimonials)
- Site settings

### User

- Registration & login
- Profile management
- Order placement
- Payment processing

## 🛡️ Authentication

- NextAuth with credentials provider
- Role-based access (admin/user)
- JWT sessions (24-hour expiration)
- Protected routes via middleware
- Bcrypt password hashing

## 🗄️ Database

- MongoDB 7.0
- Mongoose ODM
- Collections: Users, Products, Orders, Testimonials, FAQs, Pages, Settings

## 📁 Project Structure

```
├── app/                    # Next.js app router
├── components/             # React components
├── lib/                    # Utilities and configurations
├── models/                 # Mongoose models
├── contexts/               # React contexts
├── scripts/                # Database seeding scripts
├── public/                 # Static assets
├── docker-compose.dev.yml  # Development Docker config
├── docker-compose.prod.yml # Production Docker config
├── Dockerfile              # Production Dockerfile
└── Dockerfile.dev          # Development Dockerfile
```

## 🔧 Environment Variables

### Required

```env
NODE_ENV=development
MONGODB_URI=mongodb://admin:adminpassword@mongodb:27017/ecommerce_dev?authSource=admin
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
```

### Optional

```env
SEED_DB=true  # Auto-seed database on startup
```

## 🐛 Troubleshooting

### Port Already in Use

If port 3001 or 27018 is in use:

```bash
# Edit docker-compose.dev.yml
# Change ports:
#   - "3002:3000"  # For app
#   - "27019:27017" # For MongoDB
```

### Database Connection Failed

```bash
# Check MongoDB is running
docker-compose -f docker-compose.dev.yml ps

# Check logs
docker-compose -f docker-compose.dev.yml logs mongodb
```

### Application Won't Start

```bash
# Remove containers and volumes
docker-compose -f docker-compose.dev.yml down -v

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml up -d --build
```

## 📚 Documentation

Detailed documentation available in `.gemini/antigravity/brain/.../`:

- `README.md` - Complete application overview
- `docker-guide.md` - Comprehensive Docker guide
- `nextauth-guide.md` - Authentication setup
- `security-audit.md` - Security best practices
- `walkthrough.md` - Feature walkthrough

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Gowtam Kumar**

- GitHub: [@gowtamkumar](https://github.com/gowtamkumar)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database
- NextAuth for authentication
- All contributors and users
