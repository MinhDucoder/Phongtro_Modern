import express from 'express'
import AdminUserController from '~/controllers/AdminUserController'
import AdminPostController from '~/controllers/AdminPostController'
import { getDashboardOverview } from '~/controllers/AdminDashboardController'
import { authenticate } from '~/middlewares/checkToken'
import checkRole from '~/middlewares/checkRole'
import catchAsync from '~/middlewares/catchAsync'

const adminRoute = express.Router()

// Auth middleware for admin routes
adminRoute.use(authenticate())
adminRoute.use(checkRole(['admin']))

// Dashboard Routes
adminRoute.get('/dashboard', getDashboardOverview)

// User Management Routes
adminRoute.get('/users', catchAsync(AdminUserController.getAllUsers))
adminRoute.get('/users/:id', catchAsync(AdminUserController.getUserById))
adminRoute.put('/users/:id', catchAsync(AdminUserController.updateUser))
adminRoute.patch('/users/:id/ban', catchAsync(AdminUserController.toggleBanUser))
adminRoute.delete('/users/:id', catchAsync(AdminUserController.deleteUser))
adminRoute.post('/users/:id/force-delete', catchAsync(AdminUserController.hardDeleteUser))
adminRoute.get('/recent-activities', catchAsync(AdminUserController.getRecentActivities))

// Post Management Routes
adminRoute.get('/posts', catchAsync(AdminPostController.getAllPosts))
adminRoute.get('/posts/:id', catchAsync(AdminPostController.getPostById))
adminRoute.patch('/posts/:id/status', catchAsync(AdminPostController.updatePostStatus))
adminRoute.delete('/posts/:id', catchAsync(AdminPostController.deletePost))

export default adminRoute