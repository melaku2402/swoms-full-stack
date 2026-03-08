// src/models/RulesModel.js
import { query } from "../config/database.js";
import {
  RULE_TYPES,
  PROGRAM_TYPES,
  ACADEMIC_RANKS,
} from "../config/constants.js";

class RulesModel {
  // Static cache properties
  static cache = new Map();
  static cacheTTL = 5 * 60 * 1000; // 5 minutes cache

  // ==================== CACHE MANAGEMENT ====================
  static getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.value;
    }
    return null;
  }

  static setToCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  static clearCache() {
    this.cache.clear();
  }

  // ==================== CORE CRUD OPERATIONS ====================
  // Create a new rule
  static async create(ruleData) {
    const {
      rule_name,
      rule_value,
      rule_type,
      program_type,
      effective_from,
      effective_to,
      description,
      previous_version_id = null,
    } = ruleData;

    // Validate rule value based on type
    if (!this.validateRuleValue(rule_type, rule_value)) {
      throw new Error(`Invalid value for rule type: ${rule_type}`);
    }

    const result = await query(
      `INSERT INTO system_rules 
       (rule_name, rule_value, rule_type, program_type, effective_from, effective_to, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        rule_name,
        rule_value,
        rule_type,
        program_type || null,
        effective_from,
        effective_to || null,
        description || null,
      ]
    );

    // Record in history if this is a new version
    if (previous_version_id) {
      const previousRule = await this.findById(previous_version_id);
      if (previousRule) {
        await query(
          `INSERT INTO ruleset_history 
           (rule_name, previous_value, new_value, changed_by, change_reason, 
            effective_from, effective_to, program_type, version_number) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            rule_name,
            previousRule.rule_value,
            rule_value,
            previous_version_id,
            "Version update",
            effective_from,
            effective_to || null,
            program_type || null,
            `v${result.insertId}`,
          ]
        );
      }
    }

    // Clear relevant cache
    this.clearCache();
    return this.findById(result.insertId, false);
  }

  // Find rule by ID (with cache)
  static async findById(ruleId, useCache = true) {
    const cacheKey = `rule_${ruleId}`;

    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    const rules = await query(
      `SELECT sr.*, 
              CASE 
                WHEN sr.effective_to IS NULL OR sr.effective_to >= CURDATE() THEN TRUE 
                ELSE FALSE 
              END as is_active,
              (SELECT COUNT(*) FROM ruleset_history rh WHERE rh.rule_name = sr.rule_name) as version_count
       FROM system_rules sr
       WHERE sr.rule_id = ?`,
      [ruleId]
    );

    const result = rules[0] || null;
    if (useCache && result) {
      this.setToCache(cacheKey, result);
    }

    return result;
  }

  // Find active rule by name (with caching)
  static async findActiveRuleByName(
    ruleName,
    programType = null,
    useCache = true
  ) {
    const cacheKey = `active_${ruleName}_${programType || "all"}`;

    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    let sql = `
      SELECT sr.* 
      FROM system_rules sr
      WHERE sr.rule_name = ?
        AND (sr.effective_to IS NULL OR sr.effective_to >= CURDATE())
        AND sr.effective_from <= CURDATE()
    `;

    const params = [ruleName];

    if (programType) {
      sql +=
        " AND (sr.program_type = ? OR sr.program_type IS NULL OR sr.program_type = 'all')";
      params.push(programType);
    }

    sql += " ORDER BY sr.effective_from DESC, sr.rule_id DESC LIMIT 1";

    const rules = await query(sql, params);
    const result = rules[0] || null;

    if (useCache && result) {
      this.setToCache(cacheKey, result);
    }

    return result;
  }

  // Get all rules with advanced filtering
  static async findAll(page = 1, limit = 50, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = "";
    const params = [];

    // Build dynamic WHERE clause
    const conditions = [];

    if (filters.rule_type) {
      conditions.push("sr.rule_type = ?");
      params.push(filters.rule_type);
    }

    if (filters.program_type) {
      conditions.push("(sr.program_type = ? OR sr.program_type IS NULL)");
      params.push(filters.program_type);
    }

    if (filters.rule_name) {
      conditions.push("sr.rule_name LIKE ?");
      params.push(`%${filters.rule_name}%`);
    }

    if (filters.is_active !== undefined) {
      if (filters.is_active) {
        conditions.push(
          "(sr.effective_to IS NULL OR sr.effective_to >= CURDATE())"
        );
      } else {
        conditions.push(
          "(sr.effective_to IS NOT NULL AND sr.effective_to < CURDATE())"
        );
      }
    }

    if (filters.effective_from) {
      conditions.push("sr.effective_from >= ?");
      params.push(filters.effective_from);
    }

    if (filters.effective_to) {
      conditions.push("sr.effective_to <= ?");
      params.push(filters.effective_to);
    }

    if (conditions.length > 0) {
      whereClause = "WHERE " + conditions.join(" AND ");
    }

    // Get rules with pagination
    const rules = await query(
      `SELECT sr.*, 
              CASE 
                WHEN sr.effective_to IS NULL OR sr.effective_to >= CURDATE() THEN TRUE 
                ELSE FALSE 
              END as is_active,
              (SELECT COUNT(*) FROM ruleset_history rh WHERE rh.rule_name = sr.rule_name) as version_count
       FROM system_rules sr
       ${whereClause}
       ORDER BY sr.rule_type, sr.rule_name, sr.effective_from DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count
    const totalResult = await query(
      `SELECT COUNT(*) as count FROM system_rules sr ${whereClause}`,
      params
    );
    const total = totalResult[0] ? totalResult[0].count : 0;

    return {
      rules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      filters,
    };
  }

  // Update rule
  static async update(ruleId, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => updateData[field]), ruleId];

    await query(
      `UPDATE system_rules SET ${setClause} WHERE rule_id = ?`,
      values
    );

    // Clear relevant cache
    this.clearCache();
    return this.findById(ruleId, false);
  }

  // Delete rule
  static async delete(ruleId) {
    await query("DELETE FROM system_rules WHERE rule_id = ?", [ruleId]);

    // Clear relevant cache
    this.clearCache();
    return true;
  }

  // Activate rule (deactivate others with same name first)
  static async activate(ruleId) {
    const rule = await this.findById(ruleId);
    if (!rule) return null;

    // Deactivate other rules with same name
    await query(
      `UPDATE system_rules 
       SET effective_to = DATE_SUB(CURDATE(), INTERVAL 1 DAY) 
       WHERE rule_name = ? 
         AND rule_id != ? 
         AND (effective_to IS NULL OR effective_to >= CURDATE())`,
      [rule.rule_name, ruleId]
    );

    // Activate this rule
    await query(
      `UPDATE system_rules 
       SET effective_from = CURDATE(), effective_to = NULL 
       WHERE rule_id = ?`,
      [ruleId]
    );

    // Clear relevant cache
    this.clearCache();
    return this.findById(ruleId, false);
  }

  // Deactivate rule
  static async deactivate(ruleId) {
    await query(
      `UPDATE system_rules 
       SET effective_to = DATE_SUB(CURDATE(), INTERVAL 1 DAY) 
       WHERE rule_id = ? AND (effective_to IS NULL OR effective_to >= CURDATE())`,
      [ruleId]
    );

    // Clear relevant cache
    this.clearCache();
    return this.findById(ruleId, false);
  }

  // ==================== RULE VALIDATION ====================
  static validateRuleValue(ruleType, value) {
    if (typeof value !== "string" && typeof value !== "number") {
      return false;
    }

    const strValue = String(value).trim();

    switch (ruleType) {
      case "load_factor":
      case "distribution":
        const factor = parseFloat(strValue);
        return !isNaN(factor) && factor >= 0 && factor <= 2;

      case "rank_limit":
        const limit = parseFloat(strValue);
        return !isNaN(limit) && limit >= 0 && limit <= 100;

      case "payment":
      case "tax_rate":
        const amount = parseFloat(strValue);
        return !isNaN(amount) && amount >= 0 && amount <= 100;

      case "boolean":
        return ["true", "false", "1", "0", "yes", "no"].includes(
          strValue.toLowerCase()
        );

      default:
        return strValue.length > 0 && strValue.length <= 255;
    }
  }

  static parseRuleValue(ruleType, value) {
    const strValue = String(value).trim();

    switch (ruleType) {
      case "load_factor":
      case "rank_limit":
      case "payment":
      case "tax_rate":
      case "distribution":
        return parseFloat(strValue);

      case "boolean":
        return ["true", "1", "yes"].includes(strValue.toLowerCase());

      default:
        return strValue;
    }
  }

  // ==================== BUSINESS LOGIC METHODS ====================
  // Calculate load with factors
  static async calculateLoad(
    lectureHours,
    labHours = 0,
    tutorialHours = 0,
    programType = "regular"
  ) {
    const factors = await this.getLoadFactors(programType);

    const lectureLoad = lectureHours * (factors.lecture || 1.0);
    const labLoad = labHours * (factors.lab || 0.75);
    const tutorialLoad = tutorialHours * (factors.tutorial || 0.5);

    return {
      lecture: lectureLoad,
      lab: labLoad,
      tutorial: tutorialLoad,
      total: lectureLoad + labLoad + tutorialLoad,
      factors,
      calculation: {
        lecture_hours: lectureHours,
        lab_hours: labHours,
        tutorial_hours: tutorialHours,
        program_type: programType,
      },
    };
  }

  // Validate rank against limits
  static async validateRankLoad(rank, totalHours, programType = "regular") {
    const limits = await this.getRankLimits(rank, programType);

    const validation = {
      rank,
      current: totalHours,
      min: limits.min,
      max: limits.max,
      is_within_limits: true,
      warnings: [],
      errors: [],
    };

    if (limits.min !== null && totalHours < limits.min) {
      validation.is_within_limits = false;
      validation.underload_hours = limits.min - totalHours;
      validation.warnings.push(
        `Load is ${validation.underload_hours.toFixed(2)} hours below minimum`
      );
    }

    if (limits.max !== null && totalHours > limits.max) {
      validation.is_within_limits = false;
      validation.overload_hours = totalHours - limits.max;
      validation.errors.push(
        `Load is ${validation.overload_hours.toFixed(2)} hours above maximum`
      );
    }

    if (validation.is_within_limits) {
      validation.message = "Load within rank limits";
    }

    return validation;
  }

  // Get rank limits
  static async getRankLimits(rank, programType = "regular") {
    const minRule = await this.findActiveRuleByName(
      `rank_min_${rank}`,
      programType
    );
    const maxRule = await this.findActiveRuleByName(
      `rank_max_${rank}`,
      programType
    );

    return {
      min: minRule ? parseFloat(minRule.rule_value) : null,
      max: maxRule ? parseFloat(maxRule.rule_value) : null,
    };
  }

  // Get all rank load limits
  static async getAllRankLoadLimits(programType = "regular") {
    const limits = {};

    for (const rank of Object.values(ACADEMIC_RANKS)) {
      limits[rank] = await this.getRankLimits(rank, programType);
    }

    return limits;
  }

  // Get load factors
  static async getLoadFactors(programType = "regular") {
    const cacheKey = `load_factors_${programType}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const labFactor = await this.findActiveRuleByName(
      "lab_factor",
      programType
    );
    const tutorialFactor = await this.findActiveRuleByName(
      "tutorial_factor",
      programType
    );
    const lectureFactor = await this.findActiveRuleByName(
      "lecture_factor",
      programType
    );
    const moduleFactor = await this.findActiveRuleByName(
      "module_factor_distance",
      "distance"
    );

    const factors = {
      lab: labFactor ? parseFloat(labFactor.rule_value) : 0.75,
      tutorial: tutorialFactor ? parseFloat(tutorialFactor.rule_value) : 0.5,
      lecture: lectureFactor ? parseFloat(lectureFactor.rule_value) : 1.0,
      module_distance: moduleFactor ? parseFloat(moduleFactor.rule_value) : 1.0,
    };

    this.setToCache(cacheKey, factors);
    return factors;
  }

  // Calculate NRP payment
  static async calculateNRPPayment(
    programType,
    rateCategory = "default",
    creditHours,
    studentCount = 0,
    teachingHours = null,
    moduleHours = null
  ) {
    // Get rate
    let rate = null;

    // First try to get specific category rate
    if (rateCategory !== "default") {
      rate = await this.getPaymentRate(programType, rateCategory);
    }

    // If not found, get default rate
    if (!rate) {
      rate = await this.getPaymentRate(programType, "default");
    }

    if (!rate) {
      throw new Error(`No rate found for ${programType}`);
    }

    let basePayment = 0;

    // Calculate based on available rate fields
    if (rate.amount_per_credit) {
      basePayment = creditHours * parseFloat(rate.amount_per_credit);
    } else if (rate.amount_per_hour && teachingHours) {
      basePayment = teachingHours * parseFloat(rate.amount_per_hour);
    } else if (rate.amount_per_student && studentCount > 0) {
      basePayment = studentCount * parseFloat(rate.amount_per_student);
    } else if (moduleHours && rate.amount_per_hour) {
      basePayment = moduleHours * parseFloat(rate.amount_per_hour);
    } else {
      // Default calculation
      basePayment = creditHours * 500; // Fallback
    }

    const taxRate = await this.getTaxRate(programType);
    const taxAmount = basePayment * (taxRate / 100);
    const netPayment = basePayment - taxAmount;

    return {
      base: parseFloat(basePayment.toFixed(2)),
      taxRate,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      net: parseFloat(netPayment.toFixed(2)),
      rate: rate,
      calculation: {
        program_type: programType,
        rate_category: rateCategory,
        credit_hours: creditHours,
        student_count: studentCount,
        teaching_hours: teachingHours,
        module_hours: moduleHours,
      },
    };
  }

  // Get payment rate
  static async getPaymentRate(programType, rateCategory = "default") {
    const cacheKey = `payment_rate_${programType}_${rateCategory}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const rates = await query(
      `SELECT * FROM rate_tables 
       WHERE program_type = ? 
         AND (rate_category = ? OR rate_category = 'default')
         AND (effective_to IS NULL OR effective_to >= CURDATE())
         AND effective_from <= CURDATE()
       ORDER BY rate_category DESC, effective_from DESC 
       LIMIT 1`,
      [programType, rateCategory]
    );

    const result = rates[0] || null;
    if (result) {
      this.setToCache(cacheKey, result);
    }
    return result;
  }

  // Get tax rate
  static async getTaxRate(programType) {
    const cacheKey = `tax_rate_${programType}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const tax = await query(
      `SELECT tax_rate FROM tax_rules 
       WHERE program_type = ? 
         AND (effective_to IS NULL OR effective_to >= CURDATE())
         AND effective_from <= CURDATE()
       ORDER BY effective_from DESC 
       LIMIT 1`,
      [programType]
    );

    const result = tax[0] ? parseFloat(tax[0].tax_rate) : 10.0;
    this.setToCache(cacheKey, result);
    return result;
  }

  // Calculate overload payment
  static async calculateOverloadPayment(overloadHours) {
    const rateRule = await this.findActiveRuleByName(
      "overload_rate",
      "overload"
    );
    const rate = rateRule ? parseFloat(rateRule.rule_value) : 450;

    const taxRate = await this.getTaxRate("overload");
    const basePayment = overloadHours * rate;
    const taxAmount = basePayment * (taxRate / 100);
    const netPayment = basePayment - taxAmount;

    return {
      hours: parseFloat(overloadHours.toFixed(2)),
      rate: rate,
      base: parseFloat(basePayment.toFixed(2)),
      taxRate,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      net: parseFloat(netPayment.toFixed(2)),
      calculation: {
        overload_hours: overloadHours,
        rate_per_hour: rate,
      },
    };
  }

  // Get correction rates
  static async getCorrectionRates() {
    const cacheKey = "correction_rates";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const assignmentRate = await this.findActiveRuleByName(
        "assignment_correction_rate",
        "all"
      );
      const examRate = await this.findActiveRuleByName(
        "exam_correction_rate",
        "all"
      );
      const tutorialRate = await this.findActiveRuleByName(
        "tutorial_rate_per_student",
        "all"
      );

      const rates = {
        assignment: assignmentRate ? parseFloat(assignmentRate.rule_value) : 10,
        exam: examRate ? parseFloat(examRate.rule_value) : 15,
        tutorial: tutorialRate ? parseFloat(tutorialRate.rule_value) : 150,
      };

      this.setToCache(cacheKey, rates);
      return rates;
    } catch (error) {
      // Return default rates if rule not found
      return {
        assignment: 10,
        exam: 15,
        tutorial: 150,
      };
    }
  }

  // Get summer distribution
  static async getSummerDistribution() {
    const cacheKey = "summer_distribution";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const distribution = await query(
        `SELECT * FROM summer_distribution 
         WHERE (effective_to IS NULL OR effective_to >= CURDATE())
           AND effective_from <= CURDATE()
         ORDER BY effective_from DESC 
         LIMIT 1`
      );

      let result;
      if (distribution[0]) {
        result = {
          stage1: parseFloat(distribution[0].stage1_percent),
          stage2: parseFloat(distribution[0].stage2_percent),
          stage3: parseFloat(distribution[0].stage3_percent),
          stage4: parseFloat(distribution[0].stage4_percent),
          effective_from: distribution[0].effective_from,
        };
      } else {
        result = {
          stage1: 30.0,
          stage2: 30.0,
          stage3: 20.0,
          stage4: 20.0,
          effective_from: new Date().toISOString().split("T")[0],
        };
      }

      this.setToCache(cacheKey, result);
      return result;
    } catch (error) {
      // Return default distribution
      return {
        stage1: 30.0,
        stage2: 30.0,
        stage3: 20.0,
        stage4: 20.0,
      };
    }
  }

  // Apply summer distribution to payment
  static async applySummerDistribution(totalPayment) {
    const distribution = await this.getSummerDistribution();

    return {
      total: parseFloat(totalPayment.toFixed(2)),
      stage1: parseFloat(
        ((totalPayment * distribution.stage1) / 100).toFixed(2)
      ),
      stage2: parseFloat(
        ((totalPayment * distribution.stage2) / 100).toFixed(2)
      ),
      stage3: parseFloat(
        ((totalPayment * distribution.stage3) / 100).toFixed(2)
      ),
      stage4: parseFloat(
        ((totalPayment * distribution.stage4) / 100).toFixed(2)
      ),
      distribution,
    };
  }

  // Get rules by type
  static async findByType(ruleType, programType = null, onlyActive = true) {
    const cacheKey = `rules_by_type_${ruleType}_${
      programType || "all"
    }_${onlyActive}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let sql = `
      SELECT sr.* 
      FROM system_rules sr
      WHERE sr.rule_type = ?
    `;

    const params = [ruleType];

    if (programType) {
      sql += " AND (sr.program_type = ? OR sr.program_type IS NULL)";
      params.push(programType);
    }

    if (onlyActive) {
      sql += " AND (sr.effective_to IS NULL OR sr.effective_to >= CURDATE())";
    }

    sql += " ORDER BY sr.effective_from DESC";

    const result = await query(sql, params);
    this.setToCache(cacheKey, result);
    return result;
  }

  // Get rule history
  static async getRuleHistory(ruleName) {
    const cacheKey = `rule_history_${ruleName}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const history = await query(
      `SELECT sr.*, 
              CASE 
                WHEN sr.effective_to IS NULL OR sr.effective_to >= CURDATE() THEN TRUE 
                ELSE FALSE 
              END as is_active
       FROM system_rules sr
       WHERE sr.rule_name = ?
       ORDER BY sr.effective_from DESC`,
      [ruleName]
    );

    this.setToCache(cacheKey, history);
    return history;
  }

  // Bulk update rules
  static async bulkUpdate(rules) {
    const results = [];

    for (const rule of rules) {
      try {
        const existingRule = await this.findActiveRuleByName(
          rule.rule_name,
          rule.program_type,
          false
        );

        if (existingRule && existingRule.rule_value !== rule.rule_value) {
          // Create new version
          const newRule = await this.create({
            rule_name: rule.rule_name,
            rule_value: rule.rule_value,
            rule_type: rule.rule_type || existingRule.rule_type,
            program_type: rule.program_type || existingRule.program_type,
            effective_from:
              rule.effective_from || new Date().toISOString().split("T")[0],
            effective_to: rule.effective_to || null,
            description: rule.description || existingRule.description,
            previous_version_id: existingRule.rule_id,
          });

          // Deactivate old rule
          await this.deactivate(existingRule.rule_id);

          results.push({
            rule_name: rule.rule_name,
            status: "updated",
            new_value: rule.rule_value,
            rule_id: newRule.rule_id,
          });
        } else if (!existingRule) {
          // Create new rule
          const newRule = await this.create({
            rule_name: rule.rule_name,
            rule_value: rule.rule_value,
            rule_type: rule.rule_type || "other",
            program_type: rule.program_type || null,
            effective_from:
              rule.effective_from || new Date().toISOString().split("T")[0],
            effective_to: rule.effective_to || null,
            description: rule.description || null,
          });

          results.push({
            rule_name: rule.rule_name,
            status: "created",
            rule_id: newRule.rule_id,
          });
        } else {
          results.push({
            rule_name: rule.rule_name,
            status: "unchanged",
            rule_id: existingRule.rule_id,
          });
        }
      } catch (error) {
        results.push({
          rule_name: rule.rule_name,
          status: "error",
          error: error.message,
        });
      }
    }

    this.clearCache();
    return results;
  }

  // Validate workload comprehensively
  static async validateWorkload(workloadData) {
    const {
      staff_id,
      semester_id,
      teaching_hours = 0,
      admin_hours = 0,
      research_hours = 0,
      community_hours = 0,
      program_type = "regular",
    } = workloadData;

    const totalHours =
      teaching_hours + admin_hours + research_hours + community_hours;

    // Get staff rank
    const [staff] = await query(
      `SELECT sp.academic_rank 
       FROM staff_profiles sp
       WHERE sp.staff_id = ?`,
      [staff_id]
    );

    if (!staff) {
      throw new Error("Staff not found");
    }

    // Validate rank limits
    const rankValidation = await this.validateRankLoad(
      staff.academic_rank,
      totalHours,
      program_type
    );

    // Check additional business rules
    const validation = {
      valid: rankValidation.is_within_limits,
      total_hours: totalHours,
      breakdown: {
        teaching: teaching_hours,
        admin: admin_hours,
        research: research_hours,
        community: community_hours,
      },
      rank_validation: rankValidation,
      warnings: [],
      errors: rankValidation.errors,
    };

    // Add warnings from rank validation
    validation.warnings.push(...rankValidation.warnings);

    // Additional validations
    if (teaching_hours > 20) {
      validation.warnings.push("Teaching hours exceed typical maximum (20)");
    }

    if (admin_hours > 12) {
      validation.warnings.push(
        "Administrative hours exceed typical maximum (12)"
      );
    }

    // Check if total hours exceed absolute maximum
    if (totalHours > 40) {
      validation.errors.push("Total hours exceed absolute maximum (40)");
      validation.valid = false;
    }

    return validation;
  }

  // Evaluate a rule with context
  static async evaluate(ruleName, programType = null, context = {}) {
    const rule = await this.findActiveRuleByName(ruleName, programType);

    if (!rule) {
      throw new Error(`Rule not found: ${ruleName}`);
    }

    const value = this.parseRuleValue(rule.rule_type, rule.rule_value);

    return {
      rule_name: ruleName,
      rule_type: rule.rule_type,
      program_type: rule.program_type,
      value,
      raw_value: rule.rule_value,
      effective_from: rule.effective_from,
      effective_to: rule.effective_to,
      context_applied: context,
    };
  }

  // Get rules dashboard summary
  static async getDashboardSummary() {
    const cacheKey = "dashboard_summary";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [summary] = await query(`
        SELECT 
          COUNT(*) as total_rules,
          COUNT(CASE WHEN effective_to IS NULL OR effective_to >= CURDATE() THEN 1 END) as active_rules,
          COUNT(DISTINCT rule_type) as rule_types_count,
          COUNT(DISTINCT program_type) as program_types_count
        FROM system_rules
      `);

      const byType = await query(`
        SELECT rule_type, COUNT(*) as count
        FROM system_rules
        WHERE effective_to IS NULL OR effective_to >= CURDATE()
        GROUP BY rule_type
      `);

      const recentChanges = await query(`
        SELECT rh.*, u.username as changed_by_name
        FROM ruleset_history rh
        LEFT JOIN users u ON rh.changed_by = u.user_id
        ORDER BY rh.changed_at DESC
        LIMIT 10
      `);

      const result = {
        summary: summary[0],
        by_type: byType,
        recent_changes: recentChanges,
      };

      this.setToCache(cacheKey, result);
      return result;
    } catch (error) {
      // Return empty dashboard if error
      return {
        summary: {
          total_rules: 0,
          active_rules: 0,
          rule_types_count: 0,
          program_types_count: 0,
        },
        by_type: [],
        recent_changes: [],
      };
    }
  }

  // Get active rate tables
  static async getActiveRateTables(programType = null) {
    const cacheKey = `active_rate_tables_${programType || "all"}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let whereClause =
      "WHERE (effective_to IS NULL OR effective_to >= CURDATE())";
    const params = [];

    if (programType) {
      whereClause += " AND program_type = ?";
      params.push(programType);
    }

    const rates = await query(
      `SELECT * FROM rate_tables 
       ${whereClause}
         AND effective_from <= CURDATE()
       ORDER BY program_type, rate_category, effective_from DESC`,
      params
    );

    this.setToCache(cacheKey, rates);
    return rates;
  }

  // Get active tax rules
  static async getActiveTaxRules(programType = null) {
    const cacheKey = `active_tax_rules_${programType || "all"}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let whereClause =
      "WHERE (effective_to IS NULL OR effective_to >= CURDATE())";
    const params = [];

    if (programType) {
      whereClause += " AND program_type = ?";
      params.push(programType);
    }

    const taxRules = await query(
      `SELECT * FROM tax_rules 
       ${whereClause}
         AND effective_from <= CURDATE()
       ORDER BY program_type, effective_from DESC`,
      params
    );

    this.setToCache(cacheKey, taxRules);
    return taxRules;
  }

  // Get administrative duty loads
  static async getAdministrativeLoads() {
    const cacheKey = "administrative_loads";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const deptHead = await this.findActiveRuleByName(
      "duty_department_head",
      "regular"
    );
    const dean = await this.findActiveRuleByName("duty_dean", "regular");
    const programCoordinator = await this.findActiveRuleByName(
      "duty_program_coordinator",
      "regular"
    );

    const loads = {
      department_head: deptHead ? parseFloat(deptHead.rule_value) : 6,
      dean: dean ? parseFloat(dean.rule_value) : 4,
      program_coordinator: programCoordinator
        ? parseFloat(programCoordinator.rule_value)
        : 3,
    };

    this.setToCache(cacheKey, loads);
    return loads;
  }

  // Get rule by name
  static async getRuleByName(ruleName, programType = null) {
    return await this.findActiveRuleByName(ruleName, programType);
  }

  // Deactivate all rules with given name
  static async deactivateRulesByName(ruleName) {
    await query(
      `UPDATE system_rules 
       SET effective_to = DATE_SUB(CURDATE(), INTERVAL 1 DAY) 
       WHERE rule_name = ? AND (effective_to IS NULL OR effective_to >= CURDATE())`,
      [ruleName]
    );

    this.clearCache();
    return true;
  }

  // Create a new version of an existing rule
  static async createVersion(versionData) {
    return await this.create(versionData);
  }
}

// Export the class directly for static method usage
export default RulesModel;
