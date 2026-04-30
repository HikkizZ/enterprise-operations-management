import LoginCard from '@/components/login/LoginCard';
import ThemeToggle from '@/components/ThemeToggle';
import AnimatedBackground from '@/components/login/AnimatedBackground';

export default function LoginPage() {
    return (
        <main className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-background">
            <ThemeToggle />
            <AnimatedBackground />
            <div className='relative z-10'>
                <LoginCard />
            </div>
        </main>
    )
}