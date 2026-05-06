export const { currentUser, logout, setActiveModule } = useAppStore();

export const initials =
  `${currentUser.firstName?.[0] || ""}${currentUser.lastName?.[0] || ""}`.toUpperCase();

export const handleLogout = () => {
  logout();
  toast.info("Odjavljeni ste");
};
