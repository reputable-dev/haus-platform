/**
 * HAUS Platform Design System Configuration
 * This defines the complete design system for v0 AI generation
 */

export const HAUS_DESIGN_SYSTEM = {
  // Brand Identity
  brand: {
    name: "HAUS",
    industry: "Real Estate & Property Management",
    personality: ["Professional", "Modern", "Trustworthy", "Premium", "Clean"],
    voice: "Expert yet approachable, focusing on real estate excellence"
  },

  // Color Palette
  colors: {
    primary: "#3366FF",      // Main brand color
    secondary: "#FF6B6B",    // Accent for highlights
    accent: "#FFD166",       // Warning/attention color
    success: "#06D6A0",      // Success states
    warning: "#FFD166",      // Warning states  
    error: "#EF476F",        // Error states
    neutral: "#073B4C",      // Dark neutral
    
    light: {
      text: "#073B4C",
      background: "#FFFFFF",
      card: "#F8F9FA",
      border: "#E9ECEF",
      shadow: "rgba(0, 0, 0, 0.1)",
      overlay: "rgba(0, 0, 0, 0.5)"
    },
    
    dark: {
      text: "#F8F9FA",
      background: "#121212",
      card: "#1E1E1E", 
      border: "#333333",
      shadow: "rgba(0, 0, 0, 0.3)",
      overlay: "rgba(0, 0, 0, 0.7)"
    }
  },

  // Typography Scale
  typography: {
    fontFamily: "System Font",
    sizes: {
      title: 24,        // Main titles
      subtitle: 18,     // Section headers
      body: 16,         // Standard text
      small: 14,        // Helper text
      caption: 12,      // Badges, labels
      tiny: 10          // Fine print
    },
    weights: {
      regular: "400",
      medium: "500", 
      semiBold: "600",
      bold: "700"
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6
    }
  },

  // Spacing System (based on 4px grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32
  },

  // Border Radius
  borderRadius: {
    small: 4,         // Badges
    medium: 8,        // Buttons, inputs
    large: 12,        // Cards
    round: 18,        // Circular buttons
    full: 50          // Pills
  },

  // Shadows & Elevation
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1
    },
    medium: {
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3
    }
  },

  // Component Patterns
  components: {
    // Cards (primary content containers)
    card: {
      backgroundColor: "colors.card",
      borderRadius: "borderRadius.large (12px)",
      padding: "spacing.lg (16px)",
      shadow: "shadows.medium",
      margin: "spacing.sm (8px) vertical"
    },

    // Buttons
    button: {
      primary: {
        backgroundColor: "colors.primary (#3366FF)",
        color: "#FFFFFF",
        borderRadius: "borderRadius.medium (8px)",
        padding: "spacing.md (12px)",
        fontSize: "typography.sizes.body (16px)",
        fontWeight: "typography.weights.semiBold (600)"
      },
      secondary: {
        backgroundColor: "colors.card",
        color: "colors.text", 
        borderColor: "colors.border",
        borderWidth: 1
      }
    },

    // Input Fields
    input: {
      backgroundColor: "colors.card",
      borderColor: "colors.border",
      borderWidth: 1,
      borderRadius: "borderRadius.medium (8px)",
      padding: "spacing.md (12px)",
      fontSize: "typography.sizes.body (16px)"
    },

    // Badges
    badge: {
      backgroundColor: "Dynamic based on status",
      borderRadius: "borderRadius.small (4px)",
      paddingHorizontal: "spacing.sm (8px)",
      paddingVertical: "spacing.xs (4px)",
      fontSize: "typography.sizes.caption (12px)",
      fontWeight: "typography.weights.semiBold (600)",
      color: "#FFFFFF"
    },

    // Navigation
    tabBar: {
      backgroundColor: "colors.background",
      borderTopColor: "colors.border",
      activeColor: "colors.primary",
      inactiveColor: "colors.text (opacity: 0.6)"
    }
  },

  // Icon Usage
  icons: {
    library: "Lucide React Native",
    sizes: {
      small: 16,
      medium: 20,
      large: 24,
      xlarge: 32
    },
    usage: {
      navigation: ["Home", "Search", "Heart", "User", "BarChart3", "Bot"],
      property: ["MapPin", "Bed", "Bath", "Car", "Heart"],
      actions: ["Filter", "Plus", "X", "Check", "ChevronRight"],
      status: ["TrendingUp", "TrendingDown", "Minus", "AlertCircle"]
    }
  },

  // Layout Patterns
  layouts: {
    screen: {
      padding: "spacing.lg (16px)",
      backgroundColor: "colors.background"
    },
    section: {
      marginBottom: "spacing.xl (20px)"
    },
    list: {
      gap: "spacing.lg (16px)"
    }
  },

  // Real Estate Specific Patterns
  propertyComponents: {
    propertyCard: {
      imageHeight: 200,
      contentPadding: "spacing.lg (16px)",
      badgePositioning: "top-left with 12px margin",
      favoriteButtonPosition: "top-right with 12px margin",
      priceTypography: "18px, weight: 700",
      titleTypography: "16px, weight: 600", 
      featuresLayout: "horizontal row with icons"
    },
    
    filters: {
      buttonStyle: "outlined with border",
      badgeStyle: "circular with count",
      modalStyle: "bottom sheet on mobile"
    },

    metrics: {
      containerStyle: "card with trend indicators",
      valueTypography: "24px, weight: bold",
      trendIcons: "TrendingUp (success), TrendingDown (error), Minus (neutral)"
    }
  },

  // Responsive Breakpoints
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024
  },

  // Animation Standards
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    },
    easing: {
      standard: "ease-out",
      emphasis: "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  }
};

