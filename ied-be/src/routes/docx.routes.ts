import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const router = Router();

router.post("/modify-template", async (req, res, next) => {
	const data = req.body;
	console.log("data:", data);
	const content = fs.readFileSync(
		path.resolve(__dirname, "../templates/template_1.docx"),
		"binary",
	);
	const zip = new PizZip(content);
	const doc = new Docxtemplater(zip);

	try {
		doc.render({
			...data,
		});
	} catch (error) {
		next(error);
	}

	const buf = doc.getZip().generate({ type: "nodebuffer" });
	res.send(buf);
});

export default router;
