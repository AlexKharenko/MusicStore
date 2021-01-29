const express = require('express');
const router = express.Router();
const multer = require('multer');
const path =require('path');
const getMP3Duration = require('get-mp3-duration');
const fs = require('fs');
const Audio = require('../models/audio');
const Author = require('../models/author');
const uploadCoverPath = path.join('./public', Audio.coverImageBasePath);
const uploadAudioPath = path.join('./public', Audio.audioFileBasePath);

const assign = multer.diskStorage({
    destination:(req,file,cb) => {
        if(file.fieldname === "cover"){
            cb(null,uploadCoverPath);
        }
        else if(file.fieldname === "audiofile"){
            cb(null,uploadAudioPath);
        }
    },
    filename: (req,file,cb) => {
        cb(null,file.fieldname + '-' + Date.now() + file.originalname);
    }
});

const upload = multer({
    storage:assign,
    dest: './public/uploads',
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if(file.fieldname === "cover"){
            if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                return cb(new Error('Only images are allowed'))
            }
            cb(null,true);
        }
        else if(file.fieldname === "audiofile"){
            if(ext !== '.mp3') {
                return cb(new Error('Only audios are allowed'))
            }
            cb(null,true);
        }
    }
});

//All Audios Route

router.get('/', async(req, res) => {
    let query = Audio.find();
    if(req.query.title != null && req.query.title !== ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore !== ''){
        query = query.lte('publishDate', req.query.publishedBefore);
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter !== ''){
        query = query.gte('publishDate', req.query.publishedAfter);
    }
    try{
        const audios = await query.exec();
        res.render('audios/index', {
            audios:audios, 
            searchOptions: req.query
        });
    } catch {
        res.redirect('/');
    }
})

//New Audio Route 

router.get('/new', async (req, res)=>{
    renderNewPage(res, new Audio());
})

//Create Audio Route


const cpUpload = upload.fields([{name:'cover', maxCount:1}, {name:'audiofile', maxCount:1}]);

router.post('/', cpUpload ,async (req, res) => {
    let audioFileName = null;
    let duration=null;
    if(req.files.audiofile != null ){
        audioFileName = req.files.audiofile[0].filename;
        const buffer = fs.readFileSync(req.files.audiofile[0].path);
        duration = millisToMinutesAndSeconds(getMP3Duration(buffer));
    }
    const coverFileName = req.files.cover != null ? req.files.cover[0].filename : null;
    const audio = new Audio({
        title: req.body.name,
        author:req.body.author,
        publishDate: new Date(req.body.publishDate),
        duration: duration,
        lyrics: req.body.lyrics,
        coverImageName:coverFileName,
        AudioName:audioFileName
    })

    try{
        const newAudio = await audio.save();
        //res.redirect(`audios/${newAudio.id}`)
        res.redirect('audios');
    } catch{
        if(audio.coverImageName!=null){
            removeFile(uploadCoverPath, audio.coverImageName);
        }
        if(audio.AudioName!=null){
            removeFile(uploadAudioPath, audio.AudioName);
        }
        renderNewPage(res, audio, true);
    }
})

function removeFile(pathparam, filename){
    fs.unlink(path.join(pathparam, filename), err => {
        if(err) console.error(err);
    });
}


function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
};

async function renderNewPage(res, audio, hasErrror = false){
    try{
        const authors = await Author.find({});
        const params = {
            authors: authors,
            audio: audio
        }
        if(hasErrror) params.errorMessage = 'Error Creating Audio';
        res.render('audios/new', params)
    }catch{
        res.redirect('/audios');
    }
};

module.exports = router;