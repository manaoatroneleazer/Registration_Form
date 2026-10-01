"use strict";

const STUDENT_NUMBER_PATTERN = /^\d{2}-\d{4}-\d{3}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^(09|\+639)\d{9}$/;

const PASSWORD_RULES = [
  { test: (value) => value.length >= 8, message: "at least 8 characters" },
  { test: (value) => /[A-Z]/.test(value), message: "one uppercase letter" },
  { test: (value) => /\d/.test(value), message: "one digit" },
  { test: (value) => /[@$!]/.test(value), message: "one of @, $, or !" },
  { test: (value) => !/\s/.test(value), message: "no spaces" },
];

const SUCCESS_TEXT = "Registration details validated successfully!";

const SUMMARY_FIELDS = {
  summaryName: "fullName",
  summaryStudentNumber: "studentNumber",
  summaryEmail: "email",
  summaryMobileNumber: "mobileNumber",
  summaryCourse: "course",
};

function isValidStudentNumber(value) {
  return typeof value === "string" && STUDENT_NUMBER_PATTERN.test(value.trim());
}

function isValidPassword(value) {
  return typeof value === "string" && PASSWORD_RULES.every((rule) => rule.test(value));
}

function describePasswordProblems(value) {
  const unmet = PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => rule.message);
  return unmet.length ? `Password needs: ${unmet.join(", ")}.` : "";
}

function checkText(value, label, isValid, formatMessage) {
  if (value === "") {
    return `${label} is required.`;
  }
  return isValid(value) ? "" : formatMessage;
}

const VALIDATORS = {
  fullName: (v) =>
    checkText(v.fullName, "Full name", (name) => name.length >= 2, "Full name must be at least 2 characters."),
  studentNumber: (v) =>
    checkText(v.studentNumber, "Student number", isValidStudentNumber, "Enter a student number in the format 24-1234-123."),
  email: (v) =>
    checkText(v.email, "Email address", (email) => EMAIL_PATTERN.test(email), "Enter an email address like name@example.com, with no spaces."),
  mobileNumber: (v) =>
    checkText(v.mobileNumber, "Mobile number", (mobile) => MOBILE_PATTERN.test(mobile), "Enter a mobile number as 09XXXXXXXXX or +639XXXXXXXXX, with no spaces or hyphens."),
  password: (v) => (v.password === "" ? "Password is required." : describePasswordProblems(v.password)),
  confirmPassword: (v) => {
    if (v.confirmPassword === "") {
      return "Confirm your password.";
    }
    return v.confirmPassword === v.password ? "" : "Passwords do not match.";
  },
  course: (v) => (v.course === "BSIT" || v.course === "BSCS" ? "" : "Select your course (BSIT or BSCS)."),
  terms: (v) => (v.terms ? "" : "You must agree to the terms to register."),
};

function byId(id) {
  return document.getElementById(id);
}

function readValues() {
  return {
    fullName: byId("fullName").value.trim(),
    studentNumber: byId("studentNumber").value.trim(),
    email: byId("email").value.trim(),
    mobileNumber: byId("mobileNumber").value.trim(),
    password: byId("password").value,
    confirmPassword: byId("confirmPassword").value,
    course: byId("course").value,
    terms: byId("terms").checked,
  };
}

function showError(name, message) {
  byId(`${name}Error`).textContent = message;
  byId(name).setAttribute("aria-invalid", String(message !== ""));
}

function validateField(name) {
  const message = VALIDATORS[name](readValues());
  showError(name, message);
  return message === "";
}

function clearOutput() {
  byId("successMessage").textContent = "";
  Object.keys(SUMMARY_FIELDS).forEach((id) => {
    byId(id).textContent = "";
  });
  byId("registrationSummary").hidden = true;
}

function showSummary(values) {
  Object.entries(SUMMARY_FIELDS).forEach(([id, field]) => {
    byId(id).textContent = values[field];
  });
  byId("successMessage").textContent = SUCCESS_TEXT;
  byId("registrationSummary").hidden = false;
}

function handleSubmit(event) {
  event.preventDefault();
  const results = Object.keys(VALIDATORS).map((name) => validateField(name));
  clearOutput();
  if (results.every(Boolean)) {
    showSummary(readValues());
  }
}

function handlePasswordInput() {
  byId("passwordFeedback").textContent =
    describePasswordProblems(byId("password").value) || "Password meets all requirements.";
}

function handleReset() {
  Object.keys(VALIDATORS).forEach((name) => showError(name, ""));
  byId("passwordFeedback").textContent = "";
  clearOutput();
}

if (typeof document !== "undefined") {
  byId("registrationForm").addEventListener("submit", handleSubmit);
  byId("registrationForm").addEventListener("reset", handleReset);
  byId("password").addEventListener("input", handlePasswordInput);
  byId("fullName").addEventListener("blur", () => validateField("fullName"));
  byId("course").addEventListener("change", () => validateField("course"));
  byId("terms").addEventListener("change", () => validateField("terms"));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { isValidStudentNumber, isValidPassword };
}
