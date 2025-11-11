const mongoose = require('mongoose');

// Sub-schema for replies (supports nested replies)
const replySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userPhotoUrl: {
    type: String,
    default: null
  },
  comment: {
    type: String,
    required: true,
    default: ' ', // Allow space for media-only posts
    maxlength: 500
  },
  mediaUrls: [{
    type: String
  }],
  likes: [{
    type: String // Array of user IDs who liked
  }],
  dislikes: [{
    type: String // Array of user IDs who disliked
  }],
  parentReplyId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null // null means it's a direct reply to review, otherwise it's a reply to another reply
  },
  replyingTo: {
    type: String, // Name of the user being replied to
    default: null
  }
}, {
  timestamps: true
});

const reviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userPhotoUrl: {
    type: String,
    default: null
  },
  doctorId: {
    type: Number,
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: '',
    maxlength: 1000
  },
  mediaUrls: [{
    type: String // Array of Cloudinary URLs for images/videos
  }],
  likes: [{
    type: String // Array of user IDs who liked
  }],
  dislikes: [{
    type: String // Array of user IDs who disliked
  }],
  replies: [replySchema]
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Compound index to ensure one review per user per doctor
reviewSchema.index({ userId: 1, doctorId: 1 }, { unique: true });

// Index for querying reviews by doctor
reviewSchema.index({ doctorId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
