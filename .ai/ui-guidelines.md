# UI & UX Guidelines

## Purpose

This document defines the official User Interface (UI) and User Experience (UX) standards for this project.

Every generated screen, page, component, dialog, table, form, dashboard, and layout must follow these guidelines.

The goal is to provide a consistent, professional, accessible, and easy-to-use interface suitable for enterprise and government applications.

Never generate inconsistent UI.

---

# Design Principles

Always prioritize

- Simplicity
- Consistency
- Readability
- Accessibility
- Performance
- Maintainability

Avoid visual clutter.

Avoid unnecessary decorations.

Avoid flashy animations.

Focus on helping users complete tasks efficiently.

---

# Target Users

Primary Users

- Government Employees
- Administrators
- Managers
- Supervisors

Secondary Users

- Public Users
- External Partners

Assume users have varying levels of technical experience.

The interface must be easy to learn.

---

# Design Style

Preferred style

- Clean
- Minimal
- Modern
- Professional
- Spacious

Avoid

- Glassmorphism
- Neumorphism
- Heavy Gradients
- Excessive Shadows
- Bright Neon Colors

Government applications must feel trustworthy.

---

# Technology

Always use

- Tailwind CSS
- shadcn/ui
- Lucide Icons

Never introduce another UI framework unless requested.

---

# Layout

Desktop First

Support

- Desktop
- Laptop
- Tablet
- Mobile

Use responsive layouts.

Never rely on fixed widths.

Use flexible containers.

---

# Spacing

Always use consistent spacing.

Use Tailwind spacing scale.

Examples

p-4

p-6

gap-4

gap-6

space-y-4

Avoid random spacing values.

---

# Typography

Prioritize readability.

Use

Font Weight

Regular

Medium

Semibold

Bold

Avoid excessive font sizes.

Recommended hierarchy

Page Title

Section Title

Card Title

Body Text

Caption

Never use more than five typography levels.

---

# Color

Use semantic colors.

Primary

Secondary

Success

Warning

Error

Info

Neutral

Avoid hardcoded colors.

Use design tokens.

---

# Dark Mode

Every page must support

Light Mode

Dark Mode

Do not hardcode white backgrounds.

Use semantic Tailwind classes.

---

# Navigation

Keep navigation simple.

Use

Sidebar

Top Navigation

Breadcrumb

Tabs

Avoid deep navigation trees.

Maximum sidebar depth

3

---

# Cards

Cards should contain

Title

Description (optional)

Actions

Content

Keep cards simple.

Avoid nested cards.

---

# Tables

Enterprise applications rely heavily on tables.

Every table should support

Search

Sorting

Filtering

Pagination

Column Visibility

Row Selection (when appropriate)

Responsive layout

Loading State

Empty State

Error State

Actions

Do not place more than five primary actions in a row.

---

# Forms

Every form must include

Label

Placeholder

Description (when needed)

Validation

Helper Text

Error Message

Required Indicator

Submit Button

Cancel Button

Never rely on placeholders as labels.

---

# Buttons

Button Priority

Primary

Secondary

Outline

Ghost

Destructive

Loading

Disabled

Do not use more than one primary button per section.

---

# Dialog

Dialogs should be used only when necessary.

Support

Confirmation

Create

Update

Delete

Warning

Success

Dialogs must be keyboard accessible.

---

# Notifications

Use

Toast

Alert

Inline Error

Confirmation Dialog

Avoid intrusive popups.

---

# Icons

Use Lucide Icons only.

Every icon should have meaning.

Avoid decorative icons.

---

# Loading States

Every async operation must have

Loading Spinner

Skeleton

Disabled Actions

Loading Text

Never leave blank screens.

---

# Empty States

Every empty page must explain

Why there is no data

What the user should do next

Provide an action whenever possible.

---

# Error States

Every page should gracefully handle

404

403

401

500

Network Errors

Validation Errors

Provide retry actions when appropriate.

---

# Dashboard

Dashboards should contain

Summary Cards

Charts

Recent Activities

Quick Actions

Notifications

Avoid information overload.

---

# Accessibility

Always support

Keyboard Navigation

Focus Indicators

ARIA Labels (where needed)

Color Contrast

Screen Reader Friendly Labels

Never rely on color alone.

---

# Performance

Lazy load heavy pages.

Avoid unnecessary re-rendering.

Optimize images.

Keep components reusable.

---

# Components

Components should be

Reusable

Small

Composable

Easy to understand

Prefer composition over inheritance.

---

# Naming

Components

PascalCase

Folders

kebab-case

Hooks

useSomething

Utilities

camelCase

---

# Responsive Design

Support

320px

768px

1024px

1280px

1536px

Never break layouts on smaller screens.

---

# Animations

Keep animations minimal.

Use only for

Dialog

Dropdown

Toast

Accordion

Hover

Avoid long animations.

---

# Enterprise Pages

Typical pages include

Dashboard

CRUD

Detail

Profile

Settings

Reports

Audit Trail

Approval Workflow

Notifications

Analytics

Maintain a consistent layout across all pages.

---

# Page Structure

Every page should include

Page Title

Breadcrumb

Primary Action

Filters

Content

Footer (optional)

Avoid inconsistent page layouts.

---

# AI Instructions

Whenever generating UI

1. Explain the page purpose.

2. Explain the layout.

3. Explain component choices.

4. Generate responsive UI.

5. Generate accessible UI.

6. Generate reusable components.

7. Support loading state.

8. Support empty state.

9. Support error state.

10. Support dark mode.

Never generate placeholder UI.

Never generate incomplete components.

Always generate production-ready React components.