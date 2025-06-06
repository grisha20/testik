
import React from 'react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode; 
}

interface BottomNavigationProps {
  items: NavigationItem[];
  activeItem: string;
  onNavigate: (itemId: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ items, activeItem, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-50/95 backdrop-blur-md border-t border-gray-200 shadow-top z-20 pt-safe-dummy"> {/* pt-safe-dummy will be handled by fixed-bottom-nav-height on main content */}
      <div className="max-w-3xl mx-auto flex justify-around items-stretch h-16 sm:h-20">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-none w-1/3 focus:outline-none transition-colors duration-150 flex-grow ${ // Adjusted to w-1/3 for three items
              activeItem === item.id 
                ? 'text-black border-t-2 border-black' 
                : 'text-gray-500 hover:text-gray-700 border-t-2 border-transparent'
            }`}
            aria-current={activeItem === item.id ? 'page' : undefined}
            aria-label={item.label}
          >
            {item.icon}
            <span className={`mt-1 text-xs sm:text-sm ${activeItem === item.id ? 'font-semibold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
      <style>
        {`
        .shadow-top {
          box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
        }
        /* This class is a placeholder in BottomNavigation.tsx as padding is handled by fixed-bottom-nav-height on the main content area ensuring scrollable content clears the nav.
           Actual safe area padding for the nav itself, if it were to have content scrollable *behind* it at the very bottom, would be applied directly to the nav.
           However, since its content (buttons) is fixed within its height, env(safe-area-inset-bottom) is primarily for the page's main scrollable area.
           We will use a dummy class here to acknowledge its existence in index.html style block.
        */
        .pt-safe-dummy { 
            padding-bottom: env(safe-area-inset-bottom);
        }
      `}
      </style>
    </nav>
  );
};
