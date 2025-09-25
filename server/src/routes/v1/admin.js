import express from 'express'
import AdminUserController from '../../controllers/AdminUserController.js'
import authenticate from '../../middlewares/authenticate.js'
import checkRole from '../../middlewares/checkRole.js'
import catchAsync from '../../middlewares/catchAsync.js'

const adminRoute = express.Router()

// Auth middleware for admin routes
adminRoute.use(authenticate)
adminRoute.use(checkRole(['admin']))

// User Management Routes
adminRoute.get('/users', catchAsync(AdminUserController.getAllUsers))
adminRoute.get('/users/:id', catchAsync(AdminUserController.getUserById))
adminRoute.put('/users/:id', catchAsync(AdminUserController.updateUser))
adminRoute.patch('/users/:id/ban', catchAsync(AdminUserController.toggleBanUser))
adminRoute.delete('/users/:id', catchAsync(AdminUserController.deleteUser))
adminRoute.post('/users/:id/force-delete', catchAsync(AdminUserController.hardDeleteUser))
adminRoute.get('/recent-activities', catchAsync(AdminUserController.getRecentActivities))

export default adminRoute