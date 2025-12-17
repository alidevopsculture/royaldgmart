const cookieParser = require('cookie-parser');
const cors = require('cors');
const csrf = require('csurf');
const { loadSecrets } = require('./Config/secrets');

// Load secrets from AWS Secrets Manager in production
loadSecrets();

require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const connectDB = require("./db");

// Initialize secrets loading
if (process.env.NODE_ENV === 'production') {
  console.log('🔐 Production mode: AWS Secrets Manager enabled');
} else {
  console.log('🔧 Development mode: Using .env file');
}
const app = express();
const server = http.createServer(app);
const UserRoutes = require("./Routes/UserRoutes");
const productRoutes = require('./Routes/ProductRoutes')
const cartRoutes = require('./Routes/CartRoutes');
const guestCartRoutes = require('./Routes/GuestCartRoutes');
const wholesaleCartRoutes = require('./Routes/WholesaleCartRoutes');
const guestWholesaleCartRoutes = require('./Routes/GuestWholesaleCartRoutes');
const addressRoutes = require('./Routes/AddressRoutes');
const orderRoutes = require('./Routes/OrderRoutes');
const wholesaleOrderRoutes = require('./Routes/WholesaleOrderRoutes');
const dashboardRoutes = require('./Routes/DashboardRoutes');
const customerRoutes = require('./Routes/CustomerRoutes');
const notificationRoutes = require('./Routes/notificationRoutes');
const adminRoutes = require('./Routes/AdminRoutes');
const reviewRoutes = require('./Routes/ReviewRoutes');
const wholesaleSettingsRoutes = require('./Routes/WholesaleSettingsRoutes');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // In production, allow specific domains
        if (process.env.NODE_ENV === 'production') {
            const allowedOrigins = [
                'https://www.royaldgmart.com', 
                'https://royaldgmart.com',
                'http://www.royaldgmart.com', 
                'http://royaldgmart.com',
		'http://localhost:3000',
		'http://3.110.43.42:3000'
            ];
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            // Reject other origins in production
            return callback(new Error('Not allowed by CORS'), false);
        }
        
        // In development, allow all localhost variants
        if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0')) {
            return callback(null, true);
        }
        
        // Allow all origins in development
        return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Origin']
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use((req, res, next) => {	// <- Serves req time and cookies
	req.requestTime = new Date().toISOString();
	next();
});

app.use((req, res, next) => {
	res.setHeader('Content-Type', 'application/json');
	next();
});

app.use(express.json({ limit: '100mb' })); // <- Parses Json data
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // <- Parses URLencoded data

app.use(bodyParser.json());
app.use(cookieParser());

// Serve uploaded payment screenshots
app.use('/uploads/payment-screenshots', express.static(path.join(__dirname, '../uploads/payment-screenshots')));

// CSRF Protection (only in production)
// CSRF Protection (disabled for Docker deployment)
if (false) {
  const csrfProtection = csrf({ cookie: true });
  app.use(csrfProtection);

  // CSRF token endpoint
  app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });
}


connectDB();
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API',
      version: '1.0.0',
      description: 'Your API Description',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./Routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

require('./Config/passport')(app);

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(specs, { explorer: true }));


app.use('/api/users', UserRoutes);
app.use('/api/products', productRoutes)
app.use('/api/cart' , cartRoutes);
app.use('/api/guest-cart' , guestCartRoutes);
app.use('/api/wholesale-cart' , wholesaleCartRoutes);
app.use('/api/guest-wholesale-cart' , guestWholesaleCartRoutes);
app.use('/api/address' , addressRoutes);
app.use('/api/orders' , orderRoutes);
app.use('/api/wholesale-orders' , wholesaleOrderRoutes);
app.use('/api/dashboard' , dashboardRoutes);
app.use('/api/customers' , customerRoutes);
app.use('/api/notifications' , notificationRoutes);
app.use('/api/admin' , adminRoutes);
app.use('/api/reviews' , reviewRoutes);
app.use('/api/wholesale-settings' , wholesaleSettingsRoutes);



module.exports = app;
