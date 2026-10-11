Design a complete desktop-first web application UI for a graduation capstone project called:

ERIS – Employee Retention Intelligence System
AI-powered Attrition Prediction and HR Decision Support Platform.

ERIS is NOT a general HR management system.

Its primary purpose is to help HR professionals:
- manage employee data used for attrition analysis,
- identify employees who may have a higher risk of leaving,
- understand the factors contributing to an AI prediction,
- review workforce-level attrition patterns,
- compare departments or employee groups,
- generate reports,
- and use AI-generated information as decision support.

AI predictions are advisory only.
The system must never imply that AI automatically makes hiring, termination, promotion, retention, or other employment decisions.
Final employee-related decisions always remain with authorized HR personnel.

====================================================
DESIGN DIRECTION
====================================================

Create a modern, clean, professional enterprise SaaS product that looks like it was carefully designed by a real product designer.

The visual style should feel:
- modern,
- human-centered,
- professional,
- trustworthy,
- calm,
- organized,
- intelligent,
- easy to understand,
- suitable for HR professionals who may not have advanced AI knowledge.

Do NOT make the interface look overly AI-generated or futuristic.

Avoid:
- excessive gradients,
- neon colors,
- glowing cards,
- cyberpunk effects,
- glassmorphism everywhere,
- overly rounded floating components,
- decorative AI graphics,
- excessive purple-blue gradients,
- huge empty hero sections,
- random illustrations,
- unrealistic dashboard widgets,
- excessive use of icons.

Use a LIGHT UI with WHITE as the dominant background.

Design inspiration:
modern enterprise SaaS products such as Linear, Notion, Stripe Dashboard, Asana, Atlassian, modern HR analytics platforms, and clean B2B admin systems.

Do not copy any product directly.
Create an original ERIS design system.

====================================================
COLOR SYSTEM
====================================================

Main background:
#FFFFFF

Secondary page background:
#F8FAFC or #F7F8FA

Primary text:
#0F172A

Secondary text:
#475569

Muted text:
#64748B

Border:
#E2E8F0

Primary brand color:
#4F46E5

Primary hover:
#4338CA

Primary subtle background:
#EEF2FF

Use color carefully.

Risk colors:
High Risk:
#DC2626 with very light red background

Medium Risk:
#D97706 with very light amber background

Low Risk:
#16A34A with very light green background

Do not fill large cards completely with red, yellow, or green.

Use risk colors mainly for:
- badges,
- indicators,
- chart segments,
- small labels,
- progress bars.

====================================================
TYPOGRAPHY
====================================================

Use a modern professional sans-serif font such as Inter.

Create a clear visual hierarchy.

Page title:
28–32px / semibold

Section title:
18–20px / semibold

Card heading:
14–16px / medium or semibold

Body:
14px

Table text:
13–14px

Caption / metadata:
12–13px

Avoid oversized text.

====================================================
LAYOUT
====================================================

Desktop-first design.

Primary frame:
1440px wide.

Use a consistent application shell.

Left sidebar:
240–256px wide.

Top header:
64–72px height.

Main content:
fluid width with approximately 24–32px page padding.

Use an 8px spacing system.

Cards:
10–12px border radius.

Buttons:
8px radius.

Inputs:
8px radius.

Use subtle 1px borders and very soft shadows.

Avoid excessive shadows.

Maintain generous but practical whitespace.

The UI should feel dense enough for professional HR work but never cluttered.

====================================================
GLOBAL APPLICATION SHELL
====================================================

LEFT SIDEBAR

At the top:

ERIS logo mark
ERIS
Employee Retention Intelligence

Navigation should use simple line icons and text.

Possible navigation structure:

Overview

WORKFORCE
Employees
Risk Analysis
Reports

DATA & AI
Employee Data
Data Preparation
AI Model

ADMINISTRATION
Users
Roles & Permissions
System Configuration
System Activity

Navigation items must be shown or hidden depending on the user's role.

