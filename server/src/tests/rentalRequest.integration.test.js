import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';

import rentalRequestRoute from '../routes/v1/rentalRequest.js';
import User from '../models/userSchema.js';
import Room from '../models/roomSchema.js';
import Post from '../models/postSchema.js';

const JWT_SECRET = 'integration-test-secret';
process.env.JWT_SECRET = JWT_SECRET;

const createToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/v1/rental-requests', rentalRequestRoute);
  return request(app);
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const log = (message) => console.log(message); // eslint-disable-line no-console

const run = async () => {
  let mongoServer;

  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    log('🧪 Running rental request integration tests...');

    const landlord = await User.create({
      full_name: 'Landlord Lisa',
      email: 'landlord@example.com',
      password: 'hashed-password',
      role: 'landlord',
      phone: '0900000001',
    });

    const tenantOne = await User.create({
      full_name: 'Tenant Tony',
      email: 'tenant1@example.com',
      password: 'hashed-password',
      role: 'user',
      phone: '0900000002',
    });

    const tenantTwo = await User.create({
      full_name: 'Tenant Tina',
      email: 'tenant2@example.com',
      password: 'hashed-password',
      role: 'user',
      phone: '0900000003',
    });

    const room = await Room.create({
      title: 'Phòng đẹp quận 1',
      city: 'Hồ Chí Minh',
      address: '123 Nguyễn Huệ',
      price: 5000000,
      area: 25,
      landlord: landlord._id,
    });

    const post = await Post.create({
      roomId: room._id,
      landlord: landlord._id,
      propertyType: 'phong_tro',
      status: 'active',
    });

    const agent = buildApp();

    const tenantToken = createToken(tenantOne);
    const expectedMoveIn = new Date();
    expectedMoveIn.setDate(expectedMoveIn.getDate() + 7);

    const createResponse = await agent
      .post('/api/v1/rental-requests')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        postId: post._id.toString(),
        message: 'Tôi muốn xem phòng vào cuối tuần.',
        expectedMoveIn: expectedMoveIn.toISOString(),
      });

    assert(createResponse.status === 201, `Expected status 201, got ${createResponse.status}`);
    assert(createResponse.body?.success === true, 'Expected success response when creating request');

    const createdRequestId = createResponse.body.data?._id;
    assert(Boolean(createdRequestId), 'Created rental request should return an id');

    const landlordToken = createToken(landlord);

    const acceptResponse = await agent
      .patch(`/api/v1/rental-requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({ status: 'accepted', responseMessage: 'Hẹn gặp bạn cuối tuần này!' });

    assert(acceptResponse.status === 200, `Expected status 200 on accept, got ${acceptResponse.status}`);
    assert(acceptResponse.body?.data?.status === 'accepted', 'Request status should be updated to accepted');

    log('✅ Rental request creation + acceptance passed');

    const tenantTwoToken = createToken(tenantTwo);
    const secondRequestResponse = await agent
      .post('/api/v1/rental-requests')
      .set('Authorization', `Bearer ${tenantTwoToken}`)
      .send({
        postId: post._id.toString(),
        message: 'Xin chào, phòng còn không ạ?',
        expectedMoveIn: expectedMoveIn.toISOString(),
      });

    assert(
      secondRequestResponse.status === 201,
      `Expected status 201 for second request, got ${secondRequestResponse.status}`
    );

    const secondRequestId = secondRequestResponse.body.data?._id;
    assert(Boolean(secondRequestId), 'Second rental request should return an id');

    const rejectResponse = await agent
      .patch(`/api/v1/rental-requests/${secondRequestId}/status`)
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({ status: 'rejected', responseMessage: 'Phòng đã có người thuê trước.' });

    assert(rejectResponse.status === 200, `Expected status 200 on reject, got ${rejectResponse.status}`);
    assert(rejectResponse.body?.data?.status === 'rejected', 'Request status should be updated to rejected');

    log('✅ Rental request rejection passed');

    console.log('🎉 All rental request integration tests passed!');
  } catch (error) {
    console.error('❌ Rental request integration test failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
};

run();
