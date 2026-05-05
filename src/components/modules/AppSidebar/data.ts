export const { activeModule, setActiveModule } = useAppStore();

export const { isMobile, setOpenMobile } = useSidebar();

export const { t } = useTranslation();

export const logo = useThemeStore((s) => s.logo);

export const companyName = useThemeStore((s) => s.companyName);

export const isModuleEnabled = useAppStore((s) => s.isModuleEnabled);

export const handleModuleClick = (module: ModuleType) => {
    setActiveModule(module)
    if (isMobile) setOpenMobile(false)
  }
