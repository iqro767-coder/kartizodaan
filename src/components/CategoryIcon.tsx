import {
  BookOpen,
  Briefcase,
  Coffee,
  Dumbbell,
  Home,
  Moon,
} from 'lucide-react';
import type { CategoryId } from '../types/task';

interface CategoryIconProps {
  category: CategoryId;
  className?: string;
}

export function CategoryIcon({ category, className = 'w-4 h-4' }: CategoryIconProps) {
  switch (category) {
    case 'Ish':
      return <Briefcase className={className} aria-hidden="true" />;
    case "O'qish":
      return <BookOpen className={className} aria-hidden="true" />;
    case 'Sport':
      return <Dumbbell className={className} aria-hidden="true" />;
    case 'Uy ishlari':
      return <Home className={className} aria-hidden="true" />;
    case 'Dam olish':
      return <Coffee className={className} aria-hidden="true" />;
    case 'Uyqu':
      return <Moon className={className} aria-hidden="true" />;
  }
}
