import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Type for icon components
type IconComponent = LucideIcon;

// Function to get icon component by name
export function getIconByName(iconName: string): IconComponent {
  // Handle different naming conventions
  const normalizedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);

  // Try exact match first
  if (LucideIcons[iconName as keyof typeof LucideIcons]) {
    return LucideIcons[iconName as keyof typeof LucideIcons] as IconComponent;
  }

  // Try normalized name
  if (LucideIcons[normalizedName as keyof typeof LucideIcons]) {
    return LucideIcons[
      normalizedName as keyof typeof LucideIcons
    ] as IconComponent;
  }

  // Try common variations
  const variations = [
    iconName.toLowerCase(),
    iconName.toUpperCase(),
    iconName.replace(/[-_]/g, ''),
    iconName.replace(/[-_]/g, '').charAt(0).toUpperCase() +
      iconName.replace(/[-_]/g, '').slice(1),
  ];

  for (const variation of variations) {
    if (LucideIcons[variation as keyof typeof LucideIcons]) {
      return LucideIcons[
        variation as keyof typeof LucideIcons
      ] as IconComponent;
    }
  }

  // Fallback to Table icon if not found
  return LucideIcons.Table as IconComponent;
}

// Function to render icon with props
export function renderIcon(
  iconName: string,
  props?: React.ComponentProps<LucideIcon>
) {
  const IconComponent = getIconByName(iconName);
  return IconComponent(props || {});
}

// Helper to check if icon exists
export function iconExists(iconName: string): boolean {
  try {
    const normalizedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    return !!(
      LucideIcons[iconName as keyof typeof LucideIcons] ||
      LucideIcons[normalizedName as keyof typeof LucideIcons]
    );
  } catch {
    return false;
  }
}
