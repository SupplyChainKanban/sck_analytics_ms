


export interface ProcessedDataToAnalysisInterface {
    id: string;
    sourceType: string;
    materialID: number;
    processedQuantity: number;
    processedDate: Date;
}


export interface LastRegisterInterface {
    totalQuantityUsed: number;
    totalQuantityPurchased: number;
    avgDailyUsed: number;
    lastPurchasedDate: Date;
    usedTrend: string;
    avgTimeBetweenPurchases: number;
    recommendation: string;
}


export interface DataAnalysisInterface {
    totalQuantityUsed: number;
    totalQuantityPurchased: number;
    lastPurchasedDate: Date | null;
    avgDailyUsed: number;
    usedTrend: string | null;
    avgTimeBetweenPurchases: number;
    recommendation: string | null;
}