At the bottom of sidebar display:

User avatar
User name
Role
Settings / Logout menu

====================================================
TOP BAR
====================================================

Keep the top bar minimal.

Include:
- optional breadcrumb,
- global search,
- notification icon,
- help icon,
- user avatar.

Do not overload the top navigation.

====================================================
SYSTEM ROLES
====================================================

The system contains exactly these official roles:

1. HR Staff
2. HR Manager
3. Data / AI Analyst
4. System Administrator

HR Staff can:
- view employees,
- search and filter employee data,
- review individual attrition risk,
- review prediction explanations,
- use dashboards,
- use reports.

HR Manager can:
- review employee attrition information,
- review organization-level attrition information,
- identify high-risk employees or groups,
- compare departments,
- review major contributing factors,
- use reports for retention planning.

Data / AI Analyst can:
- manage analysis datasets,
- import employee data,
- validate and prepare data,
- maintain the AI analysis component,
- review model performance and evaluation results.

System Administrator can:
- manage users,
- manage roles,
- manage permissions,
- manage system configuration,
- review operational status,
- review relevant system activities.

====================================================
SCREEN 01 — LOGIN
====================================================

Create a simple professional authentication page.

Do not use a huge illustration.

Layout:
centered login card or subtle two-column layout.

Content:

ERIS logo

Welcome back

Sign in to Employee Retention Intelligence System

Email
Password
Remember me
Forgot password

Primary button:
Sign in

Add subtle security messaging:

“Secure access to employee retention intelligence.”

Keep the design minimal.

====================================================
SCREEN 02 — HR OVERVIEW DASHBOARD
====================================================

Page header:

Overview

Subtitle:
Monitor workforce attrition risk and identify areas that may require HR attention.

Top-right:
Date Range selector
Export Report button

KPI cards:

Total Employees
1,248

High Risk
126
10.1%

Medium Risk
312
25.0%

Low Risk
810
64.9%

Do not make KPI cards oversized.

Below the KPIs:

LEFT:
Attrition Risk Distribution

Use a professional donut or horizontal stacked chart:
High Risk
Medium Risk
Low Risk

RIGHT:
Risk Trend

Line chart showing risk changes over time.

Next section:

Department Risk Overview

Use horizontal bars or a clean table:

Engineering
Sales
Operations
Finance
Marketing
Human Resources

Columns:
Department
Employees
High Risk
Average Risk
Trend

Next section:

Employees Requiring Attention

Professional data table:

Employee
Department
Role
Risk Level
Risk Score
Top Factor
Last Analysis
Action

Use realistic employee avatars or initials.

Action:
View analysis

Do not use dramatic wording such as:
“Dangerous employee”
“Critical employee”
“Terminate”

Use neutral HR terminology.

====================================================
SCREEN 03 — EMPLOYEE DIRECTORY
====================================================

Page title:
Employees

Subtitle:
Search and review employee information used for retention analysis.

Toolbar:

Search employees...

Department filter
Job Role filter
Risk Level filter
Employment Status filter

Advanced Filters button

Right side:
Import Data button if the current role has permission

Main employee table:

Employee
Employee ID
Department
Role
Tenure
Job Satisfaction
Risk Level
Risk Score
Last Analysis
Action

Risk level should use small pills:

High Risk
Medium Risk
Low Risk

Row action:
View employee

Include:
sorting,
pagination,
row selection,
filter chips,
results count.

Design a clean professional data table similar to a real enterprise application.

====================================================
SCREEN 04 — EMPLOYEE PROFILE
====================================================

Page breadcrumb:

Employees / Employee Profile

Header:

Employee avatar
Employee name
Employee ID

Department
Job role

Risk badge

Tabs:

Overview
Risk Analysis
Employment Data
Analysis History

Overview section:

Personal / Employment Information

Department
Job Role
Age
Tenure
Business Travel
Overtime
Monthly Income
Job Level
Job Satisfaction
Environment Satisfaction
Work-Life Balance

