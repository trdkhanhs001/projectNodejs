const DiningTable = require('../models/diningTable.model');

// Get all tables
exports.getAllTables = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [tables, total] = await Promise.all([
    DiningTable.find({ isDeleted: false, isActive: true })
      .skip(skip)
      .limit(limit)
      .sort({ tableNumber: 1 }),
    DiningTable.countDocuments({ isDeleted: false, isActive: true })
  ]);

  return {
    tables,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

// Get available tables only
exports.getAvailableTables = async () => {
  const tables = await DiningTable.find({
    isDeleted: false,
    isActive: true,
    status: 'AVAILABLE'
  }).sort({ tableNumber: 1 });

  return tables;
};

// Get table by ID
exports.getTableById = async (id) => {
  const table = await DiningTable.findById(id);
  return table;
};

// Get table by number
exports.getTableByNumber = async (tableNumber) => {
  const table = await DiningTable.findOne({
    tableNumber: tableNumber.toString(),
    isDeleted: false
  });
  return table;
};

// Create table
exports.createTable = async (data, adminId) => {
  const { tableNumber, capacity, area, notes } = data;

  // Check if table already exists
  const existingTable = await DiningTable.findOne({
    tableNumber: tableNumber.toString()
  });

  if (existingTable) {
    throw new Error('Table number already exists');
  }

  const table = new DiningTable({
    tableNumber: tableNumber.toString(),
    capacity,
    area: area || null,
    notes: notes || null,
    status: 'AVAILABLE',
    createdBy: adminId
  });

  await table.save();
  return table;
};

// Update table
exports.updateTable = async (id, data, adminId) => {
  const { capacity, area, notes, status } = data;

  const table = await DiningTable.findByIdAndUpdate(
    id,
    {
      capacity: capacity || undefined,
      area: area || undefined,
      notes: notes || undefined,
      status: status || undefined,
      updatedBy: adminId
    },
    { new: true, runValidators: true }
  );

  if (!table) {
    throw new Error('Table not found');
  }

  return table;
};

// Update table status
exports.updateTableStatus = async (tableNumber, newStatus) => {
  const table = await DiningTable.findOneAndUpdate(
    { tableNumber: tableNumber.toString() },
    { status: newStatus },
    { new: true }
  );

  if (!table) {
    throw new Error('Table not found');
  }

  return table;
};

// Mark table as occupied
exports.markTableOccupied = async (tableNumber) => {
  return await exports.updateTableStatus(tableNumber, 'OCCUPIED');
};

// Mark table as available
exports.markTableAvailable = async (tableNumber) => {
  return await exports.updateTableStatus(tableNumber, 'AVAILABLE');
};

// Get table statistics
exports.getTableStats = async () => {
  const stats = {
    total: await DiningTable.countDocuments({ isDeleted: false, isActive: true }),
    available: await DiningTable.countDocuments({ isDeleted: false, isActive: true, status: 'AVAILABLE' }),
    occupied: await DiningTable.countDocuments({ isDeleted: false, isActive: true, status: 'OCCUPIED' }),
    reserved: await DiningTable.countDocuments({ isDeleted: false, isActive: true, status: 'RESERVED' }),
    cleaning: await DiningTable.countDocuments({ isDeleted: false, isActive: true, status: 'CLEANING' })
  };

  return stats;
};

// Soft delete table
exports.deleteTable = async (id) => {
  const table = await DiningTable.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  return table;
};
