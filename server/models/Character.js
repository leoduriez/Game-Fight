const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  power: {
    type: Number,
    required: true,
    min: 0
  },
  manaCost: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['attack', 'special', 'heal', 'defense'],
    required: true
  }
});

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: '🥊'
  },
  stats: {
    health: {
      type: Number,
      required: true,
      min: 1,
      max: 200
    },
    attack: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    defense: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    speed: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    mana: {
      type: Number,
      required: true,
      min: 0,
      max: 200
    }
  },
  skills: {
    type: [skillSchema],
    validate: [arrayLimit, 'Un personnage doit avoir exactement 4 compétences']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

function arrayLimit(val) {
  return val.length === 4;
}

characterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Character', characterSchema);
