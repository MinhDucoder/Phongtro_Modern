import express from 'express';
import mongoose from 'mongoose';
import catchAsync from '../../middlewares/catchAsync.js';

const systemRoute = express.Router();

systemRoute.get('/health', catchAsync(async (req, res) => {
  try {
    // Check MongoDB connection
    const status = mongoose.connection.readyState;
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const mongoStatus = {
      status: statusMap[status] || 'unknown',
      connected: status === 1
    };
    
    // Return system health
    return res.status(200).json({
      success: true,
      data: {
        server: {
          status: 'running',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        },
        database: mongoStatus
      }
    });
  } catch (error) {
    console.error('Error checking system health:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking system health',
      error: error.message
    });
  }
}));

// Endpoint to check if a specific collection and document exists
systemRoute.get('/verify/:collection/:id', catchAsync(async (req, res) => {
  try {
    const { collection, id } = req.params;
    
    if (!mongoose.connection.readyState) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === collection);
    
    if (!collectionExists) {
      return res.status(404).json({
        success: false,
        message: `Collection '${collection}' not found`
      });
    }
    
    // Try to find document by ID
    const db = mongoose.connection.db;
    const result = await db.collection(collection).findOne({ _id: mongoose.Types.ObjectId.createFromHexString(id) });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Document with ID '${id}' not found in collection '${collection}'`
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `Document with ID '${id}' exists in collection '${collection}'`,
      data: {
        exists: true,
        documentPreview: {
          _id: result._id,
          // Include a few safe fields for preview
          ...('created_at' in result && { created_at: result.created_at }),
          ...('updated_at' in result && { updated_at: result.updated_at }),
          ...('is_deleted' in result && { is_deleted: result.is_deleted })
        }
      }
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying document',
      error: error.message
    });
  }
}));

export default systemRoute;