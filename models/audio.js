const mongoose =require('mongoose');
const path = require('path');

const coverImageBasePath = 'uploads/audioCovers';
const audioFileBasePath = 'uploads/audioFiles';

const audioSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    lyrics:{
        type:String
    },
    publishDate:{
        type:Date,
        required:true
    },
    duration:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now
    },
    coverImageName:{
        type:String
    },
    AudioName:{
        type:String,
        required:true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Author'
    }
})

audioSchema.virtual('coverImagePath').get(function() {
    if(this.coverImageName!= null){
        return path.join('/', coverImageBasePath, this.coverImageName);
    }
})
audioSchema.virtual('audioFilePath').get(function() {
    if(this.AudioName!= null){
        return path.join('/', audioFileBasePath, this.AudioName);
    }
})

module.exports = mongoose.model('Audio', audioSchema);
module.exports.coverImageBasePath = coverImageBasePath;
module.exports.audioFileBasePath = audioFileBasePath;