Do not include unnecessary private personal information.

Side panel:

Current Attrition Risk

Large but restrained percentage:
78%

High Risk

Last analyzed:
Sep 22, 2026

Button:
View Risk Analysis

====================================================
SCREEN 05 — EMPLOYEE ATTRITION RISK ANALYSIS
====================================================

This is one of the most important screens.

Page header:

Nguyen Van A
Software Engineer · Engineering

Risk Badge:
High Risk

Risk Score:
78%

Last analyzed:
Sep 22, 2026

Create a two-column analytical layout.

LEFT MAIN COLUMN:

Attrition Risk Assessment

Show:
78%
High Risk

Use a clean risk gauge, circular indicator, or horizontal scale.

Below:

Risk Explanation

Text example:

“The model indicates an elevated attrition risk for this employee. Overtime, job satisfaction, and years at the company are among the strongest factors associated with this prediction.”

Do not claim causation.

Create a section:

Key Contributing Factors

Use an Explainable AI / SHAP-inspired visual but make it understandable for HR professionals.

Example:

Overtime                    +18%
Low Job Satisfaction        +14%
Years at Company            +11%
Monthly Income              +9%
Job Involvement             -6%

Use horizontal contribution bars.

Explain clearly:

Factors increasing predicted risk
Factors reducing predicted risk

Do NOT display raw technical SHAP terminology everywhere.
Technical information may be accessible through a tooltip.

RIGHT COLUMN:

Employee Snapshot

Department:
Engineering

Role:
Software Engineer

Tenure:
2.4 years

Overtime:
Yes

Job Satisfaction:
2 / 5

Work-Life Balance:
2 / 4

Another card:

Analysis Information

Model Version:
Attrition Model v2.3

Analysis Date:
Sep 22, 2026

Data Status:
Validated

At the bottom create a clear but unobtrusive information banner:

“AI-generated risk information is advisory and is intended to support HR review. Final employment and retention decisions remain the responsibility of authorized HR personnel.”

This message is important.

====================================================
SCREEN 06 — ORGANIZATION RISK OVERVIEW
====================================================

Designed mainly for HR Manager.

Page title:
Risk Overview

Subtitle:
Review attrition risk patterns across the organization.

Top metrics:

Organization Risk
High-Risk Employees
Departments Monitored
Risk Change

Main visualizations:

Risk by Department

Department Comparison

Risk Distribution by Job Role

Attrition Risk Trend

Top Contributing Factors Across Organization

Examples:
Overtime
Job Satisfaction
Years at Company
Environment Satisfaction
Monthly Income

Add:

High-Risk Groups

Table:

Group
Employees
High Risk
Average Risk
Main Contributing Factor
Trend
Action

Groups may include:
Engineering
Sales
Operations
Employees with < 2 years tenure
Employees working overtime

Do not automatically recommend employment actions.

Provide:
Review Group
View Employees

====================================================
SCREEN 07 — REPORTS
====================================================

Page title:
Reports

Subtitle:
Create and review reports for employee retention analysis.

Report templates:

Workforce Risk Summary

Department Risk Analysis

High-Risk Employee Review

Attrition Factor Analysis

Model Analysis Summary

Each report card should contain:

Report name
Description
Last generated
Owner
Action

Buttons:

Generate Report
View
Download

Filters:

Date range
Department
Risk Level
Job Role

Add recent reports table.

====================================================
SCREEN 08 — REPORT DETAIL
====================================================

Create a clean report viewer.

Header:

Workforce Attrition Risk Report

Generated:
Sep 22, 2026

Filters used:
All Departments
Current Workforce

Buttons:
Download PDF
Export CSV
Print

Sections:

Executive Summary

Risk Distribution

Department Comparison

Employees Requiring Review

Key Contributing Factors

Method / Analysis Information

AI Advisory Notice

Design this screen to work well both on-screen and when exported to PDF.

====================================================
SCREEN 09 — EMPLOYEE DATA MANAGEMENT
====================================================

