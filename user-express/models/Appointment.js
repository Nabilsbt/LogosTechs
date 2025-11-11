const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  doctorId: {
    type: Number,
    required: true,
    index: true
  },
  doctorName: {
    type: String,
    required: true
  },
  departmentId: {
    type: Number,
    required: false
  },
  departmentName: {
    type: String,
    required: false
  },
  appointmentDate: {
    type: Date,
    required: true,
    index: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
    index: true
  },
  reason: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    default: ''
  },
  confirmedBy: {
    type: String,
    default: null
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: String,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index composé pour recherches rapides
appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, status: 1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
