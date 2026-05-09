import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginButtonProps {
    isLoading?: boolean;
}

export default function LoginButton({ isLoading = false }: LoginButtonProps) {
    return (
        <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 font-semibold text-white bg-linear-to-r from-gradient-from to-gradient-to hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Iniciar sesión'}
        </Button>
    )
}