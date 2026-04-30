import { Card, CardContent } from '@/components/ui/card';
import LoginLogo from './LoginLogo';
import LoginForm from './LoginForm';

export default function LoginCard() {
    return (
        <Card className="w-full max-w-lg border-border bg-card shadow-xl shadow-black/20">
            <CardContent className="p-10 space-y-8">
                <LoginLogo />
                <LoginForm />
            </CardContent>
        </Card>
    )
}