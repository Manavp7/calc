export class CircuitBreaker {
    private failureCount = 0;
    private lastFailureTime: number | null = null;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    constructor(
        private maxFailures = 3,
        private resetTimeout = 300000, // 5 minutes
        private halfOpenAttempts = 1
    ) { }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        // Check if circuit should reset
        if (this.state === 'OPEN' && this.shouldAttemptReset()) {
            this.state = 'HALF_OPEN';
        }

        // Reject if circuit is open
        if (this.state === 'OPEN') {
            throw new Error('Circuit breaker is OPEN - service temporarily disabled');
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private shouldAttemptReset(): boolean {
        if (!this.lastFailureTime) return false;
        return Date.now() - this.lastFailureTime >= this.resetTimeout;
    }

    private onSuccess(): void {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.maxFailures) {
            this.state = 'OPEN';
            console.error(`Circuit breaker OPEN after ${this.failureCount} failures`);
        }
    }

    getState() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            lastFailureTime: this.lastFailureTime
        };
    }
}

// Singleton instance for the Gemini API
export const geminiCircuitBreaker = new CircuitBreaker();
