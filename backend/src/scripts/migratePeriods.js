require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/Course');
const Evaluation = require('../models/Evaluation');
const { defaultPeriods } = require('../utils/periods');

async function migrate() {
  await connectDB();
  const courses = await Course.find({});
  let coursesUpdated = 0;
  let evaluationsUpdated = 0;

  for (const course of courses) {
    if (!course.periods?.length) {
      course.periods = defaultPeriods();
      await course.save();
      coursesUpdated += 1;
    }
    const result = await Evaluation.updateMany(
      { courseId: course._id, $or: [{ periodId: { $exists: false } }, { periodId: null }] },
      { $set: { periodId: course.periods[0]._id } }
    );
    evaluationsUpdated += result.modifiedCount;
  }

  const remaining = await Evaluation.countDocuments({ $or: [{ periodId: { $exists: false } }, { periodId: null }] });
  console.log(JSON.stringify({ coursesUpdated, evaluationsUpdated, evaluationsWithoutPeriod: remaining }));
  if (remaining > 0) process.exitCode = 1;
}

migrate()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => mongoose.disconnect());
