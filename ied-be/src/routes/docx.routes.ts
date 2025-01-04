import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const router = Router();

router.get("/modify-template", async (req, res, next) => {
	const content = fs.readFileSync(
		path.resolve(__dirname, "../templates/template.docx"),
		"binary",
	);
	const zip = new PizZip(content);
	const doc = new Docxtemplater(zip);

	doc.setData({
		ime: "John",
		prezime: "Doe",
		offline_cena: "100",
		online_cena: "50",
		datum: "2021-12-12",
	});

	try {
		doc.render();
	} catch (error) {
		next(error);
	}

	const buf = doc.getZip().generate({ type: "nodebuffer" });
	res.send(buf);
});

export default router;
