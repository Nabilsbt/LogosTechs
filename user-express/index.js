require('dotenv').config();
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const fetch = require('node-fetch');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const Review = require('./models/Review');
const Appointment = require('./models/Appointment');

const app = express();
const memoryStore = new session.MemoryStore();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare';
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for videos and audio
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') ||
        file.mimetype.startsWith('video/') ||
        file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image, video, and audio files are allowed!'), false);
    }
  },
});

// Cloudinary upload helper function
async function uploadImageToCloudinary(buffer, folder = 'users') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: folder,
        transformation: [
          { width: 500, height: 500, crop: 'fill' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    ).end(buffer);
  });
}

// Delete image from Cloudinary
async function deleteImageFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
}

// CORS middleware for cross-origin requests
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   if (req.method === 'OPTIONS') {
//     res.sendStatus(200);
//   } else {
//     next();
//   }
// });

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(express.json());
app.use(
  session({
    secret: 'some-secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔍 Google OAuth Profile:', {
      id: profile.id,
      displayName: profile.displayName,
      emails: profile.emails,
      name: profile.name
    });

    // Extract user info from Google profile
    const email = profile.emails[0]?.value;
    const firstName = profile.name?.givenName || extractFirstNameFromEmail(email);
    const lastName = profile.name?.familyName || extractLastNameFromEmail(email);
   
    if (!email) {
      return done(new Error('No email found in Google profile'), null);
    }

    // Check if user already exists in Keycloak or create new one
    const user = await handleGoogleUser(email, firstName, lastName, profile);
   
    return done(null, user);
  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    return done(error, null);
  }
}));

// Keycloak middleware
const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM,
  'auth-server-url': process.env.KEYCLOAK_SERVER_URL,
  'ssl-required': 'external',
  resource: process.env.KEYCLOAK_CLIENT_ID,
  credentials: { secret: process.env.KEYCLOAK_CLIENT_SECRET },
  'confidential-port': 0,
  'bearer-only': false,
};
const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

// ========================================
//           GOOGLE OAUTH ROUTES (BEFORE KEYCLOAK MIDDLEWARE)
// ========================================

// Start Google OAuth flow
app.get('/auth/google', (req, res, next) => {
  console.log('🔍 Google OAuth route called - ROUTE HANDLER STARTED');
  next();
}, passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_ERROR_URL || 'http://localhost:4200/auth/error'
  }),
  async (req, res) => {
    try {
      console.log('✅ Google OAuth successful:', req.user);
     
      // Get user roles from Keycloak to determine redirect
      let userRoles = [];
      try {
        await ensureAdminAuth();
        if (adminReady && kcAdminClient) {
          const roleMapping = await kcAdminClient.users.listRealmRoleMappings({
            id: req.user.keycloakId
          });
          userRoles = roleMapping.map(role => role.name);
          console.log(`🔍 User roles for redirection: ${userRoles.join(', ')}`);
        }
      } catch (roleError) {
        console.error('⚠️ Could not fetch user roles, defaulting to visitor redirect:', roleError);
        userRoles = ['visitor']; // Default fallback
      }
     
      // Determine redirect URL based on user role
      let redirectUrl;
      if (userRoles.includes('admin')) {
        // Admin users go to dashboard
        redirectUrl = 'http://localhost:4200/dashboard';
        console.log('🔄 Redirecting admin user to dashboard');
      } else {
        // Visitors go to front page
        redirectUrl = 'http://localhost:4200';
        console.log('🔄 Redirecting visitor user to front page');
      }
     
      // Add user info as query parameters for the frontend
      const finalUrl = new URL(redirectUrl);
      finalUrl.searchParams.append('googleAuth', 'true');
      finalUrl.searchParams.append('user', JSON.stringify({
        keycloakId: req.user.keycloakId,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        isNewUser: req.user.isNewUser,
        roles: userRoles,
        photoUrl: req.user.photoUrl || null,
        photoPublicId: req.user.photoPublicId || null
      }));
     
      res.redirect(finalUrl.toString());
    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      res.redirect(process.env.FRONTEND_ERROR_URL || 'http://localhost:4200/auth/error');
    }
  }
);

