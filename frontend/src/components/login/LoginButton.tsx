import { Button } from '@/components/ui/button';

export default function LoginButton() {
    return (
        <Button
            type="submit"
            className="w-full h-11 font-semibold text-white bg-linear-to-r from-gradient-from to-gradient-to hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]">
            Iniciar Sesión
        </Button>
    )
}