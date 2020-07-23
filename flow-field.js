class FlowField {
    constructor(noiseSettings) {
        this.noiseSettings = noiseSettings;
        this.zOffset = 0;
        this.store = new Map();
    }

    updateZOffset() {
        this.zOffset += this.noiseSettings.zStep;
        this.store.clear();
    }

    updateSettings(noiseSettings) {
        this.noiseSettings = noiseSettings;
    }

    getCellNoiseAngle(x, y) {
        const { xStep, yStep } = this.noiseSettings;
        const xOffset = x * xStep;
        const yOffset = y * yStep;

        const storeKey = this.getStoreKey(xOffset, yOffset, this.zOffset);
        if (this.store.has(storeKey)) {
            return this.store.get(storeKey);
        }

        const noiseValue = noise(xOffset, yOffset, this.zOffset);
        const angle = map(noiseValue, 0, 1, 0, TWO_PI);
        this.store.set(storeKey, angle);
        return angle;
    }

    getStoreKey(xOffset, yOffset, zOffset) {
        return `${xOffset}_${yOffset}_${zOffset}`;
    }
}