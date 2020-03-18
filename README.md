# Analytics System 

## 1. URLs

- Hosting URL: `https://my-analytics-3ed6f.firebaseapp.com/`
- My Website: `https://my-analytics-3ed6f.firebaseapp.com/`
This page is used to collect visitors' data and sent to back-end for analytics purpose.
- Analytics Login: `https://my-analytics-3ed6f.firebaseapp.com/analytics/login.html`
- Analytics Dashboard; `https://my-analytics-3ed6f.firebaseapp.com/analytics/dashboard.html` SPA to display all
visualized analytics data.

## 2. Authentication (Login & SignUp)

Dashboard is protected and can be view after authentication. Analytics System only supports Email & Password Login and SignUp. Users can signup without verifying email.

## 3. Role Based Access Control

There are three roles: Admin, Analyst, and User.

- Admin: Admin can view analytics data and manage users including granting roles and deleting accounts. New users with email ending with "@cse.135" can directly have Admin access. Regular users can have admin access granted by other admin.
- Analyst: Analysts can only view analytics data. Analysts access can be granted by other admin.
- User: Regular users have no access to any analytics data.

## 3. Dashboard

Dashboard displays all analytics data and users information(only visible to admin). There are three parts of reports.

- Overview: Present on the dashboard when loaded. Showing Visit Counts and Average Speed chart.
- User Report: Showing information of unique users. Displaying browser and OS data via HighCharts and ZingGrid.
- Speed Report: Showing information of sessions. Displaying Loading Time via HighCharts and ZingGrid.

## 4. Instructions to use Analytics System

1. Sign up in `login.html`. If you want Admin access, use any email address ending with "@cse.135".
2. The page will automatically redirect to `dashboard.html`.
Logout and re-login, you will have the correct access.
3. All features and data can be accessed in the menu bar.

- Home: Reload dashboard.
- Account: Display the current user info, set username, change passwords.
- Setting: Manage users.(Only visible to Admin)
- User Report & Speed Report: Show analytics data.

*Important: All data may take a few seconds to be displayed on the screen due to network constrains.

