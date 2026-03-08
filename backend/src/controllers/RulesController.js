
import RulesModel from "../models/RulesModel.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { RULE_TYPES, PROGRAM_TYPES, ACADEMIC_RANKS } from "../config/constants.js";

class RulesController {
  // ==================== CRUD OPERATIONS ====================

  // Get all system rules with advanced filtering
  static async getAllRules(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        rule_type,
        program_type,
        is_active,
        rule_name,
        effective_from,
      } = req.query;

      const result = await RulesModel.findAll(parseInt(page), parseInt(limit), {
        rule_type,
        program_type,
        is_active:
          is_active === "true"
            ? true
            : is_active === "false"
            ? false
            : undefined,
        rule_name,
        effective_from,
      });

      return sendSuccess(res, "System rules retrieved successfully", result);
    } catch (error) {
      console.error("Get all rules error:", error);
      return sendError(res, "Failed to retrieve system rules", 500);
    }
  }

  // Get rule by ID
  static async getRuleById(req, res) {
    try {
      const { id } = req.params;
      const rule = await RulesModel.findById(parseInt(id));

      if (!rule) {
        return sendError(res, "Rule not found", 404);
      }

      // Get history for this rule
      const history = await RulesModel.getRuleHistory(rule.rule_name);

      return sendSuccess(res, "Rule retrieved successfully", {
        rule,
        history,
      });
    } catch (error) {
      console.error("Get rule error:", error);
      return sendError(res, "Failed to retrieve rule", 500);
    }
  }

  // Create a new rule
  static async createRule(req, res) {
    try {
      const {
        rule_name,
        rule_value,
        rule_type,
        program_type,
        effective_from,
        effective_to,
        description,
      } = req.body;

      // Validate required fields
      if (!rule_name || !rule_value || !rule_type || !effective_from) {
        return sendError(
          res,
          "Rule name, value, type, and effective from date are required",
          400
        );
      }

      // Validate rule type
      const validRuleTypes = Object.values(RULE_TYPES);
      if (!validRuleTypes.includes(rule_type)) {
        return sendError(
          res,
          `Invalid rule type. Must be one of: ${validRuleTypes.join(", ")}`,
          400
        );
      }

      // Validate program type if provided
      if (program_type && program_type !== "all") {
        const validProgramTypes = Object.values(PROGRAM_TYPES);
        if (!validProgramTypes.includes(program_type)) {
          return sendError(
            res,
            `Invalid program type. Must be one of: ${validProgramTypes.join(
              ", "
            )}`,
            400
          );
        }
      }

      // Validate rule value
      if (!RulesModel.validateRuleValue(rule_type, rule_value)) {
        return sendError(res, `Invalid value for rule type: ${rule_type}`, 400);
      }

      // Validate dates
      if (effective_to && new Date(effective_from) >= new Date(effective_to)) {
        return sendError(
          res,
          "Effective from date must be before effective to date",
          400
        );
      }

      const rule = await RulesModel.create({
        rule_name,
        rule_value,
        rule_type,
        program_type: program_type || null,
        effective_from,
        effective_to: effective_to || null,
        description: description || null,
      });

      return sendSuccess(res, "Rule created successfully", rule, 201);
    } catch (error) {
      console.error("Create rule error:", error);
      return sendError(res, error.message || "Failed to create rule", 400);
    }
  }

  // Update a rule (creates new version if active)
  static async updateRule(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if rule exists
      const existingRule = await RulesModel.findById(parseInt(id));
      if (!existingRule) {
        return sendError(res, "Rule not found", 404);
      }

      // Validate rule value if provided
      if (updateData.rule_value !== undefined) {
        const ruleType = updateData.rule_type || existingRule.rule_type;
        if (!RulesModel.validateRuleValue(ruleType, updateData.rule_value)) {
          return sendError(
            res,
            `Invalid value for rule type: ${ruleType}`,
            400
          );
        }
      }

      // If rule is active and value is changing, create new version
      if (
        existingRule.is_active &&
        updateData.rule_value &&
        updateData.rule_value !== existingRule.rule_value
      ) {
        const newRule = await RulesModel.create({
          rule_name: existingRule.rule_name,
          rule_value: updateData.rule_value,
          rule_type: updateData.rule_type || existingRule.rule_type,
          program_type: updateData.program_type || existingRule.program_type,
          effective_from: new Date().toISOString().split("T")[0],
          effective_to: updateData.effective_to || null,
          description: updateData.description || existingRule.description,
          previous_version_id: existingRule.rule_id,
        });

        // Deactivate the old rule
        await RulesModel.deactivate(existingRule.rule_id);

        return sendSuccess(
          res,
          "New rule version created and activated",
          newRule
        );
      }

      // Otherwise, update normally
      const updatedRule = await RulesModel.update(parseInt(id), updateData);
      return sendSuccess(res, "Rule updated successfully", updatedRule);
    } catch (error) {
      console.error("Update rule error:", error);
      return sendError(res, error.message || "Failed to update rule", 400);
    }
  }

  // Delete a rule
  static async deleteRule(req, res) {
    try {
      const { id } = req.params;

      const existingRule = await RulesModel.findById(parseInt(id));
      if (!existingRule) {
        return sendError(res, "Rule not found", 404);
      }

      if (existingRule.is_active) {
        return sendError(
          res,
          "Cannot delete active rule. Deactivate it first.",
          400
        );
      }

      await RulesModel.delete(parseInt(id));
      return sendSuccess(res, "Rule deleted successfully");
    } catch (error) {
      console.error("Delete rule error:", error);
      return sendError(res, "Failed to delete rule", 500);
    }
  }

  // Activate a rule
  static async activateRule(req, res) {
    try {
      const { id } = req.params;

      const existingRule = await RulesModel.findById(parseInt(id));
      if (!existingRule) {
        return sendError(res, "Rule not found", 404);
      }

      if (existingRule.is_active) {
        return sendError(res, "Rule is already active", 400);
      }

      const activatedRule = await RulesModel.activate(parseInt(id));
      return sendSuccess(res, "Rule activated successfully", activatedRule);
    } catch (error) {
      console.error("Activate rule error:", error);
      return sendError(res, "Failed to activate rule", 500);
    }
  }

  // Deactivate a rule
  static async deactivateRule(req, res) {
    try {
      const { id } = req.params;

      const deactivatedRule = await RulesModel.deactivate(parseInt(id));
      return sendSuccess(res, "Rule deactivated successfully", deactivatedRule);
    } catch (error) {
      console.error("Deactivate rule error:", error);
      return sendError(res, "Failed to deactivate rule", 500);
    }
  }

  // ==================== BUSINESS LOGIC OPERATIONS ====================

  // Evaluate a rule
  static async evaluateRule(req, res) {
    try {
      const { rule_name, program_type = null, context = {} } = req.body;

      if (!rule_name) {
        return sendError(res, "Rule name is required", 400);
      }

      const result = await RulesModel.evaluate(
        rule_name,
        program_type,
        context
      );
      return sendSuccess(res, "Rule evaluated successfully", result);
    } catch (error) {
      console.error("Evaluate rule error:", error);
      return sendError(res, error.message || "Failed to evaluate rule", 400);
    }
  }

  // Calculate load with factors
  static async calculateLoad(req, res) {
    try {
      const {
        lecture_hours,
        lab_hours = 0,
        tutorial_hours = 0,
        program_type = "regular",
      } = req.body;

      if (!lecture_hours && lecture_hours !== 0) {
        return sendError(res, "Lecture hours are required", 400);
      }

      const result = await RulesModel.calculateLoad(
        parseFloat(lecture_hours),
        parseFloat(lab_hours),
        parseFloat(tutorial_hours),
        program_type
      );

      return sendSuccess(res, "Load calculated successfully", result);
    } catch (error) {
      console.error("Calculate load error:", error);
      return sendError(res, error.message || "Failed to calculate load", 400);
    }
  }

  // Validate rank load
  static async validateRankLoad(req, res) {
    try {
      const { rank, total_hours, program_type = "regular" } = req.body;

      if (!rank || total_hours === undefined) {
        return sendError(res, "Rank and total hours are required", 400);
      }

      const result = await RulesModel.validateRankLoad(
        rank,
        parseFloat(total_hours),
        program_type
      );

      return sendSuccess(res, "Rank load validation completed", result);
    } catch (error) {
      console.error("Validate rank load error:", error);
      return sendError(
        res,
        error.message || "Failed to validate rank load",
        400
      );
    }
  }

  // Calculate NRP payment
  static async calculateNRPPayment(req, res) {
    try {
      const {
        program_type,
        rate_category = "default",
        credit_hours,
        student_count = 0,
      } = req.body;

      if (!program_type || !credit_hours) {
        return sendError(
          res,
          "Program type and credit hours are required",
          400
        );
      }

      const result = await RulesModel.calculateNRPPayment(
        program_type,
        rate_category,
        parseFloat(credit_hours),
        parseInt(student_count)
      );

      return sendSuccess(res, "NRP payment calculated", result);
    } catch (error) {
      console.error("Calculate NRP payment error:", error);
      return sendError(
        res,
        error.message || "Failed to calculate NRP payment",
        400
      );
    }
  }

  // Calculate overload payment
  static async calculateOverloadPayment(req, res) {
    try {
      const { overload_hours } = req.body;

      if (!overload_hours || overload_hours <= 0) {
        return sendError(res, "Valid overload hours are required", 400);
      }

      const result = await RulesModel.calculateOverloadPayment(
        parseFloat(overload_hours)
      );

      return sendSuccess(res, "Overload payment calculated", result);
    } catch (error) {
      console.error("Calculate overload payment error:", error);
      return sendError(
        res,
        error.message || "Failed to calculate overload payment",
        400
      );
    }
  }

  // Get correction rates
  static async getCorrectionRates(req, res) {
    try {
      const rates = await RulesModel.getCorrectionRates();
      return sendSuccess(res, "Correction rates retrieved", rates);
    } catch (error) {
      console.error("Get correction rates error:", error);
      // Return default values if rules don't exist
      const defaultRates = {
        assignment: 10,
        exam: 15,
        tutorial: 150,
      };
      return sendSuccess(res, "Correction rates retrieved (default)", defaultRates);
    }
  }

  // Apply summer distribution
  static async applySummerDistribution(req, res) {
    try {
      const { total_payment } = req.body;

      if (!total_payment || total_payment <= 0) {
        return sendError(res, "Valid total payment amount is required", 400);
      }

      const result = await RulesModel.applySummerDistribution(
        parseFloat(total_payment)
      );

      return sendSuccess(res, "Summer distribution applied", result);
    } catch (error) {
      console.error("Apply summer distribution error:", error);
      // Return default distribution
      const defaultDistribution = {
        total: parseFloat(total_payment).toFixed(2),
        stage1: parseFloat((total_payment * 0.3).toFixed(2)),
        stage2: parseFloat((total_payment * 0.3).toFixed(2)),
        stage3: parseFloat((total_payment * 0.2).toFixed(2)),
        stage4: parseFloat((total_payment * 0.2).toFixed(2)),
        distribution: {
          stage1: 30.0,
          stage2: 30.0,
          stage3: 20.0,
          stage4: 20.0,
        },
      };
      return sendSuccess(res, "Summer distribution applied (default)", defaultDistribution);
    }
  }

  // ==================== UTILITY OPERATIONS ====================

  // Get rule by name
  static async getRuleByName(req, res) {
    try {
      const { name } = req.params;
      const { program_type } = req.query;

      const rule = await RulesModel.findActiveRuleByName(name, program_type);
      if (!rule) {
        return sendError(res, `Rule '${name}' not found`, 404);
      }

      return sendSuccess(res, "Rule retrieved successfully", rule);
    } catch (error) {
      console.error("Get rule by name error:", error);
      return sendError(res, "Failed to retrieve rule", 500);
    }
  }

  // Get rules by type
  static async getRulesByType(req, res) {
    try {
      const { type } = req.params;
      const { program_type, active_only = "true" } = req.query;

      const validRuleTypes = Object.values(RULE_TYPES);
      if (!validRuleTypes.includes(type)) {
        return sendError(
          res,
          `Invalid rule type. Must be one of: ${validRuleTypes.join(", ")}`,
          400
        );
      }

      const rules = await RulesModel.findByType(
        type,
        program_type,
        active_only === "true"
      );

      return sendSuccess(res, `Rules of type ${type} retrieved`, rules);
    } catch (error) {
      console.error("Get rules by type error:", error);
      return sendError(res, "Failed to retrieve rules by type", 500);
    }
  }

  // Get rule history
  static async getRuleHistory(req, res) {
    try {
      const { name } = req.params;
      const history = await RulesModel.getRuleHistory(name);
      return sendSuccess(res, "Rule history retrieved", history);
    } catch (error) {
      console.error("Get rule history error:", error);
      return sendError(res, "Failed to retrieve rule history", 500);
    }
  }

  // Get rank load limits
  static async getRankLoadLimits(req, res) {
    try {
      const { rank } = req.params;
      const { program_type = "regular" } = req.query;

      const limits = await RulesModel.getRankLimits(rank, program_type);
      return sendSuccess(res, "Rank load limits retrieved", {
        rank,
        program_type,
        ...limits,
      });
    } catch (error) {
      console.error("Get rank load limits error:", error);
      // Return null values if rules don't exist
      return sendSuccess(res, "Rank load limits retrieved", {
        rank,
        min: null,
        max: null,
      });
    }
  }

  // Get all rank load limits
  static async getAllRankLoadLimits(req, res) {
    try {
      const { program_type = "regular" } = req.query;
      const limits = await RulesModel.getAllRankLoadLimits(program_type);
      return sendSuccess(res, "All rank load limits retrieved", limits);
    } catch (error) {
      console.error("Get all rank load limits error:", error);
      // Return empty object if error
      return sendSuccess(res, "All rank load limits retrieved", {});
    }
  }

  // Get load factors
  static async getLoadFactors(req, res) {
    try {
      const { program_type = "regular" } = req.query;
      const factors = await RulesModel.getLoadFactors(program_type);
      return sendSuccess(res, "Load factors retrieved", factors);
    } catch (error) {
      console.error("Get load factors error:", error);
      // Return default factors
      const defaultFactors = {
        lab: 0.75,
        tutorial: 0.5,
        lecture: 1.0,
        module_distance: 1.0,
      };
      return sendSuccess(res, "Load factors retrieved (default)", defaultFactors);
    }
  }

  // Get payment rates
  static async getPaymentRates(req, res) {
    try {
      const { program_type } = req.params;
      const { rate_category } = req.query;

      const rates = await RulesModel.getPaymentRate(
        program_type,
        rate_category
      );
      return sendSuccess(res, "Payment rates retrieved", rates || {});
    } catch (error) {
      console.error("Get payment rates error:", error);
      return sendSuccess(res, "Payment rates retrieved", {});
    }
  }

  // Get summer distribution
  static async getSummerDistribution(req, res) {
    try {
      const distribution = await RulesModel.getSummerDistribution();
      return sendSuccess(res, "Summer distribution retrieved", distribution);
    } catch (error) {
      console.error("Get summer distribution error:", error);
      // Return default distribution
      const defaultDistribution = {
        stage1: 30.0,
        stage2: 30.0,
        stage3: 20.0,
        stage4: 20.0,
      };
      return sendSuccess(res, "Summer distribution retrieved (default)", defaultDistribution);
    }
  }

  // Bulk update rules
  static async bulkUpdateRules(req, res) {
    try {
      const { rules } = req.body;

      if (!rules || !Array.isArray(rules) || rules.length === 0) {
        return sendError(res, "Rules array is required", 400);
      }

      const results = await RulesModel.bulkUpdate(rules);
      return sendSuccess(res, "Rules updated successfully", results);
    } catch (error) {
      console.error("Bulk update rules error:", error);
      return sendError(res, "Failed to update rules", 500);
    }
  }

  // Validate workload
  static async validateWorkload(req, res) {
    try {
      const workloadData = req.body;

      if (!workloadData.staff_id) {
        return sendError(res, "Staff ID is required", 400);
      }

      const validation = await RulesModel.validateWorkload(workloadData);
      return sendSuccess(res, "Workload validation completed", validation);
    } catch (error) {
      console.error("Validate workload error:", error);
      return sendError(
        res,
        error.message || "Failed to validate workload",
        400
      );
    }
  }

  // Get rules dashboard
  static async getRulesDashboard(req, res) {
    try {
      const dashboard = await RulesModel.getDashboardSummary();
      return sendSuccess(res, "Rules dashboard retrieved", dashboard);
    } catch (error) {
      console.error("Get rules dashboard error:", error);
      return sendError(res, "Failed to get rules dashboard", 500);
    }
  }

  // Clear cache (admin only)
  static async clearCache(req, res) {
    try {
      RulesModel.clearCache();
      return sendSuccess(res, "Rules cache cleared");
    } catch (error) {
      console.error("Clear cache error:", error);
      return sendError(res, "Failed to clear cache", 500);
    }
  }

  // Get active rate tables
  static async getActiveRateTables(req, res) {
    try {
      const { program_type } = req.query;

      const rates = await RulesModel.getActiveRateTables(program_type);
      return sendSuccess(res, "Active rate tables retrieved", rates);
    } catch (error) {
      console.error("Get active rate tables error:", error);
      return sendError(res, "Failed to get rate tables", 500);
    }
  }

  // Get active tax rules
  static async getActiveTaxRules(req, res) {
    try {
      const { program_type } = req.query;

      const taxRules = await RulesModel.getActiveTaxRules(program_type);
      return sendSuccess(res, "Active tax rules retrieved", taxRules);
    } catch (error) {
      console.error("Get active tax rules error:", error);
      return sendError(res, "Failed to get tax rules", 500);
    }
  }
}

export default RulesController;