Designed mainly for Data / AI Analyst.

Page title:
Employee Data

Subtitle:
Manage employee datasets used for attrition analysis.

Top cards:

Total Records
Valid Records
Records With Issues
Last Updated

Toolbar:

Search
Dataset Status
Department
Validation Status

Buttons:
Import Data
Validate Data

Table:

Employee ID
Employee
Department
Data Completeness
Validation Status
Last Updated
Action

Validation badges:

Valid
Warning
Invalid

====================================================
SCREEN 10 — IMPORT EMPLOYEE DATA
====================================================

Create a simple 3-step import flow.

Step 1
Upload File

Drag and drop:
CSV or XLSX

Button:
Choose File

Step 2
Column Mapping

Map uploaded columns to ERIS fields.

Examples:

EmployeeNumber → Employee ID
Department → Department
JobRole → Job Role
MonthlyIncome → Monthly Income
OverTime → Overtime

Step 3
Validation Preview

Show:

Total rows
Valid rows
Warnings
Invalid rows

Display validation issues clearly.

Actions:

Cancel
Back
Import Valid Records

Do not immediately run AI prediction after upload.

Data must be validated and prepared first.

====================================================
SCREEN 11 — DATA VALIDATION & PREPARATION
====================================================

Page title:
Data Preparation

Subtitle:
Validate and prepare employee data before attrition analysis.

Create summary cards:

Total Records
Valid
Warnings
Errors

Main table:

Row
Employee ID
Field
Issue
Severity
Suggested Resolution
Status

Examples:

Missing Job Satisfaction
Invalid Monthly Income
Unknown Department
Duplicate Employee ID

Filters:

All Issues
Errors
Warnings
Resolved

Create a preparation status panel:

Data Validation
Completed

Missing Value Handling
Completed

Data Transformation
Completed

Ready for Analysis
Yes

Primary button:
Mark Dataset Ready

Do not make this workflow overly technical.

====================================================
SCREEN 12 — AI MODEL MANAGEMENT
====================================================

Designed for Data / AI Analyst.

Page title:
AI Model

Subtitle:
Monitor and maintain the attrition analysis component used by ERIS.

Model summary card:

Model Name:
Employee Attrition Prediction

Version:
v2.3

Status:
Active

Last Evaluated:
Sep 20, 2026

Training Dataset:
Employee Dataset 2026-Q3

Buttons:
View Evaluation
Model Details

Create model information sections:

Current Model
Model History
Analysis Configuration

Model history table:

Version
Status
Evaluation Date
Dataset
Accuracy
F1 Score
Action

Do NOT include features for inventing a new AI algorithm.

The project uses existing machine-learning approaches.

====================================================
SCREEN 13 — MODEL EVALUATION
====================================================

Page title:
Model Evaluation

Provide clear evaluation metrics:

Accuracy
Precision
Recall
F1 Score
ROC-AUC

Example values can be realistic demo values.

Create charts:

Confusion Matrix

ROC Curve

Feature Importance

Model Performance Comparison

Create a section:

Explainability Review

Show whether explanations are:
Available
Generated Successfully
Ready for HR Display

Include notes explaining that prediction quality and explanation usefulness must be evaluated before operational use.

Avoid pretending that a metric alone proves fairness or correctness.

====================================================
SCREEN 14 — USER MANAGEMENT
====================================================

Designed for System Administrator.

Page title:
Users

Buttons:
Add User

Search:
Search users...

Filters:
Role
Status

Table:

User
Email
Role
Status
Last Login
Created
Action

Roles MUST use these exact names:

HR Staff
HR Manager
Data / AI Analyst
System Administrator

Status:
Active
Inactive

Actions:
View
Edit
Deactivate

====================================================
SCREEN 15 — ROLES & PERMISSIONS
====================================================

Page title:
Roles & Permissions

Create four role cards:

HR Staff
HR Manager
Data / AI Analyst
System Administrator

