
export enum RawDataPriority {
    HIGH = 'HIGH',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
}

export const priorityList = [
    RawDataPriority.HIGH,
    RawDataPriority.LOW,
    RawDataPriority.MEDIUM,
]

export enum SourceType {
    MES = 'MES',
    MANUAL = 'MANUAL',
    PROJECT = 'PROJECT',
}

export enum ValidationStatus {
    NOT_PROCESSED = 'NOT_PROCESSED',
    PENDING = 'PENDING',
    PROCESSED = 'PROCESSED',
}