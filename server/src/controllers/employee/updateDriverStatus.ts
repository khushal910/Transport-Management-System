// @ts-nocheck
import Driver from '../../models/driver.schema';
import response from '../../response/response';
import {
  DRIVER_STATUS,
  MANUALLY_CHANGEABLE_STATUSES,
} from '../../constants/driverStatus.constants';
import { prepareDriverStatusUpdate, validateStatusTransition } from '../../utils/driverStatusManager';

/**
 * Update driver status manually by admin/manager
 * Only allows status changes when driver is not on a trip
 * Maintains audit trail of all status changes
 */
const updateDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    const companyId = req.user.companyId;

    // Validate input
    if (!status) {
      return response(res, 400, false, 'Driver status is required');
    }

    // Check if status is valid
    if (!MANUALLY_CHANGEABLE_STATUSES.includes(status)) {
      return response(res, 400, false, `Invalid manual status: "${status}". Allowed: ${MANUALLY_CHANGEABLE_STATUSES.join(', ')}`);
    }

    // Check if driver exists
    const driver = await Driver.findById(driverId).populate('user', 'company');
    
    if (!driver) {
      console.error(`[Backend] Driver not found: ${driverId}`);
      return response(res, 404, false, 'Driver not found');
    }

    // Verify driver belongs to manager's company
    if (driver.user.company.toString() !== companyId.toString()) {
      console.error(`[Backend] Company mismatch:`, {
        driverCompany: driver.user.company.toString(),
        userCompany: companyId.toString(),
      });
      return response(res, 403, false, 'Unauthorized: Driver does not belong to your company');
    }

    // Validate status transition
    try {
      validateStatusTransition(driver.status, status);
    } catch (error) {
      console.error(`[Backend] Transition validation failed:`, error.message);
      return response(res, 400, false, error.message);
    }

    // If changing to same status, return success
    if (driver.status === status) {
      return response(res, 200, true, 'Driver status unchanged', {
        driverId: driver._id,
        currentStatus: driver.status,
        message: 'Driver already has this status',
      });
    }

    // Check if driver is ON_TRIP - cannot manually change
    if (driver.status === DRIVER_STATUS.ON_TRIP) {
      console.error(`[Backend] Cannot update driver on trip`);
      return response(res, 400, false, 'Driver is currently on a trip and cannot be updated manually. Wait for trip completion.');
    }

    // Prepare status update with audit trail
    const updateData = prepareDriverStatusUpdate(driver, status, {
      reason: 'manual_update',
      changedBy: userId,
    });

    // Update driver
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    return response(res, 200, true, 'Driver status updated successfully', {
      driverId: updatedDriver._id,
      previousStatus: driver.status,
      currentStatus: updatedDriver.status,
      lastStatusChange: updatedDriver.lastStatusChange,
      driverName: updatedDriver.user.name,
      driverEmail: updatedDriver.user.email,
    });
  } catch (error) {
    console.error('Error updating driver status:', error);
    return response(res, 500, false, 'Internal server error');
  }
};

/**
 * Get driver status history and details
 */
const getDriverStatusHistory = async (req, res) => {
  try {
    const { driverId } = req.params;
    const companyId = req.user?.companyId;

    if (!driverId) {
      return response(res, 400, false, 'Driver ID is required');
    }

    if (!companyId) {
      return response(res, 401, false, 'User is not authenticated or missing company information');
    }

    // Check if driver exists
    const driver = await Driver.findById(driverId)
      .populate('user', 'name email company')
      .populate('statusHistory.changedBy', 'name email role');

    if (!driver) {
      return response(res, 404, false, 'Driver not found');
    }

    // Verify driver belongs to user's company
    if (driver.user.company.toString() !== companyId.toString()) {
      return response(res, 403, false, 'Unauthorized: Driver does not belong to your company');
    }

    return response(res, 200, true, 'Driver status history retrieved', {
      driverId: driver._id,
      driverName: driver.user.name,
      driverEmail: driver.user.email,
      currentStatus: driver.status,
      lastStatusChange: driver.lastStatusChange,
      statusHistory: driver.statusHistory.map((record) => ({
        fromStatus: record.fromStatus,
        toStatus: record.toStatus,
        reason: record.reason,
        changedBy: record.changedBy ? {
          userId: record.changedBy._id,
          name: record.changedBy.name,
          role: record.changedBy.role,
        } : 'System (Automatic)',
        changedAt: record.changedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching driver status history:', error);
    return response(res, 500, false, 'Internal server error');
  }
};

/**
 * Get list of drivers by status
 */
const getDriversByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const companyId = req.user.companyId;

    if (status && !Object.values(DRIVER_STATUS).includes(status)) {
      return response(res, 400, false, `Invalid status: "${status}"`);
    }

    const filter = { 'user.company': companyId };
    if (status) {
      filter.status = status;
    }

    const drivers = await Driver.find(filter)
      .populate('user', 'name email')
      .select('status lastStatusChange safetyScore completionRate licenseExpiry');

    return response(res, 200, true, 'Drivers retrieved successfully', {
      total: drivers.length,
      drivers: drivers.map((driver) => ({
        driverId: driver._id,
        name: driver.user.name,
        email: driver.user.email,
        status: driver.status,
        lastStatusChange: driver.lastStatusChange,
        safetyScore: driver.safetyScore,
        completionRate: driver.completionRate,
        licenseExpiry: driver.licenseExpiry,
      })),
    });
  } catch (error) {
    console.error('Error fetching drivers by status:', error);
    return response(res, 500, false, 'Internal server error');
  }
};

export { updateDriverStatus, getDriverStatusHistory, getDriversByStatus };

