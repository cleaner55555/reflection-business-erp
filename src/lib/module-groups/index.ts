// Module group index - maps each module key to its code-splitting group
// DYNAMIC: derived from menuGroupsData (single source of truth)
// Adding a new module to menuGroupsData automatically updates this map.

import { getModuleCodeGroupMap } from '@/lib/menuGroupsData'

/** Module ID → code-splitting group name (core, hr, finance, sales, projects, it, logistics, education, hospitality, construction, property, medical, services, retail) */
export const moduleGroupMap: Record<string, string> = getModuleCodeGroupMap()
