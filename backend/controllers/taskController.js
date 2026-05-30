import Task from '../models/Task.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { emitToUser, emitToAll } from '../services/socketService.js';
import { sendEmail } from '../services/emailService.js';

// Helper to notify a user both via WebSocket and DB entry, plus optional email
const notifyUser = async (recipientId, senderId, text, task, triggerEmail = false) => {
  try {
    // 1. Save notification in DB
    const notif = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      text,
      task: task._id,
    });

    // Populate sender details for UI
    const populatedNotif = await Notification.findById(notif._id)
      .populate('sender', 'name email avatar')
      .populate('task', 'title status');

    // 2. Emit WebSocket event
    emitToUser(recipientId, 'notification', populatedNotif);

    // 3. Send Email if requested
    if (triggerEmail) {
      const recipient = await User.findById(recipientId);
      if (recipient && recipient.email) {
        await sendEmail({
          to: recipient.email,
          subject: 'TaskFlow Collaboration Alert',
          text: `Hello ${recipient.name},\n\n${text}\n\nTask Details:\nTitle: ${task.title}\nStatus: ${task.status}\nPriority: ${task.priority}\nDue Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date set'}\n\nCheck your dashboard for updates.\n\nTaskFlow System`,
          html: `<p>Hello <strong>${recipient.name}</strong>,</p>
                 <p>${text}</p>
                 <hr/>
                 <h3>Task Details</h3>
                 <ul>
                   <li><strong>Title:</strong> ${task.title}</li>
                   <li><strong>Status:</strong> ${task.status}</li>
                   <li><strong>Priority:</strong> ${task.priority}</li>
                   <li><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date set'}</li>
                 </ul>
                 <p>Log in to your dashboard to review it.</p>`,
        });
      }
    }
  } catch (error) {
    console.error('Failed to dispatch notification / email:', error.message);
  }
};

// @desc    Get all tasks with filters, search, and pagination
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo, q, page = 1, limit = 100 } = req.query;

    const query = {};

    // Filter rules
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // Search query keyword filter
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    // Pagination settings
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalTasks = await Task.countDocuments(query);
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .populate('comments.user', 'name email avatar role')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total: totalTasks,
      pages: Math.ceil(totalTasks / limitNum),
      currentPage: pageNum,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .populate('comments.user', 'name email avatar role');

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status: status || 'Pending',
      priority: priority || 'Medium',
      assignedTo: assignedTo || [],
      dueDate,
      createdBy: req.user._id,
    });

    // Create Audit Log entry
    await ActivityLog.create({
      user: req.user._id,
      task: task._id,
      text: `created the task "${task.title}"`,
      type: 'create',
    });

    // Notify all assigned users
    if (task.assignedTo && task.assignedTo.length > 0) {
      for (const userId of task.assignedTo) {
        if (String(userId) !== String(req.user._id)) {
          await notifyUser(
            userId,
            req.user._id,
            `You have been assigned to task "${task.title}" by ${req.user.name}`,
            task,
            true // Trigger email for assignments
          );
        }
      }
    }

    // Broadcast update globally to refresh lists
    emitToAll('task-update', { action: 'create', taskId: task._id });

    // Fetch fully populated new task to return
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role');

    res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const originalAssigned = task.assignedTo.map(id => String(id));

    // Update properties
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    
    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.assignedTo = assignedTo || task.assignedTo;
    task.dueDate = dueDate || task.dueDate;

    await task.save();

    // Create Audit Log
    await ActivityLog.create({
      user: req.user._id,
      task: task._id,
      text: `updated task "${task.title}" details`,
      type: 'update',
    });

    // Find newly assigned users to notify
    const updatedAssigned = task.assignedTo.map(id => String(id));
    const newlyAssigned = updatedAssigned.filter(id => !originalAssigned.includes(id));

    for (const userId of newlyAssigned) {
      if (String(userId) !== String(req.user._id)) {
        await notifyUser(
          userId,
          req.user._id,
          `You have been assigned to task "${task.title}" by ${req.user.name}`,
          task,
          true
        );
      }
    }

    // Broadcast update
    emitToAll('task-update', { action: 'update', taskId: task._id });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .populate('comments.user', 'name email avatar role');

    res.status(200).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Check user role, or prevent deletion unless owner/admin/manager
    if (
      req.user.role !== 'Admin' &&
      req.user.role !== 'Manager' &&
      String(task.createdBy) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this task. Requires Owner, Manager, or Admin status',
      });
    }

    // Save title for logs before delete
    const taskTitle = task.title;

    await Task.findByIdAndDelete(req.params.id);

    // Create Audit Log
    await ActivityLog.create({
      user: req.user._id,
      text: `deleted task "${taskTitle}"`,
      type: 'delete',
    });

    // Notify original assignees of task deletion
    for (const userId of task.assignedTo) {
      if (String(userId) !== String(req.user._id)) {
        await notifyUser(
          userId,
          req.user._id,
          `Task "${taskTitle}" has been deleted by ${req.user.name}`,
          { title: taskTitle, status: 'Deleted', priority: 'N/A' },
          false
        );
      }
    }

    // Broadcast update
    emitToAll('task-update', { action: 'delete', taskId: req.params.id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (patch quick update)
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const patchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const previousStatus = task.status;
    task.status = status;
    await task.save();

    // Log status change activity
    await ActivityLog.create({
      user: req.user._id,
      task: task._id,
      text: `moved "${task.title}" status from ${previousStatus} to ${status}`,
      type: 'status_change',
    });

    // Notify Creator & Assignees (except the actor)
    const notifyList = new Set([...task.assignedTo.map(id => String(id)), String(task.createdBy)]);
    notifyList.delete(String(req.user._id));

    for (const userId of notifyList) {
      await notifyUser(
        userId,
        req.user._id,
        `Task "${task.title}" status was changed to ${status} by ${req.user.name}`,
        task,
        false // Trigger websocket only to prevent email spam for status updates
      );
    }

    // Broadcast status change
    emitToAll('task-update', { action: 'status_change', taskId: task._id, status });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .populate('comments.user', 'name email avatar role');

    res.status(200).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const newComment = {
      user: req.user._id,
      text,
    };

    task.comments.push(newComment);
    await task.save();

    // Log comment activity
    await ActivityLog.create({
      user: req.user._id,
      task: task._id,
      text: `commented on task "${task.title}": "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
      type: 'comment',
    });

    // Notify Creator & Assignees
    const notifyList = new Set([...task.assignedTo.map(id => String(id)), String(task.createdBy)]);
    notifyList.delete(String(req.user._id));

    for (const userId of notifyList) {
      await notifyUser(
        userId,
        req.user._id,
        `${req.user.name} commented on "${task.title}": "${text.substring(0, 40)}..."`,
        task,
        true // Trigger email for comments to notify teammates offline
      );
    }

    // Broadcast comments refresh to anyone looking at the details
    emitToAll('task-update', { action: 'comment', taskId: task._id });

    // Return the updated task with populated comments
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .populate('comments.user', 'name email avatar role');

    res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity logs
// @route   GET /api/tasks/activities
// @access  Private
export const getActivities = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
