const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const upload = require('../middlewares/upload');//importazione della confiugurazione di Multer 