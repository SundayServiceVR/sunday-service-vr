# Role Simulation Feature

## Overview
The role simulation feature allows developers to test the application with different role permissions without needing to modify their actual Discord roles.

## How to Use

### Prerequisites
- You must have the "developer" role to access this feature
- The feature is only available when you're logged in as a developer

### Accessing Role Simulation
1. Log in to the application with your developer account
2. Look for the "🎭 Role Simulation" button in the main navigation bar
3. Click the button to open the Role Simulation modal

### What You Should See When Simulating Roles

When you select only the **DJ role**, you should notice:
- The main navigation links (Home, Events, DJ Roster) disappear from the navbar
- The Home page shows a different message: "We don't have anything here for you on this page yet"
- The breadcrumbs bar disappears
- You'll be blocked from accessing host/admin-only pages with a permission error

When you select **Host role**, you should see:
- All navigation links return (Home, Events, DJ Roster)
- Full access to the Home page with helpful links
- Access to event management features
- Breadcrumbs navigation appears

When you select **Admin role**, you get:
- Everything that Host gets
- Additional administrative features
- Access to DJ management pages

### Using the Modal
The Role Simulation modal allows you to:
- **Select Roles**: Check/uncheck roles you want to simulate having
- **Clear Simulation**: Click "Clear Simulation" to return to your actual developer roles
- **Reset to All Roles**: Click "Reset to All Roles" to select all available roles
- **Apply Simulation**: Click "Apply Simulation" to activate the selected roles

### Visual Indicators
When role simulation is active, you'll see:
- The navigation button changes to "🎭 Role Sim Active" with warning color
- A "SIM" badge appears next to your username in the user dropdown
- The simulated roles are displayed throughout the application

### Persistence
- Role simulation settings are saved in localStorage and persist across browser sessions
- Simulation is automatically cleared when you log out
- Simulation is only available to users with developer role

### Available Roles
- **Admin**: Full administrative access
- **Host**: Event hosting capabilities
- **DJ**: Basic DJ permissions
- **Developer**: Development and debugging features

## Technical Implementation

### Components Added
- `RoleSimulationModal.tsx`: Modal component for role selection
- Updated `FirebaseAuthContext.tsx`: Added role simulation state management
- Updated `Layout.tsx`: Added role simulation button to navbar
- Updated `UserDropdown.tsx`: Added visual simulation indicator

### Context Changes
The FirebaseAuthContext now includes:
- `isSimulatingRoles`: Boolean indicating if simulation is active
- `actualRoles`: Array of user's real roles from Discord
- `setSimulatedRoles`: Function to set simulated roles
- `clearRoleSimulation`: Function to clear simulation

### Storage
Simulated roles are stored in localStorage with the key `simulatedRoles`.