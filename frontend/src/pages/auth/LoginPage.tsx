import LoginCard from '@/components/login/LoginCard';

export default function LoginPage() {
    return (
        <main className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-background">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-linear-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-linear-to-tr from-gradient-to/10 to-transparent rounded-full blur-3xl" />
            </div>
            <LoginCard />
        </main>
    )
}