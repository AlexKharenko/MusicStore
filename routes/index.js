const express = require('express');
const router = express.Router();
const Audio = require('../models/audio');

router.get('/', async (req, res) => {
    let audios;
    try{
        audios = await Audio.find().sort({createdAt: 'desc'}).limit(10).exec();
    } catch{
        audios = [];
    }
    res.render('index', { audios: audios});
})

module.exports = router;