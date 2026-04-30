import logo from '@/assets/eoms-logo.svg';

export default function LoginLogo() {
    return (
        <div className="flex flex-col items-center gap-4">
            <img src={logo} alt="EOMS" className="w-16 h-16" />
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-foreground">Iniciar Sesión</h1>
                <p className="mt-1 text-sm text-muted-foreground">Accede a tu cuenta</p>
            </div>
        </div>
    )
}