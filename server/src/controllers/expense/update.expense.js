import FuelLog from "../../models/fuel.schema.js";
import Trip from "../../models/trip.schema.js";
import response from "../../response/response.js";
import expenseUpdateSchema from "../../validations/expense.update.validator.js";
import mongoose from "mongoose";

const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const companyId = req.user.companyId;

    if (!expenseId) {
      return response(res, 400, false, "Expense ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return response(res, 400, false, "Invalid Expense ID");
    }

    // Validate update data
    const { error, value } = expenseUpdateSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return response(
        res,
        400,
        false,
        "Invalid expense data",
        error.details.map((detail) => detail.message.replace(/"/g, ""))
      );
    }

    // Find expense and verify it belongs to the company
    const expense = await FuelLog.findOne({ _id: expenseId, company: companyId });
    if (!expense) {
      return response(res, 404, false, "Expense not found or does not belong to your company");
    }

    // Only allow updating pending expenses
    if (expense.status !== "pending") {
      return response(res, 400, false, `Cannot update expense with status '${expense.status}'. Only pending expenses can be updated.`);
    }

    // Calculate distance from trip odometers if not provided
    let updateData = { ...value };
    if (!updateData.distance || updateData.distance === 0) {
      const trip = await Trip.findById(expense.trip);
      if (trip?.startOdometer && trip?.endOdometer) {
        updateData.distance = trip.endOdometer - trip.startOdometer;
      }
    }

    // If user fills in fuelCost and distance, mark as completed
    if (updateData.fuelCost !== undefined && updateData.distance !== undefined && updateData.distance > 0) {
      updateData.status = "completed";
    }

    // Update the expense
    const updatedExpense = await FuelLog.findByIdAndUpdate(
      expenseId,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).populate("trip driver vehicle");

    if (!updatedExpense) {
      return response(res, 404, false, "Expense not found");
    }

    response(res, 200, true, "Expense updated successfully", updatedExpense);
  } catch (error) {
    console.error("Expense update error:", error);
    response(res, 500, false, "Error updating expense");
  }
};

export default updateExpense;
