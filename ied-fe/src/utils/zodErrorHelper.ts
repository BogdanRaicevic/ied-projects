export const extractErrorMessages = (errors: any): string[] => {
  const messages: string[] = [];

  const processError = (error: any) => {
    if (Array.isArray(error)) {
      error.forEach(processError);
    } else if (typeof error === 'object' && error !== null) {
      Object.values(error).forEach((value: any) => {
        if (value?.message) {
          messages.push(value.message);
        } else {
          processError(value);
        }
      });
    }
  };

  processError(errors);
  return messages;
};