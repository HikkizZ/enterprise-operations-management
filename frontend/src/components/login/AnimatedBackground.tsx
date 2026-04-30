export default function AnimatedBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 saturate-150 dark:saturate-100">
            <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />

            <div
                className="absolute inset-0 opacity-[0.06] dark:opacity-[0.015]"
                style={{
                    backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
                    backgroundSize: '80px 80px'
                }}
            />

            <div className="absolute top-[20%] left-0 w-20 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent animate-travel-right" />
            <div className="absolute top-[45%] left-0 w-32 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent animate-travel-right" style={{ animationDelay: '3s' }} />
            <div className="absolute top-[70%] left-0 w-24 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent animate-travel-right" style={{ animationDelay: '7s' }} />

            <div className="absolute top-[35%] right-0 w-28 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent animate-travel-left" style={{ animationDelay: '2s' }} />
            <div className="absolute top-[60%] right-0 w-16 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent animate-travel-left" style={{ animationDelay: '5s' }} />

            <div className="absolute bottom-0 left-[10%] w-40 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent rotate-[-30deg] animate-travel-diagonal" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-0 left-[40%] w-32 h-px bg-linear-to-r from-transparent via-primary/25 to-transparent rotate-[-25deg] animate-travel-diagonal" style={{ animationDelay: '8s' }} />

            <div className="absolute top-[12%] left-[8%] animate-float-slow">
                <div className="w-2.5 h-2.5 rounded-full bg-primary/50 animate-glow-pulse" />
                <div className="absolute inset-0 w-10 h-10 -translate-x-3.75 -translate-y-3.75 rounded-full border border-primary/30 animate-ping-slow" />
            </div>

            <div className="absolute top-[18%] right-[12%] animate-float-medium">
                <div className="w-3 h-3 rounded-full bg-primary/40 animate-glow-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 w-12 h-12 -translate-x-4.5 -translate-y-4.5 rounded-full border border-primary/25 animate-ping-slow" style={{ animationDelay: '0.5s' }} />
            </div>

            <div className="absolute top-[40%] left-[5%] animate-float-fast">
                <div className="w-2 h-2 rounded-full bg-primary/35 animate-glow-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="absolute bottom-[22%] left-[18%] animate-float-medium" style={{ animationDelay: '1.5s' }}>
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <div className="absolute inset-0 w-8 h-8 -translate-x-3 -translate-y-3 rounded-full border border-primary/20 animate-ping-slow" style={{ animationDelay: '1s' }} />
            </div>

            <div className="absolute bottom-[30%] right-[10%] animate-float-slow" style={{ animationDelay: '2s' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/45 animate-glow-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <div className="absolute top-[55%] right-[20%] animate-float-fast" style={{ animationDelay: '1s' }}>
                <div className="w-2 h-2 rounded-full bg-primary/30" />
            </div>

            <div className="absolute bottom-[45%] left-[25%] animate-float-medium" style={{ animationDelay: '3s' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/35" />
            </div>

            <div className="absolute top-[75%] right-[30%] animate-float-slow" style={{ animationDelay: '2.5s' }}>
                <div className="w-2 h-2 rounded-full bg-primary/25 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
            </div>

            <div className="absolute top-[12%] left-[8%] w-[30%] h-px bg-linear-to-r from-primary/30 via-primary/10 to-transparent rotate-15 origin-left" />
            <div className="absolute top-[18%] right-[12%] w-[25%] h-px bg-linear-to-l from-primary/25 via-primary/10 to-transparent -rotate-20 origin-right" />
            <div className="absolute bottom-[25%] left-[18%] w-[40%] h-px bg-linear-to-r from-primary/20 via-primary/15 to-transparent rotate-[-8deg] origin-left" />

            <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-bl from-primary/12 dark:from-primary/6 to-transparent animate-glow-pulse"
                style={{ animationDuration: '5s' }} />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-primary/12 dark:from-primary/6 to-transparent animate-glow-pulse"
                style={{ animationDuration: '6s', animationDelay: '2s' }} />
        </div>
    )
}