import { linearRegression, linearRegressionLine } from "simple-statistics";
import { ProcessedDataToAnalysisInterface } from "../interfaces";
import { SourceType } from "src/analytics/enums/data.enum";
import { getDaysBetween, getTotalDaysBetween } from "./";

export const getRecommendation = (usedTrend: string, avgDailyUsed: number): string => {
    switch (usedTrend) {
        case 'increasing':
            return `Reabastecer inventario pronto porque el consumo diario promedio es de ${avgDailyUsed} unidades.`
        case 'decreasing':
            return `Revisar la demanda porque el consumo ha disminuido`
        case 'stable':
            return `Mantener el inventario actual`
        default:
            return '';
    }
}

export const calculateAverageTimeBetweenPurchases = (totalData: ProcessedDataToAnalysisInterface[]): number => {
    let totalDays = 0;
    const totalManualData = totalData.filter((data) => data.sourceType === SourceType.MANUAL)

    for (let i = 1; i < totalManualData.length; i++) {
        totalDays += getDaysBetween(new Date(totalManualData[i].processedDate), new Date(totalManualData[i - 1].processedDate));
    }
    if (totalManualData.length <= 1) return 0;
    const avgTimeBetweenPurchases = (totalDays / (totalManualData.length - 1)).toFixed(4)

    return +avgTimeBetweenPurchases
};

export const calculateDaysSinceLastPurchase = (lastPurchasedDate: Date, processedDate: Date): number => {
    const days = getDaysBetween(new Date(lastPurchasedDate), new Date(processedDate));
    return days;
}

export const detectUsedTrend = (totalData: ProcessedDataToAnalysisInterface[]): string => {
    if (totalData.length <= 2) return `Not enough data to calculate trend`

    const dates = totalData.map((data) => data.processedDate.getTime()).reverse()
    const quantities = totalData.map((data) => data.processedQuantity).reverse()
    const regression = linearRegression(dates.map((date, index) => [date, quantities[index]]))
    const trend = linearRegressionLine(regression);
    const slope = regression.m;

    if (slope > 0) {
        return 'increasing';
    } else if (slope < 0) {
        return 'decreasing';
    }
    return 'stable';
}

export const calculateAverageDailyUsed = (totalData: ProcessedDataToAnalysisInterface[], totalQuantityUsed: number): number => {
    const totalDays = getTotalDaysBetween(totalData)
    if (totalDays <= 0) return totalQuantityUsed;
    const avgDailyUsed = (totalQuantityUsed / totalDays).toFixed(4)
    return +avgDailyUsed

}