// Google OAuth logout
app.post('/auth/google/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('❌ Session destruction error:', sessionErr);
        return res.status(500).json({ error: 'Session cleanup failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Get current Google OAuth user info
app.get('/auth/google/user', (req, res) => {
  if (req.user) {
    res.json({
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      authenticated: false,
      user: null
    });
  }
});

// Apply Keycloak middleware AFTER Google OAuth routes
app.use(keycloak.middleware());

let kcAdminClient;
let adminReady = false;
let lastAuthTime = 0;
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // Refresh token every 4 minutes (Keycloak default is 5 min)

// Initialize Keycloak Admin Client dynamically
async function initKeycloakAdmin() {
  const { default: KcAdminClient } = await import('@keycloak/keycloak-admin-client');
 
  // Try different authentication methods
  const authMethods = [
    {
      name: 'admin-cli with healthcare2 realm',
      config: {
        baseUrl: process.env.KEYCLOAK_SERVER_URL,
        realmName: process.env.KEYCLOAK_REALM, // healthcare2
      },
      auth: {
        grantType: 'password',
        username: process.env.KEYCLOAK_ADMIN_USERNAME,
        password: process.env.KEYCLOAK_ADMIN_PASSWORD,
        clientId: 'admin-cli',
      }
    },
    {
      name: 'admin-cli with master realm',
      config: {
        baseUrl: process.env.KEYCLOAK_SERVER_URL,
        realmName: 'master', // Try master realm
      },
      auth: {
        grantType: 'password',
        username: process.env.KEYCLOAK_ADMIN_USERNAME,
        password: process.env.KEYCLOAK_ADMIN_PASSWORD,
        clientId: 'admin-cli',
      }
    },
    {
      name: 'client_credentials with healthcare2 realm',
      config: {
        baseUrl: process.env.KEYCLOAK_SERVER_URL,
        realmName: process.env.KEYCLOAK_REALM,
      },
      auth: {
        grantType: 'client_credentials',
        clientId: process.env.KEYCLOAK_CLIENT_ID,
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      }
    }
  ];

  for (const method of authMethods) {
    try {
      console.log(`🔄 Trying authentication method: ${method.name}`);
      kcAdminClient = new KcAdminClient(method.config);
      await kcAdminClient.auth(method.auth);
     
      // Test if we can access the healthcare2 realm
      await kcAdminClient.realms.findOne({ realm: 'healthcare2' });
     
      console.log(`✅ Admin client authenticated successfully with: ${method.name}`);
      adminReady = true;
      lastAuthTime = Date.now(); // Record successful authentication time
      return;
    } catch (err) {
      console.error(`❌ Failed authentication with ${method.name}:`, err.responseData || err.message);
      continue;
    }
  }
 
  // If all methods failed
  console.error('❌ All authentication methods failed');
  adminReady = false;
}

// ========================================
//           GOOGLE AUTH UTILITIES
// ========================================

// Extract first name from email (before @ or before .)
function extractFirstNameFromEmail(email) {
  if (!email) return 'User';
  const localPart = email.split('@')[0];
  // If email contains dots, take first part; otherwise take first part before numbers
  const namePart = localPart.includes('.') ? localPart.split('.')[0] : localPart.replace(/\d+/g, '');
  return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
}

// Extract last name from email (after first dot, or empty)
function extractLastNameFromEmail(email) {
  if (!email) return '';
  const localPart = email.split('@')[0];
  if (localPart.includes('.')) {
    const parts = localPart.split('.');
    if (parts.length > 1) {
      const lastPart = parts[1].replace(/\d+/g, '');
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).toLowerCase();
    }
  }
  return '';
}

// Handle Google OAuth user (existing or new)
async function handleGoogleUser(email, firstName, lastName, googleProfile) {
  try {
    if (!adminReady || !kcAdminClient) {
      throw new Error('Keycloak admin client not ready');
    }

    await ensureAdminAuth();

    // Search for existing user by email first, then by username
    let existingUsers;
    try {
      existingUsers = await kcAdminClient.users.find({ email: email });
    } catch (findError) {
      // If 401 Unauthorized, token expired - retry once
      if (findError.response && findError.response.status === 401) {
        console.log('⚠️ Got 401 error, forcing re-authentication...');
        adminReady = false; // Force re-auth
        await ensureAdminAuth();
        existingUsers = await kcAdminClient.users.find({ email: email });
      } else {
        throw findError;
      }
    }
   
    // If not found by email, try searching by username (email as username)
    if (!existingUsers || existingUsers.length === 0) {
      existingUsers = await kcAdminClient.users.find({ username: email });
      console.log(`🔍 User not found by email, searching by username: ${existingUsers?.length || 0} results`);
    }
   
    if (existingUsers && existingUsers.length > 0) {
      // User exists - link Google account and update attributes
      const existingUser = existingUsers[0];
      console.log('✅ Found existing user for Google login:', {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName
      });

      // Always update user with Google data (email only, keep names from Keycloak)
      try {
        await kcAdminClient.users.update(
          { id: existingUser.id },
          {
            email: email, // Update email from Google
            firstName: existingUser.firstName, // Use Keycloak firstName
            lastName: existingUser.lastName,   // Use Keycloak lastName
            emailVerified: true,
            attributes: {
              ...existingUser.attributes,
              googleLinked: ['true'],
              googleId: [googleProfile.id],
              updatedVia: ['google-oauth']
            }
          }
        );
        console.log('✅ Updated existing user with Google profile data (names from Keycloak)');
      } catch (updateError) {
        console.warn('⚠️ Could not update user with Google data:', updateError);
      }

      // Check if user has any roles, assign visitor if none
      try {
        const userRoles = await kcAdminClient.users.listRealmRoleMappings({
          id: existingUser.id
        });
        // If user has no roles, assign visitor role
        if (!userRoles || userRoles.length === 0) {
          console.log('⚠️ Existing user has no roles, assigning visitor role');
          const visitorRole = await kcAdminClient.roles.findOneByName({ name: 'visitor' });
          if (visitorRole) {
            await kcAdminClient.users.addRealmRoleMappings({
              id: existingUser.id,
              roles: [visitorRole]
            });
            console.log('✅ Assigned visitor role to existing user without roles');
          }
        }
      } catch (roleCheckError) {
        console.warn('⚠️ Could not check/assign roles for existing user:', roleCheckError);
      }

      return {
        keycloakId: existingUser.id,
        email: email, // Return Google email
        firstName: existingUser.firstName, // Return Keycloak firstName
        lastName: existingUser.lastName,   // Return Keycloak lastName
        isNewUser: false,
        googleId: googleProfile.id,
        photoUrl: existingUser.attributes?.photo_url?.[0] || null,
        photoPublicId: existingUser.attributes?.photo_public_id?.[0] || null
      };
    } else {
      // Create new user with visitor role
      console.log('🆕 Creating new user from Google profile:', { email, firstName, lastName });
     
      const newUser = {
        username: email,
        email: email,
        firstName: firstName,
        lastName: lastName,
        enabled: true,
        emailVerified: true, // Google emails are verified
        attributes: {
          googleLinked: ['true'],
          googleId: [googleProfile.id],
          createdVia: ['google-oauth']
        }
      };

      const createdUser = await kcAdminClient.users.create(newUser);
      console.log('✅ Created new user:', createdUser);

      // Assign visitor role
      try {
        const visitorRole = await kcAdminClient.roles.findOneByName({ name: 'visitor' });
        if (visitorRole) {
          await kcAdminClient.users.addRealmRoleMappings({
            id: createdUser.id,
            roles: [visitorRole]
          });
          console.log('✅ Assigned visitor role to new user');
        }
      } catch (roleError) {
        console.warn('⚠️ Could not assign visitor role:', roleError);
      }

      return {
        keycloakId: createdUser.id,
        email: email,
        firstName: firstName,
        lastName: lastName,
        isNewUser: true,
        googleId: googleProfile.id,
        photoUrl: null, // New users don't have photos initially
        photoPublicId: null
      };
    }
  } catch (error) {
    console.error('❌ Error handling Google user:', error);
    throw error;
  }
}

// ========================================
//                ROUTES
// ========================================

// Test endpoint to check admin client status
app.get('/admin/status', (req, res) => {
  res.json({
    adminReady: adminReady,
    hasAdminClient: !!kcAdminClient,
    keycloakConfig: {
      baseUrl: process.env.KEYCLOAK_SERVER_URL,
      realmName: process.env.KEYCLOAK_REALM,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      hasAdminUsername: !!process.env.KEYCLOAK_ADMIN_USERNAME,
      hasAdminPassword: !!process.env.KEYCLOAK_ADMIN_PASSWORD,
      hasClientSecret: !!process.env.KEYCLOAK_CLIENT_SECRET
    }
  });
});

// Test image upload endpoint without authentication (for debugging)
app.put('/test-profile-update', upload.single('photo'), async (req, res) => {
  try {
    const { firstName, lastName, email, userId } = req.body;
   
    console.log('🧪 Test profile update for user:', userId);
    console.log('📋 Form data:', { firstName, lastName, email });
    console.log('🖼️ File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');
   
    let photoUrl = null;
    let photoPublicId = null;
   
    // Upload image if provided
    if (req.file) {
      try {
        const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'users');
        photoUrl = uploadResult.url;
        photoPublicId = uploadResult.publicId;
        console.log('🖼️ Image uploaded to Cloudinary:', { photoUrl, photoPublicId });
      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed:', uploadError);
        return res.status(400).json({ error: 'Failed to upload image to Cloudinary' });
      }
    }
   
    // Try to update Keycloak user
    let keycloakSuccess = false;
    let keycloakError = null;
   
    if (userId && adminReady && kcAdminClient) {
      try {
        await ensureAdminAuth();
        const currentUser = await kcAdminClient.users.findOne({ id: userId });
       
        if (currentUser) {
          const updateData = {
            firstName: firstName || currentUser.firstName,
            lastName: lastName || currentUser.lastName,
            email: email || currentUser.email,
            attributes: {
              ...currentUser.attributes,
              photo_url: photoUrl ? [photoUrl] : (currentUser.attributes?.photo_url || []),
              photo_public_id: photoPublicId ? [photoPublicId] : (currentUser.attributes?.photo_public_id || [])
            }
          };
         
          console.log('🔄 Updating Keycloak user:', updateData);
          await kcAdminClient.users.update({ id: userId }, updateData);
          keycloakSuccess = true;
          console.log('✅ Keycloak user updated successfully');
        } else {
          keycloakError = 'User not found in Keycloak';
        }
      } catch (error) {
        console.error('❌ Keycloak update failed:', error);
        keycloakError = error.message;
      }
    } else {
      keycloakError = 'Admin client not ready or no user ID provided';
    }
   
    res.json({
      success: true,
      photoUrl,
      photoPublicId,
      keycloakSuccess,
      keycloakError,
      adminReady,
      message: keycloakSuccess ? 'Profile updated successfully in Keycloak' : 'Image uploaded but Keycloak update failed'
    });
   
  } catch (error) {
    console.error('❌ Test profile update failed:', error);
    res.status(500).json({ error: 'Test profile update failed', details: error.message });
  }
});

// Test endpoint to verify Keycloak attribute saving
app.post('/test-attribute-save/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { testValue } = req.body;
   
    console.log('🧪 Testing attribute save for user:', userId);
   
    if (!adminReady || !kcAdminClient) {
      return res.status(500).json({ error: 'Admin client not ready' });
    }
   
    await ensureAdminAuth();
   
    // Get current user
    const currentUser = await kcAdminClient.users.findOne({ id: userId });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
   
    console.log('📋 Current user attributes:', currentUser.attributes);
   
    // Try to save a test attribute
    const updateData = {
      attributes: {
        ...currentUser.attributes,
        test_attribute: [testValue || 'test123'],
        photo_url: ['https://test-photo-url.com/test.jpg'],
        photo_public_id: ['test_public_id_123']
      }
    };
   
    console.log('🔄 Attempting to save test attributes:', updateData);
   
    await kcAdminClient.users.update({ id: userId }, updateData);
   
    // Verify immediately
    const verifyUser = await kcAdminClient.users.findOne({ id: userId });
    console.log('🔍 Verification after test save:', verifyUser.attributes);
   
    res.json({
      success: true,
      originalAttributes: currentUser.attributes,
      updatedAttributes: verifyUser.attributes,
      testWorked: !!verifyUser.attributes?.test_attribute,
      photoUrlWorked: !!verifyUser.attributes?.photo_url
    });
   
  } catch (error) {
    console.error('❌ Test attribute save failed:', error);
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

// Call at startup
initKeycloakAdmin();

// Retry admin authentication if needed
async function ensureAdminAuth() {
  const now = Date.now();
  const timeSinceLastAuth = now - lastAuthTime;
 
  // Re-authenticate if:
  // 1. Admin not ready, OR
  // 2. Token might be expired (more than 4 minutes since last auth)
  if (!adminReady || timeSinceLastAuth > TOKEN_REFRESH_INTERVAL) {
    if (timeSinceLastAuth > TOKEN_REFRESH_INTERVAL) {
      console.log(`🔄 Token potentially expired (${Math.floor(timeSinceLastAuth / 1000)}s since last auth), re-authenticating...`);
    } else {
      console.log('🔄 Admin client not ready, retrying authentication...');
    }
    await initKeycloakAdmin();
  }
  return adminReady;
}

// Helper function to safely execute admin operations with retry
async function safeAdminOperation(operation, errorMessage = 'Admin operation failed') {
  try {
    // Ensure admin is authenticated
    await ensureAdminAuth();
    if (!adminReady) {
      throw new Error('Admin client authentication failed');
    }
   
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
   
    // If it's an auth error, try to re-authenticate once
    if (error.response && error.response.status === 401) {
      console.log('🔄 Got 401, retrying admin authentication...');
      adminReady = false;
      await initKeycloakAdmin();
     
      if (adminReady) {
        try {
          return await operation();
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          throw retryError;
        }
      }
    }
   
    throw error;
  }
}

// Create user and assign role
async function createUser({ username, email, password, role, firstName, lastName, photoUrl = null, photoPublicId = null }) {
  return await safeAdminOperation(async () => {
    const userData = {
      username,
      email,
      firstName,
      lastName,
      enabled: true,
      credentials: [{ type: 'password', value: password, temporary: false }],
    };

    // Add photo URL as user attribute if provided
    if (photoUrl) {
      userData.attributes = {
        photo_url: [photoUrl],
        photo_public_id: [photoPublicId || '']
      };
      console.log('🖼️ Adding photo attributes:', userData.attributes);
    }

    const newUser = await kcAdminClient.users.create(userData);
    console.log(`✅ User created: ${newUser.id}`);

    const roleObj = await kcAdminClient.roles.findOneByName({ name: role });
    if (!roleObj) throw new Error(`Role "${role}" not found`);

    await kcAdminClient.users.addRealmRoleMappings({
      id: newUser.id,
      roles: [{ id: roleObj.id, name: roleObj.name }],
    });

    console.log(`✅ Role "${role}" assigned to user "${username}"`);
    return newUser;
  }, 'Failed to create user');
}

// Route to create user
app.post('/create-user', upload.single('photo'), async (req, res) => {
  const { username, email, password, role, firstName, lastName } = req.body;

  // Validate role
  if (!['patient', 'visitor'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be "patient" or "visitor".' });
  }

  try {
    let photoUrl = null;
    let photoPublicId = null;

    // Handle photo upload if provided
    if (req.file) {
      try {
        const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'users');
        photoUrl = uploadResult.url;
        photoPublicId = uploadResult.publicId;
      } catch (uploadError) {
        console.error('Failed to upload image:', uploadError);
        return res.status(400).json({ error: 'Failed to upload image' });
      }
    }

    const newUser = await createUser({
      username,
      email,
      password,
      role,
      firstName,
      lastName,
      photoUrl,
      photoPublicId
    });

    res.json({
      message: `User "${username}" created with role "${role}"`,
      userId: newUser.id,
      photoUrl: photoUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
 
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', process.env.KEYCLOAK_CLIENT_ID);
  params.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET);
  params.append('username', username);
  params.append('password', password);

  try {
    const response = await fetch(`${process.env.KEYCLOAK_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
   
    const data = await response.json();
   
    if (data.access_token) {
      res.json({
        message: 'Login successful',
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in
      });
    } else {
      console.log('Login failed:', data);
      res.status(401).json({ error: 'Invalid credentials', details: data });
    }
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login error' });
  }
});

// Get user profile (simplified - no admin client required)
app.get('/profile', keycloak.protect(), async (req, res) => {
  try {
    const tokenContent = req.kauth.grant.access_token.content;
    const userId = tokenContent.sub;
   
    console.log('🔍 Getting profile for user:', userId);
   
    // Get roles directly from token (this always works)
    let roles = [];
    if (tokenContent.realm_access && tokenContent.realm_access.roles) {
      roles = tokenContent.realm_access.roles.filter(r => r === 'admin');
      console.log('✅ Roles from token:', roles);
    }

    // Try to get fresh user data from Keycloak admin client
    let profile = null;
   
    if (adminReady && kcAdminClient) {
      try {
        await ensureAdminAuth();
        const keycloakUser = await kcAdminClient.users.findOne({ id: userId });
       
        if (keycloakUser) {
          console.log('✅ Fresh user data from Keycloak:', {
            id: keycloakUser.id,
            firstName: keycloakUser.firstName,
            lastName: keycloakUser.lastName,
            email: keycloakUser.email,
            attributes: keycloakUser.attributes
          });
         
          // Build profile from fresh Keycloak data
          profile = {
            id: keycloakUser.id,
            username: keycloakUser.username,
            email: keycloakUser.email,
            firstName: keycloakUser.firstName,
            lastName: keycloakUser.lastName,
            enabled: keycloakUser.enabled,
            emailVerified: keycloakUser.emailVerified,
            createdTimestamp: keycloakUser.createdTimestamp,
            roles: roles,
            photoUrl: keycloakUser.attributes?.photo_url ? keycloakUser.attributes.photo_url[0] : null,
            photoPublicId: keycloakUser.attributes?.photo_public_id ? keycloakUser.attributes.photo_public_id[0] : null
          };
         
          console.log('✅ Profile built from fresh Keycloak data:', profile);
        }
      } catch (keycloakError) {
        console.error('❌ Failed to fetch from Keycloak, falling back to token data:', keycloakError);
      }
    }
   
    // Fallback to token data if Keycloak fetch failed
    if (!profile) {
      console.log('⚠️ Using token data as fallback');
      profile = {
        id: tokenContent.sub,
        username: tokenContent.preferred_username || tokenContent.username,
        email: tokenContent.email,
        firstName: tokenContent.given_name || tokenContent.firstName,
        lastName: tokenContent.family_name || tokenContent.lastName,
        enabled: true,
        emailVerified: tokenContent.email_verified,
        createdTimestamp: tokenContent.iat * 1000,
        roles: roles,
        photoUrl: null,
        photoPublicId: null
      };
    }
   
    console.log('✅ Profile loaded successfully:', profile);
    res.json(profile);
   
  } catch (error) {
    console.error('❌ Failed to get profile:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// Update user profile (simplified version)
// Google OAuth profile update endpoint (no token required)
app.put('/profile', upload.single('photo'), async (req, res) => {
  try {
    const { firstName, lastName, email, removePhoto, userId, isGoogleOAuth } = req.body;
   
    // Handle Google OAuth users differently
    if (isGoogleOAuth === 'true' && userId) {
      console.log('🔄 Updating Google OAuth user profile:', { userId, firstName, lastName, email });
     
      let photoUrl = null;
      let photoPublicId = null;
     
      // Try to get current user data to preserve existing photo
      try {
        if (adminReady && kcAdminClient) {
          await ensureAdminAuth();
          const currentUser = await kcAdminClient.users.findOne({ id: userId });
          if (currentUser && currentUser.attributes) {
            photoUrl = currentUser.attributes.photo_url ? currentUser.attributes.photo_url[0] : null;
            photoPublicId = currentUser.attributes.photo_public_id ? currentUser.attributes.photo_public_id[0] : null;
          }
        }
      } catch (fetchError) {
        console.log('⚠️ Could not fetch current user data for photo preservation:', fetchError);
      }
     
      // Handle photo removal
      if (removePhoto === 'true' && photoPublicId) {
        try {
          await deleteImageFromCloudinary(photoPublicId);
          photoUrl = null;
          photoPublicId = null;
          console.log('🗑️ Photo removed from Cloudinary');
        } catch (deleteError) {
          console.error('❌ Failed to remove photo from Cloudinary:', deleteError);
        }
      }
     
      // Handle new photo upload
      if (req.file) {
        try {
          // Remove old photo if exists
          if (photoPublicId) {
            await deleteImageFromCloudinary(photoPublicId);
          }
         
          const uploadResult = await uploadImageToCloudinary(req.file.buffer);
          photoUrl = uploadResult.secure_url;
          photoPublicId = uploadResult.public_id;
          console.log('📸 New photo uploaded:', { photoUrl, photoPublicId });
        } catch (uploadError) {
          console.error('❌ Failed to upload photo to Cloudinary:', uploadError);
          return res.status(500).json({ error: 'Failed to upload photo' });
        }
      }
     
      // Update user in Keycloak
      let adminUpdateSuccess = false;
      let adminError = null;
     
      if (adminReady && kcAdminClient) {
        try {
          await ensureAdminAuth();
         
          // Prepare user update data
          const updateData = {
            firstName: firstName || '',
            lastName: lastName || '',
            email: email || '',
            attributes: {
              photo_url: photoUrl ? [photoUrl] : [],
              photo_public_id: photoPublicId ? [photoPublicId] : []
            }
          };
         
          await kcAdminClient.users.update({ id: userId }, updateData);
          adminUpdateSuccess = true;
          console.log('✅ Google OAuth user profile updated in Keycloak');
        } catch (updateError) {
          console.error('❌ Failed to update Google OAuth user in Keycloak:', updateError);
          adminError = updateError.message;
        }
      } else {
        adminError = 'Admin client not ready';
      }
     
      return res.json({
        message: 'Google OAuth profile updated',
        adminUpdateSuccess,
        adminError,
        photoUrl,
        photoPublicId,
        adminReady
      });
    }
   
    // If not a Google OAuth request, check for Keycloak token
    if (!req.kauth || !req.kauth.grant || !req.kauth.grant.access_token) {
      return res.status(401).json({ error: 'Authentication required for non-Google OAuth users' });
    }
   
    // Handle regular Keycloak authenticated users
    const keycloakUserId = req.kauth.grant.access_token.content.sub;
    console.log('🔄 Updating Keycloak user profile:', keycloakUserId);
   
    let photoUrl = null;
    let photoPublicId = null;
   
    // Try to get current user data to preserve existing photo
    try {
      if (adminReady && kcAdminClient) {
        const currentUser = await kcAdminClient.users.findOne({ id: keycloakUserId });
        if (currentUser && currentUser.attributes) {
          photoUrl = currentUser.attributes.photo_url ? currentUser.attributes.photo_url[0] : null;
          photoPublicId = currentUser.attributes.photo_public_id ? currentUser.attributes.photo_public_id[0] : null;
        }
      }
    } catch (fetchError) {
      console.log('⚠️ Could not fetch current user data for photo preservation');
    }
   
    // Handle photo removal
    if (removePhoto === 'true' && photoPublicId) {
      try {
        await deleteImageFromCloudinary(photoPublicId);
        photoUrl = null;
        photoPublicId = null;
        console.log('🗑️ Photo removed from Cloudinary');
      } catch (deleteError) {
        console.error('Failed to delete image from Cloudinary:', deleteError);
      }
    }
   
    // Handle new photo upload
    if (req.file) {
      try {
        // Delete old photo if exists
        if (photoPublicId) {
          await deleteImageFromCloudinary(photoPublicId);
        }
       
        // Upload new photo
        const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'users');
        photoUrl = uploadResult.url;
        photoPublicId = uploadResult.publicId;
        console.log('🖼️ New photo uploaded:', { photoUrl, photoPublicId });
      } catch (uploadError) {
        console.error('Failed to upload new image:', uploadError);
        return res.status(400).json({ error: 'Failed to upload new image' });
      }
    }
   
    // Try to update user via admin client
    let updateSuccess = false;
    let adminError = null;
   
    // Ensure admin client is authenticated
    await ensureAdminAuth();
   
    try {
      if (adminReady && kcAdminClient) {
        console.log('🔍 Fetching current user data...');
        const currentUser = await kcAdminClient.users.findOne({ id: keycloakUserId });
        if (currentUser) {
          console.log('📋 Current user data:', {
            id: currentUser.id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            attributes: currentUser.attributes
          });

          const updateData = {
            firstName: firstName || currentUser.firstName,
            lastName: lastName || currentUser.lastName,
            email: email || currentUser.email,
            attributes: {
              ...currentUser.attributes,
              photo_url: photoUrl ? [photoUrl] : (currentUser.attributes?.photo_url || []),
              photo_public_id: photoPublicId ? [photoPublicId] : (currentUser.attributes?.photo_public_id || [])
            }
          };

          console.log('🔄 Updating user with data:', updateData);
          console.log('🖼️ Photo attributes being set:', {
            photoUrl: photoUrl,
            photoPublicId: photoPublicId,
            photo_url_array: updateData.attributes.photo_url,
            photo_public_id_array: updateData.attributes.photo_public_id,
            hasFile: !!req.file
          });
         
          // Try the standard update first
          await kcAdminClient.users.update({ id: keycloakUserId }, updateData);
          updateSuccess = true;
          console.log('✅ Profile updated via admin client (all data including photos)');
         
          // No need for second update - the first update handles everything
          console.log('📋 Update completed with data:', updateData);
         
          // Verify the update by fetching the user again
          const updatedUser = await kcAdminClient.users.findOne({ id: keycloakUserId });
          console.log('🔍 Verification - Updated user data:', {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            attributes: updatedUser.attributes
          });
         
          // Specifically check photo attributes
          console.log('🖼️ Photo attributes after update:', {
            photo_url: updatedUser.attributes?.photo_url,
            photo_public_id: updatedUser.attributes?.photo_public_id,
            photo_url_value: updatedUser.attributes?.photo_url ? updatedUser.attributes.photo_url[0] : null,
            photo_public_id_value: updatedUser.attributes?.photo_public_id ? updatedUser.attributes.photo_public_id[0] : null
          });
        } else {
          console.log('❌ User not found in Keycloak');
          adminError = 'User not found';
        }
      } else {
        console.log('❌ Admin client not ready');
        adminError = 'Admin client not ready';
      }
    } catch (updateError) {
      console.error('❌ Admin update failed:', updateError);
      adminError = updateError.message;
     
      // Try to reauthenticate and retry once
      if (updateError.response && updateError.response.status === 401) {
        console.log('🔄 Got 401, trying to reauthenticate admin client...');
        await initKeycloakAdmin();
       
        if (adminReady) {
          try {
            const currentUser = await kcAdminClient.users.findOne({ id: keycloakUserId });
            if (currentUser) {
              const updateData = {
                firstName: firstName || currentUser.firstName,
                lastName: lastName || currentUser.lastName,
                email: email || currentUser.email,
                attributes: {
                  ...currentUser.attributes,
                  photo_url: photoUrl ? [photoUrl] : (currentUser.attributes?.photo_url || []),
                  photo_public_id: photoPublicId ? [photoPublicId] : (currentUser.attributes?.photo_public_id || [])
                }
              };

              await kcAdminClient.users.update({ id: keycloakUserId }, updateData);
              updateSuccess = true;
              console.log('✅ Profile updated after reauthentication');
              adminError = null;
            }
          } catch (retryError) {
            console.error('❌ Retry after reauthentication failed:', retryError);
            adminError = `Retry failed: ${retryError.message}`;
          }
        }
      }
    }
   
    // Return detailed response
    res.json({
      message: updateSuccess ? 'Profile updated successfully in Keycloak' : 'Profile update failed',
      photoUrl: photoUrl,
      photoPublicId: photoPublicId,
      adminUpdateSuccess: updateSuccess,
      adminError: adminError,
      adminReady: adminReady
    });
   
  } catch (error) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Special endpoint to add photo attributes to existing users (admin only)
app.post('/admin/add-photo-attributes/:userId', upload.single('photo'), async (req, res) => {
  try {
    const { userId } = req.params;
   
    // Check if photo is provided
    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    // Upload photo to Cloudinary
    const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'users');
    console.log('🖼️ Photo uploaded for existing user:', uploadResult);

    // Get current user data
    const currentUser = await safeAdminOperation(async () => {
      return await kcAdminClient.users.findOne({ id: userId });
    }, 'Failed to fetch user data');

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user with photo attributes
    const updateData = {
      ...currentUser,
      attributes: {
        ...currentUser.attributes,
        photo_url: [uploadResult.url],
        photo_public_id: [uploadResult.publicId]
      }
    };

    await safeAdminOperation(async () => {
      return await kcAdminClient.users.update({ id: userId }, updateData);
    }, 'Failed to update user with photo attributes');

    console.log(`✅ Photo attributes added to user ${userId}`);
    res.json({
      message: 'Photo attributes added successfully',
      photoUrl: uploadResult.url,
      photoPublicId: uploadResult.publicId
    });

  } catch (error) {
    console.error('Failed to add photo attributes:', error);
    res.status(500).json({ error: 'Failed to add photo attributes' });
  }
});

// Public endpoint to get user basic info by ID (for Feign client from other microservices)
// No authentication required - this is for service-to-service communication
app.get('/api/users/:id/info', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!adminReady || !kcAdminClient) {
      return res.status(503).json({ error: 'Admin client not ready' });
    }

    await ensureAdminAuth();
    
    const user = await kcAdminClient.users.findOne({ id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Extract basic user information
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: user.attributes?.photo_url ? user.attributes.photo_url[0] : null,
      photoPublicId: user.attributes?.photo_public_id ? user.attributes.photo_public_id[0] : null,
      enabled: user.enabled,
      emailVerified: user.emailVerified
    };
    
    res.json(userInfo);
  } catch (error) {
    console.error('Failed to get user info:', error);
    res.status(500).json({ error: 'Failed to retrieve user info' });
  }
});

// Get all users (admin only)
app.get('/users', keycloak.protect('admin'), async (req, res) => {
  try {
    const users = await kcAdminClient.users.find();
   
    // Get roles and photo info for each user
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        try {
          const roles = await kcAdminClient.users.listRealmRoleMappings({ id: user.id });
         
          // Extract photo information from user attributes
          let photoUrl = null;
          let photoPublicId = null;
          if (user.attributes) {
            photoUrl = user.attributes.photo_url ? user.attributes.photo_url[0] : null;
            photoPublicId = user.attributes.photo_public_id ? user.attributes.photo_public_id[0] : null;
          }
         
          return {
            ...user,
            roles: roles.map(role => role.name),
            photoUrl: photoUrl,
            photoPublicId: photoPublicId
          };
        } catch (error) {
          console.error(`Failed to get details for user ${user.id}:`, error);
          return {
            ...user,
            roles: [],
            photoUrl: null,
            photoPublicId: null
          };
        }
      })
    );
   
    res.json(usersWithDetails);
  } catch (error) {
    console.error('Failed to get users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Get user by ID (admin only)
app.get('/users/:id', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await kcAdminClient.users.findOne({ id });
    const roles = await kcAdminClient.users.listRealmRoleMappings({ id });
   
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
   
    // Extract photo information from user attributes
    let photoUrl = null;
    let photoPublicId = null;
    if (user.attributes) {
      photoUrl = user.attributes.photo_url ? user.attributes.photo_url[0] : null;
      photoPublicId = user.attributes.photo_public_id ? user.attributes.photo_public_id[0] : null;
    }
   
    res.json({
      ...user,
      roles: roles.map(role => role.name),
      photoUrl: photoUrl,
      photoPublicId: photoPublicId
    });
  } catch (error) {
    console.error('Failed to get user:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// Update user (admin only)
app.put('/users/:id', keycloak.protect('admin'), upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, enabled, removePhoto } = req.body;
   
    // Get current user data
    const currentUser = await kcAdminClient.users.findOne({ id });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
   
    let photoUrl = null;
    let photoPublicId = null;
   
    // Get current photo info
    if (currentUser.attributes) {
      photoUrl = currentUser.attributes.photo_url ? currentUser.attributes.photo_url[0] : null;
      photoPublicId = currentUser.attributes.photo_public_id ? currentUser.attributes.photo_public_id[0] : null;
    }
   
    // Handle photo removal
    if (removePhoto === 'true' && photoPublicId) {
      await deleteImageFromCloudinary(photoPublicId);
      photoUrl = null;
      photoPublicId = null;
    }
   
    // Handle new photo upload
    if (req.file) {
      try {
        // Delete old photo if exists
        if (photoPublicId) {
          await deleteImageFromCloudinary(photoPublicId);
        }
       
        // Upload new photo
        const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'users');
        photoUrl = uploadResult.url;
        photoPublicId = uploadResult.publicId;
      } catch (uploadError) {
        console.error('Failed to upload new image:', uploadError);
        return res.status(400).json({ error: 'Failed to upload new image' });
      }
    }
   
    // Prepare update data
    const updateData = {
      username,
      email,
      firstName,
      lastName,
      enabled,
      attributes: {
        ...currentUser.attributes,
        photo_url: photoUrl ? [photoUrl] : [],
        photo_public_id: photoPublicId ? [photoPublicId] : []
      }
    };
   
    await kcAdminClient.users.update({ id }, updateData);
   
    res.json({
      message: 'User updated successfully',
      photoUrl: photoUrl
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
app.delete('/users/:id', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id } = req.params;
   
    // Get user data to clean up photo
    const user = await kcAdminClient.users.findOne({ id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
   
    // Delete user's photo from Cloudinary if exists
    if (user.attributes && user.attributes.photo_public_id) {
      const photoPublicId = user.attributes.photo_public_id[0];
      if (photoPublicId) {
        await deleteImageFromCloudinary(photoPublicId);
      }
    }
   
    // Delete user from Keycloak
    await kcAdminClient.users.del({ id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Enable/Disable user (admin only)
app.patch('/users/:id/toggle', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await kcAdminClient.users.findOne({ id });
   
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
   
    await kcAdminClient.users.update({ id }, {
      enabled: !user.enabled
    });
   
    res.json({
      message: `User ${user.enabled ? 'disabled' : 'enabled'} successfully`,
      enabled: !user.enabled
    });
  } catch (error) {
    console.error('Failed to toggle user status:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// Assign role to user (admin only)
app.post('/users/:id/roles', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName } = req.body;
   
    const roleObj = await kcAdminClient.roles.findOneByName({ name: roleName });
    if (!roleObj) {
      return res.status(404).json({ error: `Role "${roleName}" not found` });
    }
   
    await kcAdminClient.users.addRealmRoleMappings({
      id,
      roles: [{ id: roleObj.id, name: roleObj.name }]
    });
   
    res.json({ message: `Role "${roleName}" assigned to user` });
  } catch (error) {
    console.error('Failed to assign role:', error);
    res.status(500).json({ error: 'Failed to assign role' });
  }
});

// Remove role from user (admin only)
app.delete('/users/:id/roles/:roleName', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id, roleName } = req.params;
   
    const roleObj = await kcAdminClient.roles.findOneByName({ name: roleName });
    if (!roleObj) {
      return res.status(404).json({ error: `Role "${roleName}" not found` });
    }
   
    await kcAdminClient.users.delRealmRoleMappings({
      id,
      roles: [{ id: roleObj.id, name: roleObj.name }]
    });
   
    res.json({ message: `Role "${roleName}" removed from user` });
  } catch (error) {
    console.error('Failed to remove role:', error);
    res.status(500).json({ error: 'Failed to remove role' });
  }
});

// Reset user password (admin only)
app.post('/users/:id/reset-password', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, temporary = false } = req.body;
   
    await kcAdminClient.users.resetPassword({
      id,
      credential: {
        type: 'password',
        value: newPassword,
        temporary
      }
    });
   
    res.json({
      message: 'Password reset successfully',
      temporary
    });
  } catch (error) {
    console.error('Failed to reset password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  // For JWT stateless logout, just respond and let client delete token
  res.json({ message: 'Logged out successfully (client should delete token)' });
});

// Forgot Password - Send reset email
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Find user by email
    const users = await kcAdminClient.users.find({ email });
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    const user = users[0];
   
    // Send password reset email
    await kcAdminClient.users.executeActionsEmail({
      id: user.id,
      actions: ['UPDATE_PASSWORD'],
      redirectUri: process.env.KEYCLOAK_RESET_REDIRECT_URI,
      clientId: process.env.KEYCLOAK_CLIENT_ID
    });

    res.json({
      message: 'Password reset email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Failed to send reset email:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

// Reset Password with token (for direct API reset)
app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  try {
    // Verify the reset token with Keycloak
    const response = await fetch(`${process.env.KEYCLOAK_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: token,
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET
      })
    });

    const tokenData = await response.json();
   
    if (!tokenData.active) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Reset the user's password
    await kcAdminClient.users.resetPassword({
      id: tokenData.sub,
      credential: {
        type: 'password',
        value: newPassword,
        temporary: false
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Failed to reset password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Check reset token validity
app.post('/verify-reset-token', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const response = await fetch(`${process.env.KEYCLOAK_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: token,
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET
      })
    });

    const tokenData = await response.json();
   
    if (tokenData.active) {
      res.json({
        valid: true,
        email: tokenData.email,
        username: tokenData.preferred_username
      });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    console.error('Failed to verify token:', error);
    res.status(500).json({ error: 'Failed to verify reset token' });
  }
});

// Email verification
app.post('/users/:id/send-verify-email', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await kcAdminClient.users.sendVerifyEmail({ id });
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Get user sessions (admin only)
app.get('/users/:id/sessions', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const sessions = await kcAdminClient.users.listSessions({ id });
    res.json(sessions);
  } catch (error) {
    console.error('Failed to get user sessions:', error);
    res.status(500).json({ error: 'Failed to retrieve user sessions' });
  }
});

// Logout user sessions (admin only)
app.delete('/users/:id/sessions', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await kcAdminClient.users.logout({ id });
    res.json({ message: 'User logged out from all sessions' });
  } catch (error) {
    console.error('Failed to logout user:', error);
    res.status(500).json({ error: 'Failed to logout user' });
  }
});

// ========================================
//       DOCTOR REVIEWS & RATINGS (MongoDB)
// ========================================

// Middleware to handle both Keycloak and Google OAuth authentication
const authenticateUser = (req, res, next) => {
  // Check for Google OAuth custom headers first (bypass Keycloak)
  const googleUserId = req.headers['x-user-id'];
  const authType = req.headers['x-auth-type'];
 
  if (googleUserId && authType === 'google-oauth') {
    req.userId = googleUserId;
    req.authType = 'google-oauth';
    console.log(`🔐 Google OAuth user authenticated: ${googleUserId}`);
    return next();
  }
 
  // Check for Keycloak token
  if (req.kauth && req.kauth.grant && req.kauth.grant.access_token) {
    req.userId = req.kauth.grant.access_token.content.sub;
    req.authType = 'keycloak';
    console.log(`🔐 Keycloak user authenticated: ${req.userId}`);
    return next();
  }
 
  // No authentication found
  console.warn('⚠️ Authentication required but not found');
  return res.status(401).json({ error: 'Authentication required. Please login.' });
};

// Add or update a review (requires authentication - Keycloak or Google OAuth)
app.post('/reviews', authenticateUser, async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;
    const userId = req.userId;
    const authType = req.authType;
   
    // Validation
    if (!doctorId || !rating) {
      return res.status(400).json({ error: 'Doctor ID and rating are required' });
    }
   
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
   
    // Get user info for the review
    let userName = 'Anonymous';
    let userPhotoUrl = null;
   
    try {
      if (authType === 'google-oauth') {
        // For Google OAuth, get user info from headers
        userName = req.headers['x-user-name'] || 'Google User';
        userPhotoUrl = req.headers['x-user-photo'] || null;
        console.log('📸 Google OAuth user info - Name:', userName, 'Photo:', userPhotoUrl);
      } else if (adminReady && kcAdminClient) {
        // For Keycloak users
        await ensureAdminAuth();
        const user = await kcAdminClient.users.findOne({ id: userId });
        if (user) {
          userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
          // Get photo from user attributes if exists
          if (user.attributes && user.attributes.photo_url && user.attributes.photo_url[0]) {
            userPhotoUrl = user.attributes.photo_url[0];
          }
          console.log('📸 Keycloak user photo URL for review:', userPhotoUrl);
        }
      }
    } catch (error) {
      console.warn('Could not fetch user info:', error);
    }
   
    // Check if user already reviewed this doctor (upsert)
    const existingReview = await Review.findOne({
      userId,
      doctorId: parseInt(doctorId)
    });
   
    if (existingReview) {
      // Update existing review
      existingReview.rating = parseInt(rating);
      existingReview.comment = comment || '';
      existingReview.userName = userName; // Update name in case it changed
      existingReview.userPhotoUrl = userPhotoUrl; // Update photo
      await existingReview.save();
     
      console.log(`✅ Review updated for doctor ${doctorId} by user ${userId}`);
      return res.json({
        message: 'Review updated successfully',
        review: existingReview
      });
    }
   
    // Create new review
    const newReview = await Review.create({
      userId,
      userName,
      userPhotoUrl,
      doctorId: parseInt(doctorId),
      rating: parseInt(rating),
      comment: comment || '',
      mediaUrls: [],
      likes: [],
      dislikes: [],
      replies: []
    });
   
    console.log(`✅ Review added for doctor ${doctorId} by user ${userId}`);
   
    res.status(201).json({
      message: 'Review added successfully',
      review: newReview
    });
   
  } catch (error) {
    console.error('Error adding review:', error);
   
    // Handle duplicate key error (shouldn't happen with upsert logic, but just in case)
    if (error.code === 11000) {
      return res.status(409).json({ error: 'You have already reviewed this doctor' });
    }
   
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Get all reviews for a doctor (public - no auth required)
app.get('/reviews/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
   
    // Find all reviews for this doctor, sorted by most recent first
    const doctorReviews = await Review.find({
      doctorId: parseInt(doctorId)
    })
    .sort({ createdAt: -1 })
    .lean();
   
    res.json({
      doctorId: parseInt(doctorId),
      totalReviews: doctorReviews.length,
      reviews: doctorReviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get average rating for a doctor (public - no auth required)
app.get('/reviews/doctor/:doctorId/average', async (req, res) => {
  try {
    const { doctorId } = req.params;
   
    // Get all reviews for this doctor
    const doctorReviews = await Review.find({
      doctorId: parseInt(doctorId)
    }).lean();
   
    if (doctorReviews.length === 0) {
      return res.json({
        doctorId: parseInt(doctorId),
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
    }
   
    // Calculate average rating
    const totalRating = doctorReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / doctorReviews.length).toFixed(1);
   
    // Count ratings by star
    const ratingDistribution = {
      5: doctorReviews.filter(r => r.rating === 5).length,
      4: doctorReviews.filter(r => r.rating === 4).length,
      3: doctorReviews.filter(r => r.rating === 3).length,
      2: doctorReviews.filter(r => r.rating === 2).length,
      1: doctorReviews.filter(r => r.rating === 1).length
    };
   
    res.json({
      doctorId: parseInt(doctorId),
      averageRating: parseFloat(averageRating),
      totalReviews: doctorReviews.length,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error calculating average rating:', error);
    res.status(500).json({ error: 'Failed to calculate average rating' });
  }
});

// Get reviews by current user (requires authentication)
app.get('/reviews/my-reviews', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
   
    // Find all reviews by this user, sorted by most recent first
    const userReviews = await Review.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
   
    res.json({
      totalReviews: userReviews.length,
      reviews: userReviews
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
});

// Delete a review (requires authentication - user can only delete their own)
app.delete('/reviews/:reviewId', authenticateUser, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;
   
    // Find and delete the review (only if it belongs to the user)
    const deletedReview = await Review.findOneAndDelete({
      _id: reviewId,
      userId: userId
    });
   
    if (!deletedReview) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }
   
    console.log(`✅ Review ${reviewId} deleted by user ${userId}`);
   
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Delete a reply (requires authentication - user can only delete their own)
app.delete('/reviews/:reviewId/reply/:replyId', authenticateUser, async (req, res) => {
  try {
    const { reviewId, replyId } = req.params;
    const userId = req.userId;
   
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
   
    const reply = review.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }
   
    // Check if user owns the reply
    if (reply.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized - not your reply' });
    }
   
    // Remove the reply using pull method (Mongoose 6+ compatible)
    review.replies.pull(replyId);
    await review.save();
   
    console.log(`✅ Reply ${replyId} deleted by user ${userId}`);
   
    res.json({ message: 'Reply deleted successfully', review });
  } catch (error) {
    console.error('Error deleting reply:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

// Like a review or reply (toggle - requires authentication)
app.post('/reviews/:reviewId/like', authenticateUser, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { replyId } = req.body; // Optional - if liking a reply
    const userId = req.userId;
   
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
   
    if (replyId) {
      // Like a reply
      const reply = review.replies.id(replyId);
      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }
     
      // Remove from dislikes if present
      reply.dislikes = reply.dislikes.filter(id => id !== userId);
     
      // Toggle like
      if (reply.likes.includes(userId)) {
        reply.likes = reply.likes.filter(id => id !== userId);
      } else {
        reply.likes.push(userId);
      }
    } else {
      // Like the review
      // Remove from dislikes if present
      review.dislikes = review.dislikes.filter(id => id !== userId);
     
      // Toggle like
      if (review.likes.includes(userId)) {
        review.likes = review.likes.filter(id => id !== userId);
      } else {
        review.likes.push(userId);
      }
    }
   
    await review.save();
    res.json({ message: 'Like updated', review });
  } catch (error) {
    console.error('Error liking review:', error);
    res.status(500).json({ error: 'Failed to like review' });
  }
});

// Dislike a review or reply (toggle - requires authentication)
app.post('/reviews/:reviewId/dislike', authenticateUser, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { replyId } = req.body; // Optional - if disliking a reply
    const userId = req.userId;
   
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
   
    if (replyId) {
      // Dislike a reply
      const reply = review.replies.id(replyId);
      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }
     
      // Remove from likes if present
      reply.likes = reply.likes.filter(id => id !== userId);
     
      // Toggle dislike
      if (reply.dislikes.includes(userId)) {
        reply.dislikes = reply.dislikes.filter(id => id !== userId);
      } else {
        reply.dislikes.push(userId);
      }
    } else {
      // Dislike the review
      // Remove from likes if present
      review.likes = review.likes.filter(id => id !== userId);
     
      // Toggle dislike
      if (review.dislikes.includes(userId)) {
        review.dislikes = review.dislikes.filter(id => id !== userId);
      } else {
        review.dislikes.push(userId);
      }
    }
   
    await review.save();
    res.json({ message: 'Dislike updated', review });
  } catch (error) {
    console.error('Error disliking review:', error);
    res.status(500).json({ error: 'Failed to dislike review' });
  }
});

// Add a reply to a review (requires authentication)
app.post('/reviews/:reviewId/reply', authenticateUser, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment, parentReplyId } = req.body; // parentReplyId for nested replies
    const userId = req.userId;
    const authType = req.authType;
   
    // Allow empty comment if media will be uploaded later (Facebook style)
    // Frontend will upload media after creating the reply
    const commentText = comment || '';
   
    // Removed validation - allow empty comments for media-only posts
   
    // Get user info
    let userName = 'Anonymous';
    let userPhotoUrl = null;
   
    try {
      if (authType === 'google-oauth') {
        // For Google OAuth, get user info from headers
        userName = req.headers['x-user-name'] || 'Google User';
        userPhotoUrl = req.headers['x-user-photo'] || null;
        console.log('📸 Google OAuth user info for reply - Name:', userName, 'Photo:', userPhotoUrl);
      } else if (adminReady && kcAdminClient) {
        // For Keycloak users
        await ensureAdminAuth();
        const user = await kcAdminClient.users.findOne({ id: userId });
        if (user) {
          userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
          // Get photo from user attributes if exists (use photo_url with underscore)
          if (user.attributes && user.attributes.photo_url && user.attributes.photo_url[0]) {
            userPhotoUrl = user.attributes.photo_url[0];
          }
          console.log('📸 Keycloak user photo URL for reply:', userPhotoUrl);
        }
      }
    } catch (error) {
      console.warn('Could not fetch user info:', error);
    }
   
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
   
    // If replying to another reply, get the parent reply info
    let replyingTo = null;
    if (parentReplyId) {
      const parentReply = review.replies.id(parentReplyId);
      if (parentReply) {
        replyingTo = parentReply.userName;
      }
    }
   
    const reply = {
      userId,
      userName,
      userPhotoUrl,
      comment: commentText.trim() || ' ', // Use space if empty to satisfy schema requirement
      mediaUrls: [],
      likes: [],
      dislikes: [],
      parentReplyId: parentReplyId || null,
      replyingTo: replyingTo
    };
   
    review.replies.push(reply);
    await review.save();
   
    res.status(201).json({
      message: 'Reply added successfully',
      review
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Upload media for review (requires authentication)
app.post('/reviews/:reviewId/media', authenticateUser, upload.single('media'), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { replyId } = req.body; // Optional - if uploading to a reply
    const userId = req.userId;
   
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
   
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
   
    // Upload to Cloudinary using buffer
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'healthcare/reviews',
          resource_type: 'auto' // Supports images and videos
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });
   
    const result = uploadResult;
   
    if (replyId) {
      // Add media to reply
      const reply = review.replies.id(replyId);
      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }
     
      if (reply.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized - not your reply' });
      }
     
      // Prevent duplicate URLs
      if (!reply.mediaUrls.includes(result.secure_url)) {
        reply.mediaUrls.push(result.secure_url);
      }
    } else {
      // Add media to review - Allow any authenticated user to add media
      // Prevent duplicate URLs
      if (!review.mediaUrls.includes(result.secure_url)) {
        review.mediaUrls.push(result.secure_url);
      }
    }
   
    await review.save();
   
    res.json({
      message: 'Media uploaded successfully',
      mediaUrl: result.secure_url,
      review
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Test routes
app.get('/', (req, res) => res.send('User Microservice is running!'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    adminReady,
    uptime: process.uptime()
  });
});

app.get('/protected', keycloak.protect(), (req, res) => {
  res.json({ message: 'Protected route', user: req.kauth.grant.access_token.content });
});
app.get('/admin', keycloak.protect('admin'), (req, res) => {
  res.json({ message: 'Admin access granted!' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Test endpoint (no auth required)
app.get('/test', (req, res) => {
  console.log('🔍 Test endpoint called - ROUTE HANDLER EXECUTED');
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Temporary profile endpoint without keycloak protection for testing
app.get('/profile-simple', async (req, res) => {
  console.log('🔍 Simple profile endpoint called');
 
  // Add CORS headers explicitly
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
 
  const profile = {
    id: '48331b90-56df-4de0-8de4-7518460d88c5',
    username: 'khalil',
    email: 'khalilca1620@gmail.com',
    firstName: 'khalil',
    lastName: 'lakhdar',
    enabled: true,
    emailVerified: true,
    createdTimestamp: 1759951935000,
    roles: ['admin'],
    photoUrl: null,
    photoPublicId: null
  };
 
  console.log('✅ Simple profile returned:', profile);
  res.json(profile);
});

// Simple profile endpoint without authentication for testing
app.get('/profile-test', async (req, res) => {
  console.log('🔍 Test profile endpoint called');
 
  const mockProfile = {
    id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    enabled: true,
    emailVerified: true,
    createdTimestamp: Date.now(),
    roles: ['admin'],
    photoUrl: null,
    photoPublicId: null
  };
 
  res.json(mockProfile);
});


// Eureka client registration
const Eureka = require('eureka-js-client').Eureka;

const eurekaClient = new Eureka({
  instance: {
    app: 'USER-EXPRESS',
    hostName: 'localhost',
    ipAddr: '127.0.0.1',
    statusPageUrl: 'http://localhost:3000/info',  // ADD THIS
    healthCheckUrl: 'http://localhost:3000/health',  // ADD THIS
    homePageUrl: 'http://localhost:3000/',  // ADD THIS
    port: {
      '$': 3000,
      '@enabled': true,
    },
    vipAddress: 'user-express',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
    // ADD METADATA
    metadata: {
      'management.port': '3000',
      'instanceId': 'user-express:3000'
    }
  },
  eureka: {
    host: 'localhost',
    port: 8761,
    servicePath: '/eureka/apps/',
    maxRetries: 3,  // ADD RETRY CONFIG
    requestRetryDelay: 2000,
  },
});

// Start the client
eurekaClient.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
  eurekaClient.stop();
  process.exit();
});

module.exports = eurekaClient;

// ========================================
//       APPOINTMENTS MANAGEMENT (Admin + Patients)
// ========================================

// Create new appointment (authenticated users - patients/visitors)
app.post('/appointments', authenticateUser, async (req, res) => {
  try {
    const { 
      doctorId, 
      doctorName, 
      departmentId, 
      departmentName, 
      appointmentDate, 
      appointmentTime, 
      reason, 
      notes 
    } = req.body;
    const userId = req.userId;
    
    // Validation
    if (!doctorId || !doctorName || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({ 
        error: 'Doctor ID, doctor name, date, time, and reason are required' 
      });
    }
    
    // Get user info
    let userName = 'Anonymous';
    let userEmail = 'no-email@example.com';
    
    try {
      if (req.authType === 'google-oauth') {
        if (req.session && req.session.user) {
          userName = `${req.session.user.firstName} ${req.session.user.lastName}`;
          userEmail = req.session.user.email;
        }
      } else {
        await ensureAdminAuth();
        if (adminReady && kcAdminClient) {
          const keycloakUser = await kcAdminClient.users.findOne({ id: userId });
          if (keycloakUser) {
            userName = `${keycloakUser.firstName} ${keycloakUser.lastName}`;
            userEmail = keycloakUser.email;
          }
        }
      }
    } catch (error) {
      console.warn('Could not fetch user info for appointment:', error);
    }
    
    // Create appointment
    const newAppointment = await Appointment.create({
      patientId: userId,
      patientName: userName,
      patientEmail: userEmail,
      doctorId: parseInt(doctorId),
      doctorName: doctorName,
      departmentId: departmentId ? parseInt(departmentId) : null,
      departmentName: departmentName || '',
      appointmentDate: new Date(appointmentDate),
      appointmentTime: appointmentTime,
      status: 'pending',
      reason: reason,
      notes: notes || ''
    });
    
    console.log(`✅ Appointment created: ${newAppointment._id} for patient ${userName}`);
    
    res.status(201).json({ 
      message: 'Appointment created successfully',
      appointment: newAppointment
    });
    
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Get all appointments (admin only - with filters)
app.get('/appointments', keycloak.protect('admin'), async (req, res) => {
  try {
    const { status, doctorId, patientId, startDate, endDate } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctorId = parseInt(doctorId);
    if (patientId) filter.patientId = patientId;
    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) filter.appointmentDate.$gte = new Date(startDate);
      if (endDate) filter.appointmentDate.$lte = new Date(endDate);
    }
    
    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .lean();
    
    res.json({
      total: appointments.length,
      appointments: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointments for current patient
app.get('/appointments/my-appointments', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    
    const appointments = await Appointment.find({ patientId: userId })
      .sort({ appointmentDate: -1 })
      .lean();
    
    res.json({
      total: appointments.length,
      appointments: appointments
    });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointments by doctor ID (admin or doctor)
app.get('/appointments/doctor/:doctorId', keycloak.protect(), async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query;
    
    const filter = { doctorId: parseInt(doctorId) };
    if (status) filter.status = status;
    
    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .lean();
    
    res.json({
      doctorId: parseInt(doctorId),
      total: appointments.length,
      appointments: appointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get single appointment by ID
app.get('/appointments/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const appointment = await Appointment.findById(id).lean();
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Check authorization (patient can only see their own, admin can see all)
    if (req.authType !== 'admin' && appointment.patientId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view this appointment' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Confirm appointment (admin only)
app.patch('/appointments/:id/confirm', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.kauth.grant.access_token.content.sub;
    const adminUsername = req.kauth.grant.access_token.content.preferred_username;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (appointment.status === 'confirmed') {
      return res.status(400).json({ error: 'Appointment is already confirmed' });
    }
    
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot confirm a cancelled appointment' });
    }
    
    appointment.status = 'confirmed';
    appointment.confirmedBy = adminUsername || adminId;
    appointment.confirmedAt = new Date();
    if (adminNotes) appointment.adminNotes = adminNotes;
    
    await appointment.save();
    
    console.log(`✅ Appointment ${id} confirmed by admin ${adminUsername}`);
    
    res.json({ 
      message: 'Appointment confirmed successfully',
      appointment: appointment
    });
    
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ error: 'Failed to confirm appointment' });
  }
});

// Cancel appointment (admin only)
app.patch('/appointments/:id/cancel', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason, adminNotes } = req.body;
    const adminId = req.kauth.grant.access_token.content.sub;
    const adminUsername = req.kauth.grant.access_token.content.preferred_username;
    
    if (!cancellationReason) {
      return res.status(400).json({ error: 'Cancellation reason is required' });
    }
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }
    
    appointment.status = 'cancelled';
    appointment.cancelledBy = adminUsername || adminId;
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = cancellationReason;
    if (adminNotes) appointment.adminNotes = adminNotes;
    
    await appointment.save();
    
    console.log(`✅ Appointment ${id} cancelled by admin ${adminUsername}`);
    
    res.json({ 
      message: 'Appointment cancelled successfully',
      appointment: appointment
    });
    
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Mark appointment as completed (admin only)
app.patch('/appointments/:id/complete', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ error: 'Only confirmed appointments can be marked as completed' });
    }
    
    appointment.status = 'completed';
    if (adminNotes) appointment.adminNotes = adminNotes;
    
    await appointment.save();
    
    console.log(`✅ Appointment ${id} marked as completed`);
    
    res.json({ 
      message: 'Appointment marked as completed',
      appointment: appointment
    });
    
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ error: 'Failed to complete appointment' });
  }
});

// Delete appointment (admin only - hard delete)
app.delete('/appointments/:id', keycloak.protect('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findByIdAndDelete(id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    console.log(`🗑️ Appointment ${id} deleted by admin`);
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Update appointment details (patient can update before confirmation)
app.put('/appointments/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { appointmentDate, appointmentTime, reason, notes } = req.body;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Only patient can update their own pending appointments
    if (appointment.patientId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this appointment' });
    }
    
    if (appointment.status !== 'pending') {
      return res.status(400).json({ 
        error: `Cannot update ${appointment.status} appointment. Only pending appointments can be updated.` 
      });
    }
    
    // Update fields
    if (appointmentDate) appointment.appointmentDate = new Date(appointmentDate);
    if (appointmentTime) appointment.appointmentTime = appointmentTime;
    if (reason) appointment.reason = reason;
    if (notes !== undefined) appointment.notes = notes;
    
    await appointment.save();
    
    console.log(`✅ Appointment ${id} updated by patient ${userId}`);
    
    res.json({ 
      message: 'Appointment updated successfully',
      appointment: appointment
    });
    
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Get appointment statistics (admin only)
app.get('/appointments/stats/overview', keycloak.protect('admin'), async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    
    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    res.json({
      total: totalAppointments,
      pending: pendingAppointments,
      confirmed: confirmedAppointments,
      cancelled: cancelledAppointments,
      completed: completedAppointments,
      today: todayAppointments
    });
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({ error: 'Failed to fetch appointment statistics' });
  }
});

// Start background token refresh
setInterval(async () => {
  try {
    const now = Date.now();
    const timeSinceLastAuth = now - lastAuthTime;
   
    // Proactively refresh token every 3.5 minutes (before 5 min expiration)
    if (timeSinceLastAuth > (3.5 * 60 * 1000)) {
      console.log('🔄 Proactively refreshing Keycloak admin token...');
      await initKeycloakAdmin();
      if (adminReady) {
        console.log('✅ Token refreshed successfully');
      }
    }
  } catch (error) {
    console.error('❌ Background token refresh failed:', error.message);
  }
}, 60 * 1000); // Check every minute

// Start server and register with Eureka
// Re-add background token refresh (lost during conflict) to keep Keycloak admin token alive.
// Runs every minute; refreshes if older than 3.5 minutes.
setInterval(async () => {
  try {
    const now = Date.now();
    const timeSinceLastAuth = now - lastAuthTime;
    if (timeSinceLastAuth > (3.5 * 60 * 1000)) {
      console.log('🔄 Proactively refreshing Keycloak admin token...');
      await initKeycloakAdmin();
      if (adminReady) {
        console.log('✅ Admin token refreshed');
      }
    }
  } catch (err) {
    console.error('⚠️ Background token refresh failed:', err.message);
  }
}, 60 * 1000);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  eurekaClient.start((error) => {
    if (error) {
      console.error('Eureka registration failed:', error);
    } else {
      console.log('Registered with Eureka!');
    }
  });
});