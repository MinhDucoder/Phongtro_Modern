import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Post from '../models/postSchema.js';
import Room from '../models/roomSchema.js';
import User from '../models/userSchema.js';

describe('Post detail view tracking', () => {
  let landlord;
  let room;
  let post;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phongtro_test');

    landlord = await User.create({
      full_name: 'LL Test',
      email: `ll_${Date.now()}@test.com`,
      password: 'hashed',
      role: 'landlord',
    });

    room = await Room.create({
      title: 'Room A',
      city: 'Hanoi',
      price: 1000000,
      landlord: landlord._id,
      propertyType: 'phong_tro',
    });

    post = await Post.create({
      roomId: room._id,
      landlord: landlord._id,
      propertyType: 'phong_tro',
      status: 'active',
      expiresAt: new Date(Date.now() + 7*24*60*60*1000),
      postDuration: 7,
    });
  });

  afterAll(async () => {
    await Post.deleteMany({ landlord: landlord?._id });
    await Room.deleteMany({ landlord: landlord?._id });
    await User.deleteOne({ _id: landlord?._id });
    await mongoose.connection.close();
  });

  it('increments views and visits on first detail fetch', async () => {
    const before = await Post.findById(post._id).lean();

    const res = await request(app)
      .get(`/api/v1/posts/${post._id}`)
      .set('User-Agent', 'jest-agent')
      .set('X-Forwarded-For', '1.2.3.4')
      .expect(200);

    expect(res.body.success).toBe(true);

    const after = await Post.findById(post._id).lean();
    expect((after.views?.total || 0)).toBe((before.views?.total || 0) + 1);
    expect((after.visits?.total || 0)).toBe((before.visits?.total || 0) + 1);
  });

  it('increments only views (not visits) for same IP/UA same day', async () => {
    const before = await Post.findById(post._id).lean();

    await request(app)
      .get(`/api/v1/posts/${post._id}`)
      .set('User-Agent', 'jest-agent')
      .set('X-Forwarded-For', '1.2.3.4')
      .expect(200);

    const after = await Post.findById(post._id).lean();
    expect((after.views?.total || 0)).toBe((before.views?.total || 0) + 1);
    expect((after.visits?.total || 0)).toBe((before.visits?.total || 0));
  });
});



