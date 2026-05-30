import User from '../models/User.js';
import Task from '../models/Task.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      console.log('Database already has data. Skipping seeder.');
      return;
    }

    console.log('Seeding initial database content...');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Siddharth (Admin)',
        email: 'siddharth@example.com',
        password: 'password123',
        role: 'Admin',
        avatar: 'S',
      },
      {
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: 'password123',
        role: 'Manager',
        avatar: 'SC',
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'Employee',
        avatar: 'JD',
      },
      {
        name: 'Elena Rostova',
        email: 'elena@example.com',
        password: 'password123',
        role: 'Employee',
        avatar: 'ER',
      },
    ]);

    console.log(`Seeded ${users.length} users successfully. Default password is 'password123'`);

    const admin = users[0];
    const manager = users[1];
    const john = users[2];
    const elena = users[3];

    // 2. Create Tasks
    const tasks = await Task.create([
      {
        title: 'Design System & Style Guidelines',
        description: 'Design dark/light mode CSS colors, typography scale, buttons, badges and reusable glassmorphism cards for the layout.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
        assignedTo: [admin._id, elena._id],
        createdBy: manager._id,
        comments: [
          { user: elena._id, text: 'Added initial colors palette in index.css.' },
          { user: admin._id, text: 'Looks stellar, thanks Elena!' }
        ],
      },
      {
        title: 'Implement JWT Authentication Flow',
        description: 'Create protected routes, login / registration page validations, token local storage sync and API interceptor header injection.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
        assignedTo: [admin._id],
        createdBy: manager._id,
        comments: [],
      },
      {
        title: 'Kanban Board Drag & Drop Interface',
        description: 'Integrate @hello-pangea/dnd columns with columns representing Pending, In Progress, and Completed states. Ensure updates sync with storage.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 86400000 * 12),
        assignedTo: [manager._id, elena._id],
        createdBy: admin._id,
        comments: [],
      },
      {
        title: 'WebSocket Real-Time Notification Panel',
        description: 'Write Socket.IO client service to trigger top-right desktop-style toast banners whenever coworkers create or update dashboard items.',
        status: 'Pending',
        priority: 'Low',
        dueDate: new Date(Date.now() + 86400000 * 15),
        assignedTo: [john._id],
        createdBy: admin._id,
        comments: [],
      },
    ]);

    console.log(`Seeded ${tasks.length} tasks successfully.`);
  } catch (error) {
    console.error(`Database seeding error: ${error.message}`);
  }
};