/**
 * Generate system prompt for v0 AI to follow HAUS design system
 */
export function generateHausSystemPrompt(): string {
  return `
You are a UI/UX expert specializing in the HAUS Platform design system. HAUS is a premium real estate and property management platform. You MUST follow these design system guidelines exactly:

## BRAND IDENTITY
- Industry: Real Estate & Property Management  
- Personality: Professional, Modern, Trustworthy, Premium, Clean
- Voice: Expert yet approachable, focusing on real estate excellence

## COLOR PALETTE (MUST USE THESE EXACT COLORS)
- Primary: #3366FF (main brand color)
- Secondary: #FF6B6B (accents)
- Success: #06D6A0 
- Warning/Accent: #FFD166
- Error: #EF476F
- Neutral Dark: #073B4C

Light Theme:
- Text: #073B4C
- Background: #FFFFFF  
- Card: #F8F9FA
- Border: #E9ECEF

Dark Theme:
- Text: #F8F9FA
- Background: #121212
- Card: #1E1E1E
- Border: #333333

## TYPOGRAPHY
- Font: System font stack
- Title: 24px, weight 700
- Subtitle: 18px, weight 600  
- Body: 16px, weight 400
- Small: 14px, weight 500
- Caption: 12px, weight 600

## SPACING (4px grid system)
- xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 20px, xxl: 24px

## COMPONENTS MUST FOLLOW THESE PATTERNS:

### Cards
- Border radius: 12px
- Padding: 16px
- Background: #F8F9FA (light) / #1E1E1E (dark)
- Shadow: shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2

### Buttons  
- Primary: #3366FF background, white text, 8px radius, 12px padding
- Secondary: Card background with 1px border
- Font weight: 600, size: 16px

### Input Fields
- Background: Card color
- Border: 1px solid border color
- Radius: 8px, Padding: 12px
- Font size: 16px

### Badges
- Radius: 4px
- Padding: 8px horizontal, 4px vertical  
- Font: 12px, weight 600, white text
- Colors: Primary for new/sale, Success for rent, Warning for auction, Secondary for other

## ICONS
- Library: Lucide React Native ONLY
- Sizes: 16px (small), 20px (medium), 24px (large)
- Common icons: Home, Search, Heart, User, BarChart3, Bot, MapPin, Bed, Bath, Car, Filter, TrendingUp/Down

## REAL ESTATE SPECIFIC RULES:
- Property cards: 200px image height, badges top-left, favorite button top-right
- Price typography: 18px, weight 700
- Features: horizontal row with bed/bath/car icons + numbers  
- Metric widgets: trend icons with success/error colors
- Filter buttons: outlined style with circular count badges

## LAYOUT STANDARDS:
- Screen padding: 16px
- Section margins: 20px bottom
- List gaps: 16px between items
- Responsive: adjust sizes for mobile vs tablet (use screenWidth < 768 check)

## NEVER USE:
- Colors outside the defined palette
- Font sizes not in the scale  
- Border radius other than 4px, 8px, 12px, or 18px
- Icons from other libraries
- Inconsistent spacing (must use 4px grid)

## ALWAYS INCLUDE:
- Theme support (useTheme hook with Colors[theme])
- Proper TypeScript interfaces
- Accessibility (testID attributes)
- Responsive design
- Haptic feedback for interactions (Haptics.selectionAsync())

Focus on real estate use cases: property listings, search filters, dashboards, metrics, user profiles, and property management workflows.

Generate components that feel native to the HAUS platform and maintain visual consistency.
`;
}

/**
 * Get component-specific instructions for different types
 */
export function getComponentInstructions(componentType: 'card' | 'form' | 'navigation' | 'dashboard' | 'property'): string {
  const instructions = {
    card: `
## CARD COMPONENT INSTRUCTIONS:
- Use 12px border radius, 16px padding
- Background: colors.card with medium shadow
- Include proper theme support
- Consider content hierarchy with typography scale
- Add subtle hover/press states with activeOpacity={0.9}
    `,
    
    form: `
## FORM COMPONENT INSTRUCTIONS:
- Input fields: 8px radius, card background, border color
- Primary buttons: #3366FF background, white text
- Proper validation states with error color (#EF476F)
- Include loading states and disabled styles
- Use consistent 16px spacing between elements
    `,
    
    navigation: `
## NAVIGATION COMPONENT INSTRUCTIONS:
- Tab bar: background color with border-top
- Active state: primary color (#3366FF)
- Inactive state: text color with 60% opacity
- Include proper icon sizes (24px for tabs)
- Support both light and dark themes
    `,
    
    dashboard: `
## DASHBOARD COMPONENT INSTRUCTIONS:
- Metric cards: trend icons (TrendingUp/Down) with appropriate colors
- Charts: use primary color scheme
- Grid layouts: responsive breakpoints at 768px
- Loading states: skeleton placeholders
- Empty states: helpful messaging with icons
    `,
    
    property: `
## PROPERTY COMPONENT INSTRUCTIONS:
- Property cards: 200px image, overlay badges, favorite button
- Price: 18px bold, formatting for rent/sale/auction
- Features: bed/bath/car icons with Lucide React Native
- Location: MapPin icon with address
- Status badges: color-coded by listing type
- Blur effect for exclusive/off-market properties
    `
  };
  
  return instructions[componentType] || '';
}