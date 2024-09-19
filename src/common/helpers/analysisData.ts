import { linearRegression, linearRegressionLine } from "simple-statistics";
import { ProcessedDataToAnalysisInterface } from "../interfaces";
import { SourceType } from "src/analytics/enums/data.enum";



export const calculateAverageTimeBetweenPurchases = (totalData: ProcessedDataToAnalysisInterface[]): number => {
    let totalDays = 0;
    const totalManualData = totalData.filter((data) => {
        return data.sourceType === SourceType.MANUAL
    })

    for (let i = 1; i < totalManualData.length; i++) {
        totalDays += getDaysBetween(new Date(totalManualData[i].processedDate), new Date(totalManualData[i - 1].processedDate));
    }
    const avgTimeBetweenPurchases = (totalDays / (totalManualData.length - 1)).toFixed(2)

    return +avgTimeBetweenPurchases
};

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
    return 'stable'
}




export const calculateAverageDailyUsed = (totalData: ProcessedDataToAnalysisInterface[], totalQuantityUsed: number): number => {
    const totalDays = getTotalDaysBetween(totalData)
    return Math.round(totalQuantityUsed / totalDays);
}

const getTotalDaysBetween = (totalData: ProcessedDataToAnalysisInterface[]) => {
    const startDate = new Date(totalData[totalData.length - 1].processedDate);
    const endDate = new Date(totalData[0].processedDate);
    return getDaysBetween(startDate, endDate);
}

const getDaysBetween = (startDate: Date, endDate: Date): number => {
    const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24
    const differenceMs = Math.abs(startDate.getTime() - endDate.getTime());
    return Math.round(differenceMs / DAY_IN_MILLISECONDS);
}