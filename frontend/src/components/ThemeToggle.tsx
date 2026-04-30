import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
            {theme === 'light' ? <Moon className="size-6" /> : <Sun className="size-6" />}
        </Button>
    )
}