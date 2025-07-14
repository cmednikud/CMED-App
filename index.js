const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI || 'http://localhost:5000/oauth2callback'
);

const tokens = {};

const FOLDER_NAMES = ['Images', 'Videos', 'Docs'];
const folderMap = {};

const ensureFoldersExist = async (auth) => {
  const drive = google.drive({ version: 'v3', auth });

  for (const name of FOLDER_NAMES) {
    const res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`,
      fields: 'files(id, name)',
    });

    if (res.data.files.length > 0) {
      folderMap[name] = res.data.files[0].id;
    } else {
      const folder = await drive.files.create({
        resource: {
          name: name,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      folderMap[name] = folder.data.id;
    }
  }
};

app.get('/api/auth-url', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/drive',
    prompt: 'consent',
  });
  res.json({ authUrl });
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens: newTokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(newTokens);
    
    const sessionId = req.cookies.sessionId || Math.random().toString(36).substring(2);
    tokens[sessionId] = newTokens;
    
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    await ensureFoldersExist(oauth2Client);
    res.redirect(process.env.FRONTEND_REDIRECT || 'http://localhost:3000');
  } catch (err) {
    console.error(err);
    res.status(500).send('Authentication failed. Please try again.');
  }
});

const isAuthenticated = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;
    if (!sessionId || !tokens[sessionId]) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    oauth2Client.setCredentials(tokens[sessionId]);
    
    if (oauth2Client.isTokenExpiring()) {
      const { credentials } = await oauth2Client.refreshToken(tokens[sessionId].refresh_token);
      tokens[sessionId] = {
        ...tokens[sessionId],
        ...credentials
      };
      oauth2Client.setCredentials(tokens[sessionId]);
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Authentication error' });
  }
};

app.get('/api/files', isAuthenticated, async (req, res) => {
  try {
    const { type, folderId } = req.query;
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    let query = 'trashed=false';
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    } else if (type) {
      const folderId = folderMap[type];
      if (!folderId) return res.status(400).json({ error: 'Invalid type' });
      query += ` and '${folderId}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
    });

    res.json({ files: response.data.files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const { type } = req.body;
    const folderId = folderMap[type];
    if (!folderId) return res.status(400).json({ error: 'Invalid type' });

    const ALLOWED_MIME = {
      Images: /^image\//,
      Videos: /^video\//,
      Docs: /^(application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document|text\/plain)$/,
    };

    if (!ALLOWED_MIME[type]?.test(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid file type for this folder' });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const fileMetadata = {
      name: req.file.originalname,
      parents: [folderId],
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, mimeType',
    });

    fs.unlinkSync(req.file.path);
    res.json(file.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/file/:fileId', isAuthenticated, async (req, res) => {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const file = await drive.files.get({
      fileId: req.params.fileId,
      fields: 'id, name, mimeType, webViewLink, webContentLink',
    });
    res.json({ file: file.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/delete/:fileId', isAuthenticated, async (req, res) => {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    await drive.files.delete({ fileId: req.params.fileId });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/download/:fileId', isAuthenticated, async (req, res) => {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const file = await drive.files.get({
      fileId: req.params.fileId,
      fields: 'name, mimeType',
    });

    const response = await drive.files.get(
      { fileId: req.params.fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    res.setHeader('Content-Disposition', `attachment; filename="${file.data.name}"`);
    response.data.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));