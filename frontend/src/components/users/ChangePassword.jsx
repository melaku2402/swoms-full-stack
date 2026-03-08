// src/components/users/ChangePassword.jsx
import { useState } from "react";
import { authAPI } from "../../api/authAPI";
import { Eye, EyeOff } from "lucide-react";
import "./ChangePassword.css";

const ChangePassword = ({
  userId,
  username,
  onSuccess,
  onCancel,
  isSelfUpdate = false,
}) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isAdminReset, setIsAdminReset] = useState(!isSelfUpdate);

  const validateForm = () => {
    const newErrors = {};

    if (!isAdminReset && !formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain letters and numbers";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      let response;

      if (isAdminReset) {
        // Admin resetting another user's password
        response = await authAPI.resetPassword(userId, formData.newPassword);
      } else {
        // User changing their own password
        response = await authAPI.changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
      }

      if (response.success) {
        onSuccess?.();
      } else {
        setErrors({ submit: response.message });
      }
    } catch (error) {
      setErrors({ submit: error.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 5);
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const strengthLabels = [
    "Very Weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Very Strong",
  ];

  return (
    <div className="change-password">
      <div className="password-header">
        <h3>{isAdminReset ? "Reset Password" : "Change Password"}</h3>
        {isAdminReset && username && (
          <p className="user-info">
            For user: <strong>{username}</strong>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {errors.submit && (
          <div className="form-error alert alert-error">{errors.submit}</div>
        )}

        {!isAdminReset && (
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password *</label>
            <div className="password-input-wrapper">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPassword.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleChange}
                className={errors.currentPassword ? "error" : ""}
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility("current")}
                tabIndex="-1"
              >
                {showPassword.current ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="error-text">{errors.currentPassword}</span>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="newPassword">New Password *</label>
          <div className="password-input-wrapper">
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleChange}
              className={errors.newPassword ? "error" : ""}
              placeholder="Enter new password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility("new")}
              tabIndex="-1"
            >
              {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && (
            <span className="error-text">{errors.newPassword}</span>
          )}

          <div className="password-strength">
            <div className="strength-bars">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`strength-bar ${
                    level <= passwordStrength ? "filled" : ""
                  } ${
                    passwordStrength >= 4
                      ? "strong"
                      : passwordStrength >= 3
                      ? "medium"
                      : "weak"
                  }`}
                />
              ))}
            </div>
            <span className="strength-text">
              Strength: {strengthLabels[passwordStrength]}
            </span>
          </div>

          <div className="password-requirements">
            <p>Password must:</p>
            <ul>
              <li className={formData.newPassword.length >= 6 ? "met" : ""}>
                Be at least 6 characters long
              </li>
              <li
                className={
                  /(?=.*[A-Za-z])(?=.*\d)/.test(formData.newPassword)
                    ? "met"
                    : ""
                }
              >
                Contain both letters and numbers
              </li>
            </ul>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password *</label>
          <div className="password-input-wrapper">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "error" : ""}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility("confirm")}
              tabIndex="-1"
            >
              {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="error-text">{errors.confirmPassword}</span>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !formData.newPassword || passwordStrength < 2}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Processing...
              </>
            ) : isAdminReset ? (
              "Reset Password"
            ) : (
              "Change Password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
