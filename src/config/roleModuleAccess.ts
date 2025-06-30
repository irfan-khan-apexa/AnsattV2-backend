// /src/config/roleModuleAccess.ts

export const RoleModuleAccess: Record<string, string[]> = {
  Admin: [
    "Dashboard",
    "Employee Management",
    "Project Management",
    "Reports",
    "Onboarding",
    "Exit Management",
  ],
  HR: ["Onboarding", "Exit Management", "Employee Management", "Dashboard"],
  Developer: ["Dashboard", "Projects"],
  Manager: ["Dashboard", "Reports", "Projects"],
};