When selecting a role, display a permissions matrix.

Permission groups:

Employee Data

Risk Analysis

Reports

Data Management

AI Model

User Management

System Configuration

Use checkboxes or permission toggles.

Keep the design easy to audit.

====================================================
SCREEN 16 — SYSTEM CONFIGURATION & ACTIVITY
====================================================

Create a System Configuration screen with sections:

General

Security

Analysis

Reporting

Notifications

Use clean form controls.

Also include a System Activity view or tab.

Operational cards:

Application
Operational

Database
Connected

AI Analysis Service
Operational

Reporting Service
Operational

Activity table:

Time
User
Activity
Module
Status

Examples:

Dataset imported
User role updated
Analysis completed
Report generated

Do not expose unnecessary low-level technical logs to normal HR users.

====================================================
COMPONENT SYSTEM
====================================================

Create reusable components:

Primary Button
Secondary Button
Tertiary Button

Icon Button

Text Input
Search Input
Select
Multi Select
Date Picker

Tabs

Breadcrumbs

Pagination

Tooltip

Dropdown Menu

Modal

Confirmation Dialog

Toast Notification

Empty State

Loading State

Error State

Data Table

Metric Card

Chart Card

Information Banner

Risk Badge

User Avatar

Status Badge

Filter Chip

====================================================
TABLE DESIGN
====================================================

Tables are extremely important in this product.

Create tables that are:
- compact,
- readable,
- professional,
- easy to scan.

Use:

48–52px row height

Sticky table headers when appropriate

Subtle separators

Row hover states

Sortable columns

Filter controls

Pagination

Avoid giant cards around every row.

====================================================
CHART DESIGN
====================================================

Charts must look like professional analytical tools.

Prefer:

horizontal bar charts,
line charts,
stacked bars,
donut charts,
simple distribution charts.

Avoid:

3D charts,
large decorative charts,
rainbow palettes,
excessive chart labels.

Every chart should have:
title,
short description where useful,
legend,
tooltip behavior,
clear labels.

====================================================
EMPTY / LOADING / ERROR STATES
====================================================

Design realistic system states.

Examples:

No employees found

No reports generated yet

No dataset uploaded

Analysis unavailable

Dataset contains validation issues

AI analysis failed

Permission denied

Do not only design ideal success states.

====================================================
HUMAN-CENTERED AI PRINCIPLES
====================================================

ERIS should never make AI feel like an unquestionable authority.

Use language such as:

“Predicted Risk”

“Risk Analysis”

“Contributing Factors”

“Employees Requiring Attention”

“Review Analysis”

“AI-assisted analysis”

Avoid language such as:

“AI Decision”

“AI says terminate”

“Guaranteed resignation”

“This employee will leave”

“Bad employee”

Predictions should be presented with context.

Explainable AI information should be understandable to non-technical HR users.

Always make it visually clear that AI supports, but does not replace, human judgment.

====================================================
OUT OF SCOPE
====================================================

Do NOT design functionality for:

Payroll

Salary payment processing

Recruitment management

Applicant tracking

Attendance management

Timekeeping

Leave management

Automatic termination

Automatic employee retention actions

Automatic employment decisions

Full enterprise HR management

ERIS must remain focused on employee retention intelligence and HR decision support.

====================================================
PROTOTYPE QUALITY
====================================================

Make the final result look like a real production-ready B2B SaaS application, not a conceptual AI mockup.

All screens must:

use the same sidebar,
use the same top navigation,
use the same typography,
use the same card styles,
use the same button styles,
use the same table style,
use the same spacing system,
use the same color system.

Maintain strong visual consistency across the entire application.

Use realistic sample employee data and realistic chart values.

Do not use Lorem Ipsum.

Create clear hover states, selected states, active states, disabled states, loading states, and error states where appropriate.

Prioritize usability and readability over visual effects.

The overall result should feel polished, modern, trustworthy, human-designed, and appropriate for a university graduation capstone that could realistically become a production HR analytics application.