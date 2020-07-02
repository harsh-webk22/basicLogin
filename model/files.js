const mongoose =require('mongoose');

const fileSchema = new mongoose.Schema({
    name: {
        type: 'String',
        required: true
    },
    uploadedBy:{
        type: 'String',
        required: true
    },
    path:{
        type: 'String',
        required: true
    }
}, {
    timestamps: true
});


const Files = mongoose.model('Files' , fileSchema);
module.exports = Files