import { clerkClient, getAuth } from "@clerk/express";
import type { Response, Request, NextFunction } from "express";

export const hasPermission = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const auth = getAuth(req);

	if (!auth.userId) {
		return res.status(403).send("Forbidden");
	}

	const currentUser =
		(await clerkClient.users.getUser(auth.userId)).primaryEmailAddress
			?.emailAddress || "unknown-user";

	userStore.setCurrentUser(currentUser);
	next();
};

class UserStore {
	private currentUser: string | null = null;

	setCurrentUser(user: string) {
		this.currentUser = user;
	}

	getCurrentUser() {
		return this.currentUser;
	}
}

export const userStore = new UserStore();
