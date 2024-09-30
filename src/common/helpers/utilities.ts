import { ProcessedDataToAnalysisInterface } from "../interfaces";

export const getTotalDaysBetween = (totalData: ProcessedDataToAnalysisInterface[]) => {
    const startDate = new Date(totalData[totalData.length - 1].processedDate);
    const endDate = new Date(totalData[0].processedDate);
    return getDaysBetween(startDate, endDate);
}

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
    const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24
    const differenceMs = Math.abs(startDate.getTime() - endDate.getTime());
    return Math.round(differenceMs / DAY_IN_MILLISECONDS);
}