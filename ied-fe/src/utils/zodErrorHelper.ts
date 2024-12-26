export type ValidationError = {
  message: string;
  field?: string;
  value?: any;
}

export const extractErrorMessages = (errors: any): ValidationError[] => {
  const validationErrors: ValidationError[] = [];

  const processError = (error: any, parentField?: string) => {
    if (Array.isArray(error)) {
      error.forEach(e => processError(e, parentField));
    } else if (typeof error === 'object' && error !== null) {
      Object.entries(error).forEach(([key, value]: [string, any]) => {
        if (value?.message) {
          validationErrors.push({
            message: value.message,
            field: parentField ? `${parentField}.${key}` : key,
            value: value.input || value.received,
          });
        } else {
          processError(value, key);
        }
      });
    }
  };

  processError(errors);
  return validationErrors;
};