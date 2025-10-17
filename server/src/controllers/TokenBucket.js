class TokenBucket {
    constructor(tokens, refillRate) {
        this.capacity = tokens;
        this.tokens = tokens;
        this.refillRate = refillRate; // tokens per millisecond
        this.lastRefill = Date.now();  
    }

    tryConsume(count) {
        this.refill();
        if (this.tokens >= count) {
            this.tokens -= count;
            return true;
        }
        return false;
    }
    refill(){
        const now = Date.now();
        const elapsed = (now - this.lastRefill) / 1000;

        this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
        this.lastRefill = now;
    }
}