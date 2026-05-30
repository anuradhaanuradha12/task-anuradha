let io = null;

export const setIO = (ioInstance) => {
  io = ioInstance;
};

export const getIO = () => {
  return io;
};

export const emitToUser = (userId, eventName, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(eventName, data);
  }
};

export const emitToAll = (eventName, data) => {
  if (io) {
    io.emit(eventName, data);
  }
};
