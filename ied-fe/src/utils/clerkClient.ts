let getTokenFn: (() => Promise<string | null>) | null = null;

export const setGetTokenFn = (fn: () => Promise<string | null>) => {
	getTokenFn = fn;
};

export const getClerkToken = async (): Promise<string | null> => {
	if (!getTokenFn) throw new Error("getTokenFn not set yet");
	return await getTokenFn();
};
