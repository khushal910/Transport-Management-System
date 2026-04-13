// @ts-nocheck
import FuelLog from '../../models/fuel.schema';
import Driver from '../../models/driver.schema';
import response from '../../response/response';
import { expenseListSchema } from '../../validations/expense.list.validator';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../../config/paginationConfig';

const buildFilterObject = (filters) => {
  const filterObj = {};

  if (filters.status) {
    filterObj.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    filterObj.date = {};
    if (filters.startDate) {
      filterObj.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filterObj.date.$lte = endDate;
    }
  }

  if (filters.minCost !== undefined || filters.maxCost !== undefined) {
    filterObj.totalCost = {};
    if (filters.minCost !== undefined) {
      filterObj.totalCost.$gte = Number(filters.minCost);
    }
    if (filters.maxCost !== undefined) {
      filterObj.totalCost.$lte = Number(filters.maxCost);
    }
  }

  if (filters.driverId) {
    filterObj.driver = filters.driverId;
  }

  return filterObj;
};

const parseSort = (sortString) => {
  const [field, order] = sortString.split(':');
  return { [field]: order === 'desc' ? -1 : 1 };
};

export const getExpenseList = async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = expenseListSchema.validate(req.query, { abortEarly: true });
    if (error) {
      return response(res, 400, false, error.details[0]?.message || 'Validation failed');
    }

    const companyId = req.user?.companyId;
    const userRole = req.user?.role;
    const userId = req.user?.userId || req.user?.id;
    const {
      page = 1,
      limit = DEFAULT_LIMIT,
      sort = 'date:desc',
      groupBy = '',
      status,
      startDate,
      endDate,
      minCost,
      maxCost,
      driverId,
    } = value;

    if (!companyId) {
      return response(res, 401, false, 'Company not found in token');
    }

    const pageNum = Math.max(1, parseInt(page));
    const pageLimit = Math.min(MAX_LIMIT, parseInt(limit));
    const skip = (pageNum - 1) * pageLimit;

    // Build filter
    const filterObj = buildFilterObject({
      status,
      startDate,
      endDate,
      minCost,
      maxCost,
      driverId,
    });
    filterObj.company = companyId;

    // If user is a driver, only show expenses for their own trips
    if (userRole === 'driver') {
      const driverRecord = await Driver.findOne({ user: userId });
      if (driverRecord) {
        filterObj.driver = driverRecord._id;
      } else {
        return response(res, 200, true, 'Expenses retrieved successfully', {
          expenses: [],
          pagination: { page: pageNum, limit: pageLimit, total: 0, totalPages: 0 },
          isGrouped: false,
        });
      }
    }

    // Fetch data
    const expenses = await FuelLog.find(filterObj)
      .populate('trip', 'startLocation endLocation status')
      .populate({
        path: 'driver',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name',
        },
      })
      .populate('vehicle', 'name licensePlate model')
      .sort(parseSort(sort))
      .skip(skip)
      .limit(pageLimit);

    const total = await FuelLog.countDocuments(filterObj);

    // Normalize data
    const normalizedExpenses = expenses.map((expense) => ({
      _id: expense._id,
      tripId: expense.trip?._id?.toString().slice(-3) || expense.trip?._id || 'N/A',
      driverName: expense.driver?.user?.name || 'N/A',
      vehicleName: expense.vehicle?.name || 'N/A',
      plateNumber: expense.vehicle?.licensePlate || 'N/A',
      model: expense.vehicle?.model || 'N/A',
      distance: expense.distance || 0,
      fuelCost: expense.fuelCost,
      miscExpense: expense.miscExpense,
      totalCost: expense.fuelCost + expense.miscExpense,
      status: expense.status,
      date: expense.date,
      startLocation: expense.trip?.startLocation || 'N/A',
      endLocation: expense.trip?.endLocation || 'N/A',
    }));

    // Group if needed
    let result = normalizedExpenses;
    if (groupBy === 'status') {
      result = normalizedExpenses.reduce((acc, expense) => {
        const key = expense.status;
        if (!acc[key]) acc[key] = [];
        acc[key].push(expense);
        return acc;
      }, {});
    } else if (groupBy === 'vehicle') {
      result = normalizedExpenses.reduce((acc, expense) => {
        const key = expense.vehicleName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(expense);
        return acc;
      }, {});
    } else if (groupBy === 'driver') {
      result = normalizedExpenses.reduce((acc, expense) => {
        const key = expense.driverName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(expense);
        return acc;
      }, {});
    }

    return response(res, 200, true, 'Expenses retrieved successfully', {
      expenses: result,
      pagination: {
        page: pageNum,
        limit: pageLimit,
        total,
        totalPages: Math.ceil(total / pageLimit),
      },
      isGrouped: !!groupBy,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return response(res, 500, false, error.message || 'Error fetching expenses');
  }
};

